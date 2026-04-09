import type { NextFunction } from "express";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
export declare const getMyRestaurants: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getOwnerRestaurant: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateRestaurantInfo: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateRestaurantHours: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateRestaurantMenus: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateRestaurantEvents: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createEvent: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateRestaurantMedia: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=ownerController.d.ts.map