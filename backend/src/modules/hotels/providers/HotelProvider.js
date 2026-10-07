/**
 * Abstract base class/interface for Hotel Providers.
 * Ensures a consistent contract across all hotel data sources (e.g. Booking.com, Database).
 */
export default class HotelProvider {
  /**
   * Search for hotels based on given criteria.
   * @param {Object} criteria - Search criteria.
   * @param {string} criteria.destination - Destination city or country.
   * @param {string} [criteria.checkIn] - Check-in date (YYYY-MM-DD).
   * @param {string} [criteria.checkOut] - Check-out date (YYYY-MM-DD).
   * @param {number} [criteria.guests] - Number of guests.
   * @param {number} [criteria.rooms] - Number of rooms.
   * @param {number} [criteria.price] - Maximum price limit.
   * @param {number} [criteria.rating] - Minimum rating.
   * @returns {Promise<Array>} Array of normalized hotel objects.
   */
  async searchHotels(criteria) {
    throw new Error('Method "searchHotels" must be implemented.');
  }

  /**
   * Retrieve authoritative details for a specific hotel and its rooms.
   * @param {string} id - The provider-specific hotel ID.
   * @returns {Promise<Object>} Normalized hotel object including rooms array.
   */
  async getHotelById(id) {
    throw new Error('Method "getHotelById" must be implemented.');
  }
}
