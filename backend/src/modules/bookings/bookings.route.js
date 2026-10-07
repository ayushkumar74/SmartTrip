import express from 'express';
import { bookingController } from './bookings.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);

router.post('/', bookingController.createBooking);
router.post('/hotel', bookingController.createHotelBooking);
router.post('/package', bookingController.createPackageBooking);
router.get('/', bookingController.getUserBookings);
router.patch('/:id/cancel', bookingController.cancelBooking);
router.get('/:id', bookingController.getBookingDetails);

export default router;
