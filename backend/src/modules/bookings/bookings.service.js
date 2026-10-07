import prisma from '../../config/prisma.js';
import { createNotification } from '../notifications/notifications.service.js';
import { flightService } from '../flights/flights.service.js';
import { hotelService } from '../hotels/hotels.service.js';
import { paymentService } from '../payments/payments.service.js';
import { isDateOnly, validateFlightPassengers, validateHotelGuests } from '../../utils/requestValidation.js';
import { packageService } from '../packages/packages.service.js';

/** Generates a random alphanumeric booking reference */
const genRef = (prefix = 'ST') =>
  `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

const addCancellationCurrency = (booking) => {
  if (!booking?.cancellations) return booking;
  return {
    ...booking,
    cancellations: booking.cancellations.map((cancellation) => ({
      ...cancellation,
      currency: booking.currency,
    })),
  };
};

const bookingLock = async (tx, bookingId) => {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`smarttrip:booking:${bookingId}`}, 0))`;
};

const enrichBookingDetails = async (booking) => {
  if (!booking) return booking;

  const enriched = addCancellationCurrency({ ...booking });
  if (booking.flightBooking?.externalBookingId) {
    try {
      let flight;
      if (booking.flightBooking.externalBookingId.startsWith('db_')) {
        const offer = await prisma.flightOffer.findUnique({
          where: { id: booking.flightBooking.externalBookingId.replace('db_', '') },
          include: { airline: true },
        });
        const airports = offer ? await prisma.airport.findMany({
          where: { iataCode: { in: [offer.departureIata, offer.arrivalIata] } },
          select: { iataCode: true, city: true, countryCode: true },
        }) : [];
        const airportsByCode = new Map(airports.map((airport) => [airport.iataCode, airport]));
        flight = offer && {
          airline: offer.airline.name,
          airlineCode: offer.airline.iataCode,
          airlineIcaoCode: offer.airline.icaoCode,
          airlineLogoUrl: offer.airline.logoUrl,
          departureAirport: offer.departureIata,
          arrivalAirport: offer.arrivalIata,
          departureCity: airportsByCode.get(offer.departureIata)?.city || offer.departureIata,
          arrivalCity: airportsByCode.get(offer.arrivalIata)?.city || offer.arrivalIata,
          departureCountryCode: airportsByCode.get(offer.departureIata)?.countryCode,
          arrivalCountryCode: airportsByCode.get(offer.arrivalIata)?.countryCode,
          currency: booking.currency,
          stops: offer.stops,
        };
      } else {
        flight = await flightService.getFlightDetails(booking.flightBooking.externalBookingId);
      }
      if (!flight) throw new Error('Flight offer not found');
      enriched.flightBooking = {
        ...booking.flightBooking,
        airline: flight.airline,
        airlineCode: flight.airlineCode,
        airlineIcaoCode: flight.airlineIcaoCode,
        airlineLogoUrl: flight.airlineLogoUrl,
        departureAirport: flight.departureAirport,
        arrivalAirport: flight.arrivalAirport,
        departureCity: flight.departureCity,
        arrivalCity: flight.arrivalCity,
        cabinClass: flight.cabinClass,
        duration: flight.duration,
        currency: flight.currency,
        stops: flight.stops,
      };
    } catch (error) {
      console.warn('[Booking Flight Details] Unable to enrich booking:', error.message);
    }
  }

  if (booking.hotelBooking?.provider === 'DATABASE' && booking.hotelBooking.externalBookingId?.startsWith('db_room_')) {
    try {
      const room = await prisma.room.findUnique({
        where: { id: booking.hotelBooking.externalBookingId.replace('db_room_', '') },
        include: { hotel: { select: { city: true } } },
      });
      if (room?.hotel?.city) enriched.hotelBooking = { ...booking.hotelBooking, hotelCity: room.hotel.city };
    } catch (error) {
      console.warn('[Booking Hotel Details] Unable to enrich booking:', error.message);
    }
  }

  return enriched;
};

export const bookingService = {
  // ── Flight Booking ─────────────────────────────────────────────────────────

  /**
   * Create a flight booking.
   * Pricing is 100% server-authoritative — client provides only flightId + passengerData.
   */
  async createFlightBooking(userId, flightId, fareId, passengerData, addOns = {}) {
    if (!flightId) throw new Error('flightId is required');
    if (!fareId) throw new Error('fareId is required');
    if (!Array.isArray(passengerData) || passengerData.length === 0)
      throw new Error('passengerData must be a non-empty array');

    // 1. Fetch authoritative flight data from provider
    const flight = await flightService.getFlightDetails(flightId);
    if (!flight) throw new Error('Flight not found');

    const airports = await Promise.all([
      prisma.airport.findUnique({ where: { iataCode: flight.departureAirport }, select: { countryCode: true } }),
      prisma.airport.findUnique({ where: { iataCode: flight.arrivalAirport }, select: { countryCode: true } }),
    ]);
    const international = airports[0]?.countryCode && airports[1]?.countryCode
      ? airports[0].countryCode !== airports[1].countryCode
      : false;
    validateFlightPassengers(passengerData, { international });

    const seat = typeof addOns.seat === 'string' && /^[1-9][0-9]?[A-F]$/.test(addOns.seat) ? addOns.seat : null;
    const extraBaggageKg = Number(addOns.extraBaggageKg || 0);
    const meal = addOns.meal || 'NONE';
    const mealPrices = { NONE: 0, VEG_SANDWICH: 180, VEG_BIRYANI: 280, VEG_MEAL: 320, CHICKEN_MEAL: 420, NON_VEG_SANDWICH: 260, JAIN_MEAL: 320, GLUTEN_FREE: 350, WATER: 40, TEA_COFFEE: 90 };
    if (!Number.isInteger(extraBaggageKg) || ![0, 5, 10, 15].includes(extraBaggageKg)) throw new Error('Unsupported extra baggage selection');
    if (!Object.prototype.hasOwnProperty.call(mealPrices, meal)) throw new Error('Unsupported meal selection');
    const seatPrice = seat ? (/^13/.test(seat) ? 799 : 499) : 0;
    const baggagePrice = { 0: 0, 5: 600, 10: 1000, 15: 1400 }[extraBaggageKg];
    const mealPrice = mealPrices[meal] * passengerData.length;
    const addOnsTotal = seatPrice + baggagePrice + mealPrice;

    // 2. Calculate authoritative total (server-side, never from client)
    const fare = flight.fareOptions?.find(f => f.id === fareId);
    if (!fare) throw new Error('Selected fare is not available for this flight');
    const basePrice = fare.price;

    const BASE_TAX = 45; // fixed tax per booking
    const totalAmount = parseFloat((basePrice * passengerData.length + BASE_TAX + addOnsTotal).toFixed(2));
    const currency = flight.currency || 'USD';
    const bookingReference = genRef('ST-FLT');

    // 3. Atomic transaction: Booking + FlightBooking + Passengers + Payment
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          userId,
          bookingReference,
          type: 'FLIGHT',
          status: 'PENDING',
          totalAmount,
          currency,
        },
      });

      await tx.flightBooking.create({
        data: {
          bookingId:         newBooking.id,
          provider:          flightId.startsWith('duffel') ? 'DUFFEL' : 'DATABASE',
          externalBookingId: flightId,
          flightOfferId:     flightId.startsWith('db_') ? flightId.replace('db_', '') : null,
          fareClass:         fareId,
          flightNumber:      flight.flightNumber,
          departureLocation: flight.departureAirport,
          arrivalLocation:   flight.arrivalAirport,
          departureTime:     new Date(flight.departureTime),
          arrivalTime:       new Date(flight.arrivalTime),
          seat,
          extraBaggageKg: extraBaggageKg || null,
          meal: meal === 'NONE' ? null : meal,
          addOnsTotal,
          smartTripTicketId: `ST-TKT-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        },
      });

      await tx.passenger.createMany({
        data: passengerData.map((p) => ({
          bookingId:      newBooking.id,
          title:          p.title?.trim() || null,
          firstName:      p.firstName.trim(),
          middleName:     p.middleName?.trim() || null,
          lastName:       p.lastName.trim(),
          dateOfBirth:    new Date(p.dateOfBirth),
          gender:         p.gender.trim(),
          nationality:    p.nationality.trim(),
          email:          p.email?.trim() || null,
          mobile:         p.mobile?.trim() || null,
          passportNumber: p.passportNumber?.trim() || null,
          passportExpiry: p.passportExpiry ? new Date(p.passportExpiry) : null,
          passportIssuingCountry: p.passportIssuingCountry?.trim() || null,
          frequentFlyerNumber: p.frequentFlyerNumber?.trim() || null,
        })),
      });

      // Create Payment record — status PENDING until gateway confirms
      await tx.payment.create({
        data: {
          bookingId:       newBooking.id,
          amount:          totalAmount,
          currency,
          status:          'PENDING',
          paymentProvider: 'RAZORPAY', // gateway to be wired when keys are available
        },
      });

      return newBooking;
    });

    try {
      await createNotification({
        userId,
        type: 'BOOKING_CREATED',
        title: 'Booking Initiated',
        message: `Your flight to ${flight.arrivalAirport} booking is pending payment. Ref: ${bookingReference}`,
      });
    } catch (e) {
      console.error('[Notification Error]:', e.message);
    }

    return booking;
  },

  // ── Hotel Booking ──────────────────────────────────────────────────────────

  /**
   * Create a hotel booking.
   * Nights and total are calculated server-side. Room must belong to the hotel.
   */
  async createHotelBooking(userId, hotelId, roomId, checkIn, checkOut, guestData) {
    if (!hotelId)  throw new Error('hotelId is required');
    if (!roomId)   throw new Error('roomId is required');
    if (!isDateOnly(checkIn))  throw new Error('checkIn must use YYYY-MM-DD format');
    if (!isDateOnly(checkOut)) throw new Error('checkOut must use YYYY-MM-DD format');
    if (!Array.isArray(guestData) || guestData.length === 0)
      throw new Error('guestData must be a non-empty array');

    validateHotelGuests(guestData);

    // 1. Fetch authoritative hotel data
    const hotel = await hotelService.getHotelDetails(hotelId);
    if (!hotel) throw new Error('Hotel not found');

    // 2. Verify room belongs to this hotel
    const room = hotel.rooms?.find((r) => r.id === roomId);
    if (!room) throw new Error('Room not found or does not belong to the selected hotel');
    if (!Number.isFinite(room.price) || room.price < 0) throw new Error('Selected room price is invalid');

    // 3. Calculate nights server-side (never trust client)
    const checkInDate  = new Date(`${checkIn}T00:00:00.000Z`);
    const checkOutDate = new Date(`${checkOut}T00:00:00.000Z`);
    if (isNaN(checkInDate.getTime()))  throw new Error('checkIn date is invalid');
    if (isNaN(checkOutDate.getTime())) throw new Error('checkOut date is invalid');
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 3600 * 24));
    if (checkOut <= checkIn || nights <= 0) throw new Error('checkOut must be after checkIn');

    // 4. Authoritative total
    const BASE_TAX   = 45;
    const totalAmount = parseFloat((room.price * nights + BASE_TAX).toFixed(2));
    const currency    = room.currency || 'USD';
    const bookingReference = genRef('ST-HTL');

    // 5. Atomic transaction
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          userId,
          bookingReference,
          type: 'HOTEL',
          status: 'PENDING',
          totalAmount,
          currency,
        },
      });

      await tx.hotelBooking.create({
        data: {
          bookingId:         newBooking.id,
          provider:          hotelId.startsWith('booking_') ? 'BOOKINGCOM' : 'DATABASE',
          externalBookingId: roomId,
          hotelName:         hotel.name,
          roomType:          room.name,
          checkIn:           checkInDate,
          checkOut:          checkOutDate,
          guests:            guestData.length,
          specialRequest:    guestData[0].specialRequest?.trim() || null,
          hotelImageUrl:      hotel.images?.[0] || null,
          roomAmenities:      room.amenities || [],
          mealPlan:           room.mealPlan || null,
          cancellationPolicy: room.cancellation || null,
          roomId:             !hotelId.startsWith('booking_') ? roomId.replace('db_room_', '') : null,
          hotelId:            !hotelId.startsWith('booking_') ? hotelId.replace('db_', '') : null,
        },
      });

      await tx.passenger.createMany({
        data: guestData.map((g) => ({
          title:          g.title.trim(),
          bookingId:      newBooking.id,
          firstName:      g.firstName.trim(),
          middleName:     g.middleName?.trim() || null,
          lastName:       g.lastName.trim(),
          dateOfBirth:    g.dateOfBirth ? new Date(g.dateOfBirth) : null,
          gender:         g.gender?.trim() || 'Unknown',
          nationality:    g.nationality.trim(),
          email:          g.email.trim(),
          mobile:         g.mobile.trim(),
          passportNumber: g.passportNumber?.trim() || null,
        })),
      });

      // Create Payment record — PENDING until gateway confirms
      await tx.payment.create({
        data: {
          bookingId:       newBooking.id,
          amount:          totalAmount,
          currency,
          status:          'PENDING',
          paymentProvider: 'RAZORPAY',
        },
      });

      return newBooking;
    });

    try {
      await createNotification({
        userId,
        type: 'BOOKING_CREATED',
        title: 'Hotel Booking Initiated',
        message: `Your stay at ${hotel.name} is pending payment. Ref: ${bookingReference}`,
      });
    } catch (e) {
      console.error('[Notification Error]:', e.message);
    }

    return booking;
  },

  // ── Package Booking ────────────────────────────────────────────────────────

  async createPackageBooking(userId, packageId, travelDate, guestData) {
    if (!packageId) throw new Error('packageId is required');
    if (!isDateOnly(travelDate)) throw new Error('travelDate must use YYYY-MM-DD format');
    if (!Array.isArray(guestData) || guestData.length === 0)
      throw new Error('guestData must be a non-empty array');

    validateHotelGuests(guestData);

    const holidayPackage = await prisma.holidayPackage.findUnique({
      where: { id: packageId },
    });
    if (!holidayPackage || !holidayPackage.active) {
      throw new Error('Package not found or unavailable');
    }

    const parsedTravelDate = new Date(`${travelDate}T00:00:00.000Z`);
    if (isNaN(parsedTravelDate.getTime())) throw new Error('travelDate is invalid');

    const BASE_TAX = 45;
    const totalAmount = parseFloat((Number(holidayPackage.priceINR) * guestData.length + BASE_TAX).toFixed(2));
    const currency = 'INR';
    const bookingReference = genRef('ST-PKG');

    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          userId,
          bookingReference,
          type: 'PACKAGE',
          status: 'PENDING',
          totalAmount,
          currency,
        },
      });

      await tx.packageBooking.create({
        data: {
          bookingId: newBooking.id,
          packageId: holidayPackage.id,
          packageName: holidayPackage.name,
          destination: holidayPackage.destination,
          durationDays: holidayPackage.durationDays,
          travelDate: parsedTravelDate,
          travelers: guestData.length,
          packageImageUrl: holidayPackage.imageUrl,
        },
      });

      await tx.passenger.createMany({
        data: guestData.map((g) => ({
          title: g.title.trim(),
          bookingId: newBooking.id,
          firstName: g.firstName.trim(),
          middleName: g.middleName?.trim() || null,
          lastName: g.lastName.trim(),
          dateOfBirth: g.dateOfBirth ? new Date(g.dateOfBirth) : null,
          gender: g.gender?.trim() || 'Unknown',
          nationality: g.nationality.trim(),
          email: g.email.trim(),
          mobile: g.mobile.trim(),
          passportNumber: g.passportNumber?.trim() || null,
        })),
      });

      await tx.payment.create({
        data: {
          bookingId: newBooking.id,
          amount: totalAmount,
          currency,
          status: 'PENDING',
          paymentProvider: 'RAZORPAY',
        },
      });

      return newBooking;
    });

    try {
      await createNotification({
        userId,
        type: 'BOOKING_CREATED',
        title: 'Package Booking Initiated',
        message: `Your package ${holidayPackage.name} is pending payment. Ref: ${bookingReference}`,
      });
    } catch (e) {
      console.error('[Notification Error]:', e.message);
    }

    return booking;
  },

  // ── Booking Retrieval ──────────────────────────────────────────────────────

  /** Get all bookings for the authenticated user — includes payment status. */
  async getUserBookings(userId) {
    const bookings = await prisma.booking.findMany({
      where:   { userId },
      include: {
        flightBooking: true,
        hotelBooking:  true,
        packageBooking: true,
        passengers:    true,
        payments:      { select: { id: true, status: true, amount: true, currency: true, createdAt: true, refundStatus: true, razorpayRefundId: true } },
        cancellations: { select: { id: true, status: true, refundAmount: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return Promise.all(bookings.map(enrichBookingDetails));
  },

  /** Get one booking — user-scoped. Returns full detail including payments. */
  async getBookingById(userId, bookingId) {
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId },
      include: {
        flightBooking: true,
        hotelBooking:  true,
        packageBooking: true,
        passengers:    true,
        payments:      {
          select: {
            id: true, status: true, amount: true, currency: true,
            paymentProvider: true, transactionId: true, createdAt: true,
            refundStatus: true, razorpayRefundId: true,
          },
        },
        cancellations: { select: { id: true, status: true, reason: true, refundAmount: true, createdAt: true } },
      },
    });

    if (!booking) throw new Error('Booking not found or access denied');
    return enrichBookingDetails(booking);
  },

  // ── Cancellation ───────────────────────────────────────────────────────────

  /**
   * Cancel a booking.
   * - Verifies ownership.
   * - Verifies booking is not already cancelled.
   * - Creates Cancellation record.
  * - If a COMPLETED Razorpay payment exists, requests a real gateway refund.
   * - All changes are atomic.
   */
  async cancelBooking(userId, bookingId, reason = 'User requested cancellation') {
    const cancellationStart = await prisma.$transaction(async (tx) => {
      await bookingLock(tx, bookingId);
      const booking = await tx.booking.findFirst({
        where: { id: bookingId, userId },
        include: { payments: true, cancellations: true },
      });
      if (!booking) throw new Error('Booking not found or access denied');
      if (booking.cancellations[0]) return { booking, created: false, payments: [] };
      if (booking.status === 'CANCELLED') throw new Error('Booking is already cancelled');

      const completedPayments = booking.payments.filter((payment) => payment.status === 'COMPLETED');
      const updated = await tx.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED' } });
      await tx.cancellation.create({
        data: {
          bookingId,
          reason,
          status: completedPayments.length === 0 ? 'PROCESSED' : 'REQUESTED',
          refundAmount: 0,
        },
      });

      const completedPaymentIds = completedPayments.map((payment) => payment.id);
      if (completedPaymentIds.length > 0) {
        await tx.payment.updateMany({ where: { id: { in: completedPaymentIds, }, status: 'COMPLETED' }, data: { refundStatus: 'PENDING', refundError: null } });
      }
      return { booking: updated, created: true, payments: completedPayments };
    });

    if (!cancellationStart.created) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { flightBooking: true, hotelBooking: true, passengers: true, payments: true, cancellations: true },
      });
      return addCancellationCurrency(booking);
    }

    try {
      await createNotification({
        userId,
        type: 'BOOKING_CANCELLED',
        title: 'Booking Cancelled',
        message: `Your booking ${cancellationStart.booking.bookingReference} was cancelled.`,
        entityId: bookingId,
        actionUrl: `/bookings/${bookingId}`,
      });
    } catch (error) {
      console.error('[Notification Error]:', error.message);
    }

    for (const payment of cancellationStart.payments) {
      try {
        await paymentService.refundPayment(payment);
      } catch (error) {
        await prisma.payment.updateMany({ where: { id: payment.id, status: 'COMPLETED', refundStatus: { in: ['PENDING', 'PROCESSING'] } }, data: { refundStatus: 'FAILED', refundError: error.message } });
        console.error('[Payment Refund Error]:', error.message);
      }
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        flightBooking: true,
        hotelBooking: true,
        passengers: true,
        payments: true,
        cancellations: true,
      },
    });
    return addCancellationCurrency(booking);
  },
};
