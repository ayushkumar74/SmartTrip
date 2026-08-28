import { sendSuccess, sendError } from '../../utils/apiResponse.js';
import * as authService from './auth.service.js';
import * as oauthService from './auth.oauth.js';
import * as otpService from './auth.otp.js';
import prisma from '../../config/prisma.js';

export const registerUser = async (req, res) => {
  try {
    const user = await authService.createUser(req.body);
    // Don't log them in automatically upon registration in this flow, or optionally we can
    sendSuccess(res, 201, 'User registered successfully', { user });
  } catch (error) {
    if (error.message === 'Email is already registered') {
      return sendError(res, 409, error.message);
    }
    sendError(res, 500, 'Registration failed', error.message);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.verifyCredentials(email, password);

    // Set cookie
    authService.generateCookieToken(res, user.id);

    sendSuccess(res, 200, 'Logged in successfully', {
      user: authService.sanitizeUser(user)
    });
  } catch (error) {
    sendError(res, 401, error.message);
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Google ID token
    const payload = await oauthService.verifyGoogleToken(token);
    
    // Find or create user securely
    const user = await authService.findOrCreateGoogleUser(payload);

    // Set cookie
    authService.generateCookieToken(res, user.id);

    sendSuccess(res, 200, 'Google Authentication successful', {
      user: authService.sanitizeUser(user)
    });
  } catch (error) {
    if (error.message.includes('not configured')) {
      return sendError(res, 501, 'Google OAuth is not configured on this server');
    }
    sendError(res, 401, 'Google Authentication failed', error.message);
  }
};

export const requestOtp = async (req, res) => {
  try {
    const { identifier, purpose } = req.body;
    await otpService.requestOtp(identifier, purpose);
    
    // Generic response regardless of whether user exists
    sendSuccess(res, 200, 'OTP sent successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to send OTP', error.message);
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    
    // Verify OTP challenge
    await otpService.verifyOtp(identifier, otp, 'LOGIN');
    
    // Find or create user via Phone/Email depending on identifier
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier }
        ]
      }
    });

    if (!user) {
      // Create user if not exists
      user = await prisma.user.create({
        data: {
          name: identifier, // Placeholder name
          phone: identifier.includes('@') ? null : identifier,
          email: identifier.includes('@') ? identifier : `${identifier}@placeholder.local`,
          isPhoneVerified: !identifier.includes('@'),
          isEmailVerified: identifier.includes('@')
        }
      });
    }

    if (!user.isActive) {
      return sendError(res, 401, 'User account is deactivated');
    }

    // Set cookie
    authService.generateCookieToken(res, user.id);

    sendSuccess(res, 200, 'OTP verified and logged in successfully', {
      user: authService.sanitizeUser(user)
    });
  } catch (error) {
    sendError(res, 401, error.message);
  }
};

export const logoutUser = async (req, res) => {
  authService.clearCookieToken(res);
  sendSuccess(res, 200, 'Logged out successfully');
};

export const getCurrentUser = async (req, res) => {
  // req.user is set by auth middleware
  sendSuccess(res, 200, 'User profile retrieved successfully', {
    user: authService.sanitizeUser(req.user)
  });
};
