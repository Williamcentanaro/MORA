"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("./src/config/prisma"));
async function main() {
    const hashedPassword = await bcryptjs_1.default.hash('password', 10);
    try {
        const user = await prisma_1.default.user.update({
            where: { email: 'owner@test.com' },
            data: { password: hashedPassword }
        });
        console.log('RESET_SUCCESS: owner@test.com password updated.');
    }
    catch (e) {
        console.log('Owner user not found, creating one...');
        await prisma_1.default.user.create({
            data: {
                email: 'owner@test.com',
                password: hashedPassword,
                name: 'Owner User',
                role: 'OWNER'
            }
        });
        console.log('CREATE_SUCCESS: owner@test.com created with role OWNER.');
    }
}
main()
    .catch(console.error)
    .finally(() => prisma_1.default.$disconnect());
//# sourceMappingURL=reset_owner.js.map