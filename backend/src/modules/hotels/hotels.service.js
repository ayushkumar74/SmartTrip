import DatabaseHotelProvider from './providers/DatabaseHotelProvider.js';
import BookingProvider from './providers/BookingProvider.js';
import { shouldFallbackToDatabase } from '../../utils/providerFallback.js';
import dotenv from 'dotenv';
dotenv.config();

let activeProvider;
const databaseProvider = new DatabaseHotelProvider();

if (process.env.BOOKING_API_KEY) {
  console.log('🏨 Initializing Booking.com Provider');
  activeProvider = new BookingProvider(process.env.BOOKING_API_KEY);
} else {
  console.log('⚠️ BOOKING_API_KEY not found. Falling back to Database Hotel Provider.');
  activeProvider = new DatabaseHotelProvider();
}

export const hotelService = {
  async searchHotels(criteria) {
    try {
      return await activeProvider.searchHotels(criteria);
    } catch (error) {
      if (activeProvider === databaseProvider || !shouldFallbackToDatabase(error)) throw error;
      console.warn('[Hotel Provider Fallback] Booking.com failed; using database provider');
      return databaseProvider.searchHotels(criteria);
    }
  },

  async getHotelDetails(hotelId) {
    try {
      return await activeProvider.getHotelById(hotelId);
    } catch (error) {
      if (activeProvider === databaseProvider || !shouldFallbackToDatabase(error)) throw error;
      console.warn('[Hotel Provider Fallback] Booking.com details failed; using database provider');
      return databaseProvider.getHotelById(hotelId);
    }
  }
};
