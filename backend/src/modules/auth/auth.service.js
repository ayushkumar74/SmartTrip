import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma.js';
import { env } from '../../config/env.js';

export const generateCookieToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
};

export const clearCookieToken = (res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
};

export const createUser = async ({ name, email, password, phone }) => {
  // Check for existing user
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Email is already registered');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      phone,
      role: 'USER', // Always default to user, ignore client input
    },
  });

  return sanitizeUser(user);
};

export const verifyCredentials = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive || !user.passwordHash) {
    // Return generic error
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  return user;
};

export const findOrCreateGoogleUser = async (googlePayload) => {
  const { email, name, sub: googleId, email_verified } = googlePayload;

  if (!email_verified) {
    throw new Error('Google email is not verified');
  }

  // Check if a user with this googleId exists
  let user = await prisma.user.findUnique({ where: { googleId } });

  if (!user) {
    // Check if user exists by email
    user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Link the account safely using googleId
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          googleId,
          isEmailVerified: true 
        }
      });
    } else {
      // Create new user via Google
      user = await prisma.user.create({
        data: {
          name,
          email,
          googleId,
          isEmailVerified: true,
          role: 'USER'
        }
      });
    }
  }

  if (!user.isActive) {
    throw new Error('User account is deactivated');
  }

  return user;
};

export const sanitizeUser = (user) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};
