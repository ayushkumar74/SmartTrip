import { sendSuccess, sendError } from '../../utils/apiResponse.js';
import { adminService } from './admin.service.js';
import { bookingQuerySchema, paymentQuerySchema, userQuerySchema, flightQuerySchema, hotelQuerySchema, packageQuerySchema, parseQuery } from './admin.validation.js';

const handleError = (res, error) => sendError(res, error.statusCode || 500, error.message, error.details || null);

export const adminController = {
  async dashboard(req, res) {
    try {
      const dashboard = await adminService.getDashboard();
      return sendSuccess(res, 200, 'Admin dashboard retrieved successfully', dashboard);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async bookings(req, res) {
    try {
      const result = await adminService.listBookings(parseQuery(bookingQuerySchema, req.query));
      return sendSuccess(res, 200, 'Admin bookings retrieved successfully', result);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async payments(req, res) {
    try {
      const result = await adminService.listPayments(parseQuery(paymentQuerySchema, req.query));
      return sendSuccess(res, 200, 'Admin payments retrieved successfully', result);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async users(req, res) {
    try {
      const result = await adminService.listUsers(parseQuery(userQuerySchema, req.query));
      return sendSuccess(res, 200, 'Admin users retrieved successfully', result);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async flights(req, res) {
    try {
      const result = await adminService.listFlights(parseQuery(flightQuerySchema, req.query));
      return sendSuccess(res, 200, 'Admin flights retrieved successfully', result);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async hotels(req, res) {
    try {
      const result = await adminService.listHotels(parseQuery(hotelQuerySchema, req.query));
      return sendSuccess(res, 200, 'Admin hotels retrieved successfully', result);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async packages(req, res) {
    try {
      const result = await adminService.listPackages(parseQuery(packageQuerySchema, req.query));
      return sendSuccess(res, 200, 'Admin packages retrieved successfully', result);
    } catch (error) {
      return handleError(res, error);
    }
  },
};
