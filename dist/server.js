"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_js_1 = __importDefault(require("./app.js"));
const index_js_1 = require("./config/index.js");
const start = async () => {
    try {
        await mongoose_1.default.connect(index_js_1.config.mongodbUri);
        console.log('✓ MongoDB connected');
        app_js_1.default.listen(index_js_1.config.port, () => {
            console.log(`✓ GlowTeva server running on port ${index_js_1.config.port}`);
            console.log(`✓ Environment: ${index_js_1.config.nodeEnv}`);
        });
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map