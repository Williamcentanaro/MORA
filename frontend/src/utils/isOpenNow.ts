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

export const getRestaurantStatusDetailed = (openingHours?: OpeningHour[] | null): { 
  status: 'OPEN' | 'CLOSED' | 'UNKNOWN';
  text: string;
} => {
  if (!openingHours || !Array.isArray(openingHours) || openingHours.length === 0) {
    return { status: 'UNKNOWN', text: '' }; 
  }

  const now = new Date();
  const currentDay = now.getDay(); 
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
  const currentTimeMins = currentHour * 60 + currentMinute;

  let nextCloseMins = -1;
  let nextOpenDayDiff = 7 * 24 * 60;
  let nextOpenTime = "";

  const status = getRestaurantStatus(openingHours);
  
  if (status === 'OPEN') {
    const todays = openingHours.filter(h => h.dayOfWeek === currentDay);
    for (const h of todays) {
       if (h.openTime <= h.closeTime) {
         if (currentTimeStr >= h.openTime && currentTimeStr <= h.closeTime) {
            const closeMins = parseInt(h.closeTime.substring(0, 2)) * 60 + parseInt(h.closeTime.substring(3, 5));
             nextCloseMins = closeMins - currentTimeMins;
         }
       } else {
         if (currentTimeStr >= h.openTime || currentTimeStr <= h.closeTime) {
             const closeMins = parseInt(h.closeTime.substring(0, 2)) * 60 + parseInt(h.closeTime.substring(3, 5));
             nextCloseMins = currentTimeStr <= h.closeTime ? closeMins - currentTimeMins : (24 * 60 - currentTimeMins) + closeMins;
         }
       }
    }
    const previousDay = (currentDay + 6) % 7;
    const yesterdays = openingHours.filter(h => h.dayOfWeek === previousDay && h.openTime > h.closeTime);
    for (const h of yesterdays) {
      if (currentTimeStr <= h.closeTime) {
         const closeMins = parseInt(h.closeTime.substring(0, 2)) * 60 + parseInt(h.closeTime.substring(3, 5));
         nextCloseMins = closeMins - currentTimeMins;
      }
    }

    if (nextCloseMins > 0 && nextCloseMins <= 90) {
       const h = Math.floor(nextCloseMins / 60);
       const m = nextCloseMins % 60;
       return { status: 'OPEN', text: `Chiude tra ${h > 0 ? h + 'h ' : ''}${m}m` };
    }
    return { status: 'OPEN', text: 'Aperto ora' };
  }

  for (let i = 0; i < 7; i++) {
    const checkDay = (currentDay + i) % 7;
    const dayHours = openingHours.filter(h => h.dayOfWeek === checkDay).sort((a,b) => a.openTime.localeCompare(b.openTime));
    for (const h of dayHours) {
        if (i === 0 && h.openTime <= currentTimeStr) continue; 
        let offset = i * 24 * 60;
        const openMins = parseInt(h.openTime.substring(0, 2)) * 60 + parseInt(h.openTime.substring(3, 5));
        const diff = offset + openMins - currentTimeMins;
        if (diff > 0 && diff < nextOpenDayDiff) {
           nextOpenDayDiff = diff;
           nextOpenTime = h.openTime;
        }
    }
  }

  if (nextOpenTime) {
     if (nextOpenDayDiff < 120) {
        const h = Math.floor(nextOpenDayDiff / 60);
        const m = nextOpenDayDiff % 60;
        return { status: 'CLOSED', text: `Apre tra ${h > 0 ? h + 'h ' : ''}${m}m` };
     }
     if (nextOpenDayDiff < 24 * 60) {
        return { status: 'CLOSED', text: `Chiuso - Apre alle ${nextOpenTime}` };
     }
  }

  return { status: 'CLOSED', text: 'Chiuso' };
};
