import { z } from 'zod';

const isCalendarDate = (value) => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const optionalDate = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
  .refine(isCalendarDate, 'Use a valid calendar date')
  .optional();
const pagination = {
  page: z.coerce.number().int().min(1).max(100000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
};

export const bookingQuerySchema = z.object({
  ...pagination,
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']).optional(),
  type: z.enum(['FLIGHT', 'HOTEL']).optional(),
  bookingReference: z.string().trim().max(80).optional(),
  dateFrom: optionalDate,
  dateTo: optionalDate,
}).strict();

export const paymentQuerySchema = z.object({
  ...pagination,
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
  bookingReference: z.string().trim().max(80).optional(),
  dateFrom: optionalDate,
  dateTo: optionalDate,
}).strict();

export const userQuerySchema = z.object({
  ...pagination,
  role: z.enum(['USER', 'ADMIN']).optional(),
  isActive: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  q: z.string().trim().max(100).optional(),
  dateFrom: optionalDate,
  dateTo: optionalDate,
}).strict();

export const flightQuerySchema = z.object({
  ...pagination,
  q: z.string().trim().max(100).optional(),
  airline: z.string().trim().max(10).optional(),
  origin: z.string().trim().max(10).optional(),
  destination: z.string().trim().max(10).optional(),
  cabinClass: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).optional(),
  active: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
}).strict();

export const hotelQuerySchema = z.object({
  ...pagination,
  q: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  active: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
}).strict();

export const packageQuerySchema = z.object({
  ...pagination,
  q: z.string().trim().max(100).optional(),
  destination: z.string().trim().max(100).optional(),
  active: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
}).strict();

export const parseQuery = (schema, query) => {
  const result = schema.safeParse(query);
  if (!result.success) {
    const error = new Error('Invalid admin query parameters');
    error.statusCode = 400;
    error.details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    throw error;
  }
  if (result.data.dateFrom && result.data.dateTo && result.data.dateFrom > result.data.dateTo) {
    const error = new Error('dateFrom cannot be after dateTo');
    error.statusCode = 400;
    throw error;
  }
  return result.data;
};

export const dateRange = ({ dateFrom, dateTo }) => {
  if (!dateFrom && !dateTo) return undefined;
  const range = {};
  if (dateFrom) range.gte = new Date(`${dateFrom}T00:00:00.000Z`);
  if (dateTo) range.lte = new Date(`${dateTo}T23:59:59.999Z`);
  return range;
};
