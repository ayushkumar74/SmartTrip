import prisma from './src/config/prisma.js';
const users = await prisma.user.findMany({ where: { email: { startsWith: 'notify-smoke-' } }, select: { id: true, email: true } });
const ids = users.map((user) => user.id);
if (ids.length) {
  await prisma.booking.deleteMany({ where: { userId: { in: ids } } });
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
}
console.log(`cleaned temporary notification users: ${ids.length}`);
await prisma.$disconnect();
