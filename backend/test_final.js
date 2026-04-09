"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_js_1 = __importDefault(require("./src/config/prisma.js"));
async function test() {
    console.log('--- ADAPTER DEBUG START ---');
    try {
        const user = await prisma_js_1.default.user.findFirst();
        console.log('User query successful. Result:', user ? 'USER_FOUND' : 'NO_USERS');
    }
    catch (err) {
        console.error('--- ADAPTER ERROR ---');
        console.error(err);
    }
    finally {
        console.log('--- ADAPTER DEBUG END ---');
        process.exit(0);
    }
}
test();
//# sourceMappingURL=test_final.js.map