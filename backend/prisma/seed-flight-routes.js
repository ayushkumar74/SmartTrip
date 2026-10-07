import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const airline = await prisma.airline.upsert({
    where: { iataCode: '6E' },
    update: {},
    create: { iataCode: '6E', name: 'IndiGo', country: 'India' },
  });

  const today = new Date();
  let created = 0;

  for (let offset = 0; offset < 90; offset += 1) {
    const departureDate = new Date(today);
    departureDate.setDate(departureDate.getDate() + offset);
    const date = departureDate.toISOString().split('T')[0];
    const departureTime = new Date(`${date}T10:00:00Z`);

    const existing = await prisma.flightOffer.findFirst({
      where: {
        flightNumber: '6E-809',
        departureIata: 'PAT',
        arrivalIata: 'IXC',
        departureTime,
      },
    });

    if (!existing) {
      await prisma.flightOffer.create({
        data: {
          airlineId: airline.id,
          flightNumber: '6E-809',
          departureIata: 'PAT',
          arrivalIata: 'IXC',
          departureTime,
          arrivalTime: new Date(`${date}T12:30:00Z`),
          durationMinutes: 150,
          stops: 0,
          cabinClass: 'ECONOMY',
          availableSeats: 18,
          priceINR: 9300.00,
          baggageAllowance: '1 Checked, 1 Carry-on',
        },
      });
      created += 1;
    }
  }

  console.log(`PAT -> IXC route inventory ready (${created} offers created).`);
}

main()
  .catch((error) => {
    console.error('PAT -> IXC route seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });