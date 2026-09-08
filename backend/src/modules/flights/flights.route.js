import express from 'express';
import { flightController } from './flights.controller.js';

const router = express.Router();

router.get('/search', flightController.searchFlights);
router.get('/:id', flightController.getFlightDetails);

export default router;
