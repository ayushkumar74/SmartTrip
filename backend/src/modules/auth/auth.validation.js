import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').transform(val => val.toLowerCase()),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phone: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').transform(val => val.toLowerCase()),
  password: z.string().min(1, 'Password is required')
});

export const googleAuthSchema = z.object({
  token: z.string().min(1, 'Google ID token is required')
});

export const otpRequestSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required').transform(val => val.toLowerCase()),
  purpose: z.enum(['LOGIN']).default('LOGIN')
});

export const otpVerifySchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required').transform(val => val.toLowerCase()),
  otp: z.string().length(6, 'OTP must be exactly 6 digits')
});
