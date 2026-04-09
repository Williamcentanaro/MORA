import express from "express";
import {
    getRestaurants,
    getRestaurantById,
    createRestaurant,
    followRestaurant,
    unfollowRestaurant,
    getFollowStatus,
    createMenu,
    getTodayMenu,
    getRestaurantMenus,
    getFollowedRestaurants,
    createOrUpdateRestaurantReview,
} from "../controllers/restaurantController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createRestaurantSchema, createMenuSchema } from "../schemas";

const router = express.Router();

// Follow system - MUST be before /:id route
router.get("/followed", authenticate, getFollowedRestaurants);

router.get("/", getRestaurants);
router.get("/:id", getRestaurantById);
router.post("/", authenticate, validate(createRestaurantSchema), createRestaurant);

// Other Follow actions
router.post("/:id/follow", authenticate, followRestaurant);
router.delete("/:id/follow", authenticate, unfollowRestaurant);
router.get("/:id/follow-status", authenticate, getFollowStatus);

// Menu system
router.post("/:id/menu", authenticate, validate(createMenuSchema), createMenu);
router.get("/:id/menu/today", getTodayMenu);
router.get("/:id/menu", getRestaurantMenus);

// Reviews
router.post("/:id/reviews", authenticate, createOrUpdateRestaurantReview);

export default router;