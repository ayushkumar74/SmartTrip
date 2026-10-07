import prisma from '../../config/prisma.js';
import { createNotification } from '../notifications/notifications.service.js';
import { inputError } from '../../utils/requestValidation.js';

/**
 * Validate that a trip belongs to the given user.
 * Throws a descriptive error if not found or not owned.
 */
const ownerTrip = async (tripId, userId) => {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw Object.assign(new Error('Trip not found'), { statusCode: 404 });
  if (trip.userId !== userId) throw Object.assign(new Error('Trip not found'), { statusCode: 404 }); // 404 not 403 — no information leak
  return trip;
};

/**
 * Validate that a TripDay belongs to the given trip.
 */
const ownerDay = async (dayId, tripId) => {
  const day = await prisma.tripDay.findUnique({ where: { id: dayId } });
  if (!day || day.tripId !== tripId) throw Object.assign(new Error('Trip day not found'), { statusCode: 404 });
  return day;
};

/**
 * Validate that a TripActivity belongs to the given TripDay.
 */
const ownerActivity = async (activityId, dayId) => {
  const activity = await prisma.tripActivity.findUnique({ where: { id: activityId } });
  if (!activity || activity.tripDayId !== dayId) throw Object.assign(new Error('Activity not found'), { statusCode: 404 });
  return activity;
};

// ── Trip CRUD ─────────────────────────────────────────────────────────────────

export const tripService = {

  /** Create a new trip for a user. */
  async createTrip(userId, data) {
    const { title, startDate, endDate, destinationId, destinationName, days = [] } = data;

    if (typeof title !== 'string' || !title.trim()) throw inputError('Trip title is required');
    if (typeof startDate !== 'string' || !startDate) throw inputError('startDate is required');
    if (typeof endDate !== 'string' || !endDate) throw inputError('endDate is required');

    const start = new Date(startDate);
    const end   = new Date(endDate);
    if (isNaN(start.getTime())) throw inputError('startDate is invalid');
    if (isNaN(end.getTime()))   throw inputError('endDate is invalid');
    if (end < start) throw inputError('endDate cannot be before startDate');

    let resolvedDestinationId = destinationId || null;
    if (destinationName !== undefined && typeof destinationName !== 'string') throw new Error('destinationName must be a string');
    if (!resolvedDestinationId && destinationName?.trim()) {
      const [name, country] = destinationName.split(',').map((part) => part.trim());
      const destination = await prisma.destination.findFirst({
        where: country
          ? { name: { equals: name, mode: 'insensitive' }, country: { equals: country, mode: 'insensitive' } }
          : { name: { equals: name, mode: 'insensitive' } },
      });
      resolvedDestinationId = destination?.id || null;
    }

    // Validate destinationId if supplied
    if (resolvedDestinationId) {
      const dest = await prisma.destination.findUnique({ where: { id: resolvedDestinationId } });
      if (!dest) throw new Error('Destination not found');
    }

    if (!Array.isArray(days) || days.length > 31) throw inputError('days must be an array with at most 31 items');
    const normalizedDays = days.map((day) => {
      if (!day || typeof day !== 'object') throw inputError('Each trip day must be an object');
      if (!Number.isInteger(day.dayNumber) || day.dayNumber < 1) throw inputError('dayNumber must be a positive integer');
      if (!Array.isArray(day.activities)) throw inputError('activities must be an array');
      const dayDate = day.date ? new Date(day.date) : null;
      if (dayDate && isNaN(dayDate.getTime())) throw inputError('day date is invalid');
      const activities = day.activities.map((activity) => {
        if (typeof activity.title !== 'string' || !activity.title.trim() || typeof activity.activityType !== 'string' || !activity.activityType.trim()) throw inputError('Activity title and activityType are required');
        if (!['Flight', 'Hotel', 'Attraction', 'Custom', 'Restaurant', 'Transport'].includes(activity.activityType)) {
          throw inputError('Invalid activityType');
        }
        if (activity.sortOrder !== undefined && !Number.isInteger(activity.sortOrder)) throw inputError('sortOrder must be an integer');
        return {
          title: activity.title.trim(),
          description: activity.description?.trim() || null,
          activityType: activity.activityType,
          sortOrder: activity.sortOrder === undefined ? 0 : activity.sortOrder,
        };
      });
      return { dayNumber: day.dayNumber, date: dayDate, activities };
    });
    if (new Set(normalizedDays.map((day) => day.dayNumber)).size !== normalizedDays.length) {
      throw inputError('Trip days must have unique dayNumber values');
    }

    const trip = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          userId,
          title: title.trim(),
          startDate: start,
          endDate: end,
          destinationId: resolvedDestinationId,
        },
      });
      for (const day of normalizedDays) {
        const createdDay = await tx.tripDay.create({ data: { tripId: trip.id, dayNumber: day.dayNumber, date: day.date } });
        if (day.activities.length > 0) {
          await tx.tripActivity.createMany({
            data: day.activities.map((activity) => ({ ...activity, tripDayId: createdDay.id })),
          });
        }
      }
      return tx.trip.findUnique({
        where: { id: trip.id },
        include: { destination: { select: { id: true, name: true, country: true, imageUrl: true } }, days: { include: { activities: true } } },
      });
    });

    try {
      await createNotification({
        userId,
        type: 'TRIP_SAVED',
        title: 'Trip Saved',
        message: `Your trip "${trip.title}" was saved successfully.`,
      });
    } catch (error) {
      console.error('[Notification Error]:', error.message);
    }

    return trip;
  },

  /** List all trips for a user (summary, no days). */
  async listTrips(userId) {
    return prisma.trip.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        destination: { select: { id: true, name: true, country: true, imageUrl: true } },
        _count: { select: { days: true } },
      },
    });
  },

  /** Get a single trip with full day+activity detail. */
  async getTripById(userId, tripId) {
    await ownerTrip(tripId, userId);

    return prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        destination: { select: { id: true, name: true, country: true, imageUrl: true } },
        days: {
          orderBy: { dayNumber: 'asc' },
          include: {
            activities: {
              orderBy: { sortOrder: 'asc' },
              include: {
                attraction: { select: { id: true, name: true, category: true, rating: true, latitude: true, longitude: true } },
                hotel:      { select: { id: true, name: true, city: true, starRating: true, imageUrl: true } },
              },
            },
          },
        },
      },
    });
  },

  /** Update trip metadata. */
  async updateTrip(userId, tripId, data) {
    await ownerTrip(tripId, userId);

    const { title, startDate, endDate, destinationId } = data;
    const update = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) throw inputError('Trip title cannot be empty');
      update.title = title.trim();
    }

    if (startDate !== undefined || endDate !== undefined) {
      const trip   = await prisma.trip.findUnique({ where: { id: tripId } });
      if (startDate !== undefined && (typeof startDate !== 'string' || isNaN(new Date(startDate).getTime()))) throw inputError('startDate is invalid');
      if (endDate !== undefined && (typeof endDate !== 'string' || isNaN(new Date(endDate).getTime()))) throw inputError('endDate is invalid');
      const start  = startDate ? new Date(startDate) : trip.startDate;
      const end    = endDate   ? new Date(endDate)   : trip.endDate;
      if (start && end && end < start) throw inputError('endDate cannot be before startDate');
      if (startDate) update.startDate = new Date(startDate);
      if (endDate)   update.endDate   = new Date(endDate);
    }

    if (destinationId !== undefined) {
      if (destinationId) {
        const dest = await prisma.destination.findUnique({ where: { id: destinationId } });
        if (!dest) throw new Error('Destination not found');
      }
      update.destinationId = destinationId || null;
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data:  update,
      include: {
        destination: { select: { id: true, name: true, country: true, imageUrl: true } },
      },
    });

    try {
      await createNotification({
        userId,
        type: 'TRIP_UPDATED',
        category: 'TRIP',
        title: 'Trip Updated',
        message: `Your trip "${updatedTrip.title}" was updated successfully.`,
        entityId: updatedTrip.id,
        actionUrl: `/my-trips/${updatedTrip.id}`,
      });
    } catch (error) {
      console.error('[Notification Error]:', error.message);
    }

    return updatedTrip;
  },

  /** Delete a trip and all its days/activities (cascade). */
  async deleteTrip(userId, tripId) {
    await ownerTrip(tripId, userId);
    await prisma.trip.delete({ where: { id: tripId } });
  },

  // ── TripDay ───────────────────────────────────────────────────────────────

  /** Add a day to a trip. */
  async createDay(userId, tripId, data) {
    await ownerTrip(tripId, userId);

    const { dayNumber, date } = data;
    if (!Number.isInteger(dayNumber) || dayNumber < 1) {
      throw inputError('dayNumber must be a positive integer');
    }
    if (date !== undefined && date !== null && (typeof date !== 'string' || isNaN(new Date(date).getTime()))) throw inputError('date is invalid');

    // Check for duplicate dayNumber in this trip
    const existing = await prisma.tripDay.findUnique({
      where: { tripId_dayNumber: { tripId, dayNumber } },
    });
    if (existing) throw new Error(`Day ${dayNumber} already exists in this trip`);

    return prisma.tripDay.create({
      data: {
        tripId,
        dayNumber,
        date: date ? new Date(date) : null,
      },
    });
  },

  /** Update a trip day. */
  async updateDay(userId, tripId, dayId, data) {
    await ownerTrip(tripId, userId);
    await ownerDay(dayId, tripId);

    const { date } = data;
    if (date !== undefined && date !== null && (typeof date !== 'string' || isNaN(new Date(date).getTime()))) throw inputError('date is invalid');
    return prisma.tripDay.update({
      where: { id: dayId },
      data:  { date: date ? new Date(date) : null },
    });
  },

  /** Delete a trip day (and its activities via cascade). */
  async deleteDay(userId, tripId, dayId) {
    await ownerTrip(tripId, userId);
    await ownerDay(dayId, tripId);
    await prisma.tripDay.delete({ where: { id: dayId } });
  },

  // ── TripActivity ──────────────────────────────────────────────────────────

  /** Add an activity to a trip day. */
  async createActivity(userId, tripId, dayId, data) {
    await ownerTrip(tripId, userId);
    await ownerDay(dayId, tripId);

    const {
      title, description, activityType, startTime, endTime,
      sortOrder, attractionId, hotelId,
    } = data;

    if (typeof title !== 'string' || !title.trim())      throw inputError('Activity title is required');
    if (typeof activityType !== 'string' || !activityType.trim()) throw inputError('activityType is required');
    if (sortOrder !== undefined && !Number.isInteger(sortOrder)) throw inputError('sortOrder must be an integer');

    const VALID_TYPES = ['Flight', 'Hotel', 'Attraction', 'Custom', 'Restaurant', 'Transport'];
    if (!VALID_TYPES.includes(activityType)) {
      throw inputError(`activityType must be one of: ${VALID_TYPES.join(', ')}`);
    }

    let start = null, end = null;
    if (startTime) { start = new Date(startTime); if (isNaN(start.getTime())) throw inputError('startTime is invalid'); }
    if (endTime)   { end   = new Date(endTime);   if (isNaN(end.getTime()))   throw inputError('endTime is invalid'); }
    if (start && end && end < start) throw inputError('endTime cannot be before startTime');

    // Validate FK references if supplied
    if (attractionId) {
      const a = await prisma.attraction.findUnique({ where: { id: attractionId } });
      if (!a) throw new Error('Attraction not found');
    }
    if (hotelId) {
      const h = await prisma.hotel.findUnique({ where: { id: hotelId } });
      if (!h) throw new Error('Hotel not found');
    }

    return prisma.tripActivity.create({
      data: {
        tripDayId:    dayId,
        title:        title.trim(),
        description:  description?.trim() || null,
        activityType,
        startTime:    start,
        endTime:      end,
        sortOrder:    typeof sortOrder === 'number' ? sortOrder : 0,
        attractionId: attractionId || null,
        hotelId:      hotelId      || null,
      },
      include: {
        attraction: { select: { id: true, name: true, category: true } },
        hotel:      { select: { id: true, name: true, city: true } },
      },
    });
  },

  /** Update an activity. */
  async updateActivity(userId, tripId, dayId, activityId, data) {
    await ownerTrip(tripId, userId);
    await ownerDay(dayId, tripId);
    await ownerActivity(activityId, dayId);

    const VALID_TYPES = ['Flight', 'Hotel', 'Attraction', 'Custom', 'Restaurant', 'Transport'];
    const update = {};

    if (data.title !== undefined) {
      if (typeof data.title !== 'string' || !data.title.trim()) throw inputError('Activity title cannot be empty');
      update.title = data.title.trim();
    }
    if (data.description !== undefined) update.description  = data.description?.trim() || null;
    if (data.activityType !== undefined) {
      if (!VALID_TYPES.includes(data.activityType)) throw inputError('Invalid activityType');
      update.activityType = data.activityType;
    }
    if (data.sortOrder !== undefined) {
      if (!Number.isInteger(data.sortOrder)) throw inputError('sortOrder must be an integer');
      update.sortOrder = data.sortOrder;
    }
    if (data.startTime !== undefined) {
      if (data.startTime && isNaN(new Date(data.startTime).getTime())) throw inputError('startTime is invalid');
      update.startTime = data.startTime ? new Date(data.startTime) : null;
    }
    if (data.endTime !== undefined) {
      if (data.endTime && isNaN(new Date(data.endTime).getTime())) throw inputError('endTime is invalid');
      update.endTime = data.endTime ? new Date(data.endTime) : null;
    }
    if (data.attractionId !== undefined) {
      if (data.attractionId) {
        const a = await prisma.attraction.findUnique({ where: { id: data.attractionId } });
        if (!a) throw new Error('Attraction not found');
      }
      update.attractionId = data.attractionId || null;
    }
    if (data.hotelId !== undefined) {
      if (data.hotelId) {
        const h = await prisma.hotel.findUnique({ where: { id: data.hotelId } });
        if (!h) throw new Error('Hotel not found');
      }
      update.hotelId = data.hotelId || null;
    }

    const current = await prisma.tripActivity.findUnique({ where: { id: activityId } });
    const start   = update.startTime !== undefined ? update.startTime : current.startTime;
    const end     = update.endTime   !== undefined ? update.endTime   : current.endTime;
    if (start && end && end < start) throw new Error('endTime cannot be before startTime');

    return prisma.tripActivity.update({
      where: { id: activityId },
      data:  update,
      include: {
        attraction: { select: { id: true, name: true, category: true } },
        hotel:      { select: { id: true, name: true, city: true } },
      },
    });
  },

  /** Delete an activity. */
  async deleteActivity(userId, tripId, dayId, activityId) {
    await ownerTrip(tripId, userId);
    await ownerDay(dayId, tripId);
    await ownerActivity(activityId, dayId);
    await prisma.tripActivity.delete({ where: { id: activityId } });
  },
};
