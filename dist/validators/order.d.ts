import { z } from 'zod';
export declare const shippingAddressSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    street: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    postalCode: z.ZodString;
    country: z.ZodLiteral<"Pakistan">;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: "Pakistan";
    phone?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: "Pakistan";
    phone?: string | undefined;
}>;
export declare const createOrderSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        quantity: number;
    }, {
        productId: string;
        quantity: number;
    }>, "many">;
    shippingAddress: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodLiteral<"Pakistan">;
        phone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: "Pakistan";
        phone?: string | undefined;
    }, {
        firstName: string;
        lastName: string;
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: "Pakistan";
        phone?: string | undefined;
    }>;
    couponCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items: {
        productId: string;
        quantity: number;
    }[];
    shippingAddress: {
        firstName: string;
        lastName: string;
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: "Pakistan";
        phone?: string | undefined;
    };
    couponCode?: string | undefined;
}, {
    items: {
        productId: string;
        quantity: number;
    }[];
    shippingAddress: {
        firstName: string;
        lastName: string;
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: "Pakistan";
        phone?: string | undefined;
    };
    couponCode?: string | undefined;
}>;
export declare const reviewSchema: z.ZodObject<{
    rating: z.ZodNumber;
    title: z.ZodString;
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
    rating: number;
    title: string;
}, {
    text: string;
    rating: number;
    title: string;
}>;
export declare const contactSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    subject: z.ZodString;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    message: string;
    subject: string;
}, {
    name: string;
    email: string;
    message: string;
    subject: string;
}>;
export declare const newsletterSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
//# sourceMappingURL=order.d.ts.map