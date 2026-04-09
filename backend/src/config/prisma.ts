import { PrismaClient } from '@prisma/client';
import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

// Fix for ESM: Use process.cwd() instead of __dirname
const dbPath = path.resolve(process.cwd(), 'prisma/dev.db');

const adapter = new PrismaBetterSQLite3({
    url: `file:${dbPath}`,
});

const prisma = new PrismaClient({ adapter });

export default prisma;