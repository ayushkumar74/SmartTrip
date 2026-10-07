import api from './api';

export const hotelService = {
  searchHotels: async (criteria) => {
    // criteria is an object like { destination: 'Goa', checkIn: '2026-10-20', checkOut: '2026-10-25' }
    const params = new URLSearchParams();
    if (criteria.destination) params.append('destination', criteria.destination);
    if (criteria.checkIn) params.append('checkIn', criteria.checkIn);
    if (criteria.checkOut) params.append('checkOut', criteria.checkOut);
    if (criteria.guests) params.append('guests', criteria.guests);

    const response = await api.get(`/hotels/search?${params.toString()}`);
    return response.data;
  },

  getHotelDetails: async (hotelId) => {
    const response = await api.get(`/hotels/${hotelId}`);
    return response.data;
  }
};
