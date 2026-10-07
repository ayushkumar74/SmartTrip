import prisma from './src/config/prisma.js';

const base = 'http://localhost:5000/api/v1';
const runId = Date.now().toString(36);
const password = `CancelSmoke-${runId}!`;
const emails = [`cancel-smoke-a-${runId}@example.test`, `cancel-smoke-b-${runId}@example.test`];
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
  return (result.response.headers.getSetCookie?.() || []).map((value) => value.split(';')[0]).join('; ');
}

async function createFlightBooking(cookie, flightId) {
  const result = await request('/bookings', { method: 'POST', body: JSON.stringify({ flightId, passengerData: [{ firstName: 'Cancel', lastName: 'Tester', dateOfBirth: '1990-01-01', gender: 'OTHER', nationality: 'Indian' }] }) }, cookie);
  assert(result.response.status === 201, `flight booking failed: ${JSON.stringify(result.body)}`);
  return result.body.data.booking.id;
}

async function createHotelBooking(cookie) {
  const search = await request('/hotels/search?destination=Paris&checkIn=2026-11-10&checkOut=2026-11-12', {}, cookie);
  assert(search.response.status === 200, 'hotel search failed');
  let hotel = search.body.data.hotels?.[0];
  if (!hotel) {
    const databaseHotel = await prisma.hotel.findFirst({ where: { active: true }, include: { rooms: { where: { available: true }, take: 1 } } });
    hotel = databaseHotel && { id: `db_${databaseHotel.id}`, rooms: databaseHotel.rooms.map((room) => ({ id: `db_room_${room.id}` })) };
  }
  const room = hotel?.rooms?.[0];
  assert(room?.id, 'hotel search did not return a usable room');
  const result = await request('/bookings/hotel', { method: 'POST', body: JSON.stringify({ hotelId: hotel.id, roomId: room.id, checkIn: '2026-11-10', checkOut: '2026-11-12', guestData: [{ title: 'MR', firstName: 'Cancel', lastName: 'Guest', email: 'cancel@example.test', mobile: '+919876543210', nationality: 'Indian' }] }) }, cookie);
  assert(result.response.status === 201, `hotel booking failed: ${JSON.stringify(result.body)}`);
  return result.body.data.booking.id;
}

async function initiateAndCompleteMock(cookie, bookingId) {
  let result = await request('/payments/initiate', { method: 'POST', body: JSON.stringify({ bookingId }) }, cookie);
  assert(result.response.status === 200, `payment initiation failed: ${JSON.stringify(result.body)}`);
  result = await request('/payments/verify', { method: 'POST', body: JSON.stringify({ bookingId, devBypass: true }) }, cookie);
  assert(result.response.status === 200, `payment completion failed: ${JSON.stringify(result.body)}`);
}

async function cancel(cookie, bookingId) {
  return request(`/bookings/${bookingId}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason: 'Cancellation smoke test' }) }, cookie);
}

async function assertFailedRefundState(bookingId) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { payments: true, cancellations: true } });
  assert(booking.status === 'CANCELLED', 'booking was not cancelled');
  assert(booking.cancellations.length === 1 && booking.cancellations[0].status === 'REQUESTED', 'failed refund did not leave cancellation requested');
  assert(booking.cancellations[0].refundAmount.toString() === '0', 'failed refund changed refund amount');
  assert(booking.payments.length === 1 && booking.payments[0].status === 'COMPLETED' && booking.payments[0].refundStatus === 'FAILED', 'failed refund changed payment incorrectly');
}

async function main() {
  const bookingIds = [];
  try {
    const ownerCookie = await registerLogin(emails[0], `Cancel Smoke A ${runId}`);
    const otherCookie = await registerLogin(emails[1], `Cancel Smoke B ${runId}`);
    const flightSearch = await request('/flights/search?from=DEL&to=BOM', {}, ownerCookie);
    assert(flightSearch.response.status === 200 && flightSearch.body.data.flights?.length, 'flight search did not return a usable offer');
    const flightBookingId = await createFlightBooking(ownerCookie, flightSearch.body.data.flights[0].id);
    bookingIds.push(flightBookingId);
    await initiateAndCompleteMock(ownerCookie, flightBookingId);

    const unauthorized = await cancel(otherCookie, flightBookingId);
    assert(unauthorized.response.status === 404, `unauthorized cancellation returned ${unauthorized.response.status}`);
    console.log('OWNERSHIP: PASS');

    const concurrent = await Promise.all([cancel(ownerCookie, flightBookingId), cancel(ownerCookie, flightBookingId)]);
    assert(concurrent.every((result) => result.response.status === 200), 'concurrent cancellation did not return safely');
    await assertFailedRefundState(flightBookingId);
    const flightCancellationCount = await prisma.cancellation.count({ where: { bookingId: flightBookingId } });
    assert(flightCancellationCount === 1, 'concurrent flight cancellation created duplicate records');
    console.log('FLIGHT CANCELLATION + REFUND FAILURE: PASS');

    const repeated = await cancel(ownerCookie, flightBookingId);
    assert(repeated.response.status === 200, 'repeated cancellation was not idempotent');
    assert(await prisma.cancellation.count({ where: { bookingId: flightBookingId } }) === 1, 'repeated cancellation created another record');
    console.log('REPEATED CANCELLATION: PASS');

    const hotelBookingId = await createHotelBooking(ownerCookie);
    bookingIds.push(hotelBookingId);
    const hotelCancellation = await cancel(ownerCookie, hotelBookingId);
    assert(hotelCancellation.response.status === 200, `hotel cancellation failed: ${JSON.stringify(hotelCancellation.body)}`);
    const hotelState = await prisma.booking.findUnique({ where: { id: hotelBookingId }, include: { cancellations: true, payments: true } });
    assert(hotelState.status === 'CANCELLED' && hotelState.cancellations.length === 1 && hotelState.cancellations[0].status === 'PROCESSED', 'hotel no-payment cancellation state invalid');
    console.log('HOTEL CANCELLATION: PASS');

    const flightNotifications = await prisma.notification.findMany({ where: { userId: (await prisma.user.findUnique({ where: { email: emails[0] } })).id, type: { in: ['BOOKING_CANCELLED', 'REFUND_COMPLETED'] }, entityId: flightBookingId } });
    assert(flightNotifications.filter((notification) => notification.type === 'BOOKING_CANCELLED').length === 1, `duplicate cancellation notification created: ${JSON.stringify(flightNotifications)}`);
    assert(flightNotifications.filter((notification) => notification.type === 'REFUND_COMPLETED').length === 0, 'refund completion notification created for failed refund');
    console.log('NOTIFICATIONS: PASS');
  } finally {
    if (bookingIds.length) await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
    assert(await prisma.user.count({ where: { email: { in: emails } } }) === 0, 'temporary users remain after cleanup');
    console.log('CLEANUP: PASS');
  }
}

main().catch((error) => { console.error(`CANCELLATION REFUND SMOKE FAILED: ${error.message}`); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
