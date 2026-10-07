import { packageService } from './packages.service.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export const packageController = {
  async listPackages(req, res) {
    try {
      const packages = await packageService.listPackages(req.query.search);
      return sendSuccess(res, 200, 'Packages retrieved successfully', { packages });
    } catch (error) {
      return sendError(res, 500, error.message);
    }
  },
  async getPackage(req, res) {
    try {
      const pkg = await packageService.getPackage(req.params.id);
      if (!pkg) return sendError(res, 404, 'Package not found');
      return sendSuccess(res, 200, 'Package retrieved successfully', { package: pkg });
    } catch (error) {
      return sendError(res, 500, error.message);
    }
  },
};