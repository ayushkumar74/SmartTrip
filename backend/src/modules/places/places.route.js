import express from 'express';
import { placesController } from './places.controller.js';
import { optionalAuthenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();
router.use(optionalAuthenticate);

// GET /api/v1/places/status - Provider configuration status
router.get('/status', placesController.getStatus);

// GET /api/v1/places/search?q=paris&type=all|city|airport
router.get('/search', placesController.searchPlaces);

// GET /api/v1/places/route?origin=Delhi&destination=Mumbai&mode=DRIVE
router.get('/route', placesController.getRoute);

// GET /api/v1/places/:placeId
router.get('/:placeId', placesController.getPlaceDetails);

export default router;
