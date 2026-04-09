"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRestaurantMenus = exports.getTodayMenu = exports.createMenu = exports.getFollowedRestaurants = exports.getFollowStatus = exports.unfollowRestaurant = exports.followRestaurant = exports.createRestaurant = exports.getRestaurantById = exports.getRestaurants = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const getRestaurants = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const restaurants = await prisma_1.default.restaurant.findMany({
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
                coverImage: true,
                status: true,
                openingHours: true
            },
            skip,
            take: limit
        });
        res.json(restaurants);
    }
    catch (error) {
        next(error);
    }
};
exports.getRestaurants = getRestaurants;
const getRestaurantById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const restaurant = await prisma_1.default.restaurant.findUnique({
            where: { id: id },
            include: {
                openingHours: true,
                menus: true,
                events: true
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
                    const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                    user = { id: decoded.id || decoded.userId, role: decoded.role };
                }
                catch (e) {
                    // Ignore token errors here, just treat as unauthenticated
                }
            }
            if (!user || (user.role !== "ADMIN" && user.id !== restaurant.ownerId)) {
                res.status(404).json({ message: "Restaurant not found" });
                return;
            }
        }
        res.json(restaurant);
    }
    catch (error) {
        console.error("Error fetching restaurant:", error);
        res.status(500).json({ message: "Error fetching restaurant", error });
    }
};
exports.getRestaurantById = getRestaurantById;
const createRestaurant = async (req, res, next) => {
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
        const restaurant = await prisma_1.default.restaurant.create({
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
    }
    catch (error) {
        console.error("Error creating restaurant:", error);
        res.status(500).json({ message: "Error creating restaurant", error: error instanceof Error ? error.message : "Internal Server Error" });
    }
};
exports.createRestaurant = createRestaurant;
const followRestaurant = async (req, res, next) => {
    try {
        const { id: restaurantId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const follower = await prisma_1.default.follower.create({
            data: {
                userId,
                restaurantId,
            },
        });
        res.status(201).json(follower);
    }
    catch (error) {
        console.error("Error following restaurant:", error);
        res.status(500).json({ message: "Error following restaurant", error });
    }
};
exports.followRestaurant = followRestaurant;
const unfollowRestaurant = async (req, res, next) => {
    try {
        const { id: restaurantId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        await prisma_1.default.follower.delete({
            where: {
                userId_restaurantId: {
                    userId,
                    restaurantId,
                },
            },
        });
        res.status(200).json({ message: "Unfollowed successfully" });
    }
    catch (error) {
        console.error("Error unfollowing restaurant:", error);
        res.status(500).json({ message: "Error unfollowing restaurant", error });
    }
};
exports.unfollowRestaurant = unfollowRestaurant;
const getFollowStatus = async (req, res, next) => {
    try {
        const { id: restaurantId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            res.json({ isFollowing: false });
            return;
        }
        const follower = await prisma_1.default.follower.findUnique({
            where: {
                userId_restaurantId: {
                    userId,
                    restaurantId,
                },
            },
        });
        res.json({ isFollowing: !!follower });
    }
    catch (error) {
        console.error("Error fetching follow status:", error);
        res.status(500).json({ message: "Error fetching follow status", error });
    }
};
exports.getFollowStatus = getFollowStatus;
const getFollowedRestaurants = async (req, res, next) => {
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
        const followed = await prisma_1.default.follower.findMany({
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
    }
    catch (error) {
        console.error("Error fetching followed restaurants:", error);
        res.status(500).json({ message: "Error fetching followed restaurants", error });
    }
};
exports.getFollowedRestaurants = getFollowedRestaurants;
const createMenu = async (req, res, next) => {
    try {
        const { id: restaurantId } = req.params;
        const { title, description, type, content, price, date } = req.body;
        const menu = await prisma_1.default.menu.create({
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
    }
    catch (error) {
        console.error("Error creating menu:", error);
        res.status(500).json({ message: "Error creating menu", error });
    }
};
exports.createMenu = createMenu;
const getTodayMenu = async (req, res, next) => {
    try {
        const { id: restaurantId } = req.params;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const menu = await prisma_1.default.menu.findFirst({
            where: {
                restaurantId: restaurantId,
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
    }
    catch (error) {
        console.error("Error fetching today's menu:", error);
        res.status(500).json({ message: "Error fetching today's menu", error });
    }
};
exports.getTodayMenu = getTodayMenu;
const getRestaurantMenus = async (req, res, next) => {
    try {
        const { id: restaurantId } = req.params;
        const menus = await prisma_1.default.menu.findMany({
            where: { restaurantId: restaurantId },
            orderBy: { createdAt: "desc" },
        });
        res.json(menus);
    }
    catch (error) {
        console.error("Error fetching menus:", error);
        res.status(500).json({ message: "Error fetching menus", error });
    }
};
exports.getRestaurantMenus = getRestaurantMenus;
//# sourceMappingURL=restaurantController.js.map