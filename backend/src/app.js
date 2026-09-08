import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import healthRoutes from './modules/health/health.route.js';
import authRoutes from './modules/auth/auth.route.js';
import flightRoutes from './modules/flights/flights.route.js';
import bookingRoutes from './modules/bookings/bookings.route.js';
import notificationRoutes from './modules/notifications/notifications.route.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS config (allow frontend to access API)
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*';
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

// Rate limiting (basic anti-spam)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Built-in middleware for parsing JSON and urlencoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Basic Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// --- Routes ---
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);

// Stub routes for other modules (To be implemented later)
// app.use('/api/v1/users', userRoutes);
app.use('/api/v1/flights', flightRoutes);
// app.use('/api/v1/hotels', hotelRoutes);
app.use('/api/v1/bookings', bookingRoutes);
// app.use('/api/v1/payments', paymentRoutes);
// app.use('/api/v1/cancellations', cancellationRoutes);
app.use('/api/v1/notifications', notificationRoutes);
// app.use('/api/v1/admin', adminRoutes);
// app.use('/api/v1/external', externalRoutes);
// app.use('/api/v1/data-science', dataScienceRoutes);

// Global Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
