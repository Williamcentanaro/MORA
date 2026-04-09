"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
const path_1 = __importDefault(require("path"));
// Fix for ESM: Use process.cwd() instead of __dirname
const dbPath = path_1.default.resolve(process.cwd(), 'prisma/dev.db');
const adapter = new adapter_better_sqlite3_1.PrismaBetterSQLite3({
    url: `file:${dbPath}`,
});
const prisma = new client_1.PrismaClient({ adapter });
exports.default = prisma;
//# sourceMappingURL=prisma.js.map