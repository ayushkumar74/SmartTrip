import express from 'express';
import { userController } from './users.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/preferences', userController.getPreferences);
router.patch('/preferences', userController.updatePreferences);
router.patch('/profile', userController.updateProfile);
router.get('/search-history', userController.getSearchHistory);

export default router;
