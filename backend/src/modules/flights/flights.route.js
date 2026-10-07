import express from 'express';
import { flightController } from './flights.controller.js';
import { optionalAuthenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();
router.use(optionalAuthenticate);

router.get('/fare-calendar', flightController.getFareCalendar);
router.get('/search', flightController.searchFlights);
router.get('/:id', flightController.getFlightDetails);

export default router;
