import path from 'path';
const dbPath = path.resolve(__dirname, "../../prisma/dev.db");
console.log('RESOLVED_DB_PATH:', dbPath);

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.count();
  console.log('USER_COUNT:', users);
}
main().catch(console.error).finally(() => prisma.$disconnect());
