export type OpeningHour = {
  id?: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
};

export type RestaurantStatus = 'OPEN' | 'CLOSED' | 'UNKNOWN';

export const getRestaurantStatus = (openingHours?: OpeningHour[] | null): RestaurantStatus => {
  if (!openingHours || !Array.isArray(openingHours) || openingHours.length === 0) {
    return 'UNKNOWN'; 
  }

  const now = new Date();
  const currentDay = now.getDay(); 
  const previousDay = (currentDay + 6) % 7;
  
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

  // Check today's hours
  const todaysHours = openingHours.filter(h => h.dayOfWeek === currentDay);
  for (const hours of todaysHours) {
    if (!hours.openTime || !hours.closeTime) continue;
    
    // Basic format validation
    if (hours.openTime.length !== 5 || hours.closeTime.length !== 5) continue;

    if (hours.openTime <= hours.closeTime) {
      if (currentTimeStr >= hours.openTime && currentTimeStr <= hours.closeTime) {
        return 'OPEN';
      }
    } else {
      // Overnight schedule starting today (e.g., 18:00 - 02:00)
      if (currentTimeStr >= hours.openTime || currentTimeStr <= hours.closeTime) {
         return 'OPEN';
      }
    }
  }

  // Check yesterday's hours for overnight overlap
  const yesterdaysHours = openingHours.filter(h => h.dayOfWeek === previousDay);
  for (const hours of yesterdaysHours) {
    if (!hours.openTime || !hours.closeTime) continue;
    if (hours.openTime > hours.closeTime) {
      if (currentTimeStr <= hours.closeTime) {
        return 'OPEN';
      }
    }
  }

  return 'CLOSED';
};
