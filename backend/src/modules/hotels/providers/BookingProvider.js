import HotelProvider from './HotelProvider.js';
import fetch from 'node-fetch';
import { markProviderError } from '../../../utils/providerFallback.js';

export default class BookingProvider extends HotelProvider {
  constructor(apiKey) {
    super();
    if (!apiKey) {
      throw new Error('Booking.com API key is required to initialize BookingProvider');
    }
    this.apiKey = apiKey;
    this.baseUrl = 'https://demandapi.booking.com/3.1'; // Assuming a typical Demand API endpoint structure
  }

  /**
   * Helper for API requests
   */
  async _fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw markProviderError(new Error(`Booking.com API Error (${response.status}): ${errorText}`), response.status >= 400 && response.status < 500 ? 'client' : 'runtime');
    }

    return await response.json();
  }

  /**
   * Normalizes a Booking.com API response to the SmartTrip format.
   * This is a simplified normalization based on standard OTA JSON structures.
   */
  _normalize(hotelData) {
    return {
      id: `booking_${hotelData.hotel_id}`,
      name: hotelData.name || 'Unknown Hotel',
      city: hotelData.city || 'Unknown City',
      address: hotelData.address || '',
      rating: hotelData.class || 0,
      images: hotelData.photos ? hotelData.photos.map(p => p.url) : [],
      amenities: hotelData.hotel_facilities ? hotelData.hotel_facilities.map(f => f.name) : [],
      rooms: (hotelData.rooms || []).map(room => ({
        id: `booking_room_${room.room_id}`,
        name: room.name || 'Standard Room',
        price: parseFloat(room.price || room.min_price?.price || 0),
        currency: room.currency || room.min_price?.currency || 'USD',
        capacity: room.max_persons || 2
      }))
    };
  }

  async searchHotels(criteria) {
    if (!criteria.destination) {
      throw new Error('Destination is required for live Booking.com search');
    }

    try {
      // Step 1: Destination to location/dest_id (simplified assumption for implementation)
      // Real Demand API would likely require a location lookup first.
      
      const queryParams = new URLSearchParams({
        dest_type: 'city',
        dest_id: criteria.destination, // MOCK: We would resolve this to an actual Booking.com dest_id
        checkin: criteria.checkIn,
        checkout: criteria.checkOut,
        guests: criteria.guests || 2
      });

      const response = await this._fetch(`/hotels/search?${queryParams.toString()}`);
      
      // If the provider legitimately returns empty results, we return []
      if (!response || !Array.isArray(response.result)) {
        throw new Error('Booking.com returned an unusable hotel response');
      }
      if (response.result.length === 0) {
        return [];
      }

      return response.result.map(hotel => this._normalize(hotel));
    } catch (error) {
      console.error('Booking.com search error:', error);
      throw markProviderError(new Error(`Failed to fetch live hotels from Booking.com: ${error.message}`), error.providerFailureKind === 'client' ? 'client' : 'runtime');
    }
  }

  async getHotelById(id) {
    const realId = id.replace('booking_', '');

    try {
      const response = await this._fetch(`/hotels/details?hotel_ids=${realId}`);
      
      if (!response || !Array.isArray(response.result) || response.result.length === 0) {
        throw new Error('Booking.com hotel not found');
      }

      return this._normalize(response.result[0]);
    } catch (error) {
      console.error('Booking.com get hotel error:', error);
      throw markProviderError(new Error(`Failed to fetch specific hotel from Booking.com: ${error.message}`), error.providerFailureKind === 'client' ? 'client' : 'runtime');
    }
  }
}
