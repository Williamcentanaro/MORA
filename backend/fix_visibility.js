const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.restaurant.updateMany({
      where: { status: 'PENDING' },
      data: { status: 'APPROVED' }
    });
    console.log(`Updated ${result.count} restaurants to APPROVED.`);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
