import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { dataScienceController } from './dataScience.controller.js';
import {
  recommendationSchema,
  priceIntelligenceSchema,
  tripPlannerSchema,
  analyticsSchema,
} from './dataScience.validation.js';

const router = express.Router();
router.use(authenticate);

router.post('/recommend', validateRequest(recommendationSchema), dataScienceController.getRecommendations);
router.post('/price-intelligence', validateRequest(priceIntelligenceSchema), dataScienceController.getPriceIntelligence);
router.post('/trip-plan', validateRequest(tripPlannerSchema), dataScienceController.generateTripPlan);
router.post('/analytics', validateRequest(analyticsSchema), dataScienceController.getAnalytics);

export default router;
