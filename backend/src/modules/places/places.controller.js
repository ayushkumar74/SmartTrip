import { placesService } from './places.service.js';
import { userService } from '../users/users.service.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export const placesController = {
  /**
   * GET /api/v1/places/search?q=paris&type=city
   * type: 'city' | 'airport' | 'all' (default: 'all')
   */
  async searchPlaces(req, res) {
    try {
      const { q = '', type = 'all' } = req.query;
      const result = await placesService.searchPlaces(q, type);
      if (req.user && req.query.recordHistory === 'true' && q.trim().length >= 2) {
        try {
          await userService.recordSearch(req.user.id, 'destination', { q: q.trim(), type });
        } catch (historyError) {
          console.error('[Destination Search History Error]:', historyError.message);
        }
      }
      return sendSuccess(res, 200, 'Places retrieved successfully', result);
    } catch (error) {
      console.error('[Places Search Error]:', error.message);
      return sendError(res, 502, `Places search failed: ${error.message}`);
    }
  },

  /**
   * GET /api/v1/places/:placeId
   */
  async getPlaceDetails(req, res) {
    try {
      const { placeId } = req.params;
      const place = await placesService.getPlaceDetails(placeId);
      return sendSuccess(res, 200, 'Place details retrieved', { place });
    } catch (error) {
      console.error('[Place Details Error]:', error.message);
      const status = error.message.includes('not found') ? 404 : 502;
      return sendError(res, status, error.message);
    }
  },

  /**
   * GET /api/v1/places/route?origin=Delhi&destination=Mumbai&mode=DRIVE
   */
  async getRoute(req, res) {
    try {
      const { origin, destination, mode = 'DRIVE' } = req.query;
      if (!origin || !destination) {
        return sendError(res, 400, 'origin and destination are required');
      }
      const route = await placesService.getRoute(origin, destination, mode);
      return sendSuccess(res, 200, 'Route computed successfully', { route });
    } catch (error) {
      console.error('[Route Error]:', error.message);
      return sendError(res, 502, `Route computation failed: ${error.message}`);
    }
  },

  /**
   * GET /api/v1/places/status
   * Returns whether Google Maps API is configured
   */
  async getStatus(req, res) {
    const configured = !!(process.env.GOOGLE_MAPS_API_KEY);
    return sendSuccess(res, 200, 'Places provider status', {
      provider: configured ? 'google' : 'database',
      googleConfigured: configured,
      note: configured
        ? 'Google Places & Routes API active'
        : 'Using database fallback. Add GOOGLE_MAPS_API_KEY to .env to enable live data.'
    });
  }
};
