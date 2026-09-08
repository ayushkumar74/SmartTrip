import { flightProvider } from './flights.provider.js';

export const flightService = {
  async searchFlights(criteria) {
    const flights = await flightProvider.searchFlights(criteria);
    
    // Sort logic (default to price ascending if not specified)
    const { sortBy = 'price', sortOrder = 'asc' } = criteria;
    
    flights.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      
      if (sortBy === 'departure') {
        valA = new Date(a.departureTime).getTime();
        valB = new Date(b.departureTime).getTime();
      } else if (sortBy === 'duration') {
        // Mock simplification: parse "7h 15m" to minutes
        valA = parseDuration(a.duration);
        valB = parseDuration(b.duration);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return flights;
  },

  async getFlightDetails(flightId) {
    return await flightProvider.getFlightById(flightId);
  }
};

function parseDuration(durationStr) {
  let minutes = 0;
  const hMatch = durationStr.match(/(\d+)h/);
  const mMatch = durationStr.match(/(\d+)m/);
  if (hMatch) minutes += parseInt(hMatch[1]) * 60;
  if (mMatch) minutes += parseInt(mMatch[1]);
  return minutes;
}
