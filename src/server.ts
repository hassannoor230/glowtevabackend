import app from './app.js';
import { config } from './config/index.js';
import { connectDatabase } from './db.js';
import { emailService } from './services/emailService.js';

if (!process.env.VERCEL) {
  const server = app.listen(config.port, () => {
    console.log(`GlowTeva server running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });

  connectDatabase()
    .then(() => {
      console.log('MongoDB connected');
    })
    .catch((error: unknown) => {
      console.error('MongoDB connection unavailable; health endpoints remain available:', error);
    });

  emailService.testConnection().then((ok) => {
    if (ok) {
      console.log('SMTP connection verified at startup.');
    } else {
      console.warn('SMTP connection FAILED at startup. Check SMTP_HOST, SMTP_USER, SMTP_PASS.');
    }
  });
}

export default app;