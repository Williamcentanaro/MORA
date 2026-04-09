const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
  console.log('--- LOGIN DEBUG START ---');
  try {
    const email = 'test@example.com'; // Change if you know a real user email
    console.log(`Searching for user with email: ${email}`);
    const user = await prisma.user.findUnique({ where: { email } });
    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('User ID:', user.id);
    }
  } catch (err) {
    console.error('--- PRISMA ERROR DETECTED ---');
    console.error(err);
    if (err.code) console.log('Prisma Error Code:', err.code);
    if (err.meta) console.log('Prisma Error Meta:', JSON.stringify(err.meta));
  } finally {
    await prisma.$disconnect();
    console.log('--- LOGIN DEBUG END ---');
  }
}

debug();
