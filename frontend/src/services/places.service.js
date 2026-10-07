/**
 * SmartTrip Places Service
 * Proxies all places/routes requests through SmartTrip backend.
 * Never calls Google APIs directly from the browser.
 */
import api from './api';

export const placesService = {
  /**
   * Search places by text query.
   * @param {string} query - Search text (e.g., "Paris", "DEL")
   * @param {'all'|'city'|'airport'} type - Filter type
   * @returns {Promise<{results: Array, source: string}>}
   */
  async searchPlaces(query, type = 'all', options = {}) {
    const params = new URLSearchParams({ q: query });
    if (type !== 'all') params.append('type', type);
    if (options.recordHistory) params.append('recordHistory', 'true');
    const res = await api.get(`/places/search?${params}`);
    return res.data.data; // { results, source }
  },

  /**
   * Get details for a specific place.
   * @param {string} placeId - SmartTrip or Google place ID
   */
  async getPlaceDetails(placeId) {
    const res = await api.get(`/places/${encodeURIComponent(placeId)}`);
    return res.data.data.place;
  },

  /**
   * Compute a route between two locations.
   * @param {string} origin
   * @param {string} destination
   * @param {'DRIVE'|'WALK'|'TRANSIT'|'BICYCLE'} mode
   */
  async getRoute(origin, destination, mode = 'DRIVE') {
    const params = new URLSearchParams({ origin, destination, mode });
    const res = await api.get(`/places/route?${params}`);
    return res.data.data.route;
  },

  /**
   * Get provider status (whether Google API is configured).
   */
  async getStatus() {
    const res = await api.get('/places/status');
    return res.data.data;
  }
};
