import { userService } from './users.service.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

const handleError = (res, error) => sendError(res, error.statusCode || 400, error.message);

export const userController = {
  async getPreferences(req, res) {
    try {
      const preferences = await userService.getPreferences(req.user.id);
      return sendSuccess(res, 200, 'Preferences retrieved successfully', { preferences });
    } catch (error) {
      return handleError(res, error);
    }
  },

  async updatePreferences(req, res) {
    try {
      const preferences = await userService.updatePreferences(req.user.id, req.body);
      return sendSuccess(res, 200, 'Preferences updated successfully', { preferences });
    } catch (error) {
      return handleError(res, error);
    }
  },

  async updateProfile(req, res) {
    try {
      const user = await userService.updateProfile(req.user.id, req.body);
      return sendSuccess(res, 200, 'Profile updated successfully', { user });
    } catch (error) {
      return handleError(res, error);
    }
  },

  async getSearchHistory(req, res) {
    try {
      const searches = await userService.getSearchHistory(req.user.id);
      return sendSuccess(res, 200, 'Search history retrieved successfully', { searches });
    } catch (error) {
      return handleError(res, error);
    }
  },
};
