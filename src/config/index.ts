import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: (process.env.NODE_ENV || 'development').trim(),
  mongodbUri: (process.env.MONGODB_URI || 'mongodb://localhost:27017/glowteva').trim(),
  jwtSecret: (process.env.JWT_SECRET || 'glowteva_dev_jwt_secret_key_32chars').trim(),
  jwtRefreshSecret: (process.env.JWT_REFRESH_SECRET || 'glowteva_dev_refresh_secret_32chars').trim(),
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '15m').trim(),
  jwtRefreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d').trim(),
  stripeSecretKey: (process.env.STRIPE_SECRET_KEY || '').trim(),
  stripeWebhookSecret: (process.env.STRIPE_WEBHOOK_SECRET || '').trim(),
  cloudinary: {
    cloudName: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
    apiKey: (process.env.CLOUDINARY_API_KEY || '').trim(),
    apiSecret: (process.env.CLOUDINARY_API_SECRET || '').trim(),
  },
  smtp: {
    host: (process.env.SMTP_HOST || '').trim(),
    port: parseInt((process.env.SMTP_PORT || '587').trim(), 10),
    secure: (process.env.SMTP_SECURE || '').trim() === 'true',
    user: (process.env.SMTP_USER || '').trim(),
    pass: (process.env.SMTP_PASS || '').trim(),
    from: (process.env.SMTP_FROM || 'noreply@glowteva.com').trim(),
  },
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:3000').trim(),
  adminEmail: (process.env.ADMIN_EMAIL || 'admin@glowteva.com').trim(),
  adminPassword: (process.env.ADMIN_PASSWORD || 'GlowTevaAdmin2026!').trim(),
};

export default config;
