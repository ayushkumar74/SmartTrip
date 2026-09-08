// A mock external flight provider
// In a real application, this would integrate with Amadeus, Skyscanner, or similar APIs.

const MOCK_FLIGHTS = [
  {
    id: 'F1000A',
    airline: 'Air India',
    flightNumber: 'AI-101',
    departureAirport: 'DEL',
    departureCity: 'New Delhi',
    departureTime: '2026-10-15T06:00:00Z',
    arrivalAirport: 'BOM',
    arrivalCity: 'Mumbai',
    arrivalTime: '2026-10-15T08:15:00Z',
    duration: '2h 15m',
    stops: 0,
    cabinClass: 'ECONOMY',
    availableSeats: 45,
    price: 120.00,
    currency: 'USD',
    baggage: '1 Checked, 1 Carry-on'
  },
  {
    id: 'F1000B',
    airline: 'IndiGo',
    flightNumber: '6E-452',
    departureAirport: 'DEL',
    departureCity: 'New Delhi',
    departureTime: '2026-10-15T09:30:00Z',
    arrivalAirport: 'BOM',
    arrivalCity: 'Mumbai',
    arrivalTime: '2026-10-15T11:40:00Z',
    duration: '2h 10m',
    stops: 0,
    cabinClass: 'ECONOMY',
    availableSeats: 12,
    price: 95.00,
    currency: 'USD',
    baggage: '1 Checked, 1 Carry-on'
  },
  {
    id: 'F1001',
    airline: 'SkyHigh Airlines',
    flightNumber: 'SH-102',
    departureAirport: 'JFK',
    departureCity: 'New York',
    departureTime: '2026-10-15T08:30:00Z',
    arrivalAirport: 'CDG',
    arrivalCity: 'Paris',
    arrivalTime: '2026-10-15T21:45:00Z',
    duration: '7h 15m',
    stops: 0,
    cabinClass: 'ECONOMY',
    availableSeats: 45,
    price: 450.00,
    currency: 'USD',
    baggage: '1 Checked, 1 Carry-on'
  },
  {
    id: 'F1002',
    airline: 'Oceanic Air',
    flightNumber: 'OA-815',
    departureAirport: 'JFK',
    departureCity: 'New York',
    departureTime: '2026-10-15T10:15:00Z',
    arrivalAirport: 'CDG',
    arrivalCity: 'Paris',
    arrivalTime: '2026-10-15T23:50:00Z',
    duration: '7h 35m',
    stops: 0,
    cabinClass: 'PREMIUM_ECONOMY',
    availableSeats: 12,
    price: 750.00,
    currency: 'USD',
    baggage: '2 Checked, 1 Carry-on'
  },
  {
    id: 'F1003',
    airline: 'EuroFly',
    flightNumber: 'EF-332',
    departureAirport: 'JFK',
    departureCity: 'New York',
    departureTime: '2026-10-15T15:00:00Z',
    arrivalAirport: 'LHR',
    arrivalCity: 'London',
    arrivalTime: '2026-10-16T03:00:00Z',
    duration: '7h 00m',
    stops: 0,
    cabinClass: 'ECONOMY',
    availableSeats: 8,
    price: 390.00,
    currency: 'USD',
    baggage: '1 Carry-on only'
  },
  {
    id: 'F1004',
    airline: 'EuroFly',
    flightNumber: 'EF-333',
    departureAirport: 'LHR',
    departureCity: 'London',
    departureTime: '2026-10-16T05:00:00Z',
    arrivalAirport: 'CDG',
    arrivalCity: 'Paris',
    arrivalTime: '2026-10-16T07:15:00Z',
    duration: '1h 15m',
    stops: 0,
    cabinClass: 'ECONOMY',
    availableSeats: 20,
    price: 80.00,
    currency: 'USD',
    baggage: '1 Carry-on only'
  },
  {
    id: 'F2001',
    airline: 'Pacific Airways',
    flightNumber: 'PA-901',
    departureAirport: 'SFO',
    departureCity: 'San Francisco',
    departureTime: '2026-11-20T11:00:00Z',
    arrivalAirport: 'NRT',
    arrivalCity: 'Tokyo',
    arrivalTime: '2026-11-21T15:30:00Z',
    duration: '11h 30m',
    stops: 0,
    cabinClass: 'BUSINESS',
    availableSeats: 4,
    price: 3200.00,
    currency: 'USD',
    baggage: '2 Checked, 2 Carry-on, Lounge Access'
  },
  {
    id: 'F2002',
    airline: 'Zenith Air',
    flightNumber: 'ZA-444',
    departureAirport: 'SFO',
    departureCity: 'San Francisco',
    departureTime: '2026-11-20T13:45:00Z',
    arrivalAirport: 'NRT',
    arrivalCity: 'Tokyo',
    arrivalTime: '2026-11-21T17:15:00Z',
    duration: '10h 30m',
    stops: 0,
    cabinClass: 'ECONOMY',
    availableSeats: 80,
    price: 650.00,
    currency: 'USD',
    baggage: '1 Checked, 1 Carry-on'
  },
  {
    id: 'F3001',
    airline: 'Global Wings',
    flightNumber: 'GW-500',
    departureAirport: 'JFK',
    departureCity: 'New York',
    departureTime: '2026-12-10T06:00:00Z',
    arrivalAirport: 'MIA',
    arrivalCity: 'Miami',
    arrivalTime: '2026-12-10T09:15:00Z',
    duration: '3h 15m',
    stops: 0,
    cabinClass: 'ECONOMY',
    availableSeats: 150,
    price: 150.00,
    currency: 'USD',
    baggage: '1 Carry-on'
  }
];

// Helper to simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const flightProvider = {
  /**
   * Search for flights based on criteria
   * @param {Object} criteria { from, to, date, passengers, cabinClass } 
   * @returns {Promise<Array>} List of flights
   */
  async searchFlights(criteria = {}) {
    await delay(800); // Simulate network latency

    let results = [...MOCK_FLIGHTS];

    // Case-insensitive city/airport matching
    if (criteria.from) {
      const fromLower = criteria.from.toLowerCase();
      results = results.filter(f => 
        f.departureCity.toLowerCase().includes(fromLower) || 
        f.departureAirport.toLowerCase().includes(fromLower)
      );
    }

    if (criteria.to) {
      const toLower = criteria.to.toLowerCase();
      results = results.filter(f => 
        f.arrivalCity.toLowerCase().includes(toLower) || 
        f.arrivalAirport.toLowerCase().includes(toLower)
      );
    }

    // If a date is provided, shift the mock flights to match that date
    // so the UI can be tested without guessing hardcoded dates.
    if (criteria.date) {
      results = results.map(f => {
        // Just replace the YYYY-MM-DD part of the flight times with the requested date
        const baseDateStr = f.departureTime.split('T')[0];
        const targetDateStr = criteria.date;
        
        // Very basic string replacement to simulate dynamic dates
        return {
          ...f,
          departureTime: f.departureTime.replace(baseDateStr, targetDateStr),
          arrivalTime: f.arrivalTime.replace(baseDateStr, targetDateStr)
        };
      });
    }
    
    if (criteria.cabinClass) {
      results = results.filter(f => f.cabinClass === criteria.cabinClass.toUpperCase());
    }

    return results;
  },

  /**
   * Get specific flight details
   * @param {string} id Flight ID
   */
  async getFlightById(id) {
    await delay(400);
    const flight = MOCK_FLIGHTS.find(f => f.id === id);
    if (!flight) {
      throw new Error('Flight not found in provider');
    }
    return flight;
  }
};
