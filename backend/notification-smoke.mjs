import prisma from './src/config/prisma.js';

const base = 'http://localhost:5000/api/v1';
const runId = Date.now().toString(36);
const password = `NotifySmoke-${runId}!`;
const emails = [`notify-smoke-a-${runId}@example.test`, `notify-smoke-b-${runId}@example.test`];
const assert = (condition, message) => { if (!condition) throw new Error(message); };

async function request(path, options = {}, cookie = '') {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (cookie) headers.Cookie = cookie;
  const response = await fetch(`${base}${path}`, { ...options, headers });
  const text = await response.text();
  let body; try { body = text ? JSON.parse(text) : null; } catch { body = text; }
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

async function main() {
  let tripId;
  let hotelBookingId;
  let notificationId;
  try {
    const userCookie = await registerLogin(emails[0], `Notification Smoke A ${runId}`);
    const otherCookie = await registerLogin(emails[1], `Notification Smoke B ${runId}`);

    let result = await request('/notifications');
    assert(result.response.status === 401, 'unauthenticated notifications request was not rejected');

    result = await request('/flights/search?from=DEL&to=BOM', {}, userCookie);
    assert(result.response.status === 200 && result.body.data.flights?.length, 'flight search did not return a usable offer');
    const flight = result.body.data.flights[0];
    result = await request('/bookings', {
      method: 'POST',
      body: JSON.stringify({ flightId: flight.id, passengerData: [{ firstName: 'Notify', lastName: 'Tester', dateOfBirth: '1990-01-01', gender: 'OTHER', nationality: 'Indian' }] }),
    }, userCookie);
    assert(result.response.status === 201, `flight booking failed: ${JSON.stringify(result.body)}`);

    result = await request('/hotels/search?destination=Paris&checkIn=2026-11-10&checkOut=2026-11-12', {}, userCookie);
    assert(result.response.status === 200, 'hotel search failed');
    let hotel = result.body.data.hotels?.[0];
    if (!hotel) {
      const databaseHotel = await prisma.hotel.findFirst({ where: { active: true }, include: { rooms: { where: { available: true }, take: 1 } } });
      hotel = databaseHotel && { id: `db_${databaseHotel.id}`, rooms: databaseHotel.rooms.map((room) => ({ id: `db_room_${room.id}` })) };
    }
    const room = hotel?.rooms?.[0];
    assert(room?.id, 'hotel search did not return a usable room');
    result = await request('/bookings/hotel', {
      method: 'POST',
      body: JSON.stringify({ hotelId: hotel.id, roomId: room.id, checkIn: '2026-11-10', checkOut: '2026-11-12', guestData: [{ title: 'MR', firstName: 'Notify', lastName: 'Guest', email: 'notify@example.test', mobile: '+919876543210', nationality: 'Indian' }] }),
    }, userCookie);
    assert(result.response.status === 201, `hotel booking failed: ${JSON.stringify(result.body)}`);
    hotelBookingId = result.body.data.booking.id;

    result = await request('/payments/initiate', { method: 'POST', body: JSON.stringify({ bookingId: hotelBookingId }) }, userCookie);
    assert(result.response.status === 200 && result.body.data.mode === 'MOCK', 'local explicit mock payment mode unavailable');
    result = await request('/payments/verify', { method: 'POST', body: JSON.stringify({ bookingId: hotelBookingId, devBypass: true }) }, userCookie);
    assert(result.response.status === 200, `development payment verification failed: ${JSON.stringify(result.body)}`);

    result = await request('/trips', {
      method: 'POST',
      body: JSON.stringify({ title: `Notification Trip ${runId}`, startDate: '2026-11-10', endDate: '2026-11-12', days: [] }),
    }, userCookie);
    assert(result.response.status === 201, `trip creation failed: ${JSON.stringify(result.body)}`);
    tripId = result.body.data.trip.id;

    result = await request(`/trips/${tripId}`, { method: 'PATCH', body: JSON.stringify({ title: `Updated Notification Trip ${runId}` }) }, userCookie);
    assert(result.response.status === 200, `trip update failed: ${JSON.stringify(result.body)}`);

    result = await request(`/bookings/${hotelBookingId}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason: 'Notification smoke test' }) }, userCookie);
    assert(result.response.status === 200, `cancellation failed: ${JSON.stringify(result.body)}`);

    result = await request('/notifications?page=1&pageSize=100', {}, userCookie);
    assert(result.response.status === 200, 'notification list failed');
    const notifications = result.body.data.notifications;
    const types = new Set(notifications.map((notification) => notification.type));
    for (const type of ['BOOKING_CREATED', 'PAYMENT_COMPLETED', 'BOOKING_CANCELLED', 'TRIP_SAVED', 'TRIP_UPDATED']) {
      assert(types.has(type), `${type} notification missing`);
    }
    notificationId = notifications.find((notification) => !notification.isRead)?.id;
    result = await request('/notifications/unread-count', {}, userCookie);
    assert(result.response.status === 200 && result.body.data.unreadCount >= 4, 'unread count was incorrect');
    result = await request(`/notifications/${notificationId}/read`, { method: 'PATCH' }, userCookie);
    assert(result.response.status === 200, 'mark one read failed');
    result = await request('/notifications/read-all', { method: 'PATCH' }, userCookie);
    assert(result.response.status === 200, 'mark all read failed');
    result = await request('/notifications/unread-count', {}, userCookie);
    assert(result.body.data.unreadCount === 0, 'unread count did not reach zero');
    console.log('EVENTS AND READ STATE: PASS');

    result = await request('/notifications', {}, otherCookie);
    assert(result.response.status === 200 && result.body.data.notifications.length === 0, 'other user saw user A notifications');
    result = await request(`/notifications/${notificationId}/read`, { method: 'PATCH' }, otherCookie);
    assert(result.response.status === 404, `other user notification mutation returned ${result.response.status}`);
    console.log('OWNERSHIP: PASS');
  } finally {
    if (tripId) await prisma.trip.deleteMany({ where: { id: tripId } });
    const temporaryUsers = await prisma.user.findMany({ where: { email: { in: emails } }, select: { id: true } });
    const temporaryUserIds = temporaryUsers.map((user) => user.id);
    if (temporaryUserIds.length) {
      await prisma.booking.deleteMany({ where: { userId: { in: temporaryUserIds } } });
    }
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
    const remaining = await prisma.user.count({ where: { email: { in: emails } } });
    assert(remaining === 0, 'temporary notification test users were not cleaned up');
    console.log('CLEANUP: PASS');
  }
}

main().catch((error) => { console.error(`NOTIFICATION SMOKE FAILED: ${error.message}`); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
