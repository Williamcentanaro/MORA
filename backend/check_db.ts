
import prisma from './src/config/prisma';

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('--- USERS ---');
    users.forEach(u => console.log(`${u.email}: ${u.role}`));

    const restaurants = await prisma.restaurant.findMany();
    console.log('\n--- RESTAURANTS ---');
    restaurants.forEach(r => console.log(`${r.id}: ${r.name} (${r.status})`));
  } catch (error) {
    console.error('Error in diagnostic script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
