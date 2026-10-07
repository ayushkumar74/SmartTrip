import jwt from 'jsonwebtoken';
import prisma from './src/config/prisma.js';
import { env } from './src/config/env.js';

const base = 'http://localhost:5000/api/v1';
const runId = Date.now().toString(36);
const emails = [`security-smoke-a-${runId}@example.test`, `security-smoke-b-${runId}@example.test`];
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

async function createUser(email, name) {
  const user = await prisma.user.create({ data: { email, name, passwordHash: 'security-smoke', role: 'USER' } });
  return { user, cookie: `jwt=${jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: '1h' })}` };
}

async function main() {
  let bookingId;
  try {
    const owner = await createUser(emails[0], `Security A ${runId}`);
    const other = await createUser(emails[1], `Security B ${runId}`);
    const flight = await prisma.flightOffer.findFirst({ where: { active: true }, select: { id: true } });
    assert(flight, 'seeded flight missing');
    const created = await request('/bookings', { method: 'POST', body: JSON.stringify({ flightId: `db_${flight.id}`, passengerData: [{ firstName: 'Security', lastName: 'Tester', dateOfBirth: '1990-01-01', gender: 'OTHER', nationality: 'Indian' }] }) }, owner.cookie);
    assert(created.response.status === 201, `owner booking creation failed: ${JSON.stringify(created.body)}`);
    bookingId = created.body.data.booking.id;
    let result = await request(`/bookings/${bookingId}`, {}, other.cookie);
    assert(result.response.status === 404, `other user read booking returned ${result.response.status}`);
    result = await request(`/bookings/${bookingId}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason: 'unauthorized' }) }, other.cookie);
    assert(result.response.status === 404, `other user cancelled booking with ${result.response.status}`);
    result = await request('/admin/dashboard', {}, other.cookie);
    assert(result.response.status === 403, `normal user admin access returned ${result.response.status}`);
    result = await request('/admin/dashboard');
    assert(result.response.status === 401, `unauthenticated admin access returned ${result.response.status}`);
    console.log('BOOKING OWNERSHIP: PASS');
    console.log('ADMIN AUTHORIZATION: PASS');
  } finally {
    if (bookingId) await prisma.booking.deleteMany({ where: { id: bookingId } });
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
    assert(await prisma.user.count({ where: { email: { in: emails } } }) === 0, 'security smoke users remain after cleanup');
    console.log('SECURITY CLEANUP: PASS');
  }
}

main().catch((error) => { console.error(`SECURITY SMOKE FAILED: ${error.message}`); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
