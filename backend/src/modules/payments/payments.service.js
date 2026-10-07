import prisma from '../../config/prisma.js';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createNotification } from '../notifications/notifications.service.js';

// ── Razorpay setup (lazy init — backend starts normally if keys absent) ────────
const RAZORPAY_KEY_ID     = process.env.RAZORPAY_KEY_ID     || null;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || null;
const RAZORPAY_AVAILABLE  = !!(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);

let _razorpayInstance = null;

async function getRazorpay() {
  if (!RAZORPAY_AVAILABLE) return null;
  if (_razorpayInstance) return _razorpayInstance;
  try {
    _razorpayInstance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
    console.log('💳 Razorpay initialised in test mode.');
    return _razorpayInstance;
  } catch (e) {
    console.warn('⚠️  Razorpay could not be initialised.');
    return null;
  }
}

if (RAZORPAY_AVAILABLE) {
  console.log('ℹ️  Razorpay keys detected — gateway will activate on first payment call.');
} else {
  console.log('ℹ️  RAZORPAY_KEY_ID/SECRET not set — gateway payments are disabled.');
}

const DEV_BYPASS_ENABLED = process.env.NODE_ENV === 'development'
  && process.env.PAYMENT_DEV_BYPASS_ENABLED === 'true';

const CURRENCY_MINOR_UNITS = new Map([
  ['BHD', 3], ['JOD', 3], ['KWD', 3], ['OMR', 3], ['TND', 3],
  ['CLP', 0], ['ISK', 0], ['JPY', 0], ['KRW', 0], ['VND', 0],
]);

function toMinorUnits(amount, currency) {
  const exponent = CURRENCY_MINOR_UNITS.get(currency.toUpperCase()) ?? 2;
  const value = Number(amount);
  if (!Number.isFinite(value) || value < 0) throw new Error('Booking amount is invalid');
  return Math.round(value * (10 ** exponent));
}

function assertSupportedCurrency(currency) {
  if (typeof currency !== 'string' || !/^[A-Za-z]{3}$/.test(currency))
    throw new Error('Booking currency must be a valid three-letter currency code');
  return currency.toUpperCase();
}

function safePayment(payment) {
  if (!payment) return null;
  const { transactionId, ...result } = payment;
  return result;
}

/**
 * Verify booking belongs to the authenticated user.
 * Returns the booking (with payments included) or throws 404.
 */
async function requireOwnedBooking(userId, bookingId) {
  const booking = await prisma.booking.findFirst({
    where:   { id: bookingId, userId },
    include: { payments: true },
  });
  if (!booking) {
    const err = new Error('Booking not found or access denied');
    err.statusCode = 404;
    throw err;
  }
  return booking;
}

const paymentLock = async (tx, bookingId) => {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`smarttrip:payment:${bookingId}`}, 0))`;
};

export const paymentService = {

  // ── Initiate ─────────────────────────────────────────────────────────────────

  /**
   * Initiate payment for a booking.
   *
   * Flow:
   *   - Ownership check
   *   - Guard: cannot pay cancelled/confirmed booking
   *   - If Razorpay available: create Razorpay order, store orderId in Payment.transactionId
   *   - If Razorpay absent: return existing PENDING Payment record with MOCK mode notice
   *
   * Returns: { mode, payment, razorpayOrderId?, razorpayKeyId?, amount?, currency? }
   */
  async initiatePayment(userId, bookingId) {
    const razorpay = await getRazorpay();
    if (!razorpay && !DEV_BYPASS_ENABLED)
      throw new Error('Payment gateway is not configured. Set Razorpay credentials or explicitly enable development bypass.');

    return prisma.$transaction(async (tx) => {
      await paymentLock(tx, bookingId);
      const booking = await tx.booking.findFirst({ where: { id: bookingId, userId }, include: { payments: true } });
      if (!booking) {
        const error = new Error('Booking not found or access denied');
        error.statusCode = 404;
        throw error;
      }
      if (booking.status === 'CANCELLED') throw new Error('Cannot initiate payment for a cancelled booking');
      if (booking.status === 'CONFIRMED') throw new Error('Booking is already confirmed');

      const existingPending = booking.payments.find((payment) => payment.status === 'PENDING');
      if (razorpay) {
        const currency = assertSupportedCurrency(booking.currency);
        const amountMinor = toMinorUnits(booking.totalAmount, currency);
        if (amountMinor <= 0) throw new Error('Booking amount must be greater than zero');
        const existingOrderId = existingPending?.razorpayOrderId || existingPending?.transactionId;
        if (existingOrderId) {
          return { mode: 'RAZORPAY', payment: safePayment(existingPending), razorpayOrderId: existingOrderId, razorpayKeyId: RAZORPAY_KEY_ID, amount: amountMinor, currency };
        }

        const order = await razorpay.orders.create({ amount: amountMinor, currency, receipt: booking.bookingReference, payment_capture: 1 });
        const payment = existingPending
          ? await tx.payment.update({ where: { id: existingPending.id }, data: { transactionId: order.id, razorpayOrderId: order.id, currency } })
          : await tx.payment.create({ data: { bookingId, amount: booking.totalAmount, currency, status: 'PENDING', paymentProvider: 'RAZORPAY', transactionId: order.id, razorpayOrderId: order.id } });
        return { mode: 'RAZORPAY', payment: safePayment(payment), razorpayOrderId: order.id, razorpayKeyId: RAZORPAY_KEY_ID, amount: amountMinor, currency };
      }

      const payment = existingPending || await tx.payment.create({ data: { bookingId, amount: booking.totalAmount, currency: booking.currency, status: 'PENDING', paymentProvider: 'RAZORPAY' } });
      return { mode: 'MOCK', message: 'Development-only mock payment mode is enabled.', payment: safePayment(payment) };
    }, { maxWait: 10000, timeout: 30000 });
  },

  // ── Verify ───────────────────────────────────────────────────────────────────

  /**
   * Verify payment after gateway callback.
   *
   * Razorpay mode:
   *   - Validates HMAC-SHA256 signature using Razorpay secret
   *   - Requires: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
   *
   * Dev/mock mode (NODE_ENV=development only):
   *   - Requires: { devBypass: true }
   *   - NEVER allowed in production
   *
   * On success: Payment → COMPLETED, Booking → CONFIRMED (in one transaction)
   */
  async verifyPayment(userId, bookingId, verificationData) {
    let completedByThisRequest = false;
    const result = await prisma.$transaction(async (tx) => {
      await paymentLock(tx, bookingId);
      const booking = await tx.booking.findFirst({ where: { id: bookingId, userId } });
      if (!booking) {
        const error = new Error('Booking not found or access denied');
        error.statusCode = 404;
        throw error;
      }
      const payment = await tx.payment.findFirst({ where: { bookingId }, orderBy: { createdAt: 'desc' } });
      if (!payment) throw new Error('No payment record found for this booking');
      if (payment.status === 'COMPLETED' || payment.status === 'REFUNDED') return { payment, booking };
      if (payment.status !== 'PENDING') throw new Error('Payment is not eligible for verification');
      if (booking.status === 'CANCELLED') throw new Error('Cannot verify payment for a cancelled booking');
      if (booking.status === 'CONFIRMED') throw new Error('Booking is already confirmed');

      if (RAZORPAY_AVAILABLE && RAZORPAY_KEY_SECRET) {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = verificationData || {};
        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) throw new Error('razorpayOrderId, razorpayPaymentId, and razorpaySignature are required');
        const expectedOrderId = payment.razorpayOrderId || payment.transactionId;
        if (expectedOrderId !== razorpayOrderId) throw new Error('Razorpay order does not match this booking payment');
        const body = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expected = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(body).digest('hex');
        const expectedBuffer = Buffer.from(expected, 'utf8');
        const signatureBuffer = Buffer.from(razorpaySignature, 'utf8');
        if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) throw new Error('Payment signature verification failed — possible tampering');
        const updated = await tx.payment.updateMany({ where: { id: payment.id, status: 'PENDING' }, data: { status: 'COMPLETED', razorpayPaymentId, refundStatus: null, refundError: null } });
        if (updated.count !== 1) return { payment, booking };
      } else {
        if (!DEV_BYPASS_ENABLED) throw new Error('Payment gateway not configured. Cannot verify payment without Razorpay credentials.');
        if (!verificationData?.devBypass) throw new Error('Mock mode: send { devBypass: true } to confirm payment (development only)');
        const updated = await tx.payment.updateMany({ where: { id: payment.id, status: 'PENDING' }, data: { status: 'COMPLETED', transactionId: `dev_mock_${Date.now()}` } });
        if (updated.count !== 1) return { payment, booking };
      }

      await tx.booking.updateMany({ where: { id: bookingId, status: 'PENDING' }, data: { status: 'CONFIRMED' } });
      completedByThisRequest = true;
      return { payment: await tx.payment.findUnique({ where: { id: payment.id } }), booking };
    }, { maxWait: 10000, timeout: 30000 });

    const updatedPayment = result.payment;
    if (!completedByThisRequest) return updatedPayment;

    try {
      await createNotification({
        userId,
        type: 'PAYMENT_COMPLETED',
        title: 'Payment Successful',
        message: `Payment completed for booking ${result.booking.bookingReference}.`,
      });
    } catch (error) {
      console.error('[Notification Error]:', error.message);
    }
    return updatedPayment;
  },

  async failPayment(userId, bookingId) {
    const booking = await requireOwnedBooking(userId, bookingId);
    const payment = await prisma.payment.findFirst({
      where: { bookingId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
    if (!payment) throw new Error('No pending payment found for this booking');

    const failedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    });

    try {
      await createNotification({
        userId,
        type: 'PAYMENT_FAILED',
        category: 'PAYMENT',
        title: 'Payment Failed',
        message: `Payment for booking ${booking.bookingReference} failed. Please try again.`,
        entityId: booking.id,
        actionUrl: `/bookings/${booking.id}`,
      });
    } catch (error) {
      console.error('[Notification Error]:', error.message);
    }

    return failedPayment;
  },

  // ── Refund ───────────────────────────────────────────────────────────────────

  async refundPayment(payment) {
    if (payment.status !== 'COMPLETED') throw new Error('Only completed payments can be refunded');
    if (payment.refundStatus === 'SUCCEEDED') return payment;
    
    const isMock = DEV_BYPASS_ENABLED && payment.transactionId && payment.transactionId.startsWith('dev_mock_');

    if (!isMock && (!RAZORPAY_AVAILABLE || payment.paymentProvider !== 'RAZORPAY' || !payment.razorpayPaymentId))
      throw new Error('A gateway refund is unavailable for this payment');

    const claimed = await prisma.payment.updateMany({
      where: { id: payment.id, status: 'COMPLETED', refundStatus: 'PENDING' },
      data: { refundStatus: 'PROCESSING', refundError: null },
    });
    if (claimed.count !== 1) {
      const current = await prisma.payment.findUnique({ where: { id: payment.id } });
      if (current?.status === 'REFUNDED' || current?.refundStatus === 'SUCCEEDED') return current;
      throw new Error('A refund is already in progress or is not eligible');
    }

    let refundId;
    if (isMock) {
      refundId = `dev_mock_refund_${Date.now()}`;
    } else {
      const razorpay = await getRazorpay();
      if (!razorpay) throw new Error('Razorpay gateway is unavailable');

      try {
        const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
          amount: toMinorUnits(payment.amount, assertSupportedCurrency(payment.currency)),
          notes: { smarttripPaymentId: payment.id },
        });
        refundId = refund.id;
      } catch (error) {
        await prisma.payment.updateMany({
          where: { id: payment.id, status: 'COMPLETED', refundStatus: 'PROCESSING' },
          data: { refundStatus: 'FAILED', refundError: error.message },
        });
        throw error;
      }
    }

    const updatedPayment = await prisma.$transaction(async (tx) => {
      const transitioned = await tx.payment.updateMany({
        where: { id: payment.id, status: 'COMPLETED', refundStatus: 'PROCESSING' },
        data: { status: 'REFUNDED', razorpayRefundId: refundId, refundStatus: 'SUCCEEDED', refundError: null },
      });
      if (transitioned.count !== 1) {
        return tx.payment.findUnique({ where: { id: payment.id } });
      }

      const refundedPayments = await tx.payment.aggregate({
        where: { bookingId: payment.bookingId, status: 'REFUNDED', refundStatus: 'SUCCEEDED' },
        _sum: { amount: true },
      });
      const remainingCompletedPayments = await tx.payment.count({
        where: { bookingId: payment.bookingId, status: 'COMPLETED' },
      });
      await tx.cancellation.updateMany({
        where: { bookingId: payment.bookingId },
        data: {
          refundAmount: refundedPayments._sum.amount || 0,
          status: remainingCompletedPayments === 0 ? 'PROCESSED' : 'REQUESTED',
        },
      });

      return tx.payment.findUnique({ where: { id: payment.id } });
    });

    const bookingWithUser = await prisma.booking.findUnique({
      where: { id: payment.bookingId },
      select: { id: true, userId: true, bookingReference: true },
    });

    if (bookingWithUser) {
      try {
        await createNotification({
          userId: bookingWithUser.userId,
          type: 'REFUND_COMPLETED',
          category: 'PAYMENT',
          title: 'Refund Completed',
          message: `A refund has been issued for booking ${bookingWithUser.bookingReference}.`,
          entityId: bookingWithUser.id,
          actionUrl: `/bookings/${bookingWithUser.id}`,
        });
      } catch (error) {
        console.error('[Notification Error]:', error.message);
      }
    }

    return updatedPayment;
  },

  // ── Status ───────────────────────────────────────────────────────────────────

  /**
   * Get all payment records for a booking (user-scoped).
   * Sensitive fields (full transactionId) are returned since this is user's own booking.
   */
  async getPaymentStatus(userId, bookingId) {
    await requireOwnedBooking(userId, bookingId);

    return prisma.payment.findMany({
      where:   { bookingId },
      select:  {
        id: true, status: true, amount: true, currency: true,
        paymentProvider: true, transactionId: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
