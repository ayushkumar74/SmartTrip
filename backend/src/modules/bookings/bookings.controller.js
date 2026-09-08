import { bookingService } from './bookings.service.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export const bookingController = {
  async createBooking(req, res) {
    try {
      const userId = req.user.id; // From auth middleware
      const { flightData, passengerData, fareData } = req.body;

      if (!flightData || !passengerData || !fareData) {
        return sendError(res, 'Missing required booking data', 400);
      }

      const booking = await bookingService.createFlightBooking(userId, flightData, passengerData, fareData);

      return sendSuccess(res, 201, 'Booking created successfully', { booking });
    } catch (error) {
      console.error('[Create Booking Error]:', error);
      return sendError(res, error.message, 500);
    }
  },

  async getUserBookings(req, res) {
    try {
      const userId = req.user.id;
      const bookings = await bookingService.getUserBookings(userId);
      return sendSuccess(res, 200, 'Bookings retrieved successfully', { bookings });
    } catch (error) {
      console.error('[Get Bookings Error]:', error);
      return sendError(res, error.message, 500);
    }
  },

  async getBookingDetails(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const booking = await bookingService.getBookingById(userId, id);
      return sendSuccess(res, 200, 'Booking details retrieved successfully', { booking });
    } catch (error) {
      console.error('[Get Booking Details Error]:', error);
      return sendError(res, error.message, error.message.includes('not found') ? 404 : 500);
    }
  }
};
