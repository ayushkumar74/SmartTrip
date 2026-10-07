import api from './api';

export const userService = {
  getPreferences: async () => {
    const response = await api.get('/users/preferences');
    return response.data;
  },

  updatePreferences: async (preferences) => {
    const response = await api.patch('/users/preferences', preferences);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.patch('/users/profile', data);
    return response.data;
  },
};
