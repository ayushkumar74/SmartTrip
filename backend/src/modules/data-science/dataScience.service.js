import { dataScienceClient } from './clients/dataScienceClient.js';

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const stringOrNull = (value) => value === undefined || value === null || typeof value === 'string';
const cleanStrings = (value, field) => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim())) {
    throw new Error(`${field} must be an array of non-empty strings`);
  }
  return [...new Set(value.map((item) => item.trim()))].slice(0, 50);
};
const requireString = (value, field) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} is required`);
  return value.trim();
};
const requireDate = (value, field) => {
  const date = requireString(value, field);
  if (Number.isNaN(Date.parse(date))) throw new Error(`${field} is invalid`);
  return date;
};
const responseObject = (value) => {
  if (!isObject(value)) throw new Error('response must be an object');
  return value;
};
const recommendationResponse = (value) => {
  const body = responseObject(value);
  if (!Array.isArray(body.recommendations)) throw new Error('recommendations must be an array');
  return body;
};
const priceResponse = (value) => {
  const body = responseObject(value);
  if (!stringOrNull(body.currency) || (!body.prediction && !body.trend)) throw new Error('prediction or trend is required');
  return body;
};
const planResponse = (value) => {
  const body = responseObject(value);
  if (!Array.isArray(body.days)) throw new Error('days must be an array');
  return body;
};
const analyticsResponse = (value) => {
  const body = responseObject(value);
  if (!isObject(body.metrics) && !Array.isArray(body.metrics)) throw new Error('metrics must be an object or array');
  return body;
};

export const dataScienceService = {
  async getRecommendations(userId, input = {}) {
    if (!isObject(input)) throw new Error('request body must be an object');
    const payload = {
      userId,
      destination: input.destination?.trim(),
      travelStyles: cleanStrings(input.travelStyles, 'travelStyles'),
      budgetLevel: input.budgetLevel?.trim(),
      startDate: input.startDate ? requireDate(input.startDate, 'startDate') : undefined,
      endDate: input.endDate ? requireDate(input.endDate, 'endDate') : undefined,
      searchContext: isObject(input.searchContext) ? input.searchContext : undefined,
    };
    return dataScienceClient.post('recommendation', '/recommend', payload, recommendationResponse);
  },

  async getPriceIntelligence(userId, input = {}) {
    if (!isObject(input)) throw new Error('request body must be an object');
    const payload = {
      userId,
      productType: requireString(input.productType, 'productType'),
      origin: input.origin?.trim(),
      destination: requireString(input.destination, 'destination'),
      travelDate: input.travelDate ? requireDate(input.travelDate, 'travelDate') : undefined,
      currency: requireString(input.currency, 'currency').toUpperCase(),
      historicalWindow: input.historicalWindow,
    };
    return dataScienceClient.post('priceIntelligence', '/predict', payload, priceResponse);
  },

  async generateTripPlan(userId, input = {}) {
    if (!isObject(input)) throw new Error('request body must be an object');
    const payload = {
      userId,
      destination: requireString(input.destination, 'destination'),
      startDate: requireDate(input.startDate, 'startDate'),
      endDate: requireDate(input.endDate, 'endDate'),
      budget: input.budget,
      currency: input.currency?.trim()?.toUpperCase(),
      travelStyles: cleanStrings(input.travelStyles, 'travelStyles'),
      interests: cleanStrings(input.interests, 'interests'),
      constraints: isObject(input.constraints) ? input.constraints : undefined,
    };
    return dataScienceClient.post('tripPlanner', '/plan', payload, planResponse);
  },

  async getAnalytics(userId, input = {}) {
    if (!isObject(input)) throw new Error('request body must be an object');
    const metrics = cleanStrings(input.metrics, 'metrics');
    if (!metrics?.length) throw new Error('metrics is required');
    const payload = {
      userId,
      metrics,
      dateFrom: input.dateFrom ? requireDate(input.dateFrom, 'dateFrom') : undefined,
      dateTo: input.dateTo ? requireDate(input.dateTo, 'dateTo') : undefined,
      groupBy: input.groupBy?.trim(),
    };
    return dataScienceClient.post('analytics', '/analyze', payload, analyticsResponse);
  },
};
