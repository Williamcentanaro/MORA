import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteUser(email: string, role: 'USER' | 'OWNER' | 'ADMIN') {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`User with email ${email} not found.`);
      return;
    }

    await prisma.user.update({
      where: { email },
      data: { role },
    });

    console.log(`User ${email} promoted successfully to ${role}.`);
  } catch (error) {
    console.error('Error promoting user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: npx ts-node scripts/promote.ts <email> <role>');
  process.exit(1);
}

promoteUser(args[0] as string, args[1] as any);
