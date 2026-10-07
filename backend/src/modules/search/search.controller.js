import { searchService } from './search.service.js';

export const searchController = {
  async getAirports(req, res, next) {
    try {
      const query = req.query.q || '';
      const airports = await searchService.searchAirports(query);
      res.json({ success: true, data: { airports } });
    } catch (error) {
      next(error);
    }
  },

  async getDestinations(req, res, next) {
    try {
      const query = req.query.q || '';
      const destinations = await searchService.searchDestinations(query);
      res.json({ success: true, data: { destinations } });
    } catch (error) {
      next(error);
    }
  }
};
