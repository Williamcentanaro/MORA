"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRestaurantMedia = exports.createEvent = exports.updateRestaurantEvents = exports.updateRestaurantMenus = exports.updateRestaurantHours = exports.updateRestaurantInfo = exports.getOwnerRestaurant = exports.getMyRestaurants = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const pushNotifier_1 = require("../utils/pushNotifier");
const getMyRestaurants = async (req, res, next) => {
    try {
        const ownerId = req.user?.id;
        if (!ownerId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const restaurants = await prisma_1.default.restaurant.findMany({
            where: { ownerId },
            include: {
                _count: {
                    select: {
                        followers: true,
                        events: true
                    }
                },
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
        });
        const ownerRestaurants = restaurants.map((r) => ({
            ...r,
            followerCount: r._count.followers,
            eventCount: r._count.events,
            hasTodayMenu: r.menus.length > 0
        }));
        res.json(ownerRestaurants);
    }
    catch (error) {
        console.error("Error fetching owner restaurants:", error);
        res.status(500).json({ message: "Error fetching restaurants", error });
    }
};
exports.getMyRestaurants = getMyRestaurants;
const getOwnerRestaurant = async (req, res, next) => {
    try {
        const ownerId = req.user?.id;
        const { id } = req.params;
        if (!ownerId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
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
        if (restaurant.ownerId !== ownerId) {
            res.status(403).json({ message: "Access denied" });
            return;
        }
        res.json(restaurant);
    }
    catch (error) {
        console.error("Error fetching restaurant:", error);
        res.status(500).json({ message: "Error fetching restaurant", error });
    }
};
exports.getOwnerRestaurant = getOwnerRestaurant;
const updateRestaurantInfo = async (req, res, next) => {
    try {
        const ownerId = req.user?.id;
        const { id } = req.params;
        const { name, description, address, city, coverImage, cuisineType } = req.body;
        if (!ownerId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const restaurant = await prisma_1.default.restaurant.findUnique({
            where: { id: id }
        });
        if (!restaurant || restaurant.ownerId !== ownerId) {
            res.status(403).json({ message: "Access denied" });
            return;
        }
        const updated = await prisma_1.default.restaurant.update({
            where: { id: id },
            data: {
                name,
                description,
                address,
                city,
                coverImage,
                cuisineType: cuisineType || undefined
            }
        });
        res.json(updated);
    }
    catch (error) {
        console.error("Error updating restaurant:", error);
        res.status(500).json({ message: "Error updating restaurant", error });
    }
};
exports.updateRestaurantInfo = updateRestaurantInfo;
const updateRestaurantHours = async (req, res, next) => {
    try {
        const ownerId = req.user?.id;
        const { id } = req.params;
        const { openingHours } = req.body; // Array of { dayOfWeek, openTime, closeTime }
        if (!ownerId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const restaurant = await prisma_1.default.restaurant.findUnique({
            where: { id: id }
        });
        if (!restaurant || restaurant.ownerId !== ownerId) {
            res.status(403).json({ message: "Access denied" });
            return;
        }
        // Delete existing hours and recreate them (simpler than syncing individual rows)
        await prisma_1.default.openingHour.deleteMany({
            where: { restaurantId: id }
        });
        if (openingHours && Array.isArray(openingHours) && openingHours.length > 0) {
            await prisma_1.default.openingHour.createMany({
                data: openingHours.map((hour) => ({
                    dayOfWeek: hour.dayOfWeek,
                    openTime: hour.openTime,
                    closeTime: hour.closeTime,
                    restaurantId: id
                }))
            });
        }
        const updated = await prisma_1.default.restaurant.findUnique({
            where: { id: id },
            include: { openingHours: true }
        });
        res.json(updated);
    }
    catch (error) {
        console.error("Error updating hours:", error);
        res.status(500).json({ message: "Error updating hours", error });
    }
};
exports.updateRestaurantHours = updateRestaurantHours;
const updateRestaurantMenus = async (req, res, next) => {
    try {
        const ownerId = req.user?.id;
        const { id } = req.params;
        const { menus, menuMode, menuPdf, menuImages } = req.body;
        if (!ownerId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const restaurant = await prisma_1.default.restaurant.findUnique({
            where: { id: id }
        });
        if (!restaurant || restaurant.ownerId !== ownerId) {
            res.status(403).json({ message: "Access denied" });
            return;
        }
        // Update restaurant-level menu settings if provided
        if (menuMode || menuPdf || menuImages) {
            await prisma_1.default.restaurant.update({
                where: { id: id },
                data: {
                    menuMode: menuMode || undefined,
                    menuPdf: menuPdf || undefined,
                    menuImages: menuImages || undefined
                }
            });
        }
        const updateType = req.body.type || "REGULAR";
        let updateDate = null;
        if (req.body.date && typeof req.body.date === "string") {
            const [year, month, day] = req.body.date.split("-").map(Number);
            updateDate = new Date(Date.UTC(year, month - 1, day));
        }
        // 1. Delete existing items of the specific type/date
        if (updateType === "REGULAR") {
            await prisma_1.default.menu.deleteMany({
                where: {
                    restaurantId: id,
                    type: "REGULAR"
                }
            });
        }
        else if (updateType === "DAILY" && updateDate) {
            const nextDay = new Date(updateDate);
            nextDay.setDate(nextDay.getDate() + 1);
            await prisma_1.default.menu.deleteMany({
                where: {
                    restaurantId: id,
                    type: "DAILY",
                    date: {
                        gte: updateDate,
                        lt: nextDay
                    }
                }
            });
        }
        // 2. Create new items
        if (menus && Array.isArray(menus) && menus.length > 0) {
            await prisma_1.default.menu.createMany({
                data: menus.map((menu) => ({
                    title: menu.title,
                    description: menu.description,
                    price: menu.price ? parseFloat(menu.price) : null,
                    type: updateType,
                    date: (updateType === "DAILY" && updateDate) ? updateDate : null,
                    content: menu.content || {},
                    isActive: menu.isActive !== false,
                    restaurantId: id
                }))
            });
        }
        const updated = await prisma_1.default.restaurant.findUnique({
            where: { id: id },
            include: { menus: true }
        });
        // Trigger notifications if this is a DAILY menu for TODAY
        const now = new Date();
        const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        if (updateType === "DAILY" && updateDate && updateDate.getTime() === todayUTC.getTime()) {
            // We don't await this to avoid blocking the response
            notifyFollowersOfDailyMenu(id, updateDate).catch(err => console.error("Async notification error:", err));
        }
        res.json(updated);
    }
    catch (error) {
        console.error("Error updating menus:", error);
        res.status(500).json({ message: "Error updating menus", error });
    }
};
exports.updateRestaurantMenus = updateRestaurantMenus;
const updateRestaurantEvents = async (req, res, next) => {
    try {
        const ownerId = req.user?.id;
        const { id } = req.params;
        const { events } = req.body;
        if (!ownerId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const restaurant = await prisma_1.default.restaurant.findUnique({
            where: { id: id }
        });
        if (!restaurant || restaurant.ownerId !== ownerId) {
            res.status(403).json({ message: "Access denied" });
            return;
        }
        // 1. Fetch existing events from DB
        const existingEvents = await prisma_1.default.event.findMany({
            where: { restaurantId: id }
        });
        const existingIds = new Set(existingEvents.map(e => e.id));
        // 2. Identify categories
        const incomingEvents = events || [];
        // Items in incoming list without a valid existing ID are NEW
        // (Note: frontend generates random IDs for new unsaved items, 
        // we check if that ID exists in OUR database)
        const newEvents = incomingEvents.filter(e => !e.id || !existingIds.has(e.id));
        // Items in incoming list with a valid existing ID are UPDATES
        const eventsToUpdate = incomingEvents.filter(e => e.id && existingIds.has(e.id));
        // IDs in DB not present in incoming list are to be DELETED
        const incomingIds = new Set(incomingEvents.map(e => e.id).filter(Boolean));
        const idsToDelete = existingEvents.filter(e => !incomingIds.has(e.id)).map(e => e.id);
        // 3. Execute DB Operations
        // Delete removals
        if (idsToDelete.length > 0) {
            await prisma_1.default.event.deleteMany({
                where: { id: { in: idsToDelete } }
            });
        }
        // Update existing
        for (const ev of eventsToUpdate) {
            await prisma_1.default.event.update({
                where: { id: ev.id },
                data: {
                    title: ev.title,
                    description: ev.description,
                    date: new Date(ev.date),
                    location: ev.location,
                    image: ev.image
                }
            });
        }
        // Create new
        if (newEvents.length > 0) {
            // We use createMany but we need to notify later
            // To ensure we get IDs back or just to keep logic simple, 
            // we'll loop or use createMany. createMany is fine as we have the titles in the filter.
            await prisma_1.default.event.createMany({
                data: newEvents.map(ev => ({
                    title: ev.title,
                    description: ev.description,
                    date: new Date(ev.date),
                    location: ev.location,
                    image: ev.image,
                    restaurantId: id
                }))
            });
            // 4. Trigger notifications ONLY for new events
            for (const newEvent of newEvents) {
                await notifyFollowersOfNewEvent(id, newEvent.title);
            }
        }
        const updated = await prisma_1.default.restaurant.findUnique({
            where: { id: id },
            include: { events: true }
        });
        res.json(updated);
    }
    catch (error) {
        console.error("Error updating events:", error);
        res.status(500).json({ message: "Error updating events", error });
    }
};
exports.updateRestaurantEvents = updateRestaurantEvents;
const notifyFollowersOfNewEvent = async (restaurantId, eventTitle) => {
    try {
        const restaurant = await prisma_1.default.restaurant.findUnique({
            where: { id: restaurantId },
            select: { name: true }
        });
        if (!restaurant)
            return;
        const followers = await prisma_1.default.follower.findMany({
            where: { restaurantId },
            select: { userId: true }
        });
        if (followers.length === 0)
            return;
        const title = "Nuovo evento";
        const message = `Il ristorante ${restaurant.name} ha pubblicato un nuovo evento: ${eventTitle}`;
        await prisma_1.default.notification.createMany({
            data: followers.map((f) => ({
                userId: f.userId,
                restaurantId,
                type: 'NEW_EVENT',
                title,
                message,
                isRead: false
            }))
        });
        // Trigger Push Notification
        await (0, pushNotifier_1.notifyFollowers)(restaurantId, title, message, `/restaurants/${restaurantId}?tab=events`);
    }
    catch (error) {
        console.error("Error creating notifications:", error);
    }
};
const notifyFollowersOfDailyMenu = async (restaurantId, date) => {
    try {
        const restaurant = await prisma_1.default.restaurant.findUnique({
            where: { id: restaurantId },
            select: { name: true }
        });
        if (!restaurant)
            return;
        const followers = await prisma_1.default.follower.findMany({
            where: { restaurantId },
            select: { userId: true }
        });
        if (followers.length === 0)
            return;
        // Duplicate prevention: check if a notification of type NEW_DAILY_MENU 
        // for this restaurant and date already exists.
        const todayStart = new Date(date);
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart);
        todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);
        const existing = await prisma_1.default.notification.findFirst({
            where: {
                restaurantId,
                type: 'NEW_DAILY_MENU',
                createdAt: {
                    gte: todayStart,
                    lt: todayEnd
                }
            }
        });
        if (existing) {
            console.log(`Notification for daily menu already sent today for restaurant ${restaurantId}`);
            return;
        }
        const title = "Nuovo menu del giorno";
        const message = `${restaurant.name} ha pubblicato il menu di oggi`;
        await prisma_1.default.notification.createMany({
            data: followers.map((f) => ({
                userId: f.userId,
                restaurantId,
                type: 'NEW_DAILY_MENU',
                title,
                message,
                isRead: false
            }))
        });
        // Trigger Push Notification
        await (0, pushNotifier_1.notifyFollowers)(restaurantId, title, message, `/restaurants/${restaurantId}`);
    }
    catch (error) {
        console.error("Error creating daily menu notifications:", error);
    }
};
const createEvent = async (req, res, next) => {
    try {
        const ownerId = req.user?.id;
        const { id } = req.params;
        const { title, description, date, location, image } = req.body;
        if (!ownerId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const restaurant = await prisma_1.default.restaurant.findUnique({
            where: { id: id }
        });
        if (!restaurant || restaurant.ownerId !== ownerId) {
            res.status(403).json({ message: "Access denied" });
            return;
        }
        const event = await prisma_1.default.event.create({
            data: {
                title,
                description,
                date: new Date(date),
                location,
                image,
                restaurantId: id
            }
        });
        // Step 2: Create notifications for followers
        await notifyFollowersOfNewEvent(id, title);
        res.json(event);
    }
    catch (error) {
        next(error);
    }
};
exports.createEvent = createEvent;
const updateRestaurantMedia = async (req, res, next) => {
    try {
        const ownerId = req.user?.id;
        const { id } = req.params;
        const { gallery } = req.body;
        if (!ownerId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const restaurant = await prisma_1.default.restaurant.findUnique({
            where: { id: id }
        });
        if (!restaurant || restaurant.ownerId !== ownerId) {
            res.status(403).json({ message: "Access denied" });
            return;
        }
        const updated = await prisma_1.default.restaurant.update({
            where: { id: id },
            data: { gallery: gallery }
        });
        res.json(updated);
    }
    catch (error) {
        console.error("Error updating media:", error);
        res.status(500).json({ message: "Error updating media", details: error.message });
    }
};
exports.updateRestaurantMedia = updateRestaurantMedia;
//# sourceMappingURL=ownerController.js.map