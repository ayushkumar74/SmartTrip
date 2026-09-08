// Static dataset for airport autocomplete
// Structured to be easily replaced by an API endpoint later

export const airports = [
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', country: 'India' },
  { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore', country: 'India' },
  { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India' },
  { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India' },
  { code: 'CCU', name: 'Netaji Subhas Chandra Bose International', city: 'Kolkata', country: 'India' },
  { code: 'AMD', name: 'Sardar Vallabhbhai Patel International', city: 'Ahmedabad', country: 'India' },
  { code: 'PNQ', name: 'Pune Airport', city: 'Pune', country: 'India' },
  { code: 'PAT', name: 'Jay Prakash Narayan International Airport', city: 'Patna', country: 'India' },
  { code: 'GOI', name: 'Goa International Airport', city: 'Goa', country: 'India' },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates' },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom' },
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'United States' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
  { code: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore' },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' },
  { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia' },
];

/**
 * Searches the airport dataset by query
 * @param {string} query - The search query (city, airport name, or code)
 * @returns {Promise<Array>} - List of matching airports
 */
export const searchAirports = async (query) => {
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  
  // Simulate network delay for API realism
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = airports.filter(airport => 
        airport.city.toLowerCase().includes(lowerQuery) ||
        airport.code.toLowerCase().includes(lowerQuery) ||
        airport.name.toLowerCase().includes(lowerQuery)
      );
      
      resolve(results.map(a => ({
        title: `${a.city.toUpperCase()}, ${a.country.toUpperCase()}`,
        subtitle: a.name,
        code: a.code,
        displayTitle: a.city
      })));
    }, 150);
  });
};
