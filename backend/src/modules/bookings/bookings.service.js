import prisma from '../../config/prisma.js';
import pkg from 'uuid';
const { v4: uuidv4 } = pkg;
import { createNotification } from '../notifications/notifications.service.js';

export const bookingService = {
  /**
   * Create a flight booking transaction
   */
  async createFlightBooking(userId, flightData, passengerData, fareData) {
    // Generate a unique PNR/booking reference
    const bookingReference = 'ST-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Start Prisma Transaction
    const booking = await prisma.$transaction(async (tx) => {
      
      // 1. Create the main Booking record
      const newBooking = await tx.booking.create({
        data: {
          userId,
          bookingReference,
          type: 'FLIGHT',
          status: 'PENDING',
          totalAmount: fareData.totalAmount,
          currency: fareData.currency || 'USD',
        }
      });

      // 2. Create the FlightBooking associated record
      await tx.flightBooking.create({
        data: {
          bookingId: newBooking.id,
          provider: 'MOCK_PROVIDER',
          externalBookingId: uuidv4(),
          flightNumber: flightData.flightNumber,
          departureLocation: flightData.departureAirport,
          arrivalLocation: flightData.arrivalAirport,
          departureTime: new Date(flightData.departureTime),
          arrivalTime: new Date(flightData.arrivalTime),
        }
      });

      // 3. Create Passenger records
      const passengersToCreate = passengerData.map(p => ({
        bookingId: newBooking.id,
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: new Date(p.dateOfBirth),
        gender: p.gender,
        passportNumber: p.passportNumber || null
      }));

      await tx.passenger.createMany({
        data: passengersToCreate
      });

      return newBooking;
    });

    // Generate notification asynchronously
    try {
      await createNotification(userId, 'BOOKING_CREATED', 'Booking Confirmed', `Your flight to ${flightData.arrivalAirport} has been booked. Ref: ${bookingReference}`);
    } catch (e) {
      console.error('Failed to create notification', e);
    }

    return booking;
  },

  /**
   * Get all bookings for a user
   */
  async getUserBookings(userId) {
    return await prisma.booking.findMany({
      where: { userId },
      include: {
        flightBooking: true,
        hotelBooking: true,
        passengers: true
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  /**
   * Get a specific booking by ID (ensuring it belongs to the user)
   */
  async getBookingById(userId, bookingId) {
    const booking = await prisma.booking.findFirst({
      where: { 
        id: bookingId,
        userId: userId // Security: Only allow fetching if user owns it
      },
      include: {
        flightBooking: true,
        hotelBooking: true,
        passengers: true,
        payments: true
      }
    });

    if (!booking) {
      throw new Error('Booking not found or access denied');
    }

    return booking;
  }
};
