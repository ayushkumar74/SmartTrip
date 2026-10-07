import HotelProvider from './HotelProvider.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class DatabaseHotelProvider extends HotelProvider {
  /**
   * Normalizes a Prisma Hotel & Room to SmartTrip standard format
   */
  _normalize(hotel) {
    return {
      id: `db_${hotel.id}`,
      name: hotel.name,
      city: hotel.city,
      address: `${hotel.city}, ${hotel.country}`, // Fallback for address
      rating: hotel.starRating || 0,
      images: hotel.imageUrl ? [hotel.imageUrl] : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'],
      amenities: hotel.amenities || [],
      rooms: (hotel.rooms || []).map(room => ({
        id: `db_room_${room.id}`,
        name: room.name,
        price: parseFloat(room.pricePerNightINR),
        currency: 'INR',
        capacity: room.maxGuests,
        amenities: room.amenities || [],
        cancellation: room.cancellation || null
      }))
    };
  }

  async searchHotels(criteria = {}) {
    let whereClause = {};

    if (criteria.destination && criteria.destination.toLowerCase() !== 'india') {
      const destLower = criteria.destination.toLowerCase();
      whereClause.city = { equals: destLower, mode: 'insensitive' };
    }

    if (criteria.rating) {
      whereClause.starRating = { gte: parseFloat(criteria.rating) };
    }

    // Optional price filtering on the primary level could be complex if we only filter by rooms,
    // but Prisma allows relation filtering:
    if (criteria.price) {
      whereClause.rooms = {
        some: {
          pricePerNightINR: { lte: parseFloat(criteria.price) }
        }
      };
    }

    const hotels = await prisma.hotel.findMany({
      where: whereClause,
      include: {
        rooms: true
      }
    });

    return hotels.map(hotel => this._normalize(hotel));
  }

  async getHotelById(id) {
    const realId = id.replace('db_', '');

    const hotel = await prisma.hotel.findUnique({
      where: { id: realId },
      include: {
        rooms: true
      }
    });

    if (!hotel) {
      throw new Error('Database hotel not found');
    }

    return this._normalize(hotel);
  }
}
