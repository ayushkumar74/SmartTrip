import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('✈️  Starting Non-Destructive Flight Append for UX Pass...\n');

  // Ensure Airlines exist (IndiGo & Air India)
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

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start at midnight UTC
  const flightsToUpsert = [];

  for (let i = 0; i < 30; i++) { // Next 30 days
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    
    // DEL -> BOM (Morning AI)
    flightsToUpsert.push({
      airlineId: ai.id,
      flightNumber: 'AI-100',
      departureIata: 'DEL',
      arrivalIata: 'BOM',
      departureTime: new Date(`${dateStr}T06:00:00Z`),
      arrivalTime: new Date(`${dateStr}T08:15:00Z`),
      durationMinutes: 135,
      stops: 0,
      cabinClass: 'ECONOMY',
      availableSeats: 45,
      priceINR: 5200.00,
      baggageAllowance: '1 Checked, 1 Carry-on'
    });

    // DEL -> BOM (Morning IG)
    flightsToUpsert.push({
      airlineId: ig.id,
      flightNumber: '6E-450',
      departureIata: 'DEL',
      arrivalIata: 'BOM',
      departureTime: new Date(`${dateStr}T09:30:00Z`),
      arrivalTime: new Date(`${dateStr}T11:40:00Z`),
      durationMinutes: 130,
      stops: 0,
      cabinClass: 'ECONOMY',
      availableSeats: 12,
      priceINR: 4700.00,
      baggageAllowance: '1 Checked, 1 Carry-on'
    });

    // DEL -> BOM (Afternoon AI)
    flightsToUpsert.push({
      airlineId: ai.id,
      flightNumber: 'AI-320',
      departureIata: 'DEL',
      arrivalIata: 'BOM',
      departureTime: new Date(`${dateStr}T14:15:00Z`),
      arrivalTime: new Date(`${dateStr}T16:30:00Z`),
      durationMinutes: 135,
      stops: 0,
      cabinClass: 'ECONOMY',
      availableSeats: 60,
      priceINR: 5500.00,
      baggageAllowance: '1 Checked, 1 Carry-on'
    });

    // DEL -> BOM (Evening IG 1-stop)
    flightsToUpsert.push({
      airlineId: ig.id,
      flightNumber: '6E-720',
      departureIata: 'DEL',
      arrivalIata: 'BOM',
      departureTime: new Date(`${dateStr}T18:00:00Z`),
      arrivalTime: new Date(`${dateStr}T22:30:00Z`),
      durationMinutes: 270,
      stops: 1,
      cabinClass: 'ECONOMY',
      availableSeats: 10,
      priceINR: 4100.00,
      baggageAllowance: '1 Checked, 1 Carry-on'
    });

    // PAT -> BOM (Morning IG)
    flightsToUpsert.push({
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

    // PAT -> BOM (Evening AI)
    flightsToUpsert.push({
      airlineId: ai.id,
      flightNumber: 'AI-303',
      departureIata: 'PAT',
      arrivalIata: 'BOM',
      departureTime: new Date(`${dateStr}T18:15:00Z`),
      arrivalTime: new Date(`${dateStr}T20:50:00Z`),
      durationMinutes: 155,
      stops: 0,
      cabinClass: 'ECONOMY',
      availableSeats: 42,
      priceINR: 9100.00,
      baggageAllowance: '2 Checked, 1 Carry-on'
    });

    // IXC -> BOM (Morning IG)
    flightsToUpsert.push({
      airlineId: ig.id, flightNumber: '6E-555',
      departureIata: 'IXC', arrivalIata: 'BOM',
      departureTime: new Date(`${dateStr}T08:00:00Z`), arrivalTime: new Date(`${dateStr}T10:30:00Z`),
      durationMinutes: 150, stops: 0, cabinClass: 'ECONOMY', availableSeats: 30, priceINR: 7800.00, baggageAllowance: '1 Checked, 1 Carry-on'
    });
    
    // IXC -> BOM (Afternoon AI 1-stop)
    flightsToUpsert.push({
      airlineId: ai.id, flightNumber: 'AI-444',
      departureIata: 'IXC', arrivalIata: 'BOM',
      departureTime: new Date(`${dateStr}T13:00:00Z`), arrivalTime: new Date(`${dateStr}T18:00:00Z`),
      durationMinutes: 300, stops: 1, cabinClass: 'ECONOMY', availableSeats: 15, priceINR: 6500.00, baggageAllowance: '1 Checked, 1 Carry-on'
    });

    // Additional 6 flights for IXC -> BOM
    flightsToUpsert.push({
      airlineId: ig.id, flightNumber: '6E-556',
      departureIata: 'IXC', arrivalIata: 'BOM',
      departureTime: new Date(`${dateStr}T09:15:00Z`), arrivalTime: new Date(`${dateStr}T11:45:00Z`),
      durationMinutes: 150, stops: 0, cabinClass: 'ECONOMY', availableSeats: 40, priceINR: 8100.00, baggageAllowance: '1 Checked, 1 Carry-on'
    });
    flightsToUpsert.push({
      airlineId: ai.id, flightNumber: 'AI-445',
      departureIata: 'IXC', arrivalIata: 'BOM',
      departureTime: new Date(`${dateStr}T10:30:00Z`), arrivalTime: new Date(`${dateStr}T13:10:00Z`),
      durationMinutes: 160, stops: 0, cabinClass: 'ECONOMY', availableSeats: 50, priceINR: 8500.00, baggageAllowance: '1 Checked, 1 Carry-on'
    });
    flightsToUpsert.push({
      airlineId: ig.id, flightNumber: '6E-557',
      departureIata: 'IXC', arrivalIata: 'BOM',
      departureTime: new Date(`${dateStr}T15:00:00Z`), arrivalTime: new Date(`${dateStr}T17:30:00Z`),
      durationMinutes: 150, stops: 0, cabinClass: 'ECONOMY', availableSeats: 25, priceINR: 7200.00, baggageAllowance: '1 Checked, 1 Carry-on'
    });
    flightsToUpsert.push({
      airlineId: ai.id, flightNumber: 'AI-446',
      departureIata: 'IXC', arrivalIata: 'BOM',
      departureTime: new Date(`${dateStr}T16:45:00Z`), arrivalTime: new Date(`${dateStr}T19:30:00Z`),
      durationMinutes: 165, stops: 0, cabinClass: 'ECONOMY', availableSeats: 35, priceINR: 7900.00, baggageAllowance: '1 Checked, 1 Carry-on'
    });
    flightsToUpsert.push({
      airlineId: ig.id, flightNumber: '6E-558',
      departureIata: 'IXC', arrivalIata: 'BOM',
      departureTime: new Date(`${dateStr}T19:20:00Z`), arrivalTime: new Date(`${dateStr}T21:50:00Z`),
      durationMinutes: 150, stops: 0, cabinClass: 'ECONOMY', availableSeats: 10, priceINR: 6900.00, baggageAllowance: '1 Checked, 1 Carry-on'
    });
    flightsToUpsert.push({
      airlineId: ai.id, flightNumber: 'AI-447',
      departureIata: 'IXC', arrivalIata: 'BOM',
      departureTime: new Date(`${dateStr}T21:00:00Z`), arrivalTime: new Date(`${dateStr}T23:45:00Z`),
      durationMinutes: 165, stops: 0, cabinClass: 'ECONOMY', availableSeats: 20, priceINR: 6100.00, baggageAllowance: '1 Checked, 1 Carry-on'
    });
  }

  let appendedCount = 0;
  for (const offer of flightsToUpsert) {
    // Check if this exact flight exists to make it idempotent
    const existing = await prisma.flightOffer.findFirst({
      where: {
        flightNumber: offer.flightNumber,
        departureTime: offer.departureTime,
        departureIata: offer.departureIata,
        arrivalIata: offer.arrivalIata
      }
    });

    if (!existing) {
      await prisma.flightOffer.create({ data: offer });
      appendedCount++;
    }
  }

  console.log(`✅ Successfully appended ${appendedCount} demo flights.`);
}

main()
  .catch((e) => {
    console.error('❌ Append Flight Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
