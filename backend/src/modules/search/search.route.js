import express from 'express';
import { searchController } from './search.controller.js';

const router = express.Router();

router.get('/airports', searchController.getAirports);
router.get('/destinations', searchController.getDestinations);

export default router;
