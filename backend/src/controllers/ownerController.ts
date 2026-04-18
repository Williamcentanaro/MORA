import type { NextFunction, Response } from "express";
import prisma from "../config/prisma";
import type { AuthRequest } from "../middleware/auth";
import { notifyFollowers } from "../utils/pushNotifier";
import { flattenMenus } from "../utils/menuMapper";

export const getMyRestaurants = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

        const restaurants = await prisma.restaurant.findMany({
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
                    include: { items: true },
                    take: 1
                }
            }
        });

        const ownerRestaurants = restaurants.map((r: any) => ({
            ...r,
            followerCount: r._count.followers,
            eventCount: r._count.events,
            menus: flattenMenus(r.menus),
            hasTodayMenu: r.menus.length > 0
        }));

        res.json(ownerRestaurants);
    } catch (error) {
        console.error("Error fetching owner restaurants:", error);
        res.status(500).json({ message: "Error fetching restaurants", error });
    }
};

export const getOwnerRestaurant = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const ownerId = req.user?.id;
        const { id } = req.params;

        if (!ownerId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: id as string },
            include: {
                openingHours: true,
                menus: { include: { items: true } },
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

        res.json({
            ...restaurant,
            menus: flattenMenus(restaurant.menus)
        });
    } catch (error) {
        console.error("Error fetching restaurant:", error);
        res.status(500).json({ message: "Error fetching restaurant", error });
    }
};

export const updateRestaurantInfo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const ownerId = req.user?.id;
        const { id } = req.params;
        const { name, description, address, city, coverImage, cuisineType, latitude, longitude, gallery } = req.body;

        if (!ownerId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: id as string }
        });

        if (!restaurant || restaurant.ownerId !== ownerId) {
            res.status(403).json({ message: "Access denied" });
            return;
        }

        // Parse coordinates as Float if present and not empty
        const latVal = (latitude !== undefined && latitude !== "") ? parseFloat(latitude as string) : undefined;
        const lngVal = (longitude !== undefined && longitude !== "") ? parseFloat(longitude as string) : undefined;

        const updated = await prisma.restaurant.update({
            where: { id: id as string },
            data: {
                name,
                description,
                address,
                city,
                coverImage,
                gallery: gallery || undefined,
                cuisineType: cuisineType || undefined,
                latitude: (latVal !== undefined && !isNaN(latVal as number)) ? latVal : undefined,
                longitude: (lngVal !== undefined && !isNaN(lngVal as number)) ? lngVal : undefined
            }
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating restaurant:", error);
        res.status(500).json({ message: "Error updating restaurant", error });
    }
};

export const updateRestaurantHours = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const ownerId = req.user?.id;
        const { id } = req.params;
        const { openingHours } = req.body; // Array of { dayOfWeek, openTime, closeTime }

        if (!ownerId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: id as string }
        });

        if (!restaurant || restaurant.ownerId !== ownerId) {
            res.status(403).json({ message: "Access denied" });
            return;
        }

        // Delete existing hours and recreate them (simpler than syncing individual rows)
        await prisma.openingHour.deleteMany({
            where: { restaurantId: id as string }
        });

        if (openingHours && Array.isArray(openingHours) && openingHours.length > 0) {
            await prisma.openingHour.createMany({
                data: openingHours.map((hour: any) => ({
                    dayOfWeek: hour.dayOfWeek,
                    openTime: hour.openTime,
                    closeTime: hour.closeTime,
                    restaurantId: id as string
                }))
            });
        }

        const updated = await prisma.restaurant.findUnique({
            where: { id: id as string },
            include: { openingHours: true }
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating hours:", error);
        res.status(500).json({ message: "Error updating hours", error });
    }
};

export const updateRestaurantMenus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const ownerId = req.user?.id;
        const { id } = req.params;
        const { menus, menuMode, menuPdf, menuImages } = req.body;

        if (!ownerId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: id as string }
        });

        if (!restaurant || restaurant.ownerId !== ownerId) {
            res.status(403).json({ message: "Access denied" });
            return;
        }

        // Update restaurant-level menu settings if provided
        if (menuMode || menuPdf || menuImages) {
            await prisma.restaurant.update({
                where: { id: id as string },
                data: {
                    menuMode: menuMode || undefined,
                    menuPdf: menuPdf || undefined,
                    menuImages: menuImages || undefined
                }
            });
        }

        const updateType = req.body.type || "REGULAR";
        let updateDate: Date | null = null;
        
        if (req.body.date && typeof req.body.date === "string") {
            const [year, month, day] = req.body.date.split("-").map(Number);
            updateDate = new Date(Date.UTC(year, month - 1, day));
        }

        // 1. Delete existing items of the specific type/date
        if (updateType === "REGULAR") {
            await prisma.menu.deleteMany({
                where: { 
                    restaurantId: id as string,
                    type: "REGULAR"
                }
            });
        } else if (updateType === "DAILY" && updateDate) {
            const nextDay = new Date(updateDate);
            nextDay.setDate(nextDay.getDate() + 1);

            await prisma.menu.deleteMany({
                where: {
                    restaurantId: id as string,
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
            // Create a single "Parent" menu record for this batch
            const menuParent = await prisma.menu.create({
                data: {
                    title: updateType === "REGULAR" ? "Menu Principale" : "Specialità del Giorno",
                    description: updateType === "REGULAR" ? "I nostri piatti classici" : "Selezione giornaliera dello chef",
                    type: updateType,
                    date: (updateType === "DAILY" && updateDate) ? updateDate : null,
                    content: {}, // Legacy field, keeping empty for now
                    isActive: true,
                    restaurantId: id as string,
                    items: {
                        create: menus.map((m: any) => ({
                            name: m.title,
                            description: m.description,
                            price: m.price ? parseFloat(m.price) : null,
                            category: m.category,
                            currency: "EUR",
                            availability: true
                        }))
                    }
                }
            });
        }

        const updated = await prisma.restaurant.findUnique({
            where: { id: id as string },
            include: { menus: true }
        });

        // Trigger notifications if this is a DAILY menu for TODAY
        const now = new Date();
        const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        
        if (updateType === "DAILY" && updateDate && updateDate.getTime() === todayUTC.getTime()) {
            // We don't await this to avoid blocking the response
            notifyFollowersOfDailyMenu(id as string, updateDate).catch(err => 
                console.error("Async notification error:", err)
            );
        }

        res.json(updated);
    } catch (error) {
        console.error("Error updating menus:", error);
        res.status(500).json({ message: "Error updating menus", error });
    }
};

export const updateRestaurantEvents = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const ownerId = req.user?.id;
        const { id } = req.params;
        const { events } = req.body as { events: any[] };

        if (!ownerId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: id as string }
        });

        if (!restaurant || restaurant.ownerId !== ownerId) {
            res.status(403).json({ message: "Access denied" });
            return;
        }

        // 1. Fetch existing events from DB
        const existingEvents = await prisma.event.findMany({
            where: { restaurantId: id as string }
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
            await prisma.event.deleteMany({
                where: { id: { in: idsToDelete } }
            });
        }

        // Update existing
        for (const ev of eventsToUpdate) {
            await prisma.event.update({
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
            await prisma.event.createMany({
                data: newEvents.map(ev => ({
                    title: ev.title,
                    description: ev.description,
                    date: new Date(ev.date),
                    location: ev.location,
                    image: ev.image,
                    restaurantId: id as string
                }))
            });

            // 4. Trigger notifications ONLY for new events
            for (const newEvent of newEvents) {
                await notifyFollowersOfNewEvent(id as string, newEvent.title);
            }
        }

        const updated = await prisma.restaurant.findUnique({
            where: { id: id as string },
            include: { events: true }
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating events:", error);
        res.status(500).json({ message: "Error updating events", error });
    }
};

const notifyFollowersOfNewEvent = async (restaurantId: string, eventTitle: string) => {
    try {
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: { name: true }
        });

        if (!restaurant) return;

        const followers = await prisma.follower.findMany({
            where: { restaurantId },
            select: { userId: true }
        });

        if (followers.length === 0) return;

        const title = "Nuovo evento";
        const message = `Il ristorante ${restaurant.name} ha pubblicato un nuovo evento: ${eventTitle}`;

        await prisma.notification.createMany({
            data: followers.map((f: any) => ({
                userId: f.userId,
                restaurantId,
                type: 'NEW_EVENT',
                title,
                message,
                isRead: false
            }))
        });

        // Trigger Push Notification
        await notifyFollowers(
            restaurantId, 
            title, 
            message, 
            `/restaurants/${restaurantId}?tab=events`
        );
    } catch (error) {
        console.error("Error creating notifications:", error);
    }
};

const notifyFollowersOfDailyMenu = async (restaurantId: string, date: Date) => {
    try {
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: { name: true }
        });

        if (!restaurant) return;

        const followers = await prisma.follower.findMany({
            where: { restaurantId },
            select: { userId: true }
        });

        if (followers.length === 0) return;

        // Duplicate prevention: check if a notification of type NEW_DAILY_MENU 
        // for this restaurant and date already exists.
        const todayStart = new Date(date);
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart);
        todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

        const existing = await prisma.notification.findFirst({
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

        await prisma.notification.createMany({
            data: followers.map((f: any) => ({
                userId: f.userId,
                restaurantId,
                type: 'NEW_DAILY_MENU',
                title,
                message,
                isRead: false
            }))
        });

        // Trigger Push Notification
        await notifyFollowers(
            restaurantId, 
            title, 
            message, 
            `/restaurants/${restaurantId}`
        );
    } catch (error) {
        console.error("Error creating daily menu notifications:", error);
    }
};

export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const ownerId = req.user?.id;
        const { id } = req.params;
        const { title, description, date, location, image } = req.body;

        if (!ownerId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: id as string }
        });

        if (!restaurant || restaurant.ownerId !== ownerId) {
            res.status(403).json({ message: "Access denied" });
            return;
        }

        const event = await prisma.event.create({
            data: {
                title,
                description,
                date: new Date(date),
                location,
                image,
                restaurantId: id as string
            }
        });

        // Step 2: Create notifications for followers
        await notifyFollowersOfNewEvent(id as string, title);

        res.json(event);
    } catch (error) {
        next(error);
    }
};

export const updateRestaurantMedia = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const ownerId = req.user?.id;
        const { id } = req.params;
        const { gallery } = req.body;

        if (!ownerId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: id as string }
        });

        if (!restaurant || restaurant.ownerId !== ownerId) {
            res.status(403).json({ message: "Access denied" });
            return;
        }

        const updated = await prisma.restaurant.update({
            where: { id: id as string },
            data: { gallery: gallery as any }
        });

        res.json(updated);
    } catch (error: any) {
        console.error("Error updating media:", error);
        res.status(500).json({ message: "Error updating media", details: error.message });
    }
};
