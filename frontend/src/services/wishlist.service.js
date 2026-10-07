import api from './api';

export const wishlistService = {
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data;
  },

  addToWishlist: async (item) => {
    const response = await api.post('/wishlist', item);
    return response.data;
  },

  removeFromWishlist: async (itemId) => {
    const response = await api.delete(`/wishlist/${itemId}`);
    return response.data;
  }
};
