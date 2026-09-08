import api from './api';

export const bookingService = {
  createBooking: async (bookingPayload) => {
    // bookingPayload: { flightData, passengerData, fareData }
    const response = await api.post('/bookings', bookingPayload);
    return response.data;
  },

  getUserBookings: async () => {
    const response = await api.get('/bookings');
    return response.data;
  },

  getBookingDetails: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  }
};
