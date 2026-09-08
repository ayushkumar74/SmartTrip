import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async googleLogin(token) {
    const response = await api.post('/auth/google', { token });
    return response.data;
  },

  async requestOtp(identifier) {
    const response = await api.post('/auth/otp/request', { identifier, purpose: 'LOGIN' });
    return response.data;
  },

  async verifyOtp(identifier, otp) {
    const response = await api.post('/auth/otp/verify', { identifier, otp });
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
