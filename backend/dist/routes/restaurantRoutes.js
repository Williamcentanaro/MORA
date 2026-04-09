"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const restaurantController_1 = require("../controllers/restaurantController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../schemas");
const router = express_1.default.Router();
// Follow system - MUST be before /:id route
router.get("/followed", auth_1.authenticate, restaurantController_1.getFollowedRestaurants);
router.get("/", restaurantController_1.getRestaurants);
router.get("/:id", restaurantController_1.getRestaurantById);
router.post("/", auth_1.authenticate, (0, validate_1.validate)(schemas_1.createRestaurantSchema), restaurantController_1.createRestaurant);
// Other Follow actions
router.post("/:id/follow", auth_1.authenticate, restaurantController_1.followRestaurant);
router.delete("/:id/follow", auth_1.authenticate, restaurantController_1.unfollowRestaurant);
router.get("/:id/follow-status", auth_1.authenticate, restaurantController_1.getFollowStatus);
// Menu system
router.post("/:id/menu", auth_1.authenticate, (0, validate_1.validate)(schemas_1.createMenuSchema), restaurantController_1.createMenu);
router.get("/:id/menu/today", restaurantController_1.getTodayMenu);
router.get("/:id/menu", restaurantController_1.getRestaurantMenus);
// Reviews
router.post("/:id/reviews", auth_1.authenticate, restaurantController_1.createOrUpdateRestaurantReview);
exports.default = router;
//# sourceMappingURL=restaurantRoutes.js.map