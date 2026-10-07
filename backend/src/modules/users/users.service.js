import prisma from '../../config/prisma.js';

const preferenceData = (data = {}) => {
  const allowed = {};
  if (data.travelStyles !== undefined) {
    if (!Array.isArray(data.travelStyles) || data.travelStyles.some((style) => typeof style !== 'string' || !style.trim())) {
      throw new Error('travelStyles must be an array of non-empty strings');
    }
    allowed.travelStyles = [...new Set(data.travelStyles.map((style) => style.trim()))].slice(0, 20);
  }
  if (data.budgetLevel !== undefined) {
    if (data.budgetLevel !== null && (typeof data.budgetLevel !== 'string' || !data.budgetLevel.trim())) {
      throw new Error('budgetLevel must be a non-empty string or null');
    }
    allowed.budgetLevel = data.budgetLevel?.trim() || null;
  }
  const booleanPreferenceKeys = ['bookingNotifications', 'paymentNotifications', 'tripNotifications'];
  for (const key of booleanPreferenceKeys) {
    if (data[key] !== undefined) {
      if (typeof data[key] !== 'boolean') {
        throw new Error(`${key} must be a boolean`);
      }
      allowed[key] = data[key];
    }
  }
  return allowed;
};

export const userService = {
  async getPreferences(userId) {
    return prisma.userPreference.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        travelStyles: [],
        bookingNotifications: true,
        paymentNotifications: true,
        tripNotifications: true,
      },
    });
  },

  async updatePreferences(userId, data) {
    const update = preferenceData(data);
    if (Object.keys(update).length === 0) throw new Error('No supported preference fields provided');
    return prisma.userPreference.upsert({
      where: { userId },
      update,
      create: {
        userId,
        travelStyles: [],
        bookingNotifications: true,
        paymentNotifications: true,
        tripNotifications: true,
        ...update,
      },
    });
  },

  async updateProfile(userId, data) {
    const { name, phone } = data;
    const updateData = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) throw new Error('Name must be a valid string');
      updateData.name = name.trim();
    }
    if (phone !== undefined) {
      if (phone !== null && typeof phone !== 'string') throw new Error('Phone must be a valid string or null');
      updateData.phone = phone === null ? null : phone.trim();
    }
    
    if (Object.keys(updateData).length === 0) throw new Error('No supported profile fields provided');

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        googleId: true,
        createdAt: true,
      }
    });
  },

  async recordSearch(userId, searchType, params) {
    const query = JSON.stringify(params);
    const recent = await prisma.searchHistory.findFirst({
      where: { userId, searchType, query, createdAt: { gte: new Date(Date.now() - 30_000) } },
    });
    if (recent) return recent;
    return prisma.searchHistory.create({ data: { userId, searchType, query } });
  },

  async getSearchHistory(userId) {
    return prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },
};

export { preferenceData };
