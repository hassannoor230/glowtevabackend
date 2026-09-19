export declare const config: {
    port: number;
    nodeEnv: string;
    mongodbUri: string;
    jwtSecret: string;
    jwtRefreshSecret: string;
    jwtExpiresIn: string;
    jwtRefreshExpiresIn: string;
    stripeSecretKey: string;
    stripeWebhookSecret: string;
    cloudinary: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };
    smtp: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        pass: string;
        from: string;
    };
    clientUrl: string;
    adminEmail: string;
    adminPassword: string;
};
export default config;
//# sourceMappingURL=index.d.ts.map