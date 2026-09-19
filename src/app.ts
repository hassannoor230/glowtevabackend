import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { webhook } from './controllers/paymentController.js';
import { connectDatabase, DatabaseConnectionError, pingDatabase } from './db.js';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

const isLocalOrigin = (origin: string) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?\/?$/i.test(origin);
const allowedOrigins = [...new Set([...config.corsOrigins])];
const isAllowedOrigin = (origin: string) =>
  allowedOrigins.includes(origin) || origin === 'https://glowteva.vercel.app';

const corsOptions = {
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (config.nodeEnv === 'production' && isLocalOrigin(origin)) {
      callback(null, false);
      return;
    }
    callback(null, allowedOrigins.includes(origin));
  },
  credentials: true,
  optionsSuccessStatus: 204,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(helmet());
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    if (origin && !isAllowedOrigin(origin)) {
      res.status(403).end();
      return;
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.status(204).end();
    return;
  }

  next();
});
app.use(cors(corsOptions));
app.use(generalLimiter);

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'GlowTeva API is running',
    environment: config.nodeEnv,
  });
});

app.get('/api', (_req, res) => {
  res.json({
    success: true,
    message: 'GlowTeva API is running',
    version: '1.0.0',
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    message: 'GlowTeva API is running',
    version: '1.0.0',
  });
});

app.get('/api/health/database', async (_req, res, next) => {
  try {
    await pingDatabase();
    res.json({
      success: true,
      status: 'ok',
      message: 'Database is reachable',
    });
  } catch (error) {
    next(error);
  }
});

app.use('/api', async (_req, _res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error instanceof DatabaseConnectionError ? error : new DatabaseConnectionError(undefined, error));
  }
});

app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), webhook);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use('/api', routes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

export default app;
