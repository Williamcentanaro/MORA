const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    console.log('Testing Prisma connection (JS)...');
    try {
        const count = await prisma.user.count();
        console.log('User count:', count);
    } catch (e) {
        console.error('Prisma test error:', e);
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
