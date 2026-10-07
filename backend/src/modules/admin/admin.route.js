import express from 'express';
import { authenticate, authorizeRole } from '../../middleware/auth.middleware.js';
import { adminController } from './admin.controller.js';

const router = express.Router();

router.use(authenticate);
router.use(authorizeRole(['ADMIN']));

router.get('/dashboard', adminController.dashboard);
router.get('/bookings', adminController.bookings);
router.get('/payments', adminController.payments);
router.get('/users', adminController.users);
router.get('/flights', adminController.flights);
router.get('/hotels', adminController.hotels);
router.get('/packages', adminController.packages);

export default router;
