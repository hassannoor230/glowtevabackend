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
        variantId: z.ZodOptional<z.ZodString>;
        selectedOptions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        quantity: number;
        variantId?: string | undefined;
        selectedOptions?: Record<string, string> | undefined;
    }, {
        productId: string;
        quantity: number;
        variantId?: string | undefined;
        selectedOptions?: Record<string, string> | undefined;
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
    paymentMethod: z.ZodOptional<z.ZodEnum<["COD", "BANK_TRANSFER", "JAZZCASH", "EASYPAISA", "STRIPE"]>>;
    paymentReference: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items: {
        productId: string;
        quantity: number;
        variantId?: string | undefined;
        selectedOptions?: Record<string, string> | undefined;
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
    paymentMethod?: "COD" | "BANK_TRANSFER" | "JAZZCASH" | "EASYPAISA" | "STRIPE" | undefined;
    paymentReference?: string | undefined;
    couponCode?: string | undefined;
}, {
    items: {
        productId: string;
        quantity: number;
        variantId?: string | undefined;
        selectedOptions?: Record<string, string> | undefined;
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
    paymentMethod?: "COD" | "BANK_TRANSFER" | "JAZZCASH" | "EASYPAISA" | "STRIPE" | undefined;
    paymentReference?: string | undefined;
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
export declare const submitManualPaymentSchema: z.ZodObject<{
    orderId: z.ZodString;
    method: z.ZodEnum<["BANK_TRANSFER", "JAZZCASH", "EASYPAISA"]>;
    transactionId: z.ZodString;
    accountReference: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    method: "BANK_TRANSFER" | "JAZZCASH" | "EASYPAISA";
    orderId: string;
    transactionId: string;
    accountReference?: string | undefined;
}, {
    method: "BANK_TRANSFER" | "JAZZCASH" | "EASYPAISA";
    orderId: string;
    transactionId: string;
    accountReference?: string | undefined;
}>;
export declare const updatePaymentStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["PENDING", "CONFIRMED", "RECEIVED", "NOT_RECEIVED", "REJECTED"]>;
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "CONFIRMED" | "RECEIVED" | "NOT_RECEIVED" | "REJECTED";
    note?: string | undefined;
}, {
    status: "PENDING" | "CONFIRMED" | "RECEIVED" | "NOT_RECEIVED" | "REJECTED";
    note?: string | undefined;
}>;
export declare const updateOrderTrackingSchema: z.ZodObject<{
    courier: z.ZodOptional<z.ZodString>;
    trackingNumber: z.ZodOptional<z.ZodString>;
    estimatedDelivery: z.ZodOptional<z.ZodString>;
    lastUpdate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    courier?: string | undefined;
    trackingNumber?: string | undefined;
    estimatedDelivery?: string | undefined;
    lastUpdate?: string | undefined;
}, {
    courier?: string | undefined;
    trackingNumber?: string | undefined;
    estimatedDelivery?: string | undefined;
    lastUpdate?: string | undefined;
}>;
export declare const updateOrderStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["PENDING", "PAYMENT_PENDING", "PAYMENT_CONFIRMED", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"]>;
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "PAYMENT_PENDING" | "PAYMENT_CONFIRMED" | "CONFIRMED" | "PROCESSING" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "RETURNED" | "REFUNDED";
    note?: string | undefined;
}, {
    status: "PENDING" | "PAYMENT_PENDING" | "PAYMENT_CONFIRMED" | "CONFIRMED" | "PROCESSING" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "RETURNED" | "REFUNDED";
    note?: string | undefined;
}>;
export declare const paymentSettingsSchema: z.ZodObject<{
    codEnabled: z.ZodOptional<z.ZodBoolean>;
    bankTransferEnabled: z.ZodOptional<z.ZodBoolean>;
    jazzcashEnabled: z.ZodOptional<z.ZodBoolean>;
    easypaisaEnabled: z.ZodOptional<z.ZodBoolean>;
    bankTransfer: z.ZodOptional<z.ZodObject<{
        bankName: z.ZodOptional<z.ZodString>;
        accountTitle: z.ZodOptional<z.ZodString>;
        accountNumber: z.ZodOptional<z.ZodString>;
        iban: z.ZodOptional<z.ZodString>;
        branch: z.ZodOptional<z.ZodString>;
        instructions: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        bankName?: string | undefined;
        accountTitle?: string | undefined;
        accountNumber?: string | undefined;
        iban?: string | undefined;
        branch?: string | undefined;
        instructions?: string | undefined;
    }, {
        bankName?: string | undefined;
        accountTitle?: string | undefined;
        accountNumber?: string | undefined;
        iban?: string | undefined;
        branch?: string | undefined;
        instructions?: string | undefined;
    }>>;
    jazzcash: z.ZodOptional<z.ZodObject<{
        accountName: z.ZodOptional<z.ZodString>;
        accountNumber: z.ZodOptional<z.ZodString>;
        instructions: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        accountNumber?: string | undefined;
        instructions?: string | undefined;
        accountName?: string | undefined;
    }, {
        accountNumber?: string | undefined;
        instructions?: string | undefined;
        accountName?: string | undefined;
    }>>;
    easypaisa: z.ZodOptional<z.ZodObject<{
        accountName: z.ZodOptional<z.ZodString>;
        accountNumber: z.ZodOptional<z.ZodString>;
        instructions: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        accountNumber?: string | undefined;
        instructions?: string | undefined;
        accountName?: string | undefined;
    }, {
        accountNumber?: string | undefined;
        instructions?: string | undefined;
        accountName?: string | undefined;
    }>>;
    generalInstructions: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    codEnabled?: boolean | undefined;
    bankTransferEnabled?: boolean | undefined;
    jazzcashEnabled?: boolean | undefined;
    easypaisaEnabled?: boolean | undefined;
    bankTransfer?: {
        bankName?: string | undefined;
        accountTitle?: string | undefined;
        accountNumber?: string | undefined;
        iban?: string | undefined;
        branch?: string | undefined;
        instructions?: string | undefined;
    } | undefined;
    jazzcash?: {
        accountNumber?: string | undefined;
        instructions?: string | undefined;
        accountName?: string | undefined;
    } | undefined;
    easypaisa?: {
        accountNumber?: string | undefined;
        instructions?: string | undefined;
        accountName?: string | undefined;
    } | undefined;
    generalInstructions?: string | undefined;
}, {
    codEnabled?: boolean | undefined;
    bankTransferEnabled?: boolean | undefined;
    jazzcashEnabled?: boolean | undefined;
    easypaisaEnabled?: boolean | undefined;
    bankTransfer?: {
        bankName?: string | undefined;
        accountTitle?: string | undefined;
        accountNumber?: string | undefined;
        iban?: string | undefined;
        branch?: string | undefined;
        instructions?: string | undefined;
    } | undefined;
    jazzcash?: {
        accountNumber?: string | undefined;
        instructions?: string | undefined;
        accountName?: string | undefined;
    } | undefined;
    easypaisa?: {
        accountNumber?: string | undefined;
        instructions?: string | undefined;
        accountName?: string | undefined;
    } | undefined;
    generalInstructions?: string | undefined;
}>;
//# sourceMappingURL=payment.d.ts.map