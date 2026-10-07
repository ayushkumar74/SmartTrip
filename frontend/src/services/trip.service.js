/**
 * SmartTrip Trip Service
 * Provides all CRUD operations for user trips, days, and activities.
 */
import api from './api';

export const tripService = {

  // ── Trips ────────────────────────────────────────────────────────────────

  /** Create a new trip. */
  async createTrip(data) {
    const res = await api.post('/trips', data);
    return res.data; // { success, message, data: { trip } }
  },

  /** List all trips for the authenticated user. */
  async listTrips() {
    const res = await api.get('/trips');
    return res.data; // { success, message, data: { trips } }
  },

  /** Get full details of a trip (with days + activities). */
  async getTripById(tripId) {
    const res = await api.get(`/trips/${tripId}`);
    return res.data; // { success, message, data: { trip } }
  },

  /** Update trip metadata. */
  async updateTrip(tripId, data) {
    const res = await api.patch(`/trips/${tripId}`, data);
    return res.data;
  },

  /** Delete a trip. */
  async deleteTrip(tripId) {
    const res = await api.delete(`/trips/${tripId}`);
    return res.data;
  },

  // ── Trip Days ─────────────────────────────────────────────────────────────

  /** Add a day to a trip. */
  async createDay(tripId, data) {
    const res = await api.post(`/trips/${tripId}/days`, data);
    return res.data;
  },

  /** Update a trip day. */
  async updateDay(tripId, dayId, data) {
    const res = await api.patch(`/trips/${tripId}/days/${dayId}`, data);
    return res.data;
  },

  /** Delete a trip day. */
  async deleteDay(tripId, dayId) {
    const res = await api.delete(`/trips/${tripId}/days/${dayId}`);
    return res.data;
  },

  // ── Trip Activities ───────────────────────────────────────────────────────

  /** Add an activity to a trip day. */
  async createActivity(tripId, dayId, data) {
    const res = await api.post(`/trips/${tripId}/days/${dayId}/activities`, data);
    return res.data;
  },

  /** Update an activity. */
  async updateActivity(tripId, dayId, activityId, data) {
    const res = await api.patch(`/trips/${tripId}/days/${dayId}/activities/${activityId}`, data);
    return res.data;
  },

  /** Delete an activity. */
  async deleteActivity(tripId, dayId, activityId) {
    const res = await api.delete(`/trips/${tripId}/days/${dayId}/activities/${activityId}`);
    return res.data;
  },
};
