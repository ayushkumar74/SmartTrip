import * as notificationService from './notifications.service.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

const parsePagination = (query) => {
  const page = Number(query.page || 1);
  const pageSize = Number(query.pageSize || 25);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    const error = new Error('page must be positive and pageSize must be between 1 and 100');
    error.statusCode = 400;
    throw error;
  }
  return { page, pageSize };
};

export const getUserNotifications = async (req, res) => {
  try {
    const { page, pageSize } = parsePagination(req.query);
    const unreadOnly = String(req.query.unreadOnly || '').toLowerCase() === 'true';
    const type = req.query.type ? String(req.query.type) : undefined;
    const category = req.query.category ? String(req.query.category) : undefined;

    const result = await notificationService.getNotifications(req.user.id, {
      page,
      pageSize,
      unreadOnly,
      type,
      category,
    });
    return sendSuccess(res, 200, 'Notifications retrieved successfully', result);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message);
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await notificationService.getUnreadCount(req.user.id);
    return sendSuccess(res, 200, 'Unread notification count retrieved successfully', { unreadCount });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const markRead = async (req, res) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user.id);
    return sendSuccess(res, 200, 'Notification marked as read');
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message);
  }
};

export const markAllRead = async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    return sendSuccess(res, 200, 'Notifications marked as read', { updated: result.count });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
