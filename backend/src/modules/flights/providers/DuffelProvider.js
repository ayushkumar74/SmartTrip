import FlightProvider from './FlightProvider.js';
import { Duffel } from '@duffel/api';
import { markProviderError } from '../../../utils/providerFallback.js';

export default class DuffelProvider extends FlightProvider {
  constructor(apiKey) {
    super();
    if (!apiKey) {
      throw new Error('Duffel API key is required to initialize DuffelProvider');
    }
    this.duffel = new Duffel({ token: apiKey });
  }

  /**
   * Normalizes a Duffel Offer into the SmartTrip format.
   * Assumes the offer represents a single slice for simplicity in Phase 2B-1.
   */
  _normalize(offer) {
    const slice = offer.slices[0];
    const segment = slice.segments[0]; // for simplicity, take the first segment's airline/flight
    const lastSegment = slice.segments[slice.segments.length - 1];

    return {
      id: `duffel_${offer.id}`,
      airline: segment.operating_carrier?.name || segment.marketing_carrier?.name,
      airlineCode: segment.operating_carrier?.iata_code || segment.marketing_carrier?.iata_code,
      airlineLogoUrl: segment.operating_carrier?.logo_symbol_url || segment.marketing_carrier?.logo_symbol_url || null,
      flightNumber: `${segment.marketing_carrier?.iata_code}${segment.marketing_carrier_flight_number}`,
      departureAirport: slice.origin.iata_code,
      departureCity: slice.origin.city_name || slice.origin.name,
      arrivalAirport: slice.destination.iata_code,
      arrivalCity: slice.destination.city_name || slice.destination.name,
      departureTime: slice.segments[0].departing_at,
      arrivalTime: lastSegment.arriving_at,
      duration: slice.duration,
      stops: slice.segments.length - 1,
      cabinClass: slice.segments[0].passengers[0].cabin_class.toUpperCase(),
      availableSeats: 9, // Duffel doesn't typically expose exact seats, 9 is standard "at least 9"
      price: parseFloat(offer.total_amount),
      currency: offer.total_currency,
      baggage: offer.passengers[0].baggages?.length ? `${offer.passengers[0].baggages.length} Included` : 'Check Airline',
      cabinBaggageKg: null,
      cabinBaggagePieces: null,
      checkInBaggageKg: null,
      checkInBaggagePieces: null
    };
  }

  async searchFlights(criteria) {
    if (!criteria.from || !criteria.to || !criteria.date) {
      throw new Error('Missing required search criteria: from, to, date');
    }

    try {
      // 1. Create an Offer Request
      const offerRequestResponse = await this.duffel.offerRequests.create({
        slices: [
          {
            origin: criteria.from,
            destination: criteria.to,
            departure_date: criteria.date
          }
        ],
        passengers: Array.from({ length: criteria.passengers || 1 }).map(() => ({ type: 'adult' })),
        cabin_class: criteria.cabinClass ? criteria.cabinClass.toLowerCase() : 'economy'
      });

      // 2. The create response includes offers directly. We can sort them.
      const offers = offerRequestResponse.data?.offers;
      if (!Array.isArray(offers)) throw new Error('Duffel returned an unusable offers response');

      // Normalize all offers
      return offers.map(offer => this._normalize(offer));
    } catch (error) {
      console.error('Duffel search error:', error);
      const status = error.statusCode || error.status || Number(error.message?.match(/\b(4\d\d|5\d\d)\b/)?.[1]);
      throw markProviderError(new Error(`Failed to fetch live flights from Duffel: ${error.message}`), status >= 400 && status < 500 ? 'client' : 'runtime');
    }
  }

  async getFlightById(id) {
    const realId = id.replace('duffel_', '');

    try {
      const offerResponse = await this.duffel.offers.get(realId);
      return this._normalize(offerResponse.data);
    } catch (error) {
      console.error('Duffel get offer error:', error);
      const status = error.statusCode || error.status || Number(error.message?.match(/\b(4\d\d|5\d\d)\b/)?.[1]);
      throw markProviderError(new Error(`Failed to fetch specific offer from Duffel: ${error.message}`), status >= 400 && status < 500 ? 'client' : 'runtime');
    }
  }

  async getFareCalendar(criteria) {
    // Note: Live Duffel fare calendar requires specific credentials and API capabilities
    // As per instructions, we explicitly report this as an external pending limitation.
    console.warn('[DuffelProvider] getFareCalendar not currently implemented for live Duffel API (limitation).');
    
    // We will generate the 7 dates with null prices to satisfy UI rendering without fabricating fake prices.
    const startDate = new Date(criteria.date);
    startDate.setHours(0, 0, 0, 0);
    const calendar = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      calendar.push({
        date: d.toISOString().split('T')[0],
        price: null
      });
    }
    return calendar;
  }
}
