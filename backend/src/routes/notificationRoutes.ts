import express from "express";
import { getNotifications, markAsRead, subscribe, unsubscribe } from "../controllers/notificationController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

router.use(authenticate);

router.get("/", getNotifications);
router.patch("/:id/read", markAsRead);
router.post("/subscribe", subscribe);
router.post("/unsubscribe", unsubscribe);

export default router;
