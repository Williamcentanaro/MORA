"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsubscribe = exports.subscribe = exports.markAsRead = exports.getNotifications = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const notifications = await prisma_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(notifications);
    }
    catch (error) {
        next(error);
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const notification = await prisma_1.default.notification.findUnique({
            where: { id: id }
        });
        if (!notification) {
            res.status(404).json({ success: false, message: "Notification not found" });
            return;
        }
        if (notification.userId !== userId) {
            res.status(403).json({ success: false, message: "Access denied" });
            return;
        }
        await prisma_1.default.notification.update({
            where: { id: id },
            data: { isRead: true }
        });
        res.json({ success: true, message: "Notification marked as read" });
    }
    catch (error) {
        next(error);
    }
};
exports.markAsRead = markAsRead;
const subscribe = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { subscription } = req.body;
        if (!userId || !subscription || !subscription.endpoint) {
            res.status(400).json({ success: false, message: "Invalid subscription data" });
            return;
        }
        // Upsert the subscription
        await prisma_1.default.pushSubscription.upsert({
            where: { endpoint: subscription.endpoint },
            update: {
                userId,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth
            },
            create: {
                userId,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth
            }
        });
        console.log(`Push subscription saved/updated for user ${userId}`);
        res.status(201).json({ success: true, message: "Subscribed successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.subscribe = subscribe;
const unsubscribe = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { endpoint } = req.body;
        if (!userId || !endpoint) {
            res.status(400).json({ success: false, message: "Invalid endpoint" });
            return;
        }
        await prisma_1.default.pushSubscription.deleteMany({
            where: {
                endpoint,
                userId
            }
        });
        res.json({ success: true, message: "Unsubscribed successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.unsubscribe = unsubscribe;
//# sourceMappingURL=notificationController.js.map