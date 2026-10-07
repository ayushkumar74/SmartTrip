import api from './api';

export const bookingService = {
  /** Create a flight booking — sends only flightId + passengerData. */
  createBooking: async (bookingPayload) => {
    const response = await api.post('/bookings', bookingPayload);
    return response.data;
  },

  /** Create a hotel booking — sends hotelId + roomId + dates + guestData. */
  createHotelBooking: async (bookingPayload) => {
    const response = await api.post('/bookings/hotel', bookingPayload);
    return response.data;
  },

  /** Create a package booking — sends packageId + travelDate + guestData. */
  createPackageBooking: async (bookingPayload) => {
    const response = await api.post('/bookings/package', bookingPayload);
    return response.data;
  },

  /** List all bookings for the authenticated user. */
  getUserBookings: async () => {
    const response = await api.get('/bookings');
    return response.data;
  },

  /** Get full booking detail. */
  getBookingDetails: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  /** Cancel a booking. */
  cancelBooking: async (bookingId, reason = 'User requested cancellation') => {
    const response = await api.patch(`/bookings/${bookingId}/cancel`, { reason });
    return response.data;
  },

  // ── Payment ─────────────────────────────────────────────────────────────────

  /**
   * Initiate payment for a pending booking.
   * Returns Razorpay order details if gateway is configured,
   * or a MOCK mode response if running without credentials.
   */
  initiatePayment: async (bookingId) => {
    const response = await api.post('/payments/initiate', { bookingId });
    return response.data;
  },

  /**
   * Verify payment after gateway callback.
   * Razorpay: pass { razorpayOrderId, razorpayPaymentId, razorpaySignature }
   * Dev mock:  pass { devBypass: true }
   */
  verifyPayment: async (bookingId, verificationData) => {
    const response = await api.post('/payments/verify', { bookingId, ...verificationData });
    return response.data;
  },

  reportPaymentFailure: async (bookingId) => {
    const response = await api.post('/payments/fail', { bookingId });
    return response.data;
  },

  /** Create a gateway order and complete checkout without exposing secrets. */
  payBooking: async (bookingId) => {
    const initiated = await bookingService.initiatePayment(bookingId);
    const payment = initiated.data;

    if (payment.mode === 'MOCK') {
      return bookingService.verifyPayment(bookingId, { devBypass: true });
    }

    if (payment.mode !== 'RAZORPAY' || !payment.razorpayOrderId || !payment.razorpayKeyId)
      throw new Error('Payment checkout is unavailable');

    if (!window.Razorpay) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Unable to load Razorpay Checkout'));
        document.body.appendChild(script);
      });
    }

    return new Promise((resolve, reject) => {
      const checkout = new window.Razorpay({
        key: payment.razorpayKeyId,
        amount: payment.amount,
        currency: payment.currency,
        order_id: payment.razorpayOrderId,
        name: 'SmartTrip',
        handler: async (response) => {
          try {
            resolve(await bookingService.verifyPayment(bookingId, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }));
          } catch (error) {
            reject(error);
          }
        },
        modal: { ondismiss: () => reject(new Error('Payment checkout was cancelled')) },
      });
      checkout.on('payment.failed', async () => {
        try {
          await bookingService.reportPaymentFailure(bookingId);
        } finally {
          reject(new Error('Payment failed. You can retry from this booking.'));
        }
      });
      checkout.open();
    });
  },

  /** Get payment records for a booking. */
  getPaymentStatus: async (bookingId) => {
    const response = await api.get(`/payments/${bookingId}`);
    return response.data;
  },
};
