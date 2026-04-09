import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createRestaurantSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        address: z.ZodString;
        city: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        logo: z.ZodOptional<z.ZodString>;
        coverImage: z.ZodOptional<z.ZodString>;
        latitude: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        longitude: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        cuisineType: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateRestaurantInfoSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        address: z.ZodString;
        city: z.ZodString;
        coverImage: z.ZodOptional<z.ZodString>;
        cuisineType: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateOpeningHoursSchema: z.ZodObject<{
    body: z.ZodObject<{
        openingHours: z.ZodArray<z.ZodObject<{
            dayOfWeek: z.ZodNumber;
            openTime: z.ZodString;
            closeTime: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createMenuSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        type: z.ZodOptional<z.ZodEnum<{
            DAILY: "DAILY";
            REGULAR: "REGULAR";
        }>>;
        price: z.ZodNullable<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
        date: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        content: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateMenusSchema: z.ZodObject<{
    body: z.ZodObject<{
        menuMode: z.ZodOptional<z.ZodString>;
        menuPdf: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        menuImages: z.ZodOptional<z.ZodAny>;
        menus: z.ZodOptional<z.ZodArray<z.ZodAny>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateEventsSchema: z.ZodObject<{
    body: z.ZodObject<{
        events: z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            description: z.ZodString;
            date: z.ZodString;
            location: z.ZodOptional<z.ZodString>;
            image: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=index.d.ts.map