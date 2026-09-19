interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
declare class EmailService {
    private transporter;
    private getTransporter;
    sendEmail(options: EmailOptions): Promise<boolean>;
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
}
export declare const emailService: EmailService;
export {};
//# sourceMappingURL=emailService.d.ts.map