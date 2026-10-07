import { markProviderError } from './src/utils/providerFallback.js';

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const flightOffer = { id: 'db_fallback_flight', price: 100 };
const hotelOffer = { id: 'db_fallback_hotel', rooms: [] };

async function testFlightFallback() {
  process.env.DUFFEL_API_KEY = 'controlled-test-key';
  const [{ flightService }, DuffelProvider, DatabaseFlightProvider] = await Promise.all([
    import('./src/modules/flights/flights.service.js'),
    import('./src/modules/flights/providers/DuffelProvider.js').then((module) => module.default),
    import('./src/modules/flights/providers/DatabaseFlightProvider.js').then((module) => module.default),
  ]);
  const externalSearch = DuffelProvider.prototype.searchFlights;
  const databaseSearch = DatabaseFlightProvider.prototype.searchFlights;
  try {
    DuffelProvider.prototype.searchFlights = async () => [{ id: 'duffel_success' }];
    let result = await flightService.searchFlights({ from: 'DEL', to: 'BOM', date: '2026-11-10' });
    assert(result[0].id === 'duffel_success', 'successful Duffel response was not used');

    DuffelProvider.prototype.searchFlights = async () => { throw markProviderError(new Error('timeout'), 'runtime'); };
    DatabaseFlightProvider.prototype.searchFlights = async () => [flightOffer];
    result = await flightService.searchFlights({ from: 'DEL', to: 'BOM', date: '2026-11-10' });
    assert(result[0] === flightOffer, 'Duffel runtime failure did not use database fallback');

    let fallbackCalled = false;
    DuffelProvider.prototype.searchFlights = async () => { throw new Error('Invalid airport'); };
    DatabaseFlightProvider.prototype.searchFlights = async () => { fallbackCalled = true; return [flightOffer]; };
    await assertRejects(() => flightService.searchFlights({ from: 'BAD', to: 'BOM', date: '2026-11-10' }), 'Invalid airport');
    assert(!fallbackCalled, 'invalid flight input triggered database fallback');

    DuffelProvider.prototype.searchFlights = async () => { throw markProviderError(new Error('provider unavailable'), 'runtime'); };
    DatabaseFlightProvider.prototype.searchFlights = async () => { throw new Error('database unavailable'); };
    await assertRejects(() => flightService.searchFlights({ from: 'DEL', to: 'BOM', date: '2026-11-10' }), 'database unavailable');
    console.log('FLIGHTS FALLBACK: PASS');
  } finally {
    DuffelProvider.prototype.searchFlights = externalSearch;
    DatabaseFlightProvider.prototype.searchFlights = databaseSearch;
  }
}

async function testHotelFallback() {
  process.env.BOOKING_API_KEY = 'controlled-test-key';
  const [{ hotelService }, BookingProvider, DatabaseHotelProvider] = await Promise.all([
    import('./src/modules/hotels/hotels.service.js'),
    import('./src/modules/hotels/providers/BookingProvider.js').then((module) => module.default),
    import('./src/modules/hotels/providers/DatabaseHotelProvider.js').then((module) => module.default),
  ]);
  const externalSearch = BookingProvider.prototype.searchHotels;
  const databaseSearch = DatabaseHotelProvider.prototype.searchHotels;
  try {
    BookingProvider.prototype.searchHotels = async () => [{ id: 'booking_success' }];
    let result = await hotelService.searchHotels({ destination: 'Paris' });
    assert(result[0].id === 'booking_success', 'successful Booking.com response was not used');

    BookingProvider.prototype.searchHotels = async () => { throw markProviderError(new Error('timeout'), 'runtime'); };
    DatabaseHotelProvider.prototype.searchHotels = async () => [hotelOffer];
    result = await hotelService.searchHotels({ destination: 'Paris' });
    assert(result[0] === hotelOffer, 'Booking.com runtime failure did not use database fallback');

    let fallbackCalled = false;
    BookingProvider.prototype.searchHotels = async () => { throw new Error('Invalid destination'); };
    DatabaseHotelProvider.prototype.searchHotels = async () => { fallbackCalled = true; return [hotelOffer]; };
    await assertRejects(() => hotelService.searchHotels({ destination: 'Invalid destination' }), 'Invalid destination');
    assert(!fallbackCalled, 'invalid hotel input triggered database fallback');

    BookingProvider.prototype.searchHotels = async () => { throw markProviderError(new Error('provider unavailable'), 'runtime'); };
    DatabaseHotelProvider.prototype.searchHotels = async () => { throw new Error('database unavailable'); };
    await assertRejects(() => hotelService.searchHotels({ destination: 'Paris' }), 'database unavailable');
    console.log('HOTELS FALLBACK: PASS');
  } finally {
    BookingProvider.prototype.searchHotels = externalSearch;
    DatabaseHotelProvider.prototype.searchHotels = databaseSearch;
  }
}

async function testPlacesFallback() {
  process.env.GOOGLE_MAPS_API_KEY = 'controlled-test-key';
  const { placesService } = await import('./src/modules/places/places.service.js');
  const externalSearch = placesService._googlePlacesSearch;
  const databaseSearch = placesService._dbFallbackSearch;
  try {
    placesService._googlePlacesSearch = async () => ({ results: [{ id: 'google_success' }], source: 'google' });
    let result = await placesService.searchPlaces('Paris', 'city');
    assert(result.source === 'google', 'successful Google response was not used');

    placesService._googlePlacesSearch = async () => { throw markProviderError(new Error('Google timeout'), 'runtime'); };
    placesService._dbFallbackSearch = async () => ({ results: [{ id: 'db_place' }], source: 'database' });
    result = await placesService.searchPlaces('Paris', 'city');
    assert(result.source === 'database', 'Google runtime failure did not use database fallback');

    let fallbackCalled = false;
    placesService._googlePlacesSearch = async () => { throw markProviderError(new Error('Google invalid request'), 'client'); };
    placesService._dbFallbackSearch = async () => { fallbackCalled = true; return { results: [], source: 'database' }; };
    await assertRejects(() => placesService.searchPlaces('Paris', 'city'), 'Google invalid request');
    assert(!fallbackCalled, 'Google client failure triggered database fallback');
    console.log('PLACES FALLBACK: PASS');
  } finally {
    placesService._googlePlacesSearch = externalSearch;
    placesService._dbFallbackSearch = databaseSearch;
  }
}

async function assertRejects(operation, expectedMessage) {
  try {
    await operation();
    throw new Error(`expected rejection: ${expectedMessage}`);
  } catch (error) {
    if (!error.message.includes(expectedMessage)) throw error;
  }
}

await testFlightFallback();
await testHotelFallback();
await testPlacesFallback();
console.log('CONTROLLED PROVIDER FALLBACK SMOKE: PASS');
