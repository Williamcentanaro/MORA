const { PrismaClient } = require('@prisma/client');
console.log('Starting direct Prisma test...');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

async function main() {
    console.log('Invoking count()...');
    const count = await prisma.user.count();
    console.log('User count:', count);
}
main()
  .catch(err => {
    console.error('CRASH DETECTED');
    console.error(err);
  })
  .finally(() => prisma.$disconnect());
