import type { Request, Response, NextFunction } from "express";
export declare const getRestaurants: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getRestaurantById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createRestaurant: (req: any, res: Response, next: NextFunction) => Promise<void>;
export declare const followRestaurant: (req: any, res: Response, next: NextFunction) => Promise<void>;
export declare const unfollowRestaurant: (req: any, res: Response, next: NextFunction) => Promise<void>;
export declare const getFollowStatus: (req: any, res: Response, next: NextFunction) => Promise<void>;
export declare const getFollowedRestaurants: (req: any, res: Response, next: NextFunction) => Promise<void>;
export declare const createMenu: (req: any, res: Response, next: NextFunction) => Promise<void>;
export declare const getTodayMenu: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getRestaurantMenus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createOrUpdateRestaurantReview: (req: any, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=restaurantController.d.ts.map