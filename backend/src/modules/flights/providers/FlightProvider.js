/**
 * Abstract base class/interface for Flight Providers.
 * Ensures a consistent contract across all flight data sources (e.g. Duffel, Database).
 */
export default class FlightProvider {
  /**
   * Search for flights based on given criteria.
   * @param {Object} criteria - Search criteria.
   * @param {string} criteria.from - Origin airport code or city name.
   * @param {string} criteria.to - Destination airport code or city name.
   * @param {string} criteria.date - Date of departure (YYYY-MM-DD).
   * @param {string} [criteria.cabinClass] - E.g., 'ECONOMY', 'BUSINESS'.
   * @param {number} [criteria.passengers] - Number of passengers.
   * @returns {Promise<Array>} Array of normalized flight objects.
   */
  async searchFlights(criteria) {
    throw new Error('Method "searchFlights" must be implemented.');
  }

  /**
   * Retrieve authoritative details for a specific flight offer.
   * @param {string} id - The provider-specific flight/offer ID.
   * @returns {Promise<Object>} Normalized flight object.
   */
  async getFlightById(id) {
    throw new Error('Method "getFlightById" must be implemented.');
  }

  /**
   * Retrieve a 7-day fare calendar around the target date.
   * @param {Object} criteria - Search criteria containing from, to, date, etc.
   * @returns {Promise<Array>} Array of objects with { date, price }.
   */
  async getFareCalendar(criteria) {
    throw new Error('Method "getFareCalendar" must be implemented.');
  }
}
