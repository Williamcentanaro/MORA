import bcrypt from 'bcryptjs';
import prisma from './src/config/prisma';

async function main() {
  const hashedPassword = await bcrypt.hash('password', 10);
  try {
    const user = await prisma.user.update({
      where: { email: 'owner@test.com' },
      data: { password: hashedPassword }
    });
    console.log('RESET_SUCCESS: owner@test.com password updated.');
  } catch (e) {
    console.log('Owner user not found, creating one...');
    await prisma.user.create({
      data: {
        email: 'owner@test.com',
        password: hashedPassword,
        name: 'Owner User',
        role: 'OWNER'
      }
    });
    console.log('CREATE_SUCCESS: owner@test.com created with role OWNER.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
