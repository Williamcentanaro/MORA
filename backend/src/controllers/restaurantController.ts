import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const getRestaurants = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const restaurants = await prisma.restaurant.findMany({
            where: { status: "APPROVED" },
            select: {
                id: true,
                name: true,
                description: true,
                address: true,
                city: true,
                phone: true,
                latitude: true,
                longitude: true,
                logo: true, // Only use lightweight logo for lists
                status: true,
                cuisineType: true,
                openingHours: true,
                reviews: {
                   select: { rating: true }
                }
            },
            skip,
            take: limit
        });
        
        // Calcola average rating per ogni ristorante
        const formattedRestaurants = restaurants.map((r: any) => {
            const reviewsArr = r.reviews || [];
            const totalReviews = reviewsArr.length;
            const sumRatings = reviewsArr.reduce((acc: number, curr: any) => acc + curr.rating, 0);
            const averageRating = totalReviews > 0 ? (sumRatings / totalReviews) : 0;
            const { reviews, ...rest } = r;
            return {
                ...rest,
                reviewsCount: totalReviews,
                averageRating
            };
        });

        res.json(formattedRestaurants);
    } catch (error) {
        console.error("[GET /api/restaurants] Internal Server Error:", error);
        next(error);
    }
};

export const getRestaurantById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: id as string },
            include: {
                openingHours: true,
                menus: true,
                events: true,
                reviews: {
                    include: {
                        user: { select: { name: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!restaurant) {
            res.status(404).json({ message: "Restaurant not found" });
            return;
        }

        // If not APPROVED, ensure requester is OWNER of this restaurant or ADMIN
        if (restaurant.status !== "APPROVED") {
            let user = null;
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
                const token = authHeader.split(" ")[1];
                try {
                    const decoded = jwt.verify(token as string, JWT_SECRET as string) as any;
                    user = { id: decoded.id || decoded.userId, role: decoded.role };
                } catch (e) {
                    // Ignore token errors here, just treat as unauthenticated
                }
            }

            if (!user || (user.role !== "ADMIN" && user.id !== restaurant.ownerId)) {
                res.status(404).json({ message: "Restaurant not found" });
                return;
            }
        }

        const reviewsArr = restaurant.reviews || [];
        const totalReviews = reviewsArr.length;
        const sumRatings = reviewsArr.reduce((acc: number, curr: any) => acc + curr.rating, 0);
        const averageRating = totalReviews > 0 ? (sumRatings / totalReviews) : 0;
        
        res.json({
            ...restaurant,
            reviewsCount: totalReviews,
            averageRating
        });
    } catch (error) {
        console.error("Error fetching restaurant:", error);
        res.status(500).json({ message: "Error fetching restaurant", error });
    }
};

export const createRestaurant = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { name, description, address, city, phone, logo, coverImage, latitude, longitude, cuisineType } = req.body;
        const ownerId = req.user?.id;

        if (!ownerId) {
            res.status(401).json({ message: "Unauthorized: ownerId missing from token" });
            return;
        }

        if (req.user?.role !== 'OWNER') {
            res.status(403).json({ message: "Access denied: Only owners can create restaurants" });
            return;
        }

        if (!name || !address || !city) {
            res.status(400).json({ message: "name, address, and city are required" });
            return;
        }

        // Extremely simple payload size validation for base64 strings to prevent massive memory spikes
        if (coverImage && coverImage.length > 5 * 1024 * 1024 * 1.34) { // roughly 5MB of binary data in base64
            res.status(400).json({ message: "L'immagine è troppo grande. Massimo 5MB consentiti." });
            return;
        }

        // Robust coordinate parsing
        const latVal = (latitude && latitude !== "") ? parseFloat(latitude) : null;
        const lngVal = (longitude && longitude !== "") ? parseFloat(longitude) : null;

        const restaurant = await prisma.restaurant.create({
            data: {
                name,
                description,
                address,
                city,
                phone,
                latitude: (latVal !== null && !isNaN(latVal)) ? latVal : null,
                longitude: (lngVal !== null && !isNaN(lngVal)) ? lngVal : null,
                logo,
                coverImage,
                ownerId,
                status: "PENDING"
            },
        });

        res.status(201).json(restaurant);
    } catch (error) {
        console.error("Error creating restaurant:", error);
        res.status(500).json({ message: "Error creating restaurant", error: error instanceof Error ? error.message : "Internal Server Error" });
    }
};

export const followRestaurant = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id: restaurantId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const follower = await prisma.follower.create({
            data: {
                userId,
                restaurantId,
            },
        });

        res.status(201).json(follower);
    } catch (error) {
        console.error("Error following restaurant:", error);
        res.status(500).json({ message: "Error following restaurant", error });
    }
};

export const unfollowRestaurant = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id: restaurantId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        await prisma.follower.delete({
            where: {
                userId_restaurantId: {
                    userId,
                    restaurantId,
                },
            },
        });

        res.status(200).json({ message: "Unfollowed successfully" });
    } catch (error) {
        console.error("Error unfollowing restaurant:", error);
        res.status(500).json({ message: "Error unfollowing restaurant", error });
    }
};

export const getFollowStatus = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id: restaurantId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.json({ isFollowing: false });
            return;
        }

        const follower = await prisma.follower.findUnique({
            where: {
                userId_restaurantId: {
                    userId,
                    restaurantId,
                },
            },
        });

        res.json({ isFollowing: !!follower });
    } catch (error) {
        console.error("Error fetching follow status:", error);
        res.status(500).json({ message: "Error fetching follow status", error });
    }
};

export const getFollowedRestaurants = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const followed = await prisma.follower.findMany({
            where: { userId },
            include: {
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                        city: true,
                        coverImage: true,
                        openingHours: true,
                        menus: {
                            where: {
                                type: "DAILY",
                                isActive: true,
                                date: {
                                    gte: today,
                                    lt: tomorrow
                                }
                            },
                            take: 1
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        const restaurants = followed.map(f => ({
            ...f.restaurant,
            hasTodayMenu: f.restaurant.menus.length > 0
        }));
        res.json(restaurants);
    } catch (error) {
        console.error("Error fetching followed restaurants:", error);
        res.status(500).json({ message: "Error fetching followed restaurants", error });
    }
};

export const createMenu = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id: restaurantId } = req.params;
        const { title, description, type, content, price, date } = req.body;

        const menu = await prisma.menu.create({
            data: {
                title,
                description,
                type: type || "REGULAR",
                content,
                price: price ? parseFloat(price) : null,
                date: date ? new Date(date) : null,
                restaurantId,
            },
        });

        res.status(201).json(menu);
    } catch (error) {
        console.error("Error creating menu:", error);
        res.status(500).json({ message: "Error creating menu", error });
    }
};

export const getTodayMenu = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: restaurantId } = req.params;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const menu = await prisma.menu.findFirst({
            where: {
                restaurantId: restaurantId as string,
                type: "DAILY",
                date: {
                    gte: today,
                    lt: tomorrow,
                },
                isActive: true,
            },
        });

        if (!menu) {
            res.status(404).json({ message: "No menu available today" });
            return;
        }

        res.json(menu);
    } catch (error) {
        console.error("Error fetching today's menu:", error);
        res.status(500).json({ message: "Error fetching today's menu", error });
    }
};

export const getRestaurantMenus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: restaurantId } = req.params;
        const menus = await prisma.menu.findMany({
            where: { restaurantId: restaurantId as string },
            orderBy: { createdAt: "desc" },
        });

        res.json(menus);
    } catch (error) {
        console.error("Error fetching menus:", error);
        res.status(500).json({ message: "Error fetching menus", error });
    }
};

export const createOrUpdateRestaurantReview = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id: restaurantId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            res.status(400).json({ message: "Rating must be a number between 1 and 5" });
            return;
        }

        const review = await prisma.review.upsert({
            where: {
                userId_restaurantId: {
                    userId,
                    restaurantId
                }
            },
            update: {
                rating,
                comment
            },
            create: {
                rating,
                comment,
                userId,
                restaurantId
            }
        });

        res.status(200).json(review);
    } catch (error) {
        console.error("Error creating/updating review:", error);
        res.status(500).json({ message: "Error with review", error });
    }
};