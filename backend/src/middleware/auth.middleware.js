import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';
import prisma from '../config/prisma.js';

/**
 * Middleware to verify JWT stored in HTTP-only cookie
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return sendError(res, 401, 'Authentication required');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // Fetch the user to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || !user.isActive) {
      return sendError(res, 401, 'User account is not active or deleted');
    }

    // Attach user payload to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expired');
    }
    return sendError(res, 401, 'Invalid authentication token');
  }
};

/**
 * Middleware to restrict access based on roles
 * @param {String[]} roles - Array of allowed roles
 */
export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 403, 'Forbidden: Insufficient permissions');
    }
    next();
  };
};
