import type { NextFunction, Response } from "express";
import prisma from "../config/prisma";
import type { AuthRequest } from "../middleware/auth";

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        res.json(notifications);
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const notification = await prisma.notification.findUnique({
            where: { id: id as string }
        });

        if (!notification) {
            res.status(404).json({ success: false, message: "Notification not found" });
            return;
        }

        if (notification.userId !== userId) {
            res.status(403).json({ success: false, message: "Access denied" });
            return;
        }

        await prisma.notification.update({
            where: { id: id as string },
            data: { isRead: true }
        });

        res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
        next(error);
    }
};

export const subscribe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { subscription } = req.body;

        if (!userId || !subscription || !subscription.endpoint) {
            res.status(400).json({ success: false, message: "Invalid subscription data" });
            return;
        }

        // Upsert the subscription
        await prisma.pushSubscription.upsert({
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
    } catch (error) {
        next(error);
    }
};

export const unsubscribe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { endpoint } = req.body;

        if (!userId || !endpoint) {
            res.status(400).json({ success: false, message: "Invalid endpoint" });
            return;
        }

        await prisma.pushSubscription.deleteMany({
            where: { 
                endpoint,
                userId
            }
        });

        res.json({ success: true, message: "Unsubscribed successfully" });
    } catch (error) {
        next(error);
    }
};
