import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const wishlistService = {
  async getUserWishlists(userId) {
    return await prisma.wishlist.findMany({
      where: { userId },
      include: {
        destination: true,
        hotel: true,
        package: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async addToWishlist(userId, { type, itemId, notes }) {
    const relation = {
      destination: { field: 'destinationId', model: prisma.destination, where: 'userId_destinationId' },
      hotel: { field: 'hotelId', model: prisma.hotel, where: 'userId_hotelId' },
      package: { field: 'packageId', model: prisma.holidayPackage, where: 'userId_packageId' },
    }[type];
    if (!relation) {
      const error = new Error('Invalid wishlist item type');
      error.statusCode = 400;
      throw error;
    }
    if (!itemId) {
      const error = new Error('Wishlist itemId is required');
      error.statusCode = 400;
      throw error;
    }

    const referencedItem = await relation.model.findUnique({ where: { id: itemId }, select: { id: true } });
    if (!referencedItem) {
      const error = new Error('Wishlist item not found');
      error.statusCode = 404;
      throw error;
    }

    return prisma.wishlist.upsert({
      where: { [relation.where]: { userId, [relation.field]: itemId } },
      update: { notes },
      create: { userId, [relation.field]: itemId, notes },
      include: { destination: true, hotel: true, package: true },
    });
  },

  async removeFromWishlist(userId, wishlistId) {
    const result = await prisma.wishlist.deleteMany({
      where: { id: wishlistId, userId },
    });
    if (result.count === 0) {
      const error = new Error('Wishlist item not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }
    return result;
  }
};
