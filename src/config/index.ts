import dotenv from 'dotenv';
dotenv.config();

const getEnv = (name: string, fallback = ''): string =>
  (process.env[name] ?? fallback).trim();

const detectedNodeEnv = (process.env.NODE_ENV || (process.env.VERCEL ? 'production' : 'development')).toLowerCase();
const isOnVercel = !!process.env.VERCEL;
const productionClientUrls = ['https://glowteva.vercel.app', 'https://glowteva.com'];
const defaultClientUrl = isOnVercel ? productionClientUrls[0] : (detectedNodeEnv === 'production' ? productionClientUrls[0] : 'http://localhost:3000');
const configuredClientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || defaultClientUrl;
const localClientUrls = ['http://localhost:3000', 'http://localhost:5173'];
const frontendOrigins = [process.env.CLIENT_URL, process.env.FRONTEND_URL]
  .flatMap((value) => (value ? value.split(',') : []))
  .map((value) => value.trim())
  .filter(Boolean);
const explicitCorsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const baseOrigins = [...productionClientUrls, ...localClientUrls, ...frontendOrigins, ...explicitCorsOrigins];

export const config = {
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
  corsOrigins: [...new Set([...baseOrigins, configuredClientUrl.trim(), defaultClientUrl])].filter(
    (origin) => origin && origin !== '*'
  ),
  adminEmail: getEnv('ADMIN_EMAIL', 'admin@glowteva.com'),
  adminPassword: getEnv('ADMIN_PASSWORD'),
};

export default config;
