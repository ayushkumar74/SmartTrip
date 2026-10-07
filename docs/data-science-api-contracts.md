# SmartTrip Data Science API Contracts

## 1. Architecture

The integration boundary is:

```text
Frontend -> SmartTrip Backend -> Data Science service -> ML model
```

The frontend never calls a Data Science service directly. SmartTrip authenticates the user, derives `userId` from the HTTP-only JWT session, validates the request, and forwards only the minimum context required by the configured service.

SmartTrip does not persist generated predictions or generated itineraries yet. A trip planner response is advisory and must not be written to `Trip`, `TripDay`, or `TripActivity` automatically.

## 2. Service Responsibilities

| Service | Responsibility | SmartTrip configuration |
| --- | --- | --- |
| Recommendation | Destinations, hotels, and activities relevant to a user's context | `DS_RECOMMENDATION_URL` |
| Price Intelligence | Flight or hotel price estimates and trends | `DS_PRICE_INTELLIGENCE_URL` |
| Trip Planner | Suggested itinerary structure | `DS_TRIP_PLANNER_URL` |
| Analytics | Aggregated application insights | `DS_ANALYTICS_URL` |

All proxy routes require an authenticated SmartTrip user session. The proxy never forwards passwords, JWTs, payment data, Razorpay secrets, passport data, or arbitrary database records.

## 3. SmartTrip Proxy Endpoints

These are the endpoints implemented by the Node.js backend:

- `POST /api/v1/data-science/recommend`
- `POST /api/v1/data-science/price-intelligence`
- `POST /api/v1/data-science/trip-plan`
- `POST /api/v1/data-science/analytics`

The downstream service paths are `/recommend`, `/predict`, `/plan`, and `/analyze` respectively. DS developers expose their service at the configured base URL; SmartTrip appends the path.

## 4. Recommendation Contract

### Request

`POST /api/v1/data-science/recommend`

```json
{
  "destination": "Paris, France",
  "travelStyles": ["History", "Food & Dining"],
  "budgetLevel": "Mid-range",
  "startDate": "2026-10-20",
  "endDate": "2026-10-23",
  "searchContext": {
    "source": "explore"
  }
}
```

`userId` is derived by SmartTrip and forwarded internally. It is not accepted from the frontend.

### Response

```json
{
  "recommendations": [
    {
      "type": "destination",
      "id": "destination-id",
      "name": "Paris",
      "score": 0.91,
      "relevance": 0.91,
      "reason": "Matches the travel style and destination context"
    }
  ],
  "modelVersion": "recommendation-v1",
  "generatedAt": "2026-09-15T10:00:00Z"
}
```

`recommendations` is required. Each item may reference a destination, hotel, or activity identifier. Scores should use a documented range, preferably `0..1`.

## 5. Price Intelligence Contract

### Request

`POST /api/v1/data-science/price-intelligence`

```json
{
  "productType": "flight",
  "origin": "DEL",
  "destination": "BOM",
  "travelDate": "2026-10-20",
  "currency": "INR",
  "historicalWindow": "90d"
}
```

`productType` is `flight` or `hotel`; `currency` is required and must be an ISO-style three-letter code.

### Response

```json
{
  "currency": "INR",
  "prediction": {
    "estimatedPrice": 8500,
    "lowerBound": 7800,
    "upperBound": 9400
  },
  "trend": "stable",
  "confidence": 0.78,
  "modelVersion": "price-v1",
  "generatedAt": "2026-09-15T10:00:00Z"
}
```

Price intelligence is informational only. It must never override the backend-authoritative booking total, currency, inventory, or payment amount.

## 6. Intelligent Trip Planner Contract

### Request

`POST /api/v1/data-science/trip-plan`

```json
{
  "destination": "Paris, France",
  "startDate": "2026-10-20",
  "endDate": "2026-10-23",
  "budget": 1200,
  "currency": "USD",
  "travelStyles": ["History", "Food & Dining"],
  "interests": ["Museums", "Local cuisine"],
  "constraints": {
    "pace": "moderate",
    "mobility": "none"
  }
}
```

### Response

```json
{
  "days": [
    {
      "dayNumber": 1,
      "date": "2026-10-20",
      "activities": [
        {
          "title": "Visit Louvre",
          "description": "Museum visit",
          "activityType": "Attraction",
          "startTime": "09:00",
          "endTime": "12:00",
          "sortOrder": 0,
          "attractionId": "optional-catalog-id",
          "hotelId": null
        }
      ]
    }
  ],
  "modelVersion": "planner-v1",
  "generatedAt": "2026-09-15T10:00:00Z"
}
```

`days` is required and maps conceptually to `TripDay[]`; activities map to `TripActivity[]`. SmartTrip does not automatically persist this response.

## 7. Analytics Contract

### Request

`POST /api/v1/data-science/analytics`

```json
{
  "metrics": ["search_count", "booking_count"],
  "dateFrom": "2026-09-01",
  "dateTo": "2026-09-15",
  "groupBy": "day"
}
```

### Response

```json
{
  "metrics": {
    "search_count": 120,
    "booking_count": 18
  },
  "period": {
    "from": "2026-09-01T00:00:00Z",
    "to": "2026-09-15T23:59:59Z"
  },
  "modelVersion": "analytics-v1",
  "generatedAt": "2026-09-15T10:00:00Z"
}
```

Analytics responses should be aggregated. Do not return raw user records, credentials, payment details, or unnecessary personally identifiable information.

## 8. Error Format

SmartTrip returns its normal response envelope:

```json
{
  "success": false,
  "message": "Recommendation service is not configured"
}
```

Typical statuses:

- `400`: invalid request or invalid date/field values
- `401`: no valid SmartTrip session
- `502`: downstream HTTP error, invalid JSON, or invalid response shape
- `503`: downstream URL is not configured or unavailable
- `504`: downstream request exceeded the timeout

No error path fabricates recommendations, predictions, plans, or analytics.

## 9. Timeout and Authentication

The default downstream timeout is `DS_REQUEST_TIMEOUT_MS=5000`. A request is cancelled when the timeout expires. Each request is JSON and includes `Content-Type: application/json` and `Accept: application/json`.

When `DS_SERVICE_AUTH_SECRET` is configured, SmartTrip sends it in the header named by `DS_SERVICE_AUTH_HEADER` (default `x-ds-service-key`). This secret is server-side only and is never returned to the frontend.

The DS service must treat the forwarded `userId` as application context, not as permission to access unrelated users. SmartTrip remains the source of truth for authentication and ownership.

## 10. Versioning Strategy

Start with the unversioned internal paths documented above while the contract is being developed. Introduce `/v1` in the downstream service path when a breaking request or response change is required. Keep SmartTrip's proxy contract stable during a migration and deploy the DS service version behind its configured base URL.

Every response should include `modelVersion` and `generatedAt` when available. These fields describe the DS result only and do not alter booking authority.

## 11. How DS Developers Should Expose a Service

Each team should expose a JSON HTTP service with:

1. A base URL reachable from the SmartTrip backend.
2. The documented POST path and request fields.
3. JSON responses matching the required top-level field (`recommendations`, `prediction` or `trend`, `days`, or `metrics`).
4. HTTP 4xx/5xx responses for failures, not successful responses containing error text.
5. A predictable timeout-compatible response time.
6. Optional validation of `x-ds-service-key` when SmartTrip configures the shared secret.
7. No requirement for the browser to know the DS URL or secret.

## 12. Example Local Environment

```env
DS_RECOMMENDATION_URL=http://localhost:8001
DS_PRICE_INTELLIGENCE_URL=http://localhost:8002
DS_TRIP_PLANNER_URL=http://localhost:8003
DS_ANALYTICS_URL=http://localhost:8004
DS_REQUEST_TIMEOUT_MS=5000
DS_SERVICE_AUTH_HEADER=x-ds-service-key
DS_SERVICE_AUTH_SECRET=local-only-shared-secret
```

Leave individual URLs empty when a service is not available. The corresponding SmartTrip endpoint will return `503`; existing flights, hotels, bookings, payments, trips, preferences, and search history continue to operate independently.
