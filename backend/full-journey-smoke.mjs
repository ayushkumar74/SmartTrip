import prisma from './src/config/prisma.js';

const base = 'http://localhost:5000/api/v1';
const runId = Date.now().toString(36);
const password = `FullJourney-${runId}!`;
const emails = [`full-journey-a-${runId}@example.test`, `full-journey-b-${runId}@example.test`];
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

async function createFlightBooking(cookie, flightId, firstName = 'Journey') {
  const result = await request('/bookings', {
    method: 'POST',
    body: JSON.stringify({ flightId, passengerData: [{ firstName, lastName: 'Tester', dateOfBirth: '1990-01-01', gender: 'OTHER', nationality: 'Indian' }] }),
  }, cookie);
  assert(result.response.status === 201, `flight booking failed: ${JSON.stringify(result.body)}`);
  return result.body.data.booking.id;
}

async function completePayment(cookie, bookingId) {
  let result = await request('/payments/initiate', { method: 'POST', body: JSON.stringify({ bookingId }) }, cookie);
  assert(result.response.status === 200 && result.body.data.mode === 'MOCK', `payment initiation failed: ${JSON.stringify(result.body)}`);
  result = await request('/payments/verify', { method: 'POST', body: JSON.stringify({ bookingId, devBypass: true }) }, cookie);
  assert(result.response.status === 200 && result.body.data.payment.status === 'COMPLETED', `payment completion failed: ${JSON.stringify(result.body)}`);
}

async function main() {
  const bookingIds = [];
  let tripId;
  let wishlistId;
  try {
    const ownerCookie = await registerLogin(emails[0], `Full Journey A ${runId}`);
    const otherCookie = await registerLogin(emails[1], `Full Journey B ${runId}`);

    const flightSearch = await request('/flights/search?from=DEL&to=BOM', {}, ownerCookie);
    assert(flightSearch.response.status === 200 && flightSearch.body.data.flights?.length, 'flight search failed');
    const flightId = flightSearch.body.data.flights[0].id;
    const flightBookingId = await createFlightBooking(ownerCookie, flightId);
    bookingIds.push(flightBookingId);
    await completePayment(ownerCookie, flightBookingId);
    let bookings = await request('/bookings', {}, ownerCookie);
    assert(bookings.response.status === 200 && bookings.body.data.bookings.some((booking) => booking.id === flightBookingId && booking.status === 'CONFIRMED'), 'confirmed flight booking missing from My Trips/bookings');
    let cancelled = await request(`/bookings/${flightBookingId}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason: 'Full journey flight cancellation' }) }, ownerCookie);
    assert(cancelled.response.status === 200, `flight cancellation failed: ${JSON.stringify(cancelled.body)}`);
    const flightState = await prisma.booking.findUnique({ where: { id: flightBookingId }, include: { payments: true, cancellations: true } });
    assert(flightState.status === 'CANCELLED' && flightState.payments[0].status === 'COMPLETED' && flightState.payments[0].refundStatus === 'FAILED', 'flight cancellation/payment state was inconsistent');
    console.log('FLIGHT JOURNEY: PASS');

    const hotelSearch = await request('/hotels/search?destination=Paris&checkIn=2026-11-10&checkOut=2026-11-12', {}, ownerCookie);
    assert(hotelSearch.response.status === 200, 'hotel search failed');
    let hotel = hotelSearch.body.data.hotels?.[0];
    if (!hotel) {
      const databaseHotel = await prisma.hotel.findFirst({ where: { active: true }, include: { rooms: { where: { available: true }, take: 1 } } });
      hotel = databaseHotel && { id: `db_${databaseHotel.id}`, rooms: databaseHotel.rooms.map((room) => ({ id: `db_room_${room.id}` })) };
    }
    const room = hotel?.rooms?.[0];
    assert(room?.id, 'hotel room selection failed');
    let hotelBooking = await request('/bookings/hotel', {
      method: 'POST',
      body: JSON.stringify({ hotelId: hotel.id, roomId: room.id, checkIn: '2026-11-10', checkOut: '2026-11-12', guestData: [{ title: 'MR', firstName: 'Hotel', lastName: 'Guest', email: 'hotel@example.test', mobile: '+919876543210', nationality: 'Indian' }] }),
    }, ownerCookie);
    assert(hotelBooking.response.status === 201, `hotel booking failed: ${JSON.stringify(hotelBooking.body)}`);
    const hotelBookingId = hotelBooking.body.data.booking.id;
    bookingIds.push(hotelBookingId);
    await completePayment(ownerCookie, hotelBookingId);
    bookings = await request('/bookings', {}, ownerCookie);
    assert(bookings.body.data.bookings.some((booking) => booking.id === hotelBookingId && booking.status === 'CONFIRMED'), 'confirmed hotel booking missing from My Trips/bookings');
    cancelled = await request(`/bookings/${hotelBookingId}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason: 'Full journey hotel cancellation' }) }, ownerCookie);
    assert(cancelled.response.status === 200, `hotel cancellation failed: ${JSON.stringify(cancelled.body)}`);
    const hotelState = await prisma.booking.findUnique({ where: { id: hotelBookingId }, include: { payments: true, cancellations: true } });
    assert(hotelState.status === 'CANCELLED' && hotelState.payments[0].status === 'COMPLETED' && hotelState.payments[0].refundStatus === 'FAILED', 'hotel cancellation/payment state was inconsistent');
    console.log('HOTEL JOURNEY: PASS');

    let trip = await request('/trips', { method: 'POST', body: JSON.stringify({ title: `Full Journey Trip ${runId}`, startDate: '2026-11-10', endDate: '2026-11-12', days: [] }) }, ownerCookie);
    assert(trip.response.status === 201, `trip creation failed: ${JSON.stringify(trip.body)}`);
    tripId = trip.body.data.trip.id;
    let day = await request(`/trips/${tripId}/days`, { method: 'POST', body: JSON.stringify({ dayNumber: 1, date: '2026-11-10' }) }, ownerCookie);
    assert(day.response.status === 201, `trip day creation failed: ${JSON.stringify(day.body)}`);
    const dayId = day.body.data.day.id;
    const activity = await request(`/trips/${tripId}/days/${dayId}/activities`, { method: 'POST', body: JSON.stringify({ title: 'City walk', activityType: 'Custom', sortOrder: 1 }) }, ownerCookie);
    assert(activity.response.status === 201, `trip activity creation failed: ${JSON.stringify(activity.body)}`);
    trip = await request(`/trips/${tripId}`, { method: 'PATCH', body: JSON.stringify({ title: `Updated Full Journey Trip ${runId}` }) }, ownerCookie);
    assert(trip.response.status === 200, `trip update failed: ${JSON.stringify(trip.body)}`);
    const persistedTrip = await request(`/trips/${tripId}`, {}, ownerCookie);
    assert(persistedTrip.response.status === 200 && persistedTrip.body.data.trip.days[0].activities.length === 1, 'trip itinerary was not persisted');
    const otherTrip = await request(`/trips/${tripId}`, {}, otherCookie);
    assert(otherTrip.response.status === 404, `other user accessed trip with ${otherTrip.response.status}`);
    let deleted = await request(`/trips/${tripId}`, { method: 'DELETE' }, ownerCookie);
    assert(deleted.response.status === 200, 'trip deletion failed');
    deleted = await request(`/trips/${tripId}`, {}, ownerCookie);
    assert(deleted.response.status === 404, `deleted trip returned ${deleted.response.status}`);
    tripId = null;
    console.log('TRIP JOURNEY: PASS');

    const destination = await prisma.destination.findFirst({ select: { id: true } });
    assert(destination, 'destination seed missing');
    let wishlist = await request('/wishlist', {}, ownerCookie);
    assert(wishlist.response.status === 200, 'wishlist list failed');
    wishlist = await request('/wishlist', { method: 'POST', body: JSON.stringify({ type: 'destination', itemId: destination.id }) }, ownerCookie);
    assert(wishlist.response.status === 201, 'wishlist add failed');
    wishlistId = wishlist.body.data.item.id;
    const duplicate = await request('/wishlist', { method: 'POST', body: JSON.stringify({ type: 'destination', itemId: destination.id }) }, ownerCookie);
    assert(duplicate.response.status === 201 && duplicate.body.data.item.id === wishlistId, 'wishlist duplicate was not idempotent');
    const otherWishlist = await request('/wishlist', {}, otherCookie);
    assert(otherWishlist.response.status === 200 && otherWishlist.body.data.items.length === 0, 'other user saw wishlist');
    const otherRemove = await request(`/wishlist/${wishlistId}`, { method: 'DELETE' }, otherCookie);
    assert(otherRemove.response.status === 404, 'other user removed wishlist item');
    const removed = await request(`/wishlist/${wishlistId}`, { method: 'DELETE' }, ownerCookie);
    assert(removed.response.status === 200, 'wishlist remove failed');
    wishlistId = null;
    console.log('WISHLIST JOURNEY: PASS');

    let preferences = await request('/users/preferences', {}, ownerCookie);
    assert(preferences.response.status === 200, 'preferences GET failed');
    await request('/users/preferences', { method: 'PATCH', body: JSON.stringify({ travelStyles: ['Adventure'], budgetLevel: 'Budget' }) }, ownerCookie);
    await request('/users/preferences', { method: 'PATCH', body: JSON.stringify({ bookingNotifications: false, paymentNotifications: true, tripNotifications: true }) }, ownerCookie);
    preferences = await request('/users/preferences', {}, ownerCookie);
    assert(preferences.body.data.preferences.travelStyles.includes('Adventure') && preferences.body.data.preferences.budgetLevel === 'Budget' && preferences.body.data.preferences.bookingNotifications === false, 'preferences were not persisted');
    console.log('PREFERENCES JOURNEY: PASS');

    const failedBookingId = await createFlightBooking(ownerCookie, flightId, 'Failed');
    bookingIds.push(failedBookingId);
    let failedPayment = await request('/payments/initiate', { method: 'POST', body: JSON.stringify({ bookingId: failedBookingId }) }, ownerCookie);
    assert(failedPayment.response.status === 200, 'failed-payment initiation failed');
    failedPayment = await request('/payments/fail', { method: 'POST', body: JSON.stringify({ bookingId: failedBookingId }) }, ownerCookie);
    assert(failedPayment.response.status === 200 && failedPayment.body.data.payment.status === 'FAILED', 'payment failure path failed');

    const notifications = await request('/notifications?page=1&pageSize=100', {}, ownerCookie);
    assert(notifications.response.status === 200, 'notification list failed');
    const types = new Set(notifications.body.data.notifications.map((notification) => notification.type));
    for (const type of ['BOOKING_CREATED', 'PAYMENT_COMPLETED', 'PAYMENT_FAILED', 'BOOKING_CANCELLED', 'TRIP_SAVED', 'TRIP_UPDATED']) assert(types.has(type), `${type} notification missing`);
    assert(!types.has('REFUND_COMPLETED'), 'refund notification appeared without successful refund');
    const unread = await request('/notifications/unread-count', {}, ownerCookie);
    assert(unread.response.status === 200 && unread.body.data.unreadCount > 0, 'unread count failed');
    const unreadItem = notifications.body.data.notifications.find((notification) => !notification.isRead);
    assert(unreadItem, 'no unread notification available');
    assert((await request(`/notifications/${unreadItem.id}/read`, { method: 'PATCH' }, ownerCookie)).response.status === 200, 'mark read failed');
    assert((await request('/notifications/read-all', { method: 'PATCH' }, ownerCookie)).response.status === 200, 'mark all failed');
    assert((await request('/notifications/unread-count', {}, ownerCookie)).body.data.unreadCount === 0, 'unread count did not clear');
    const otherNotifications = await request('/notifications', {}, otherCookie);
    assert(otherNotifications.response.status === 200 && otherNotifications.body.data.notifications.length === 0, 'other user saw notifications');
    console.log('NOTIFICATION JOURNEY: PASS');
  } finally {
    if (wishlistId) await prisma.wishlist.deleteMany({ where: { id: wishlistId } });
    if (tripId) await prisma.trip.deleteMany({ where: { id: tripId } });
    if (bookingIds.length) await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
    assert(await prisma.user.count({ where: { email: { in: emails } } }) === 0, 'full journey users remain after cleanup');
    console.log('FULL JOURNEY CLEANUP: PASS');
  }
}

main().catch((error) => { console.error(`FULL JOURNEY SMOKE FAILED: ${error.message}`); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
