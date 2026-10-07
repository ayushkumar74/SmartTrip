import api from './api';

export const packageService = {
  async listPackages(search = '') {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    const response = await api.get(`/packages?${params.toString()}`);
    return response.data;
  },
  async getPackage(id) {
    const response = await api.get(`/packages/${encodeURIComponent(id)}`);
    return response.data;
  },
};