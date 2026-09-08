import api from './api';

export const notificationService = {
  getUserNotifications: async () => {
    return await api.get('/notifications');
  },
  markAsRead: async (id) => {
    return await api.patch(`/notifications/${id}/read`);
  }
};
