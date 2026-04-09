import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Email non valida"),
    password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
    name: z.string().optional(),
    role: z.string().optional(),
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Email non valida"),
    password: z.string().min(1, "Password richiesta"),
  })
});

export const createRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nome richiesto"),
    description: z.string().optional(),
    address: z.string().min(1, "Indirizzo richiesto"),
    city: z.string().min(1, "Città richiesta"),
    phone: z.string().optional(),
    logo: z.string().optional(),
    coverImage: z.string().optional(),
    latitude: z.union([z.string(), z.number()]).optional(),
    longitude: z.union([z.string(), z.number()]).optional(),
    cuisineType: z.string().optional(),
  })
});

export const updateRestaurantInfoSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nome richiesto"),
    description: z.string().optional(),
    address: z.string().min(1, "Indirizzo richiesto"),
    city: z.string().min(1, "Città richiesta"),
    coverImage: z.string().optional(),
    cuisineType: z.string().optional(),
  })
});

export const updateOpeningHoursSchema = z.object({
  body: z.object({
    openingHours: z.array(z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato ora non valido"),
      closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato ora non valido"),
    }))
  })
});

export const createMenuSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Titolo richiesto"),
    description: z.string().optional().nullable(),
    type: z.enum(['DAILY', 'REGULAR']).optional(),
    price: z.union([z.string(), z.number()]).optional().nullable(),
    date: z.string().optional().nullable(),
    content: z.any().optional(),
  })
});

export const updateMenusSchema = z.object({
  body: z.object({
    menuMode: z.string().optional(),
    menuPdf: z.string().optional().nullable(),
    menuImages: z.any().optional(),
    menus: z.array(z.any()).optional(),
  })
});

export const updateEventsSchema = z.object({
  body: z.object({
    events: z.array(z.object({
      title: z.string().min(1, "Titolo richiesto"),
      description: z.string().min(1, "Descrizione richiesta"),
      date: z.string().min(1, "Data richiesta"),
      location: z.string().optional(),
      image: z.string().optional(),
    }))
  })
});
