import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
export declare const getNotifications: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const markAsRead: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const subscribe: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const unsubscribe: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=notificationController.d.ts.map