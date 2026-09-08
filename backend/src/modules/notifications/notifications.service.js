import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getNotifications = async (userId) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

export const createNotification = async (userId, type, title, message) => {
  return await prisma.notification.create({
    data: { userId, type, title, message }
  });
};

export const markAsRead = async (notificationId, userId) => {
  return await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true }
  });
};
