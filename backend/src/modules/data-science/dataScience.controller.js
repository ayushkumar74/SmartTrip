import { sendSuccess, sendError } from '../../utils/apiResponse.js';
import { dataScienceService } from './dataScience.service.js';

const handleError = (res, error) => sendError(res, error.statusCode || 400, error.message);

export const dataScienceController = {
  async getRecommendations(req, res) {
    try {
      const recommendations = await dataScienceService.getRecommendations(req.user.id, req.body);
      return sendSuccess(res, 200, 'Recommendations retrieved successfully', recommendations);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async getPriceIntelligence(req, res) {
    try {
      const result = await dataScienceService.getPriceIntelligence(req.user.id, req.body);
      return sendSuccess(res, 200, 'Price intelligence retrieved successfully', result);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async generateTripPlan(req, res) {
    try {
      const plan = await dataScienceService.generateTripPlan(req.user.id, req.body);
      return sendSuccess(res, 200, 'Trip plan generated successfully', plan);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async getAnalytics(req, res) {
    try {
      const analytics = await dataScienceService.getAnalytics(req.user.id, req.body);
      return sendSuccess(res, 200, 'Analytics retrieved successfully', analytics);
    } catch (error) {
      return handleError(res, error);
    }
  },
};
