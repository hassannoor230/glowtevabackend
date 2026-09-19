"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js"));
const index_js_1 = require("./config/index.js");
const db_js_1 = require("./db.js");
const server = app_js_1.default.listen(index_js_1.config.port, () => {
    console.log(`GlowTeva server running on port ${index_js_1.config.port}`);
    console.log(`Environment: ${index_js_1.config.nodeEnv}`);
});
(0, db_js_1.connectDatabase)()
    .then(() => {
    console.log('MongoDB connected');
})
    .catch((error) => {
    console.error('MongoDB connection unavailable; health endpoints remain available:', error);
});
exports.default = server;
//# sourceMappingURL=server.js.map