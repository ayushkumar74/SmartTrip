import { bookingService } from './bookings.service.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';
import { isDateOnly, validateFlightPassengers, validateHotelGuests } from '../../utils/requestValidation.js';

export const bookingController = {
  async createBooking(req, res) {
    try {
      const userId = req.user.id; // From auth middleware
      const { flightId, fareId, passengerData, addOns } = req.body || {};

      if (typeof flightId !== 'string' || !flightId.trim()) {
        return sendError(res, 400, 'Missing required booking data: flightId or passengerData');
      }
      const booking = await bookingService.createFlightBooking(userId, flightId, fareId, passengerData, addOns);

      return sendSuccess(res, 201, 'Booking created successfully', { booking });
    } catch (error) {
      console.error('[Create Booking Error]:', error);
      return sendError(res, error.message.includes('not found') ? 404 : 400, error.message);
    }
  },

  async createHotelBooking(req, res) {
    try {
      const userId = req.user.id;
      const { hotelId, roomId, checkIn, checkOut, guestData } = req.body || {};

      if (typeof hotelId !== 'string' || !hotelId.trim() || typeof roomId !== 'string' || !roomId.trim() || !isDateOnly(checkIn) || !isDateOnly(checkOut)) {
        return sendError(res, 400, 'Missing required hotel booking data');
      }
      if (checkOut <= checkIn) return sendError(res, 400, 'checkOut must be after checkIn');
      validateHotelGuests(guestData);

      const booking = await bookingService.createHotelBooking(userId, hotelId, roomId, checkIn, checkOut, guestData);

      return sendSuccess(res, 201, 'Hotel Booking created successfully', { booking });
    } catch (error) {
      console.error('[Create Hotel Booking Error]:', error);
      return sendError(res, error.message.includes('not found') ? 404 : 400, error.message);
    }
  },

  async createPackageBooking(req, res) {
    try {
      const userId = req.user.id;
      const { packageId, travelDate, guestData } = req.body || {};

      if (typeof packageId !== 'string' || !packageId.trim() || !isDateOnly(travelDate)) {
        return sendError(res, 400, 'Missing required package booking data');
      }
      validateHotelGuests(guestData);

      const booking = await bookingService.createPackageBooking(userId, packageId, travelDate, guestData);

      return sendSuccess(res, 201, 'Package Booking created successfully', { booking });
    } catch (error) {
      console.error('[Create Package Booking Error]:', error);
      return sendError(res, error.message.includes('not found') ? 404 : 400, error.message);
    }
  },

  async getUserBookings(req, res) {
    try {
      const userId = req.user.id;
      const bookings = await bookingService.getUserBookings(userId);
      return sendSuccess(res, 200, 'Bookings retrieved successfully', { bookings });
    } catch (error) {
      console.error('[Get Bookings Error]:', error);
      return sendError(res, 500, error.message);
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
      return sendError(res, error.message.includes('not found') ? 404 : 500, error.message);
    }
  },

  async cancelBooking(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { reason } = req.body || {};

      const booking = await bookingService.cancelBooking(userId, id, reason);
      return sendSuccess(res, 200, 'Booking cancelled successfully', { booking });
    } catch (error) {
      console.error('[Cancel Booking Error]:', error);
      return sendError(res, error.message.includes('not found') ? 404 : 400, error.message);
    }
  }
};
