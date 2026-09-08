import { flightService } from './flights.service.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export const flightController = {
  async searchFlights(req, res) {
    try {
      const { from, to, date, cabinClass, sortBy, sortOrder } = req.query;
      
      const flights = await flightService.searchFlights({
        from,
        to,
        date,
        cabinClass,
        sortBy,
        sortOrder
      });

      return sendSuccess(res, 200, 'Flights retrieved successfully', { flights });
    } catch (error) {
      console.error('[Flight Search Error]:', error);
      return sendError(res, error.message, 500);
    }
  },

  async getFlightDetails(req, res) {
    try {
      const { id } = req.params;
      const flight = await flightService.getFlightDetails(id);
      
      return sendSuccess(res, 200, 'Flight details retrieved successfully', { flight });
    } catch (error) {
      console.error('[Flight Details Error]:', error);
      return sendError(res, error.message, error.message.includes('not found') ? 404 : 500);
    }
  }
};
