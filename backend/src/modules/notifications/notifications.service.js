import prisma from '../../config/prisma.js';
import { getNotificationCategory, getNotificationPreferenceKey } from './notificationEvents.js';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;

const normalizeNotificationPayload = (input, legacyType, legacyTitle, legacyMessage) => {
  if (typeof input === 'object' && input !== null) {
    const type = input.type ?? legacyType;
    return {
      userId: input.userId,
      type,
      category: input.category ?? getNotificationCategory(type),
      title: input.title ?? legacyTitle ?? 'SmartTrip Notification',
      message: input.message ?? legacyMessage ?? '',
      entityId: input.entityId ?? null,
      actionUrl: input.actionUrl ?? null,
      metadata: input.metadata ?? null,
    };
  }

  return {
    userId: input,
    type: legacyType,
    category: getNotificationCategory(legacyType),
    title: legacyTitle ?? 'SmartTrip Notification',
    message: legacyMessage ?? '',
    entityId: null,
    actionUrl: null,
    metadata: null,
  };
};

const shouldCreateNotification = async (userId, type) => {
  const preferenceKey = getNotificationPreferenceKey(type);
  if (!preferenceKey) return true;

  const preferences = await prisma.userPreference.findUnique({
    where: { userId },
    select: { [preferenceKey]: true },
  });

  if (!preferences) return true;
  return preferences[preferenceKey] !== false;
};

const isDuplicateNotification = async (userId, type, entityId) => {
  if (!userId || !type || !entityId) return false;

  const recent = await prisma.notification.findFirst({
    where: { userId, type, entityId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, createdAt: true },
  });

  if (!recent) return false;
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return new Date(recent.createdAt) > fiveMinutesAgo;
};

export const getNotifications = async (userId, options = {}) => {
  const {
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    unreadOnly = false,
    type,
    category,
  } = options;

  const where = { userId };
  if (unreadOnly) where.isRead = false;
  if (type) where.type = type;
  if (category) where.category = category;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        type: true,
        category: true,
        title: true,
        message: true,
        entityId: true,
        actionUrl: true,
        metadata: true,
        isRead: true,
        readAt: true,
        createdAt: true,
      },
    }),
    prisma.notification.count({ where }),
  ]);

  return { notifications, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 } };
};

export const getUnreadCount = async (userId) => {
  return prisma.notification.count({ where: { userId, isRead: false } });
};

export const createNotification = async (input, legacyType, legacyTitle, legacyMessage) => {
  const data = normalizeNotificationPayload(input, legacyType, legacyTitle, legacyMessage);
  if (!data.userId || !data.type) {
    throw new Error('Notification payload requires userId and type');
  }

  const isEnabled = await shouldCreateNotification(data.userId, data.type);
  if (!isEnabled) return null;

  if (data.entityId && await isDuplicateNotification(data.userId, data.type, data.entityId)) {
    return null;
  }

  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      category: data.category,
      title: data.title,
      message: data.message,
      entityId: data.entityId,
      actionUrl: data.actionUrl,
      metadata: data.metadata,
    },
  });
};

export const markAsRead = async (notificationId, userId) => {
  const result = await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true, readAt: new Date() },
  });
  if (result.count === 0) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }
  return result;
};

export const markAllAsRead = async (userId) => prisma.notification.updateMany({
  where: { userId, isRead: false },
  data: { isRead: true, readAt: new Date() },
});
