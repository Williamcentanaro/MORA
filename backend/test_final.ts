import prisma from './src/config/prisma.js';

async function test() {
  console.log('--- ADAPTER DEBUG START ---');
  try {
    const user = await prisma.user.findFirst();
    console.log('User query successful. Result:', user ? 'USER_FOUND' : 'NO_USERS');
  } catch (err) {
    console.error('--- ADAPTER ERROR ---');
    console.error(err);
  } finally {
    console.log('--- ADAPTER DEBUG END ---');
    process.exit(0);
  }
}

test();
