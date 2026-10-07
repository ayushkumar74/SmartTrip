// prisma/seed.js
// Idempotent seed script for SmartTrip Phase 2A master data.
// Safe to run multiple times — all writes use upsert logic.
// Run via: node prisma/seed.js

import { PrismaClient } from '@prisma/client';
import { AIRPORTS_DATA } from './data/airports.js';
import { AIRLINES_DATA, DESTINATIONS_DATA, HOTELS_DATA, PACKAGES_DATA } from './data/masterData.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SmartTrip Phase 2A seed...\n');

  // ── 1. AIRPORTS ──────────────────────────────────────────────────────────
  console.log(`📍 Seeding ${AIRPORTS_DATA.length} airports...`);
  let airportCount = 0;
  for (const airport of AIRPORTS_DATA) {
    await prisma.airport.upsert({
      where: { iataCode: airport.iataCode },
      update: {
        name: airport.name,
        city: airport.city,
        country: airport.country,
        countryCode: airport.countryCode,
        latitude: airport.latitude,
        longitude: airport.longitude,
        elevation: airport.elevation,
        type: airport.type,
        icaoCode: airport.icaoCode,
      },
      create: {
        iataCode: airport.iataCode,
        icaoCode: airport.icaoCode,
        name: airport.name,
        city: airport.city,
        country: airport.country,
        countryCode: airport.countryCode,
        latitude: airport.latitude,
        longitude: airport.longitude,
        elevation: airport.elevation,
        type: airport.type,
      },
    });
    airportCount++;
  }
  console.log(`   ✅ ${airportCount} airports upserted.\n`);

  // ── 2. AIRLINES ───────────────────────────────────────────────────────────
  console.log(`✈️  Seeding ${AIRLINES_DATA.length} airlines...`);
  let airlineCount = 0;
  for (const airline of AIRLINES_DATA) {
    await prisma.airline.upsert({
      where: { iataCode: airline.iataCode },
      update: { name: airline.name, country: airline.country },
      create: {
        iataCode: airline.iataCode,
        icaoCode: airline.icaoCode,
        name: airline.name,
        country: airline.country,
        logoUrl: airline.logoUrl,
      },
    });
    airlineCount++;
  }
  console.log(`   ✅ ${airlineCount} airlines upserted.\n`);

  // ── 3. DESTINATIONS + ATTRACTIONS ─────────────────────────────────────────
  console.log(`🗺️  Seeding ${DESTINATIONS_DATA.length} destinations & attractions...`);
  let destCount = 0;
  let attrCount = 0;
  for (const dest of DESTINATIONS_DATA) {
    const { attractions, ...destData } = dest;

    const created = await prisma.destination.upsert({
      where: { name_country: { name: destData.name, country: destData.country } },
      update: {
        description: destData.description,
        imageUrl: destData.imageUrl,
        region: destData.region,
        bestTime: destData.bestTime,
        budgetINR: destData.budgetINR,
        themes: destData.themes,
        latitude: destData.latitude,
        longitude: destData.longitude,
        countryCode: destData.countryCode,
      },
      create: { ...destData },
    });
    destCount++;

    // Seed attractions for this destination
    if (attractions && attractions.length > 0) {
      for (const attr of attractions) {
        // Find existing attraction by name + destinationId to avoid duplicates
        const existing = await prisma.attraction.findFirst({
          where: { name: attr.name, destinationId: created.id },
        });
        if (!existing) {
          await prisma.attraction.create({
            data: {
              destinationId: created.id,
              name: attr.name,
              category: attr.category,
              description: attr.description || null,
              latitude: attr.latitude || null,
              longitude: attr.longitude || null,
              entryFeeINR: attr.entryFeeINR || null,
              rating: attr.rating || null,
            },
          });
          attrCount++;
        }
      }
    }
  }
  console.log(`   ✅ ${destCount} destinations upserted, ${attrCount} attractions created.\n`);

  // ── 4. HOTELS + ROOMS ────────────────────────────────────────────────────
  console.log(`🏨 Seeding ${HOTELS_DATA.length} hotels & rooms...`);
  let hotelCount = 0;
  let roomCount = 0;
  for (const hotelData of HOTELS_DATA) {
    const { rooms, ...hotel } = hotelData;

    // Upsert hotel by name + city
    let existing = await prisma.hotel.findFirst({
      where: { name: hotel.name, city: hotel.city },
    });

    let hotelRecord;
    if (existing) {
      hotelRecord = await prisma.hotel.update({
        where: { id: existing.id },
        data: {
          starRating: hotel.starRating,
          reviewScore: hotel.reviewScore,
          reviewCount: hotel.reviewCount,
          amenities: hotel.amenities,
          description: hotel.description,
          tag: hotel.tag,
          distanceInfo: hotel.distanceInfo,
          highlight: hotel.highlight,
          imageUrl: hotel.imageUrl,
        },
      });
    } else {
      hotelRecord = await prisma.hotel.create({ data: hotel });
      hotelCount++;
    }

    // Seed rooms for this hotel (skip if already exist)
    if (rooms && rooms.length > 0) {
      for (const room of rooms) {
        const existingRoom = await prisma.room.findFirst({
          where: { hotelId: hotelRecord.id, name: room.name },
        });
        if (!existingRoom) {
          await prisma.room.create({
            data: { hotelId: hotelRecord.id, ...room },
          });
          roomCount++;
        }
      }
    }
  }
  console.log(`   ✅ ${hotelCount} hotels created/updated, ${roomCount} rooms created.\n`);

  // ── 5. HOLIDAY PACKAGES + ITINERARY ────────────────────────────────────
  console.log(`📦 Seeding ${PACKAGES_DATA.length} holiday packages...`);
  let pkgCount = 0;
  let itineraryCount = 0;
  for (const pkgData of PACKAGES_DATA) {
    const { itinerary, ...pkg } = pkgData;

    // Upsert package by name + destination
    let existingPkg = await prisma.holidayPackage.findFirst({
      where: { name: pkg.name, destination: pkg.destination },
    });

    let pkgRecord;
    if (existingPkg) {
      pkgRecord = await prisma.holidayPackage.update({
        where: { id: existingPkg.id },
        data: {
          priceINR: pkg.priceINR,
          description: pkg.description,
          highlights: pkg.highlights,
          inclusions: pkg.inclusions,
          exclusions: pkg.exclusions,
          tag: pkg.tag,
          rating: pkg.rating,
          reviewCount: pkg.reviewCount,
        },
      });
    } else {
      pkgRecord = await prisma.holidayPackage.create({ data: pkg });
      pkgCount++;
    }

    // Seed itinerary days (upsert by packageId + dayNumber)
    if (itinerary && itinerary.length > 0) {
      for (const day of itinerary) {
        await prisma.holidayPackageDay.upsert({
          where: { packageId_dayNumber: { packageId: pkgRecord.id, dayNumber: day.dayNumber } },
          update: { title: day.title, description: day.description, activities: day.activities },
          create: { packageId: pkgRecord.id, ...day },
        });
        itineraryCount++;
      }
    }
  }
  console.log(`   ✅ ${pkgCount} packages created/updated, ${itineraryCount} itinerary days upserted.\n`);

  console.log('🎉 Phase 2A seed complete!');
  console.log('\n📊 Summary:');
  console.log(`   Airports:    ${await prisma.airport.count()}`);
  console.log(`   Airlines:    ${await prisma.airline.count()}`);
  console.log(`   Destinations:${await prisma.destination.count()}`);
  console.log(`   Attractions: ${await prisma.attraction.count()}`);
  console.log(`   Hotels:      ${await prisma.hotel.count()}`);
  console.log(`   Rooms:       ${await prisma.room.count()}`);
  console.log(`   Packages:    ${await prisma.holidayPackage.count()}`);
  console.log(`   Itinerary Days: ${await prisma.holidayPackageDay.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
