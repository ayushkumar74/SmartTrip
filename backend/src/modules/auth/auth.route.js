import express from 'express';
import { validateRequest } from '../../middleware/validateRequest.js'; // Assuming this exists or we create it
import { authenticate } from '../../middleware/auth.middleware.js';
import { authLimiter, otpLimiter } from '../../middleware/rateLimiter.js';
import * as authController from './auth.controller.js';
import * as authSchema from './auth.validation.js';

const router = express.Router();

// Public Routes (Protected by Auth Rate Limiter)
router.post(
  '/register',
  authLimiter,
  validateRequest(authSchema.registerSchema),
  authController.registerUser
);

router.post(
  '/login',
  authLimiter,
  validateRequest(authSchema.loginSchema),
  authController.loginUser
);

router.post(
  '/google',
  authLimiter,
  validateRequest(authSchema.googleAuthSchema),
  authController.googleAuth
);

// OTP Routes (Protected by stricter OTP Rate Limiter)
router.post(
  '/otp/request',
  otpLimiter,
  validateRequest(authSchema.otpRequestSchema),
  authController.requestOtp
);

router.post(
  '/otp/verify',
  authLimiter,
  validateRequest(authSchema.otpVerifySchema),
  authController.verifyOtp
);

// Protected Routes
router.post('/logout', authenticate, authController.logoutUser);
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
