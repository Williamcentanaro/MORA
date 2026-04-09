import webpush from 'web-push';
import prisma from '../config/prisma';

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

webpush.setVapidDetails(
  'mailto:support@antigravity.io',
  vapidPublicKey,
  vapidPrivateKey
);

export async function sendPushNotification(userId: string, title: string, body: string, url: string = '/') {
  try {
    const subscriptions = await (prisma as any).pushSubscription.findMany({
      where: { userId }
    });

    const payload = JSON.stringify({
      title,
      body,
      url
    });

    const notifications = subscriptions.map((sub: any) => {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.auth,
          p256dh: sub.p256dh
        }
      };

      return webpush.sendNotification(pushConfig, payload).catch((err: any) => {
        if (err.statusCode === 404 || err.statusCode === 410) {
          console.log('Subscription expired or invalid. Removing...');
          return (prisma as any).pushSubscription.delete({ where: { id: sub.id } });
        }
        console.error('Error sending push notification:', err);
      });
    });

    await Promise.all(notifications);
  } catch (err) {
    console.error('Push notification broadast error:', err);
  }
}

export async function notifyFollowers(restaurantId: string, title: string, body: string, url: string) {
    try {
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            include: { owner: true }
        });

        if (!restaurant) return;

        // Plan check: Only PRO owners can send push notifications to followers
        if ((restaurant.owner as any).plan !== 'PRO') {
            console.log(`[PUSH SKIP] Restaurant ${restaurant.name} (ID: ${restaurantId}) is on FREE plan. Skipping push notification.`);
            return;
        }

        const followers = await prisma.follower.findMany({
            where: { restaurantId },
            select: { userId: true }
        });

        const notifyPromises = followers.map(f => sendPushNotification(f.userId, title, body, url));
        await Promise.all(notifyPromises);
    } catch (err) {
        console.error('Follower notification broadcast error:', err);
    }
}
