import express from "express";
import { getPendingRestaurants, approveRestaurant, rejectRestaurant, getPendingOwnerRequests, approveOwnerRequest, rejectOwnerRequest, getStats } from "../controllers/adminController";
import { authenticate, isAdmin } from "../middleware/auth";

const router = express.Router();

// Apply admin protection to all routes in this router
router.use(authenticate);
router.use(isAdmin);

router.get("/stats", getStats);
router.get("/restaurants/pending", getPendingRestaurants);
router.patch("/restaurants/:id/approve", approveRestaurant);
router.patch("/restaurants/:id/reject", rejectRestaurant);

router.get("/owner-requests/pending", getPendingOwnerRequests);
router.patch("/owner-requests/:id/approve", approveOwnerRequest);
router.patch("/owner-requests/:id/reject", rejectOwnerRequest);

export default router;
