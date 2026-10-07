import { env } from '../../../config/env.js';

const serviceUrls = {
  recommendation: env.DS_RECOMMENDATION_URL,
  priceIntelligence: env.DS_PRICE_INTELLIGENCE_URL,
  tripPlanner: env.DS_TRIP_PLANNER_URL,
  analytics: env.DS_ANALYTICS_URL,
};

const serviceLabels = {
  recommendation: 'Recommendation service',
  priceIntelligence: 'Price intelligence service',
  tripPlanner: 'Trip planner service',
  analytics: 'Analytics service',
};

const adapterError = (message, statusCode = 502) => Object.assign(new Error(message), { statusCode });

export class DataScienceClient {
  constructor({ timeoutMs = Number(env.DS_REQUEST_TIMEOUT_MS), baseUrls = serviceUrls } = {}) {
    this.timeoutMs = Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 5000;
    this.baseUrls = baseUrls;
  }

  async post(service, path, payload, validateResponse) {
    const baseUrl = this.baseUrls[service];
    const label = serviceLabels[service] || 'Data Science service';
    if (!baseUrl) throw adapterError(`${label} is not configured`, 503);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
    if (env.DS_SERVICE_AUTH_SECRET) headers[env.DS_SERVICE_AUTH_HEADER] = env.DS_SERVICE_AUTH_SECRET;

    try {
      let response;
      try {
        response = await fetch(new URL(path, `${baseUrl.replace(/\/$/, '')}/`), {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } catch (error) {
        if (error.name === 'AbortError') throw adapterError(`${label} timed out`, 504);
        throw adapterError(`${label} is unavailable`, 503);
      }

      const text = await response.text();
      if (!response.ok) throw adapterError(`${label} returned HTTP ${response.status}`, 502);
      let body;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        throw adapterError(`${label} returned invalid JSON`, 502);
      }
      try {
        return validateResponse(body);
      } catch (error) {
        throw adapterError(`${label} returned an invalid response shape`, 502);
      }
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const dataScienceClient = new DataScienceClient();
