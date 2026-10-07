import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const searchService = {
  async searchAirports(query) {
    if (!query) {
      // If no query, return some top airports as default
      return await prisma.airport.findMany({
        take: 10,
        orderBy: { type: 'asc' }, // 'large_airport' comes first typically, though sorting by volume is better.
      });
    }

    const q = query.toLowerCase();

    return await prisma.airport.findMany({
      where: {
        OR: [
          { iataCode: { contains: q, mode: 'insensitive' } },
          { icaoCode: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
          { country: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 20,
    });
  },

  async searchDestinations(query) {
    if (!query) {
      return await prisma.destination.findMany({
        include: { attractions: true },
        take: 20,
      });
    }

    const q = query.toLowerCase();

    return await prisma.destination.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { country: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { region: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: { attractions: true },
      take: 20,
    });
  }
};
