import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const logPath = path.resolve(process.cwd(), 'prisma-debug.log');
const log = (msg: string) => {
    const entry = `${new Date().toISOString()} - ${msg}\n`;
    console.log(`[PRISMA-DEBUG] ${msg}`);
    try {
        fs.appendFileSync(logPath, entry);
    } catch (e) {}
};

log("Initializing Prisma Client...");

const prisma = new PrismaClient();

prisma.$connect()
    .then(() => log("Successfully connected to database"))
    .catch((err) => log(`Connection error: ${err.stack || err.message}`));

export default prisma;