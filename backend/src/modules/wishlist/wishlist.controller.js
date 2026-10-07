import { wishlistService } from './wishlist.service.js';

export const wishlistController = {
  async getWishlists(req, res, next) {
    try {
      const items = await wishlistService.getUserWishlists(req.user.id);
      res.json({ success: true, data: { items } });
    } catch (error) {
      next(error);
    }
  },

  async addWishlist(req, res, next) {
    try {
      const { type, itemId, notes } = req.body;
      const item = await wishlistService.addToWishlist(req.user.id, { type, itemId, notes });
      res.status(201).json({ success: true, data: { item } });
    } catch (error) {
      next(error);
    }
  },

  async removeWishlist(req, res, next) {
    try {
      await wishlistService.removeFromWishlist(req.user.id, req.params.id);
      res.json({ success: true, message: 'Item removed from wishlist' });
    } catch (error) {
      next(error);
    }
  }
};
