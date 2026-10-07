import FlightProvider from './FlightProvider.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class DatabaseFlightProvider extends FlightProvider {
  /**
   * Normalizes DB FlightOffer to SmartTrip standard format
   */
  _normalize(offer) {
    return {
      id: `db_${offer.id}`,
      airline: offer.airline.name,
      flightNumber: offer.flightNumber,
      departureAirport: offer.departureIata,
      // We don't have departureCity directly on offer, but we could fetch it from Airport master if needed.
      // For now, keeping the contract minimal.
      departureCity: offer.departureAirport?.city || offer.departureIata,
      departureCountryCode: offer.departureAirport?.countryCode,
      arrivalAirport: offer.arrivalIata,
      arrivalCity: offer.arrivalAirport?.city || offer.arrivalIata,
      arrivalCountryCode: offer.arrivalAirport?.countryCode,
      departureTime: offer.departureTime,
      arrivalTime: offer.arrivalTime,
      duration: `${Math.floor(offer.durationMinutes / 60)}h ${offer.durationMinutes % 60}m`,
      stops: offer.stops,
      cabinClass: offer.cabinClass,
      availableSeats: offer.availableSeats,
      price: parseFloat(offer.priceINR),
      currency: 'INR',
      baggage: offer.baggageAllowance,
      cabinBaggageKg: offer.cabinBaggageKg,
      cabinBaggagePieces: offer.cabinBaggagePieces,
      checkInBaggageKg: offer.checkInBaggageKg,
      checkInBaggagePieces: offer.checkInBaggagePieces,
      airlineCode: offer.airline.iataCode,
      airlineIcaoCode: offer.airline.icaoCode,
      airlineLogoUrl: offer.airline.logoUrl
    };
  }

  async _withAirportNames(offers) {
    const codes = [...new Set(offers.flatMap((offer) => [offer.departureIata, offer.arrivalIata]))];
    const airports = await prisma.airport.findMany({
      where: { iataCode: { in: codes } },
      select: { iataCode: true, city: true, countryCode: true },
    });
    const byCode = new Map(airports.map((airport) => [airport.iataCode, airport]));
    return offers.map((offer) => ({
      ...offer,
      departureAirport: byCode.get(offer.departureIata),
      arrivalAirport: byCode.get(offer.arrivalIata),
    }));
  }

  async searchFlights(criteria = {}) {
    let whereClause = { active: true };

    if (criteria.from) {
      whereClause.departureIata = { equals: criteria.from, mode: 'insensitive' };
    }
    if (criteria.to) {
      whereClause.arrivalIata = { equals: criteria.to, mode: 'insensitive' };
    }
    if (criteria.cabinClass) {
      whereClause.cabinClass = { equals: criteria.cabinClass, mode: 'insensitive' };
    }
    
    // We will do a basic date match (same day)
    if (criteria.date) {
      const targetDate = new Date(criteria.date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      whereClause.departureTime = {
        gte: targetDate,
        lt: nextDay
      };
    }

    const offers = await prisma.flightOffer.findMany({
      where: whereClause,
      include: { airline: true }
    });

    const enrichedOffers = await this._withAirportNames(offers);
    return enrichedOffers.map(offer => {
      const normalized = this._normalize(offer);
      normalized.fareOptions = this._generateFareOptions(normalized.price);
      return normalized;
    });
  }

  async getFlightById(id) {
    // ID will come as db_UUID
    const realId = id.replace('db_', '');
    
    const offer = await prisma.flightOffer.findUnique({
      where: { id: realId },
      include: { airline: true }
    });

    if (!offer) {
      throw new Error('Database flight offer not found');
    }

    const [enrichedOffer] = await this._withAirportNames([offer]);
    const normalized = this._normalize(enrichedOffer);
    normalized.fareOptions = this._generateFareOptions(normalized.price);
    return normalized;
  }

  _generateFareOptions(basePrice) {
    return [
      {
        id: 'saver',
        name: 'Saver',
        price: basePrice,
        cabinBaggage: '7kg',
        checkInBaggage: '15kg',
        cancellationFee: 'Non-refundable',
        dateChangeFee: '₹3,000'
      },
      {
        id: 'standard',
        name: 'Standard',
        price: basePrice + 1200,
        cabinBaggage: '7kg',
        checkInBaggage: '15kg',
        cancellationFee: '₹2,500',
        dateChangeFee: '₹1,500'
      },
      {
        id: 'flex',
        name: 'Flex',
        price: basePrice + 3500,
        cabinBaggage: '7kg',
        checkInBaggage: '25kg',
        cancellationFee: 'Free',
        dateChangeFee: 'Free'
      }
    ];
  }

  async getFareCalendar(criteria) {
    if (!criteria.from || !criteria.to || !criteria.date) {
      throw new Error('Missing required search criteria for calendar: from, to, date');
    }

    const startDate = new Date(criteria.date);
    startDate.setHours(0, 0, 0, 0);

    const calendar = [];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const nextDay = new Date(d);
      nextDay.setDate(d.getDate() + 1);

      const minOffer = await prisma.flightOffer.findFirst({
        where: {
          active: true,
          departureIata: { equals: criteria.from, mode: 'insensitive' },
          arrivalIata: { equals: criteria.to, mode: 'insensitive' },
          departureTime: {
            gte: d,
            lt: nextDay
          }
        },
        orderBy: {
          priceINR: 'asc'
        },
        select: {
          priceINR: true
        }
      });

      calendar.push({
        date: d.toISOString().split('T')[0],
        price: minOffer ? parseFloat(minOffer.priceINR) : null
      });
    }

    return calendar;
  }
}
