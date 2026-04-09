import express from "express";
import { getMyRestaurants, getOwnerRestaurant, updateRestaurantInfo, updateRestaurantHours, updateRestaurantMenus, updateRestaurantEvents, updateRestaurantMedia, createEvent } from "../controllers/ownerController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updateRestaurantInfoSchema, updateOpeningHoursSchema, updateMenusSchema, updateEventsSchema } from "../schemas";
import prisma from "../config/prisma";

const router = express.Router();

// Middleware to ensure user is an owner
const isOwner = async (req: any, res: any, next: any) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Check current role in database to avoid stale JWT issues
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (user?.role !== 'OWNER') {
            return res.status(403).json({ message: "Access denied: Owner role required" });
        }
        next();
    } catch (error) {
        console.error("Error in isOwner middleware:", error);
        res.status(500).json({ message: "Internal server error during authorization" });
    }
};

router.use(authenticate);
router.use(isOwner);

router.get("/restaurants", getMyRestaurants);
router.get("/restaurants/:id", getOwnerRestaurant);
router.put("/restaurants/:id/info", validate(updateRestaurantInfoSchema), updateRestaurantInfo);
router.put("/restaurants/:id/hours", validate(updateOpeningHoursSchema), updateRestaurantHours);
router.put("/restaurants/:id/menus", validate(updateMenusSchema), updateRestaurantMenus);
router.post("/restaurants/:id/events", createEvent);
router.put("/restaurants/:id/events", validate(updateEventsSchema), updateRestaurantEvents);
router.put("/restaurants/:id/media", updateRestaurantMedia); // Left without schema since it just passes arbitrary gallery json or use any

export default router;
