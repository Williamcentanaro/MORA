"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ownerController_1 = require("../controllers/ownerController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../schemas");
const prisma_1 = __importDefault(require("../config/prisma"));
const router = express_1.default.Router();
// Middleware to ensure user is an owner
const isOwner = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Check current role in database to avoid stale JWT issues
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });
        if (user?.role !== 'OWNER') {
            return res.status(403).json({ message: "Access denied: Owner role required" });
        }
        next();
    }
    catch (error) {
        console.error("Error in isOwner middleware:", error);
        res.status(500).json({ message: "Internal server error during authorization" });
    }
};
router.use(auth_1.authenticate);
router.use(isOwner);
router.get("/restaurants", ownerController_1.getMyRestaurants);
router.get("/restaurants/:id", ownerController_1.getOwnerRestaurant);
router.put("/restaurants/:id/info", (0, validate_1.validate)(schemas_1.updateRestaurantInfoSchema), ownerController_1.updateRestaurantInfo);
router.put("/restaurants/:id/hours", (0, validate_1.validate)(schemas_1.updateOpeningHoursSchema), ownerController_1.updateRestaurantHours);
router.put("/restaurants/:id/menus", (0, validate_1.validate)(schemas_1.updateMenusSchema), ownerController_1.updateRestaurantMenus);
router.post("/restaurants/:id/events", ownerController_1.createEvent);
router.put("/restaurants/:id/events", (0, validate_1.validate)(schemas_1.updateEventsSchema), ownerController_1.updateRestaurantEvents);
router.put("/restaurants/:id/media", ownerController_1.updateRestaurantMedia); // Left without schema since it just passes arbitrary gallery json or use any
exports.default = router;
//# sourceMappingURL=ownerRoutes.js.map