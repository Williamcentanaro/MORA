"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            success: false,
            message: "Validation Error",
            errorCode: "VALIDATION_ERROR",
            details: err.issues
        });
        return;
    }
    // Prisma specific errors could be handled here if needed
    // e.g. err.code === 'P2002' for unique constraint
    const statusCode = err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({
        success: false,
        message,
        errorCode: err.errorCode || "INTERNAL_ERROR"
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map