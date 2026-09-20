interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
interface OrderItemEmail {
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    thumbnail?: string;
}
declare class EmailService {
    private transporter;
    private getTransporter;
    sendEmail(options: EmailOptions): Promise<boolean>;
    testConnection(): Promise<boolean>;
    sendContactNotification(contactData: {
        name: string;
        email: string;
        subject: string;
        message: string;
    }): Promise<boolean>;
    sendContactConfirmation(contactData: {
        name: string;
        email: string;
    }): Promise<boolean>;
    sendOrderConfirmation(orderData: {
        orderNumber: string;
        orderId: string;
        userEmail: string;
        userName: string;
        items: OrderItemEmail[];
        subtotal: number;
        shippingCost: number;
        discount: number;
        total: number;
        paymentMethod: string;
        orderStatus: string;
        shippingAddress: {
            firstName: string;
            lastName: string;
            street: string;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        };
    }): Promise<boolean>;
    sendOrderAdminNotification(orderData: {
        orderNumber: string;
        orderId: string;
        userName: string;
        userEmail: string;
        items: OrderItemEmail[];
        subtotal: number;
        shippingCost: number;
        discount: number;
        total: number;
        paymentMethod: string;
        orderStatus: string;
        shippingAddress: {
            firstName: string;
            lastName: string;
            street: string;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        };
    }): Promise<boolean>;
    sendNewsletterWelcome(subscriberEmail: string, adminEmail: string): Promise<boolean>;
    sendNewsletterAdminNotification(subscriberEmail: string): Promise<boolean>;
}
export declare const emailService: EmailService;
export {};
//# sourceMappingURL=emailService.d.ts.map