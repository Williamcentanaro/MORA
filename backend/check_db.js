"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("./src/config/prisma"));
async function main() {
    try {
        const users = await prisma_1.default.user.findMany();
        console.log('--- USERS ---');
        users.forEach(u => console.log(`${u.email}: ${u.role}`));
        const restaurants = await prisma_1.default.restaurant.findMany();
        console.log('\n--- RESTAURANTS ---');
        restaurants.forEach(r => console.log(`${r.id}: ${r.name} (${r.status})`));
    }
    catch (error) {
        console.error('Error in diagnostic script:', error);
    }
    finally {
        await prisma_1.default.$disconnect();
    }
}
main();
//# sourceMappingURL=check_db.js.map