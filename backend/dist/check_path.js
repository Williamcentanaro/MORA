"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.resolve(__dirname, "../../prisma/dev.db");
console.log('RESOLVED_DB_PATH:', dbPath);
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const users = await prisma.user.count();
    console.log('USER_COUNT:', users);
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=check_path.js.map