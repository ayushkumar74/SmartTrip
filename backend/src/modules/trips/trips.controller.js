import { tripService } from './trips.service.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

const handleErr = (res, err) => {
  const code = err.statusCode || (err.message?.includes('not found') ? 404 : 400);
  return sendError(res, code, err.message);
};

export const tripController = {

  // ── Trips ─────────────────────────────────────────────────────────────────

  async createTrip(req, res) {
    try {
      const trip = await tripService.createTrip(req.user.id, req.body);
      return sendSuccess(res, 201, 'Trip created successfully', { trip });
    } catch (err) { return handleErr(res, err); }
  },

  async listTrips(req, res) {
    try {
      const trips = await tripService.listTrips(req.user.id);
      return sendSuccess(res, 200, 'Trips retrieved successfully', { trips });
    } catch (err) { return handleErr(res, err); }
  },

  async getTrip(req, res) {
    try {
      const trip = await tripService.getTripById(req.user.id, req.params.tripId);
      return sendSuccess(res, 200, 'Trip retrieved successfully', { trip });
    } catch (err) { return handleErr(res, err); }
  },

  async updateTrip(req, res) {
    try {
      const trip = await tripService.updateTrip(req.user.id, req.params.tripId, req.body);
      return sendSuccess(res, 200, 'Trip updated successfully', { trip });
    } catch (err) { return handleErr(res, err); }
  },

  async deleteTrip(req, res) {
    try {
      await tripService.deleteTrip(req.user.id, req.params.tripId);
      return sendSuccess(res, 200, 'Trip deleted successfully');
    } catch (err) { return handleErr(res, err); }
  },

  // ── TripDays ──────────────────────────────────────────────────────────────

  async createDay(req, res) {
    try {
      const day = await tripService.createDay(req.user.id, req.params.tripId, req.body);
      return sendSuccess(res, 201, 'Trip day added successfully', { day });
    } catch (err) { return handleErr(res, err); }
  },

  async updateDay(req, res) {
    try {
      const day = await tripService.updateDay(req.user.id, req.params.tripId, req.params.dayId, req.body);
      return sendSuccess(res, 200, 'Trip day updated successfully', { day });
    } catch (err) { return handleErr(res, err); }
  },

  async deleteDay(req, res) {
    try {
      await tripService.deleteDay(req.user.id, req.params.tripId, req.params.dayId);
      return sendSuccess(res, 200, 'Trip day deleted successfully');
    } catch (err) { return handleErr(res, err); }
  },

  // ── TripActivities ────────────────────────────────────────────────────────

  async createActivity(req, res) {
    try {
      const activity = await tripService.createActivity(
        req.user.id, req.params.tripId, req.params.dayId, req.body
      );
      return sendSuccess(res, 201, 'Activity added successfully', { activity });
    } catch (err) { return handleErr(res, err); }
  },

  async updateActivity(req, res) {
    try {
      const activity = await tripService.updateActivity(
        req.user.id, req.params.tripId, req.params.dayId, req.params.activityId, req.body
      );
      return sendSuccess(res, 200, 'Activity updated successfully', { activity });
    } catch (err) { return handleErr(res, err); }
  },

  async deleteActivity(req, res) {
    try {
      await tripService.deleteActivity(
        req.user.id, req.params.tripId, req.params.dayId, req.params.activityId
      );
      return sendSuccess(res, 200, 'Activity deleted successfully');
    } catch (err) { return handleErr(res, err); }
  },
};
