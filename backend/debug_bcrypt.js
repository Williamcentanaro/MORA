const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const users = await prisma.user.findMany();
  console.log('Testing users:');
  for (const user of users) {
    const isMatch = await bcrypt.compare('password', user.password);
    console.log(`- ${user.email} (role: ${user.role}): password 'password' match? ${isMatch}`);
  }
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
