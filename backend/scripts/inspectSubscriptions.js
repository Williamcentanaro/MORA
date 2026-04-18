
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const subs = await prisma.pushSubscription.findMany({
    include: { user: { select: { email: true } } }
  });
  console.log('--- PUSH SUBSCRIPTIONS ---');
  subs.forEach(s => {
    console.log(`ID: ${s.id}`);
    console.log(`User: ${s.user.email}`);
    console.log(`Endpoint: ${s.endpoint.substring(0, 50)}...`);
    console.log(`Auth length: ${s.auth?.length || 'MISSING'}`);
    console.log(`P256dh length: ${s.p256dh?.length || 'MISSING'}`);
    console.log('--------------------------');
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
