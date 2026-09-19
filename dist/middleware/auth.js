"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.restrictTo = exports.protect = void 0;
const jwt_js_1 = require("../utils/jwt.js");
const User_js_1 = require("../models/User.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }
        if (!token) {
            return (0, apiResponse_js_1.error)(res, 'Not authorized. Please log in.', 401);
        }
        const decoded = (0, jwt_js_1.verifyAccessToken)(token);
        const user = await User_js_1.User.findById(decoded.userId).select('-password');
        if (!user || !user.isActive) {
            return (0, apiResponse_js_1.error)(res, 'User not found or inactive.', 401);
        }
        req.user = { userId: user._id.toString(), role: user.role };
        next();
    }
    catch (err) {
        return (0, apiResponse_js_1.error)(res, 'Invalid or expired token.', 401);
    }
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return (0, apiResponse_js_1.error)(res, 'You do not have permission to perform this action.', 403);
        }
        next();
    };
};
exports.restrictTo = restrictTo;
const optionalAuth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }
        if (token) {
            const decoded = (0, jwt_js_1.verifyAccessToken)(token);
            const user = await User_js_1.User.findById(decoded.userId).select('-password');
            if (user && user.isActive) {
                req.user = { userId: user._id.toString(), role: user.role };
            }
        }
    }
    catch {
        // ignore
    }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map