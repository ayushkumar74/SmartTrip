import api from './api';

export const notificationService = {
  getUserNotifications: async (params = {}) => {
    return await api.get('/notifications', { params });
  },
  getUnreadCount: async () => {
    return await api.get('/notifications/unread-count');
  },
  markAsRead: async (id) => {
    return await api.patch(`/notifications/${id}/read`);
  },
  markAllAsRead: async () => {
    return await api.patch('/notifications/read-all');
  },
  getNotificationTypes: () => [
    'BOOKING_CREATED',
    'BOOKING_CANCELLED',
    'PAYMENT_COMPLETED',
    'PAYMENT_FAILED',
    'REFUND_COMPLETED',
    'TRIP_SAVED',
    'TRIP_UPDATED',
  ],
};
