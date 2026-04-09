import type { NextFunction } from "express";
import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
export declare const submitRequest: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getMyRequest: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=ownerRequestController.d.ts.map