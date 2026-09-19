import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config } from '../config/index.js';
import { DatabaseConnectionError } from '../db.js';

interface HttpError extends Error {
  statusCode?: number;
  status?: number;
  code?: number;
  errors?: Record<string, any>;
  keyPattern?: Record<string, number>;
}

const allowedOrigins = [...new Set([...config.corsOrigins])];

const setCorsErrorHeaders = (res: Response, origin: string | undefined) => {
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
};

const sanitizeLogValue = (value: string) =>
  value.replace(/mongodb(?:\+srv)?:\/\/[^\s)]+/gi, 'mongodb://[redacted]');

const databaseErrorNames = new Set([
  'MongooseError',
  'MongoServerSelectionError',
  'MongoNetworkError',
  'MongoNetworkTimeoutError',
]);

const isDatabaseAvailabilityError = (error: HttpError) =>
  databaseErrorNames.has(error.name) && (
    error.message.includes('buffering timed out') ||
    error.message.includes('connect') ||
    error.message.includes('server selection')
  );

export const errorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = Number.isInteger(err.statusCode)
    ? err.statusCode!
    : Number.isInteger(err.status)
      ? err.status!
      : 500;
  const isProduction = config.nodeEnv === 'production';
  const safeMessage = err.message ? sanitizeLogValue(err.message) : 'Internal server error';
  const origin = req.headers.origin as string | undefined;

  const send = (statusCode: number, data: unknown) => {
    setCorsErrorHeaders(res, origin);
    res.status(statusCode).json(data);
  };

  if (err instanceof DatabaseConnectionError || isDatabaseAvailabilityError(err)) {
    console.error('Database request failed:', {
      name: err.name,
      message: safeMessage,
      path: req.originalUrl,
    });
    return send(503, { success: false, message: 'Database connection error' });
  }

  if (err instanceof ZodError) {
    return send(400, {
      success: false,
      message: 'Validation failed',
      errors: err.errors.reduce((acc: Record<string, string>, item) => {
        acc[item.path.join('.')] = item.message;
        return acc;
      }, {}),
    });
  }

  if (err.name === 'ValidationError') {
    return send(400, {
      success: false,
      message: 'Validation failed',
      errors: Object.keys(err.errors || {}).reduce((acc: Record<string, string>, key) => {
        acc[key] = err.errors?.[key]?.message || 'Invalid value';
        return acc;
      }, {}),
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return send(409, { success: false, message: `${field} already exists` });
  }

  if (err.name === 'CastError') {
    return send(400, { success: false, message: 'Invalid ID format' });
  }

  if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
    return send(400, { success: false, message: 'Invalid JSON body' });
  }

  if (status >= 500) {
    console.error(`Unhandled API error [${req.method} ${req.originalUrl}]:`, {
      name: err.name,
      message: safeMessage,
    });
  }

  return send(status, {
    success: false,
    message: status === 500 && isProduction ? 'Internal server error' : safeMessage,
  });
};
