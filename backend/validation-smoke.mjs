import jwt from 'jsonwebtoken';
import prisma from './src/config/prisma.js';
import { env } from './src/config/env.js';

const base = 'http://localhost:5000/api/v1';
const runId = Date.now().toString(36);
const password = `ValidationSmoke-${runId}!`;
const email = `validation-smoke-${runId}@example.test`;
const assert = (condition, message) => { if (!condition) throw new Error(message); };

async function request(path, options = {}, cookie = '') {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (cookie) headers.Cookie = cookie;
  const response = await fetch(`${base}${path}`, { ...options, headers });
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { response, body };
}

async function main() {
  let userId;
  let tripId;
  let temporaryAdminId;
  try {
    const user = await prisma.user.create({ data: { name: `Validation Smoke ${runId}`, email, passwordHash: 'validation-smoke', role: 'USER' } });
    userId = user.id;
    const cookie = `jwt=${jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: '1h' })}`;
    const checks = [
      ['/flights/search?from=DEL&to=BOM&date=bad-date', 'flight invalid date'],
      ['/flights/search?from=DEL&to=BOM&date=2026-09-20&returnDate=2026-09-19', 'flight return before departure'],
      ['/flights/search?from=DEL&to=BOM&date=2026-09-20&adults=0', 'flight invalid adults'],
      ['/flights/search?from=DEL&to=BOM&date=2026-09-20&adults=1&infants=2', 'flight invalid infants'],
      ['/hotels/search?destination=Paris&checkIn=2026-10-20&checkOut=2026-10-19', 'hotel invalid date range'],
      ['/hotels/search?destination=Paris&adults=0&rooms=0', 'hotel invalid counts'],
      ['/hotels/search?destination=Paris&children=2&childAges=4', 'hotel invalid child ages'],
      ['/bookings', 'invalid flight booking payload'],
      ['/bookings/hotel', 'invalid hotel booking payload'],
    ];
    for (const [path, label] of checks) {
      const result = await request(path, { method: path === '/bookings' || path === '/bookings/hotel' ? 'POST' : 'GET', body: path === '/bookings' || path === '/bookings/hotel' ? '{}' : undefined }, cookie);
      assert(result.response.status === 400, `${label} returned ${result.response.status}`);
    }
    console.log('FLIGHT/HOTEL/BOOKING VALIDATION: PASS');

    let result = await request('/trips', { method: 'POST', body: JSON.stringify({ title: 'Invalid date trip', startDate: '2026-10-20', endDate: '2026-10-19', days: [] }) }, cookie);
    assert(result.response.status === 400, `invalid trip dates returned ${result.response.status}`);
    result = await request('/trips', { method: 'POST', body: JSON.stringify({ title: `Validation Trip ${runId}`, startDate: '2026-10-20', endDate: '2026-10-21', days: [] }) }, cookie);
    assert(result.response.status === 201, `valid trip creation failed: ${JSON.stringify(result.body)}`);
    tripId = result.body.data.trip.id;
    result = await request(`/trips/${tripId}/days`, { method: 'POST', body: JSON.stringify({ dayNumber: 1.5, activities: [] }) }, cookie);
    assert(result.response.status === 400, `invalid trip day returned ${result.response.status}`);
    console.log('TRIP VALIDATION: PASS');

    let admin = await prisma.user.findFirst({ where: { role: 'ADMIN', isActive: true }, select: { id: true } });
    if (!admin) {
      admin = await prisma.user.create({ data: { name: `Validation Admin ${runId}`, email: `validation-admin-${runId}@example.test`, passwordHash: 'validation-smoke', role: 'ADMIN' }, select: { id: true } });
      temporaryAdminId = admin.id;
    }
    const adminCookie = `jwt=${jwt.sign({ id: admin.id }, env.JWT_SECRET, { expiresIn: '1h' })}`;
    for (const path of ['/admin/bookings?page=0', '/admin/bookings?pageSize=101', '/admin/bookings?status=INVALID', '/admin/bookings?dateFrom=2026-02-30']) {
      result = await request(path, {}, adminCookie);
      assert(result.response.status === 400, `admin validation ${path} returned ${result.response.status}`);
    }
    console.log('ADMIN VALIDATION: PASS');
  } finally {
    if (tripId) await prisma.trip.deleteMany({ where: { id: tripId } });
    if (userId) await prisma.user.deleteMany({ where: { id: userId } });
    if (temporaryAdminId) await prisma.user.delete({ where: { id: temporaryAdminId } });
    assert(await prisma.user.count({ where: { email } }) === 0, 'temporary validation user remains after cleanup');
    console.log('CLEANUP: PASS');
  }
}

main().catch((error) => { console.error(`VALIDATION SMOKE FAILED: ${error.message}`); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
