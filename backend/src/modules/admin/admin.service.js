import prisma from '../../config/prisma.js';

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  isEmailVerified: true,
  isPhoneVerified: true,
  createdAt: true,
  updatedAt: true,
};

const bookingSelect = {
  id: true,
  bookingReference: true,
  userId: true,
  type: true,
  status: true,
  totalAmount: true,
  currency: true,
  createdAt: true,
  updatedAt: true,
  user: { select: userSelect },
  flightBooking: {
    select: {
      flightNumber: true,
      departureLocation: true,
      arrivalLocation: true,
      departureTime: true,
      arrivalTime: true,
      provider: true,
    },
  },
  hotelBooking: {
    select: {
      hotelName: true,
      roomType: true,
      checkIn: true,
      checkOut: true,
      guests: true,
      provider: true,
    },
  },
  payments: {
    select: {
      id: true,
      paymentProvider: true,
      status: true,
      amount: true,
      currency: true,
      razorpayOrderId: true,
      razorpayPaymentId: true,
      razorpayRefundId: true,
      refundStatus: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  },
  cancellations: {
    select: { id: true, status: true, refundAmount: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: 'desc' },
  },
};

const pageResult = (items, total, page, pageSize) => ({
  items,
  pagination: {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  },
});

const contains = (value) => value ? { contains: value, mode: 'insensitive' } : undefined;

export const adminService = {
  async getDashboard() {
    const [totalUsers, totalBookings, flightBookings, hotelBookings, confirmedBookings, cancelledBookings,
      pendingPayments, completedPayments, refundedPayments, recentBookings] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { type: 'FLIGHT' } }),
      prisma.booking.count({ where: { type: 'HOTEL' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'COMPLETED' } }),
      prisma.payment.count({ where: { status: 'REFUNDED' } }),
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          bookingReference: true,
          type: true,
          status: true,
          totalAmount: true,
          currency: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return {
      counts: {
        totalUsers,
        totalBookings,
        flightBookings,
        hotelBookings,
        confirmedBookings,
        cancelledBookings,
        pendingPayments,
        completedPayments,
        refundedPayments,
      },
      recentBookings,
    };
  },

  async listBookings(filters) {
    const { page, pageSize, status, type, bookingReference, dateFrom, dateTo } = filters;
    const where = {
      ...(status && { status }),
      ...(type && { type }),
      ...(bookingReference && { bookingReference: contains(bookingReference) }),
      ...(dateFrom || dateTo ? { createdAt: { ...(dateFrom && { gte: new Date(`${dateFrom}T00:00:00.000Z`) }), ...(dateTo && { lte: new Date(`${dateTo}T23:59:59.999Z`) }) } } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.booking.findMany({ where, select: bookingSelect, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.booking.count({ where }),
    ]);
    return pageResult(items, total, page, pageSize);
  },

  async listPayments(filters) {
    const { page, pageSize, status, bookingReference, dateFrom, dateTo } = filters;
    const where = {
      ...(status && { status }),
      ...(bookingReference && { booking: { bookingReference: contains(bookingReference) } }),
      ...(dateFrom || dateTo ? { createdAt: { ...(dateFrom && { gte: new Date(`${dateFrom}T00:00:00.000Z`) }), ...(dateTo && { lte: new Date(`${dateTo}T23:59:59.999Z`) }) } } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          paymentProvider: true,
          status: true,
          amount: true,
          currency: true,
          razorpayOrderId: true,
          razorpayPaymentId: true,
          razorpayRefundId: true,
          refundStatus: true,
          createdAt: true,
          updatedAt: true,
          booking: { select: { id: true, bookingReference: true, type: true, status: true, user: { select: { id: true, name: true, email: true } } } },
        },
      }),
      prisma.payment.count({ where }),
    ]);
    return pageResult(items, total, page, pageSize);
  },

  async listUsers(filters) {
    const { page, pageSize, role, isActive, q, dateFrom, dateTo } = filters;
    const where = {
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
      ...(q && { OR: [{ name: contains(q) }, { email: contains(q) }] }),
      ...(dateFrom || dateTo ? { createdAt: { ...(dateFrom && { gte: new Date(`${dateFrom}T00:00:00.000Z`) }), ...(dateTo && { lte: new Date(`${dateTo}T23:59:59.999Z`) }) } } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          ...userSelect,
          _count: { select: { bookings: true, trips: true, searchHistory: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    return pageResult(items, total, page, pageSize);
  },

  async listFlights(filters) {
    const { page, pageSize, q, airline, origin, destination, cabinClass, active } = filters;
    const where = {
      ...(active !== undefined && { active }),
      ...(airline && { airline: { iataCode: airline } }),
      ...(origin && { departureIata: origin }),
      ...(destination && { arrivalIata: destination }),
      ...(cabinClass && { cabinClass }),
      ...(q && { flightNumber: contains(q) }),
    };
    const [items, total] = await Promise.all([
      prisma.flightOffer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          airline: true,
        },
      }),
      prisma.flightOffer.count({ where }),
    ]);
    return pageResult(items, total, page, pageSize);
  },

  async listHotels(filters) {
    const { page, pageSize, q, city, minRating, active } = filters;
    const where = {
      ...(active !== undefined && { active }),
      ...(city && { city: contains(city) }),
      ...(minRating !== undefined && { starRating: { gte: minRating } }),
      ...(q && { name: contains(q) }),
    };
    const [items, total] = await Promise.all([
      prisma.hotel.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          rooms: true,
        },
      }),
      prisma.hotel.count({ where }),
    ]);
    return pageResult(items, total, page, pageSize);
  },

  async listPackages(filters) {
    const { page, pageSize, q, destination, active } = filters;
    const where = {
      ...(active !== undefined && { active }),
      ...(destination && { destination: contains(destination) }),
      ...(q && { name: contains(q) }),
    };
    const [items, total] = await Promise.all([
      prisma.holidayPackage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          itinerary: {
            orderBy: { dayNumber: 'asc' }
          }
        },
      }),
      prisma.holidayPackage.count({ where }),
    ]);
    return pageResult(items, total, page, pageSize);
  },
};
