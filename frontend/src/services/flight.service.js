import api from './api';

export const flightService = {
  searchFlights: async (criteria) => {
    // criteria is an object like { from: 'JFK', to: 'CDG', date: '2026-10-15' }
    const params = new URLSearchParams();
    if (criteria.from) params.append('from', criteria.from);
    if (criteria.to) params.append('to', criteria.to);
    if (criteria.date) params.append('date', criteria.date);
    if (criteria.cabinClass) params.append('cabinClass', criteria.cabinClass);
    if (criteria.sortBy) params.append('sortBy', criteria.sortBy);
    if (criteria.sortOrder) params.append('sortOrder', criteria.sortOrder);

    const response = await api.get(`/flights/search?${params.toString()}`);
    return response.data;
  },

  getFlightDetails: async (flightId) => {
    const response = await api.get(`/flights/${flightId}`);
    return response.data;
  }
};
