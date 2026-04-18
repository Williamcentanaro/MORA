import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    console.error('Error:', err);

    if (err instanceof ZodError) {
        res.status(400).json({
            success: false,
            message: "Validation Error",
            errorCode: "VALIDATION_ERROR",
            details: err.issues
        });
        return;
    }

    // Prisma specific errors
    if (err.code === 'P2025') {
        res.status(404).json({
            success: false,
            message: "Resource not found",
            errorCode: "NOT_FOUND"
        });
        return;
    }

    const statusCode = err.status || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message,
        errorCode: err.errorCode || "INTERNAL_ERROR"
    });
};
