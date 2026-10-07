import { hotelService } from './hotels.service.js';
import { userService } from '../users/users.service.js';
import { validateHotelSearch } from '../../utils/requestValidation.js';

export const hotelController = {
  async searchHotels(req, res, next) {
    try {
      const criteria = validateHotelSearch(req.query);
      const hotels = await hotelService.searchHotels(criteria);
      if (req.user) {
        try {
          await userService.recordSearch(req.user.id, 'hotel', {
            destination: criteria.destination,
            checkIn: criteria.checkIn,
            checkOut: criteria.checkOut,
            adults: criteria.adults,
            rooms: criteria.rooms,
          });
        } catch (historyError) {
          console.error('[Hotel Search History Error]:', historyError.message);
        }
      }
      res.json({
        success: true,
        data: { hotels }
      });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
      next(error);
    }
  },

  async getHotelDetails(req, res, next) {
    try {
      const { id } = req.params;
      const hotel = await hotelService.getHotelDetails(id);
      if (!hotel) {
        return res.status(404).json({ success: false, message: 'Hotel not found' });
      }
      res.json({
        success: true,
        data: { hotel }
      });
    } catch (error) {
      next(error);
    }
  }
};
