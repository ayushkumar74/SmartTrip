import { env } from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';
import { ZodError } from 'zod';

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error(`[Error]: ${err.message}`);
  
  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 400, 'Validation Error', formattedErrors);
  }

  // Handle Syntax Errors (e.g., malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 400, 'Malformed JSON Payload');
  }

  // Handle generic errors (fallback)
  const statusCode = err.statusCode || 500;
  const message = env.NODE_ENV === 'production' && statusCode === 500 
    ? 'Internal Server Error' 
    : err.message;

  sendError(res, statusCode, message, env.NODE_ENV === 'development' ? { stack: err.stack } : null);
};

/**
 * Handle 404 Route Not Found
 */
export const notFoundHandler = (req, res, next) => {
  sendError(res, 404, `Route not found: ${req.originalUrl}`);
};
