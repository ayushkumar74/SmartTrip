import api from './api';

const normalizeCabinClass = (value) => {
  const normalized = String(value || '').trim().toUpperCase();

  const aliases = {
    ECONOMY: 'ECONOMY',
    'PREMIUM ECONOMY': 'PREMIUM_ECONOMY',
    PREMIUM_ECONOMY: 'PREMIUM_ECONOMY',
    BUSINESS: 'BUSINESS',
    FIRST: 'FIRST',
  };

  return aliases[normalized] || normalized || 'ECONOMY';
};

export const flightService = {
  /**
   * Search flights using the SmartTrip backend.
   *
   * Supported criteria:
   * {
   *   from,
   *   to,
   *   date,
   *   returnDate,
   *   cabinClass / class,
   *   adults,
   *   passengers,
   *   children,
   *   infants,
   *   childAges,
   *   sortBy,
   *   sortOrder
   * }
   */
  searchFlights: async (criteria = {}) => {
    const params = new URLSearchParams();

    if (criteria.from) {
      params.append('from', String(criteria.from).trim().toUpperCase());
    }

    if (criteria.to) {
      params.append('to', String(criteria.to).trim().toUpperCase());
    }

    if (criteria.date) {
      params.append('date', criteria.date);
    }

    if (criteria.returnDate) {
      params.append('returnDate', criteria.returnDate);
    }

    const cabinClass = normalizeCabinClass(
      criteria.cabinClass || criteria.class
    );

    if (cabinClass) {
      params.append('cabinClass', cabinClass);
    }

    if (criteria.adults !== undefined) {
      params.append('adults', String(criteria.adults));
    }

    if (criteria.passengers !== undefined) {
      params.append('passengers', String(criteria.passengers));
    }

    if (criteria.children !== undefined) {
      params.append('children', String(criteria.children));
    }

    if (criteria.infants !== undefined) {
      params.append('infants', String(criteria.infants));
    }

    if (criteria.childAges) {
      const childAges = Array.isArray(criteria.childAges)
        ? criteria.childAges.join(',')
        : String(criteria.childAges);

      params.append('childAges', childAges);
    }

    if (criteria.sortBy) {
      params.append('sortBy', criteria.sortBy);
    }

    if (criteria.sortOrder) {
      params.append('sortOrder', criteria.sortOrder);
    }

    const response = await api.get(
      `/flights/search?${params.toString()}`
    );

    return response.data;
  },

  /**
   * Get authoritative flight details from backend.
   */
  getFlightDetails: async (flightId) => {
    if (!flightId) {
      throw new Error('Flight ID is required');
    }

    const response = await api.get(
      `/flights/${encodeURIComponent(flightId)}`
    );

    return response.data;
  },

  /**
   * Get 7-day fare calendar for a route.
   */
  getFareCalendar: async (criteria = {}) => {
    const params = new URLSearchParams();

    if (criteria.from) {
      params.append(
        'from',
        String(criteria.from).trim().toUpperCase()
      );
    }

    if (criteria.to) {
      params.append(
        'to',
        String(criteria.to).trim().toUpperCase()
      );
    }

    if (criteria.date) {
      params.append('date', criteria.date);
    }

    if (criteria.adults !== undefined) {
      params.append('adults', String(criteria.adults));
    }

    if (criteria.cabinClass || criteria.class) {
      params.append(
        'class',
        normalizeCabinClass(
          criteria.cabinClass || criteria.class
        )
      );
    }

    const response = await api.get(
      `/flights/fare-calendar?${params.toString()}`
    );

    return response.data;
  },
};