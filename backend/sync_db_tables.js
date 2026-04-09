const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'prisma/dev.db');
const db = new Database(dbPath);

console.log('--- DB SYNC START ---');

try {
    // 1. Create Notification table if missing
    db.prepare(`
        CREATE TABLE IF NOT EXISTS "Notification" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "restaurantId" TEXT NOT NULL,
            "type" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "message" TEXT NOT NULL,
            "isRead" BOOLEAN NOT NULL DEFAULT 0,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
            CONSTRAINT "Notification_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
        )
    `).run();
    console.log('Notification table verified/created.');

    // 2. Create PushSubscription table if missing
    db.prepare(`
        CREATE TABLE IF NOT EXISTS "PushSubscription" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "endpoint" TEXT NOT NULL,
            "p256dh" TEXT NOT NULL,
            "auth" TEXT NOT NULL,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
        )
    `).run();
    db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint")`).run();
    console.log('PushSubscription table verified/created.');

} catch (err) {
    console.error('--- DB SYNC ERROR ---');
    console.error(err);
} finally {
    db.close();
    console.log('--- DB SYNC END ---');
}
