import api from './api';

export const adminService = {
  getDashboard: async () => {
    return await api.get('/admin/dashboard');
  },
  getUsers: async (params) => {
    return await api.get('/admin/users', { params });
  },
  getBookings: async (params) => {
    return await api.get('/admin/bookings', { params });
  },
  getPayments: async (params) => {
    return await api.get('/admin/payments', { params });
  },
  getFlights: async (params) => {
    return await api.get('/admin/flights', { params });
  },
  getHotels: async (params) => {
    return await api.get('/admin/hotels', { params });
  },
  getPackages: async (params) => {
    return await api.get('/admin/packages', { params });
  }
};
