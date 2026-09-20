"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const index_js_1 = require("./config/index.js");
const index_js_2 = __importDefault(require("./routes/index.js"));
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const rateLimiter_js_1 = require("./middleware/rateLimiter.js");
const paymentController_js_1 = require("./controllers/paymentController.js");
const db_js_1 = require("./db.js");
const app = (0, express_1.default)();
app.disable('x-powered-by');
app.set('trust proxy', 1);
const allowedOrigins = [...new Set([...index_js_1.config.corsOrigins])];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            callback(null, true);
            return;
        }
        callback(null, allowedOrigins.includes(origin));
    },
    credentials: true,
    optionsSuccessStatus: 204,
    maxAge: 86400,
    preflightContinue: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, helmet_1.default)());
app.use(rateLimiter_js_1.generalLimiter);
app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'GlowTeva API is running',
        environment: index_js_1.config.nodeEnv,
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
        await (0, db_js_1.pingDatabase)();
        res.json({
            success: true,
            status: 'ok',
            message: 'Database is reachable',
        });
    }
    catch (error) {
        next(error);
    }
});
app.use('/api', async (_req, _res, next) => {
    try {
        await (0, db_js_1.connectDatabase)();
        next();
    }
    catch (error) {
        next(error instanceof db_js_1.DatabaseConnectionError ? error : new db_js_1.DatabaseConnectionError(undefined, error));
    }
});
app.post('/api/payments/webhook', express_1.default.raw({ type: 'application/json' }), paymentController_js_1.webhook);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, express_mongo_sanitize_1.default)());
app.use('/api', index_js_2.default);
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});
app.use(errorHandler_js_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map