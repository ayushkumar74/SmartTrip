import prisma from './src/config/prisma.js';

const base = 'http://localhost:5000/api/v1';
const runId = Date.now().toString(36);
const password = `PaymentSmoke-${runId}!`;
const emails = [`payment-smoke-a-${runId}@example.test`, `payment-smoke-b-${runId}@example.test`];
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

async function registerLogin(email, name) {
  let result = await request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
  assert(result.response.status === 201, `register failed: ${JSON.stringify(result.body)}`);
  result = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  assert(result.response.status === 200, `login failed: ${JSON.stringify(result.body)}`);
  const cookie = (result.response.headers.getSetCookie?.() || []).map((value) => value.split(';')[0]).join('; ');
  assert(cookie.includes('jwt='), 'JWT cookie missing');
  return cookie;
}

async function createFlightBooking(cookie, flightId) {
  const result = await request('/bookings', {
    method: 'POST',
    body: JSON.stringify({
      flightId,
      passengerData: [{ firstName: 'Payment', lastName: 'Tester', dateOfBirth: '1990-01-01', gender: 'OTHER', nationality: 'Indian' }],
    }),
  }, cookie);
  assert(result.response.status === 201, `booking failed: ${JSON.stringify(result.body)}`);
  return result.body.data.booking.id;
}

async function main() {
  let userId;
  let bookingId;
  let failedBookingId;
  try {
    const userCookie = await registerLogin(emails[0], `Payment Smoke A ${runId}`);
    const otherCookie = await registerLogin(emails[1], `Payment Smoke B ${runId}`);

    const search = await request('/flights/search?from=DEL&to=BOM', {}, userCookie);
    assert(search.response.status === 200 && search.body.data.flights?.length, 'flight search did not return a usable offer');
    const flightId = search.body.data.flights[0].id;

    bookingId = await createFlightBooking(userCookie, flightId);

    const initiations = await Promise.all([
      request('/payments/initiate', { method: 'POST', body: JSON.stringify({ bookingId }) }, userCookie),
      request('/payments/initiate', { method: 'POST', body: JSON.stringify({ bookingId }) }, userCookie),
    ]);
    assert(initiations.every((result) => result.response.status === 200), 'concurrent initiation did not succeed');
    const paymentIds = new Set(initiations.map((result) => result.body.data.payment.id));
    assert(paymentIds.size === 1, 'concurrent initiation created multiple payment records');
    console.log('INITIATION IDEMPOTENCY: PASS');

    const unauthorized = await request(`/payments/${bookingId}`, {}, otherCookie);
    assert(unauthorized.response.status === 404, `unauthorized payment status returned ${unauthorized.response.status}`);
    const unauthorizedInitiation = await request('/payments/initiate', { method: 'POST', body: JSON.stringify({ bookingId }) }, otherCookie);
    assert(unauthorizedInitiation.response.status === 404, `unauthorized initiation returned ${unauthorizedInitiation.response.status}`);
    console.log('PAYMENT OWNERSHIP: PASS');

    const verifications = await Promise.all([
      request('/payments/verify', { method: 'POST', body: JSON.stringify({ bookingId, devBypass: true }) }, userCookie),
      request('/payments/verify', { method: 'POST', body: JSON.stringify({ bookingId, devBypass: true }) }, userCookie),
    ]);
    assert(verifications.every((result) => result.response.status === 200), 'concurrent verification was not idempotent');
    assert(new Set(verifications.map((result) => result.body.data.payment.id)).size === 1, 'verification returned different payment records');
    const notifications = await request(`/notifications?type=PAYMENT_COMPLETED&page=1&pageSize=100`, {}, userCookie);
    assert(notifications.response.status === 200, 'payment notification query failed');
    assert(notifications.body.data.notifications.length === 1, 'duplicate PAYMENT_COMPLETED notification was created');
    console.log('VERIFICATION IDEMPOTENCY: PASS');

    failedBookingId = await createFlightBooking(userCookie, flightId);
    const failedInitiation = await request('/payments/initiate', { method: 'POST', body: JSON.stringify({ bookingId: failedBookingId }) }, userCookie);
    assert(failedInitiation.response.status === 200, 'failure-flow initiation failed');
    const failed = await request('/payments/fail', { method: 'POST', body: JSON.stringify({ bookingId: failedBookingId }) }, userCookie);
    assert(failed.response.status === 200 && failed.body.data.payment.status === 'FAILED', 'payment failure transition failed');
    const failedStatus = await request(`/payments/${failedBookingId}`, {}, userCookie);
    assert(failedStatus.response.status === 200 && failedStatus.body.data.payments[0].status === 'FAILED', 'failed payment status was not persisted');
    console.log('PAYMENT FAILURE: PASS');

    const persistedUser = await prisma.user.findUnique({ where: { email: emails[0] }, select: { id: true } });
    userId = persistedUser?.id;
  } finally {
    if (failedBookingId) await prisma.booking.deleteMany({ where: { id: failedBookingId } });
    if (bookingId) await prisma.booking.deleteMany({ where: { id: bookingId } });
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
    const remaining = await prisma.user.count({ where: { email: { in: emails } } });
    assert(remaining === 0, `temporary users remain after cleanup${userId ? ` for ${userId}` : ''}`);
    console.log('CLEANUP: PASS');
  }
}

main().catch((error) => { console.error(`PAYMENT CONCURRENCY SMOKE FAILED: ${error.message}`); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
