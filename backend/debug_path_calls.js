const path = require('path');
const originalResolve = path.resolve;
path.resolve = function(...args) {
    console.log('path.resolve:', JSON.stringify(args));
    return originalResolve.apply(this, args);
};

console.log('--- DEBUG START ---');
try {
    const { PrismaClient } = require('@prisma/client');
    console.log('PrismaClient class loaded');
    const prisma = new PrismaClient();
    console.log('PrismaClient instantiated successfully');
} catch (err) {
    console.error('--- CRASH DETECTED ---');
    console.error(err);
}
console.log('--- DEBUG END ---');
