import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma.js';
import { env } from '../../config/env.js';

// Provider abstraction
const sendOtpViaDev = async (identifier, otp) => {
  // In dev, we just log it to the console with a special flag
  console.log(`\n======================================`);
  console.log(`[DEV-ONLY] OTP DELIVERED TO: ${identifier}`);
  console.log(`[DEV-ONLY] OTP CODE: ${otp}`);
  console.log(`======================================\n`);
  return true;
};

const sendOtpViaTwilio = async (identifier, otp) => {
  // Placeholder for real SMS gateway logic
  // e.g. const twilioClient = require('twilio')(env.OTP_PROVIDER_API_KEY, ...);
  console.log('Sending via Twilio...', identifier, otp);
  return true;
};

const sendOtp = async (identifier, otp) => {
  if (env.OTP_PROVIDER === 'twilio') {
    return await sendOtpViaTwilio(identifier, otp);
  }
  return await sendOtpViaDev(identifier, otp);
};

export const requestOtp = async (identifier, purpose = 'LOGIN') => {
  // Generate a secure 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  
  // Hash the OTP before storing it
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(otp, salt);
  
  // Expire in 5 minutes
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Mark previous active OTPs for this identifier and purpose as consumed (invalidate them)
  await prisma.otpChallenge.updateMany({
    where: {
      identifier,
      purpose,
      consumedAt: null,
      expiresAt: { gt: new Date() }
    },
    data: { consumedAt: new Date() }
  });

  // Create a new challenge
  await prisma.otpChallenge.create({
    data: {
      identifier,
      purpose,
      otpHash,
      expiresAt,
    }
  });

  // Send the actual OTP via the configured provider
  await sendOtp(identifier, otp);
  
  return { success: true, message: 'OTP sent successfully' };
};

export const verifyOtp = async (identifier, otp, purpose = 'LOGIN') => {
  const challenge = await prisma.otpChallenge.findFirst({
    where: {
      identifier,
      purpose,
      consumedAt: null,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!challenge) {
    throw new Error('Invalid or expired OTP');
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    throw new Error('Too many verification attempts');
  }

  // Increment attempts
  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { attempts: { increment: 1 } }
  });

  // Compare hash
  const isValid = await bcrypt.compare(otp, challenge.otpHash);
  if (!isValid) {
    throw new Error('Invalid or expired OTP');
  }

  // Mark as consumed
  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() }
  });

  return { success: true };
};
