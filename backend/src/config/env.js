import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Define schema for environment variables to ensure required ones are present
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // JWT Auth
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Google OAuth (Optional in dev to avoid crashing, but usually string)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),

  // OTP Configuration
  OTP_PROVIDER: z.enum(['dev', 'twilio']).default('dev'),
  OTP_PROVIDER_API_KEY: z.string().optional(),
  OTP_PROVIDER_SENDER_ID: z.string().optional(),

  // Payment Gateway
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  PAYMENT_DEV_BYPASS_ENABLED: z.enum(['true', 'false']).default('false'),

  // Future Data Science service adapters. Empty URLs keep the adapters disabled.
  DS_RECOMMENDATION_URL: z.preprocess((value) => value === '' ? undefined : value, z.string().url().optional()),
  DS_PRICE_INTELLIGENCE_URL: z.preprocess((value) => value === '' ? undefined : value, z.string().url().optional()),
  DS_TRIP_PLANNER_URL: z.preprocess((value) => value === '' ? undefined : value, z.string().url().optional()),
  DS_ANALYTICS_URL: z.preprocess((value) => value === '' ? undefined : value, z.string().url().optional()),
  DS_REQUEST_TIMEOUT_MS: z.string().regex(/^\d+$/).default('5000'),
  DS_SERVICE_AUTH_HEADER: z.string().default('x-ds-service-key'),
  DS_SERVICE_AUTH_SECRET: z.string().optional(),
});

// Validate environment variables
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
