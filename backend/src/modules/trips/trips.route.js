import express from 'express';
import { tripController } from './trips.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

// All trip routes require authentication
router.use(authenticate);

// ── Trips ────────────────────────────────────────────────────────────────────
router.post('/',              tripController.createTrip);
router.get('/',               tripController.listTrips);
router.get('/:tripId',        tripController.getTrip);
router.patch('/:tripId',      tripController.updateTrip);
router.delete('/:tripId',     tripController.deleteTrip);

// ── Trip Days ─────────────────────────────────────────────────────────────────
router.post('/:tripId/days',              tripController.createDay);
router.patch('/:tripId/days/:dayId',      tripController.updateDay);
router.delete('/:tripId/days/:dayId',     tripController.deleteDay);

// ── Trip Activities ───────────────────────────────────────────────────────────
router.post('/:tripId/days/:dayId/activities',                      tripController.createActivity);
router.patch('/:tripId/days/:dayId/activities/:activityId',         tripController.updateActivity);
router.delete('/:tripId/days/:dayId/activities/:activityId',        tripController.deleteActivity);

export default router;
