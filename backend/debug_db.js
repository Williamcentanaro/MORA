const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true }
  });
  console.log('USERS:', JSON.stringify(users, null, 2));
  
  const restaurants = await prisma.restaurant.findMany({
    where: { status: 'APPROVED' },
    select: { id: true, name: true }
  });
  console.log('APPROVED_RESTAURANTS:', JSON.stringify(restaurants, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
