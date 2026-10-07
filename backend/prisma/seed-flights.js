import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('✈️  Starting Fallback Flight Seed for Phase 2B-1...\n');

  // 1. Ensure Airlines exist
  const ai = await prisma.airline.upsert({
    where: { iataCode: 'AI' },
    update: {},
    create: { iataCode: 'AI', name: 'Air India', country: 'India' }
  });

  const ig = await prisma.airline.upsert({
    where: { iataCode: '6E' },
    update: {},
    create: { iataCode: '6E', name: 'IndiGo', country: 'India' }
  });

  // 2. Clear old flight offers (since this is for dev, we can regenerate)
  await prisma.flightOffer.deleteMany({});

  // We will generate flights for the next 30 days
  const today = new Date();
  const flights = [];

  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);

    const dateStr = d.toISOString().split('T')[0];
    
    // DEL -> BOM (Air India)
    flights.push({
      airlineId: ai.id,
      flightNumber: 'AI-101',
      departureIata: 'DEL',
      arrivalIata: 'BOM',
      departureTime: new Date(`${dateStr}T06:00:00Z`),
      arrivalTime: new Date(`${dateStr}T08:15:00Z`),
      durationMinutes: 135,
      stops: 0,
      cabinClass: 'ECONOMY',
      availableSeats: 45,
      priceINR: 7200.00,
      baggageAllowance: '1 Checked, 1 Carry-on'
    });

    // DEL -> BOM (IndiGo)
    flights.push({
      airlineId: ig.id,
      flightNumber: '6E-452',
      departureIata: 'DEL',
      arrivalIata: 'BOM',
      departureTime: new Date(`${dateStr}T09:30:00Z`),
      arrivalTime: new Date(`${dateStr}T11:40:00Z`),
      durationMinutes: 130,
      stops: 0,
      cabinClass: 'ECONOMY',
      availableSeats: 12,
      priceINR: 5700.00,
      baggageAllowance: '1 Checked, 1 Carry-on'
    });

    // PAT -> BOM (IndiGo)
    flights.push({
      airlineId: ig.id,
      flightNumber: '6E-808',
      departureIata: 'PAT',
      arrivalIata: 'BOM',
      departureTime: new Date(`${dateStr}T14:00:00Z`),
      arrivalTime: new Date(`${dateStr}T16:30:00Z`),
      durationMinutes: 150,
      stops: 0,
      cabinClass: 'ECONOMY',
      availableSeats: 25,
      priceINR: 8400.00,
      baggageAllowance: '1 Checked, 1 Carry-on'
    });

    // PAT -> BOM (Air India)
    flights.push({
      airlineId: ai.id,
      flightNumber: 'AI-303',
      departureIata: 'PAT',
      arrivalIata: 'BOM',
      departureTime: new Date(`${dateStr}T18:15:00Z`),
      arrivalTime: new Date(`${dateStr}T20:50:00Z`),
      durationMinutes: 155,
      stops: 0,
      cabinClass: 'BUSINESS',
      availableSeats: 4,
      priceINR: 21000.00,
      baggageAllowance: '2 Checked, 1 Carry-on'
    });

    // PAT -> IXC (IndiGo) - supported by the airport master data
    flights.push({
      airlineId: ig.id,
      flightNumber: '6E-809',
      departureIata: 'PAT',
      arrivalIata: 'IXC',
      departureTime: new Date(`${dateStr}T10:00:00Z`),
      arrivalTime: new Date(`${dateStr}T12:30:00Z`),
      durationMinutes: 150,
      stops: 0,
      cabinClass: 'ECONOMY',
      availableSeats: 18,
      priceINR: 9300.00,
      baggageAllowance: '1 Checked, 1 Carry-on'
    });
  }

  await prisma.flightOffer.createMany({
    data: flights
  });

  console.log(`✅ Successfully seeded ${flights.length} fallback flights for DEL->BOM, PAT->BOM, and PAT->IXC.`);
}

main()
  .catch((e) => {
    console.error('❌ Fallback Flight Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
