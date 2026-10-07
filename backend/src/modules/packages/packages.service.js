import prisma from '../../config/prisma.js';

export const packageService = {
  withCurrency(packages) {
    return packages.map((pkg) => ({ ...pkg, currency: 'INR' }));
  },

  async listPackages(query = '') {
    const cleanQuery = String(query || '').trim();
    const where = { active: true };
    if (cleanQuery) {
      where.OR = [
        { name: { contains: cleanQuery, mode: 'insensitive' } },
        { destination: { contains: cleanQuery, mode: 'insensitive' } },
        { country: { contains: cleanQuery, mode: 'insensitive' } },
      ];
    }
    const packages = await prisma.holidayPackage.findMany({
      where,
      include: { itinerary: { orderBy: { dayNumber: 'asc' } } },
      orderBy: { rating: 'desc' },
    });
    return this.withCurrency(packages);
  },

  async getPackage(id) {
    const pkg = await prisma.holidayPackage.findFirst({
      where: { id, active: true },
      include: { itinerary: { orderBy: { dayNumber: 'asc' } } },
    });
    return pkg ? { ...pkg, currency: 'INR' } : null;
  },
};