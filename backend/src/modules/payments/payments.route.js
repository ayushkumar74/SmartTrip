import express from 'express';
import { paymentController } from './payments.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

// All payment routes require authentication
router.use(authenticate);

router.post('/initiate',       paymentController.initiatePayment);
router.post('/verify',         paymentController.verifyPayment);
router.post('/fail',           paymentController.failPayment);
router.get('/:bookingId',      paymentController.getPaymentStatus);

export default router;
