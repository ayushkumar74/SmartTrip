import * as notificationService from './notifications.service.js';

export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getNotifications(req.user.id);
    res.json({ status: 'success', data: { notifications } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch notifications' });
  }
};

export const markRead = async (req, res) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user.id);
    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to update notification' });
  }
};
