"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getEnv = (name, fallback = '') => (process.env[name] ?? fallback).trim();
const detectedNodeEnv = (process.env.NODE_ENV || (process.env.VERCEL ? 'production' : 'development')).toLowerCase();
const defaultClientUrl = detectedNodeEnv === 'production' ? 'https://glowteva.com' : 'http://localhost:3000';
const configuredClientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || defaultClientUrl;
const configuredOrigins = [process.env.CLIENT_URL, process.env.FRONTEND_URL, process.env.CORS_ORIGIN]
    .flatMap((value) => (value ? value.split(',') : []))
    .map((value) => value.trim())
    .filter(Boolean);
exports.config = {
    port: Number.parseInt(getEnv('PORT', '5000'), 10),
    nodeEnv: detectedNodeEnv,
    mongodbUri: getEnv('MONGODB_URI'),
    jwtSecret: getEnv('JWT_SECRET'),
    jwtRefreshSecret: getEnv('JWT_REFRESH_SECRET'),
    jwtExpiresIn: getEnv('JWT_EXPIRES_IN', '15m'),
    jwtRefreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
    stripeSecretKey: getEnv('STRIPE_SECRET_KEY'),
    stripeWebhookSecret: getEnv('STRIPE_WEBHOOK_SECRET'),
    cloudinary: {
        cloudName: getEnv('CLOUDINARY_CLOUD_NAME'),
        apiKey: getEnv('CLOUDINARY_API_KEY'),
        apiSecret: getEnv('CLOUDINARY_API_SECRET'),
    },
    smtp: {
        host: getEnv('SMTP_HOST'),
        port: Number.parseInt(getEnv('SMTP_PORT', '587'), 10),
        secure: getEnv('SMTP_SECURE').toLowerCase() === 'true',
        user: getEnv('SMTP_USER'),
        pass: getEnv('SMTP_PASS'),
        from: getEnv('SMTP_FROM', 'noreply@glowteva.com'),
    },
    clientUrl: configuredClientUrl.trim(),
    corsOrigins: [...new Set([...configuredOrigins, configuredClientUrl.trim()])].filter((origin) => origin && origin !== '*'),
    adminEmail: getEnv('ADMIN_EMAIL', 'admin@glowteva.com'),
    adminPassword: getEnv('ADMIN_PASSWORD'),
};
exports.default = exports.config;
//# sourceMappingURL=index.js.map