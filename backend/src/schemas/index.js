"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventsSchema = exports.updateMenusSchema = exports.createMenuSchema = exports.updateOpeningHoursSchema = exports.updateRestaurantInfoSchema = exports.createRestaurantSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Email non valida"),
        password: zod_1.z.string().min(6, "La password deve avere almeno 6 caratteri"),
        name: zod_1.z.string().optional(),
        role: zod_1.z.string().optional(),
    })
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Email non valida"),
        password: zod_1.z.string().min(1, "Password richiesta"),
    })
});
exports.createRestaurantSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Nome richiesto"),
        description: zod_1.z.string().optional(),
        address: zod_1.z.string().min(1, "Indirizzo richiesto"),
        city: zod_1.z.string().min(1, "Città richiesta"),
        phone: zod_1.z.string().optional(),
        logo: zod_1.z.string().optional(),
        coverImage: zod_1.z.string().optional(),
        latitude: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        longitude: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        cuisineType: zod_1.z.string().optional(),
    })
});
exports.updateRestaurantInfoSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Nome richiesto"),
        description: zod_1.z.string().optional(),
        address: zod_1.z.string().min(1, "Indirizzo richiesto"),
        city: zod_1.z.string().min(1, "Città richiesta"),
        coverImage: zod_1.z.string().optional(),
        cuisineType: zod_1.z.string().optional(),
    })
});
exports.updateOpeningHoursSchema = zod_1.z.object({
    body: zod_1.z.object({
        openingHours: zod_1.z.array(zod_1.z.object({
            dayOfWeek: zod_1.z.number().int().min(0).max(6),
            openTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato ora non valido"),
            closeTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato ora non valido"),
        }))
    })
});
exports.createMenuSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, "Titolo richiesto"),
        description: zod_1.z.string().optional().nullable(),
        type: zod_1.z.enum(['DAILY', 'REGULAR']).optional(),
        price: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional().nullable(),
        date: zod_1.z.string().optional().nullable(),
        content: zod_1.z.any().optional(),
    })
});
exports.updateMenusSchema = zod_1.z.object({
    body: zod_1.z.object({
        menuMode: zod_1.z.string().optional(),
        menuPdf: zod_1.z.string().optional().nullable(),
        menuImages: zod_1.z.any().optional(),
        menus: zod_1.z.array(zod_1.z.any()).optional(),
    })
});
exports.updateEventsSchema = zod_1.z.object({
    body: zod_1.z.object({
        events: zod_1.z.array(zod_1.z.object({
            title: zod_1.z.string().min(1, "Titolo richiesto"),
            description: zod_1.z.string().min(1, "Descrizione richiesta"),
            date: zod_1.z.string().min(1, "Data richiesta"),
            location: zod_1.z.string().optional(),
            image: zod_1.z.string().optional(),
        }))
    })
});
//# sourceMappingURL=index.js.map