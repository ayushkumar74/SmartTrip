import { flightService } from './flights.service.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';
import { userService } from '../users/users.service.js';
import { validateFlightSearch } from '../../utils/requestValidation.js';

export const flightController = {
  async searchFlights(req, res) {
    try {
      const { from, to, date, returnDate, cabinClass, sortBy, sortOrder, adults, passengers, children, infants } = validateFlightSearch(req.query);
      
      const flights = await flightService.searchFlights({
        from,
        to,
        date,
        returnDate,
        cabinClass,
        sortBy,
        sortOrder,
        adults,
        passengers,
        children,
        infants,
      });

      if (req.user) {
        try {
          await userService.recordSearch(req.user.id, 'flight', { from, to, date, cabinClass });
        } catch (historyError) {
          console.error('[Flight Search History Error]:', historyError.message);
        }
      }

      return sendSuccess(res, 200, 'Flights retrieved successfully', { flights });
    } catch (error) {
      console.error('[Flight Search Error]:', error);
      return sendError(res, error.statusCode || 500, error.message);
    }
  },

  async getFareCalendar(req, res) {
    try {
      const { from, to, date, adults, class: cabinClass } = req.query;
      if (!from || !to || !date) {
        return sendError(res, 400, 'from, to, and date are required for fare calendar');
      }

      const calendar = await flightService.getFareCalendar({ from, to, date, adults, cabinClass });
      return sendSuccess(res, 200, 'Fare calendar retrieved', { calendar });
    } catch (error) {
      console.error('[Fare Calendar Error]:', error);
      return sendError(res, error.statusCode || 500, error.message);
    }
  },

  async getFlightDetails(req, res) {
    try {
      const { id } = req.params;
      const flight = await flightService.getFlightDetails(id);
      
      return sendSuccess(res, 200, 'Flight details retrieved successfully', { flight });
    } catch (error) {
      console.error('[Flight Details Error]:', error);
      return sendError(res, error.statusCode || (error.message.includes('not found') ? 404 : 500), error.message);
    }
  }
};
