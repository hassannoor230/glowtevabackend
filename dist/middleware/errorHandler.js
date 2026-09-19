"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../config/index.js");
const db_js_1 = require("../db.js");
const sanitizeLogValue = (value) => value.replace(/mongodb(?:\+srv)?:\/\/[^\s)]+/gi, 'mongodb://[redacted]');
const databaseErrorNames = new Set([
    'MongooseError',
    'MongoServerSelectionError',
    'MongoNetworkError',
    'MongoNetworkTimeoutError',
]);
const isDatabaseAvailabilityError = (error) => databaseErrorNames.has(error.name) && (error.message.includes('buffering timed out') ||
    error.message.includes('connect') ||
    error.message.includes('server selection'));
const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    const status = Number.isInteger(err.statusCode)
        ? err.statusCode
        : Number.isInteger(err.status)
            ? err.status
            : 500;
    const isProduction = index_js_1.config.nodeEnv === 'production';
    const safeMessage = err.message ? sanitizeLogValue(err.message) : 'Internal server error';
    if (err instanceof db_js_1.DatabaseConnectionError || isDatabaseAvailabilityError(err)) {
        console.error('Database request failed:', {
            name: err.name,
            message: safeMessage,
            path: req.originalUrl,
        });
        return res.status(503).json({
            success: false,
            message: 'Database connection error',
        });
    }
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: err.errors.reduce((acc, item) => {
                acc[item.path.join('.')] = item.message;
                return acc;
            }, {}),
        });
    }
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: Object.keys(err.errors || {}).reduce((acc, key) => {
                acc[key] = err.errors?.[key]?.message || 'Invalid value';
                return acc;
            }, {}),
        });
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || 'field';
        return res.status(409).json({
            success: false,
            message: `${field} already exists`,
        });
    }
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format',
        });
    }
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON body',
        });
    }
    if (status >= 500) {
        console.error(`Unhandled API error [${req.method} ${req.originalUrl}]:`, {
            name: err.name,
            message: safeMessage,
        });
    }
    return res.status(status).json({
        success: false,
        message: status === 500 && isProduction ? 'Internal server error' : safeMessage,
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map