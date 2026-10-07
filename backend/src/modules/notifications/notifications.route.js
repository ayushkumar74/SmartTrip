import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import * as notificationController from './notifications.controller.js';

const router = express.Router();

router.use(authenticate);
router.get('/', notificationController.getUserNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);

export default router;
