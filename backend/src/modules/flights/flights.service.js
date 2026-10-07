import DatabaseFlightProvider from './providers/DatabaseFlightProvider.js';
import DuffelProvider from './providers/DuffelProvider.js';
import { shouldFallbackToDatabase } from '../../utils/providerFallback.js';
import dotenv from 'dotenv';
dotenv.config();

// Provider Factory Strategy
let activeProvider;
const databaseProvider = new DatabaseFlightProvider();

if (process.env.DUFFEL_API_KEY) {
  console.log('✈️  Initializing Duffel Flight Provider');
  activeProvider = new DuffelProvider(process.env.DUFFEL_API_KEY);
} else {
  console.log('⚠️  DUFFEL_API_KEY not found. Falling back to Database Flight Provider.');
  activeProvider = new DatabaseFlightProvider();
}

export const flightService = {
  /**
   * Search for flights based on criteria
   * @param {Object} criteria { from, to, date, passengers, cabinClass }
   */
  async searchFlights(criteria) {
    let flights;
    try {
      flights = await activeProvider.searchFlights(criteria);
    } catch (error) {
      if (activeProvider === databaseProvider || !shouldFallbackToDatabase(error)) throw error;
      console.warn('[Flight Provider Fallback] Duffel failed; using database provider');
      flights = await databaseProvider.searchFlights(criteria);
    }
    
    // Sort logic (default to price ascending if not specified)
    const { sortBy = 'price', sortOrder = 'asc' } = criteria;
    
    flights.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      
      if (sortBy === 'departure') {
        valA = new Date(a.departureTime).getTime();
        valB = new Date(b.departureTime).getTime();
      } else if (sortBy === 'duration') {
        // Parse "7h 15m" or ISO duration to minutes for sorting
        valA = parseDuration(a.duration);
        valB = parseDuration(b.duration);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return flights;
  },

  async getFareCalendar(criteria) {
    try {
      return await activeProvider.getFareCalendar(criteria);
    } catch (error) {
      if (activeProvider === databaseProvider || !shouldFallbackToDatabase(error)) throw error;
      console.warn('[Flight Provider Fallback] Duffel calendar failed; using database provider');
      return databaseProvider.getFareCalendar(criteria);
    }
  },

  /**
   * Get specific flight details authoritatively
   * @param {string} id Provider-specific flight/offer ID
   */
  async getFlightDetails(flightId) {
    try {
      return await activeProvider.getFlightById(flightId);
    } catch (error) {
      if (activeProvider === databaseProvider || !shouldFallbackToDatabase(error)) throw error;
      console.warn('[Flight Provider Fallback] Duffel details failed; using database provider');
      return databaseProvider.getFlightById(flightId);
    }
  }
};

function parseDuration(durationStr) {
  if (!durationStr) return 0;
  
  // Handle PT11H30M format (ISO 8601 duration used by some providers like Duffel)
  if (durationStr.startsWith('PT')) {
    let minutes = 0;
    const hMatch = durationStr.match(/(\d+)H/);
    const mMatch = durationStr.match(/(\d+)M/);
    if (hMatch) minutes += parseInt(hMatch[1]) * 60;
    if (mMatch) minutes += parseInt(mMatch[1]);
    return minutes;
  }

  // Handle "7h 15m" format
  let minutes = 0;
  const hMatch = durationStr.match(/(\d+)h/);
  const mMatch = durationStr.match(/(\d+)m/);
  if (hMatch) minutes += parseInt(hMatch[1]) * 60;
  if (mMatch) minutes += parseInt(mMatch[1]);
  return minutes;
}
