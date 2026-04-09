import type { NextFunction } from "express";
import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
export declare const getPendingRestaurants: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const approveRestaurant: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const rejectRestaurant: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getPendingOwnerRequests: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const approveOwnerRequest: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const rejectOwnerRequest: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getStats: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=adminController.d.ts.map