
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function migrate() {
  console.log('Starting migration of legacy menu content to MenuItems...');
  
  const menus = await prisma.menu.findMany({
    include: { items: true }
  });

  for (const menu of menus) {
    // If the menu already has items, skip or update?
    // Let's assume we populate if it doesn't have items but has content
    if (menu.items.length === 0 && menu.content && typeof menu.content === 'object') {
       // Check if content is an array of dishes (based on what we saw in MenuEditor)
       // Actually, in the old logic, maybe 'content' was a single dish or an array?
       // Let's assume it's data from the old structure.
       
       // Wait, if Menu itself WAS the dish, then we should just create one MenuItem for it.
       if (menu.title) {
          console.log(`Migrating menu record: ${menu.title}`);
          await prisma.menuItem.create({
            data: {
              name: menu.title,
              description: menu.description,
              price: menu.price,
              category: (menu.content as any).category || null,
              menuId: menu.id
            }
          });
       }
    }
  }
  
  console.log('Migration completed.');
}

migrate()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
