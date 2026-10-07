import { z } from 'zod';

const date = z.string().min(1);
const stringList = z.array(z.string().min(1)).max(50).optional();
const object = z.record(z.string(), z.unknown()).optional();

export const recommendationSchema = z.object({
  destination: z.string().optional(),
  travelStyles: stringList,
  budgetLevel: z.string().optional(),
  startDate: date.optional(),
  endDate: date.optional(),
  searchContext: object,
}).strict();

export const priceIntelligenceSchema = z.object({
  productType: z.enum(['flight', 'hotel']),
  origin: z.string().optional(),
  destination: z.string().min(1),
  travelDate: date.optional(),
  currency: z.string().length(3),
  historicalWindow: z.unknown().optional(),
}).strict();

export const tripPlannerSchema = z.object({
  destination: z.string().min(1),
  startDate: date,
  endDate: date,
  budget: z.unknown().optional(),
  currency: z.string().length(3).optional(),
  travelStyles: stringList,
  interests: stringList,
  constraints: object,
}).strict();

export const analyticsSchema = z.object({
  metrics: z.array(z.string().min(1)).min(1).max(50),
  dateFrom: date.optional(),
  dateTo: date.optional(),
  groupBy: z.string().optional(),
}).strict();
