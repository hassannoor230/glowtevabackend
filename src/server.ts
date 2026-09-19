import mongoose from 'mongoose';
import app from './app.js';
import { config } from './config/index.js';

const start = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('✓ MongoDB connected');

    app.listen(config.port, () => {
      console.log(`✓ GlowTeva server running on port ${config.port}`);
      console.log(`✓ Environment: ${config.nodeEnv}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
