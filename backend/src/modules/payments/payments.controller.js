import { paymentService } from './payments.service.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

const handleErr = (res, err) => {
  const code = err.statusCode || (err.message?.includes('not found') ? 404 : 400);
  return sendError(res, code, err.message);
};

export const paymentController = {

  /**
   * POST /api/v1/payments/initiate
   * Body: { bookingId }
   *
   * Creates/returns Razorpay order if keys configured,
   * otherwise returns PENDING payment record in mock mode.
   */
  async initiatePayment(req, res) {
    try {
      const { bookingId } = req.body;
      if (!bookingId) return sendError(res, 400, 'bookingId is required');

      const result = await paymentService.initiatePayment(req.user.id, bookingId);
      return sendSuccess(res, 200, 'Payment initiated', result);
    } catch (err) {
      console.error('[Initiate Payment]:', err.message);
      return handleErr(res, err);
    }
  },

  /**
   * POST /api/v1/payments/verify
   * Body (Razorpay): { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
   * Body (dev mock):  { bookingId, devBypass: true }
   *
   * On success: Payment → COMPLETED, Booking → CONFIRMED.
   */
  async verifyPayment(req, res) {
    try {
      const { bookingId, ...verificationData } = req.body;
      if (!bookingId) return sendError(res, 400, 'bookingId is required');

      const payment = await paymentService.verifyPayment(req.user.id, bookingId, verificationData);
      return sendSuccess(res, 200, 'Payment verified and booking confirmed', { payment });
    } catch (err) {
      console.error('[Verify Payment]:', err.message);
      return handleErr(res, err);
    }
  },

  async failPayment(req, res) {
    try {
      const { bookingId } = req.body;
      if (!bookingId) return sendError(res, 400, 'bookingId is required');

      const payment = await paymentService.failPayment(req.user.id, bookingId);
      return sendSuccess(res, 200, 'Payment marked as failed', { payment });
    } catch (err) {
      console.error('[Fail Payment]:', err.message);
      return handleErr(res, err);
    }
  },

  /**
   * GET /api/v1/payments/:bookingId
   * Returns all payment records for the booking (user-scoped).
   */
  async getPaymentStatus(req, res) {
    try {
      const payments = await paymentService.getPaymentStatus(req.user.id, req.params.bookingId);
      return sendSuccess(res, 200, 'Payment status retrieved', { payments });
    } catch (err) {
      console.error('[Get Payment Status]:', err.message);
      return handleErr(res, err);
    }
  },
};
