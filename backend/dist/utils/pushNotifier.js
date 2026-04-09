"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = sendPushNotification;
exports.notifyFollowers = notifyFollowers;
const web_push_1 = __importDefault(require("web-push"));
const prisma_1 = __importDefault(require("../config/prisma"));
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
web_push_1.default.setVapidDetails('mailto:support@antigravity.io', vapidPublicKey, vapidPrivateKey);
async function sendPushNotification(userId, title, body, url = '/') {
    try {
        const subscriptions = await prisma_1.default.pushSubscription.findMany({
            where: { userId }
        });
        const payload = JSON.stringify({
            title,
            body,
            url
        });
        const notifications = subscriptions.map((sub) => {
            const pushConfig = {
                endpoint: sub.endpoint,
                keys: {
                    auth: sub.auth,
                    p256dh: sub.p256dh
                }
            };
            return web_push_1.default.sendNotification(pushConfig, payload).catch((err) => {
                if (err.statusCode === 404 || err.statusCode === 410) {
                    console.log('Subscription expired or invalid. Removing...');
                    return prisma_1.default.pushSubscription.delete({ where: { id: sub.id } });
                }
                console.error('Error sending push notification:', err);
            });
        });
        await Promise.all(notifications);
    }
    catch (err) {
        console.error('Push notification broadast error:', err);
    }
}
async function notifyFollowers(restaurantId, title, body, url) {
    try {
        const restaurant = await prisma_1.default.restaurant.findUnique({
            where: { id: restaurantId },
            include: { owner: true }
        });
        if (!restaurant)
            return;
        // Plan check: Only PRO owners can send push notifications to followers
        if (restaurant.owner.plan !== 'PRO') {
            console.log(`[PUSH SKIP] Restaurant ${restaurant.name} (ID: ${restaurantId}) is on FREE plan. Skipping push notification.`);
            return;
        }
        const followers = await prisma_1.default.follower.findMany({
            where: { restaurantId },
            select: { userId: true }
        });
        const notifyPromises = followers.map(f => sendPushNotification(f.userId, title, body, url));
        await Promise.all(notifyPromises);
    }
    catch (err) {
        console.error('Follower notification broadcast error:', err);
    }
}
//# sourceMappingURL=pushNotifier.js.map