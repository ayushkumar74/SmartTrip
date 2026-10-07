import express from 'express';
import { hotelController } from './hotels.controller.js';
import { optionalAuthenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();
router.use(optionalAuthenticate);

router.get('/search', hotelController.searchHotels);
router.get('/:id', hotelController.getHotelDetails);

export default router;
