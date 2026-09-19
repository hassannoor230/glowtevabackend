import app from './app.js';
import { config } from './config/index.js';
import { connectDatabase } from './db.js';

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
}

export default app;