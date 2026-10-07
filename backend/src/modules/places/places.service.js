import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import { markProviderError, shouldFallbackToDatabase } from '../../utils/providerFallback.js';

const prisma = new PrismaClient();

/**
 * Determines whether Google APIs are configured and available.
 */
const isGoogleConfigured = () => {
  return !!(process.env.GOOGLE_MAPS_API_KEY);
};

const classifyGoogleError = (error) => error?.providerFailure === undefined
  ? markProviderError(error, 'runtime')
  : error;

export const placesService = {
  /**
   * Search for places / destinations.
   * - If GOOGLE_MAPS_API_KEY is set  → Google Places Autocomplete (Text Search)
   * - Otherwise                       → DB fallback (Destination + Airport tables)
   */
  async searchPlaces(query, type = 'all') {
    const cleanQuery = (query || '').trim();

    if (!cleanQuery) {
      return await this._dbFallbackSearch('', type);
    }

    if (cleanQuery.length < 2) {
      return { results: [], source: 'empty' };
    }

    if (isGoogleConfigured()) {
      try {
        return await this._googlePlacesSearch(cleanQuery, type);
      } catch (error) {
        const classified = classifyGoogleError(error);
        if (!shouldFallbackToDatabase(classified)) throw classified;
        console.warn('[Places Provider Fallback] Google search failed; using database provider');
        return this._dbFallbackSearch(cleanQuery, type);
      }
    }

    return await this._dbFallbackSearch(cleanQuery, type);
  },

  /**
   * Get details for a specific place.
   * - If GOOGLE_MAPS_API_KEY is set and placeId starts with 'ChIJ...' → Google Places Details
   * - If placeId starts with 'db_'                                    → DB lookup
   */
  async getPlaceDetails(placeId) {
    if (isGoogleConfigured() && !placeId.startsWith('db_')) {
      try {
        return await this._googlePlaceDetails(placeId);
      } catch (error) {
        const classified = classifyGoogleError(error);
        if (!shouldFallbackToDatabase(classified)) throw classified;
        console.warn('[Places Provider Fallback] Google details failed; using database provider');
        return this._dbPlaceDetails(placeId);
      }
    }
    return await this._dbPlaceDetails(placeId);
  },

  /**
   * Compute a route between two places.
   * - If GOOGLE_MAPS_API_KEY is set → Google Routes API
   * - Otherwise                      → Static fallback with estimated info
   */
  async getRoute(origin, destination, mode = 'DRIVE') {
    if (isGoogleConfigured()) {
      try {
        return await this._googleRoute(origin, destination, mode);
      } catch (error) {
        const classified = classifyGoogleError(error);
        if (!shouldFallbackToDatabase(classified)) throw classified;
        console.warn('[Places Provider Fallback] Google route failed; using static fallback');
        return this._fallbackRoute(origin, destination, mode);
      }
    }
    return this._fallbackRoute(origin, destination, mode);
  },

  // ─── GOOGLE IMPLEMENTATIONS ──────────────────────────────────────────────

  async _googlePlacesSearch(query, type) {
    const endpoint = 'https://places.googleapis.com/v1/places:searchText';

    const body = {
      textQuery: query,
      maxResultCount: 10,
    };

    // Narrow type if requested
    if (type === 'airport') {
      body.textQuery = `${query} airport`;
    } else if (type === 'city') {
      body.includedType = 'locality';
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.photos'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.text();
      throw markProviderError(new Error(`Google Places API error (${res.status}): ${err}`), res.status >= 400 && res.status < 500 ? 'client' : 'runtime');
    }

    const data = await res.json();

    const results = (data.places || []).map(p => ({
      id: p.id,
      name: p.displayName?.text || '',
      address: p.formattedAddress || '',
      location: {
        lat: p.location?.latitude,
        lng: p.location?.longitude,
      },
      types: p.types || [],
      photo: p.photos?.[0]?.name
        ? `https://places.googleapis.com/v1/${p.photos[0].name}/media?maxWidthPx=400&key=${process.env.GOOGLE_MAPS_API_KEY}`
        : null,
      source: 'google',
    }));

    return { results, source: 'google' };
  },

  async _googlePlaceDetails(placeId) {
    const endpoint = `https://places.googleapis.com/v1/places/${placeId}`;

    const res = await fetch(endpoint, {
      headers: {
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,types,rating,photos,editorialSummary,websiteUri,nationalPhoneNumber,regularOpeningHours'
      }
    });

    if (!res.ok) {
      const err = await res.text();
      throw markProviderError(new Error(`Google Place Details API error (${res.status}): ${err}`), res.status >= 400 && res.status < 500 ? 'client' : 'runtime');
    }

    const p = await res.json();

    return {
      id: p.id,
      name: p.displayName?.text || '',
      address: p.formattedAddress || '',
      location: { lat: p.location?.latitude, lng: p.location?.longitude },
      types: p.types || [],
      rating: p.rating,
      description: p.editorialSummary?.text || '',
      website: p.websiteUri,
      phone: p.nationalPhoneNumber,
      openingHours: p.regularOpeningHours?.weekdayDescriptions || [],
      photos: (p.photos || []).slice(0, 5).map(ph =>
        `https://places.googleapis.com/v1/${ph.name}/media?maxWidthPx=800&key=${process.env.GOOGLE_MAPS_API_KEY}`
      ),
      source: 'google',
    };
  },

  async _googleRoute(origin, destination, mode) {
    const endpoint = 'https://routes.googleapis.com/directions/v2:computeRoutes';

    const body = {
      origin: { address: origin },
      destination: { address: destination },
      travelMode: mode,
      computeAlternativeRoutes: false,
      routeModifiers: { avoidTolls: false, avoidHighways: false },
      languageCode: 'en-US',
      units: 'METRIC'
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.legs.steps.navigationInstruction,routes.legs.duration,routes.legs.distanceMeters,routes.polyline.encodedPolyline'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.text();
      throw markProviderError(new Error(`Google Routes API error (${res.status}): ${err}`), res.status >= 400 && res.status < 500 ? 'client' : 'runtime');
    }

    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) return this._fallbackRoute(origin, destination, mode);

    return {
      origin,
      destination,
      mode,
      duration: route.duration,          // e.g. "3600s"
      durationText: this._fmtDuration(parseInt(route.duration)),
      distanceMeters: route.distanceMeters,
      distanceText: `${(route.distanceMeters / 1000).toFixed(1)} km`,
      polyline: route.polyline?.encodedPolyline || null,
      source: 'google',
    };
  },

  // ─── DB FALLBACK IMPLEMENTATIONS ────────────────────────────────────────

  async _dbFallbackSearch(query, type) {
    const q = query.toLowerCase();

    const results = [];

    if (type === 'airport' || type === 'all') {
      const airports = await prisma.airport.findMany({
        where: {
          OR: [
            { iataCode: { contains: q, mode: 'insensitive' } },
            { name: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } },
            { country: { contains: q, mode: 'insensitive' } },
          ]
        },
        take: type === 'airport' ? 15 : 5,
      });

      airports.forEach(a => results.push({
        id: `db_airport_${a.id}`,
        name: `${a.name} (${a.iataCode})`,
        address: `${a.city}, ${a.country}`,
        location: { lat: a.latitude, lng: a.longitude },
        types: ['airport'],
        iataCode: a.iataCode,
        photo: null,
        source: 'database',
      }));
    }

    if (type === 'city' || type === 'all') {
      const destinations = await prisma.destination.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { country: { contains: q, mode: 'insensitive' } },
            { region: { contains: q, mode: 'insensitive' } },
          ]
        },
        take: type === 'city' ? 15 : 5,
      });

      destinations.forEach(d => results.push({
        id: `db_dest_${d.id}`,
        name: d.name,
        address: `${d.country}${d.region ? `, ${d.region}` : ''}`,
        location: { lat: d.latitude || null, lng: d.longitude || null },
        types: ['locality'],
        description: d.description,
        imageUrl: d.imageUrl,
        photo: d.imageUrl,
        source: 'database',
      }));
    }

    return { results, source: 'database' };
  },

  async _dbPlaceDetails(placeId) {
    if (placeId.startsWith('db_dest_')) {
      const realId = placeId.replace('db_dest_', '');
      const d = await prisma.destination.findUnique({
        where: { id: realId },
        include: { attractions: true }
      });
      if (!d) throw new Error('Destination not found');
      return {
        id: placeId,
        name: d.name,
        address: `${d.country}${d.region ? `, ${d.region}` : ''}`,
        location: { lat: d.latitude, lng: d.longitude },
        types: ['locality'],
        description: d.description,
        imageUrl: d.imageUrl,
        photos: d.imageUrl ? [d.imageUrl] : [],
        attractions: d.attractions || [],
        source: 'database',
      };
    }

    if (placeId.startsWith('db_airport_')) {
      const realId = placeId.replace('db_airport_', '');
      const a = await prisma.airport.findUnique({ where: { id: realId } });
      if (!a) throw new Error('Airport not found');
      return {
        id: placeId,
        name: `${a.name} (${a.iataCode})`,
        address: `${a.city}, ${a.country}`,
        location: { lat: a.latitude, lng: a.longitude },
        types: ['airport'],
        iataCode: a.iataCode,
        source: 'database',
      };
    }

    throw new Error('Unknown place ID format');
  },

  _fallbackRoute(origin, destination, mode) {
    return {
      origin,
      destination,
      mode,
      duration: null,
      durationText: 'Duration unavailable (Google Routes API not configured)',
      distanceMeters: null,
      distanceText: 'Distance unavailable',
      polyline: null,
      source: 'fallback',
      note: 'Configure GOOGLE_MAPS_API_KEY for live route data.'
    };
  },

  _fmtDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m} min`;
  }
};
