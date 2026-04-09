
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const restaurant = await prisma.restaurant.findFirst({
    include: { menus: true }
  });
  
  if (!restaurant) {
    console.log('No restaurant found');
    return;
  }
  
  console.log(`Restaurant: ${restaurant.id} (${restaurant.name})`);
  console.log('--- MENUS ---');
  restaurant.menus.forEach(m => {
    console.log(`[${m.type}] ${m.title} - Date: ${m.date}`);
  });
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
