
export const flattenMenus = (menus: any[]) => {
  if (!menus) return [];
  return menus.flatMap(menu => 
    (menu.items || []).map((item: any) => ({
      id: item.id,
      title: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      type: menu.type,
      date: menu.date,
      isActive: menu.isActive
    }))
  );
};
