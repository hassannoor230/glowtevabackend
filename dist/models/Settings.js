"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Media = exports.BlogPost = exports.HeroSection = exports.PaymentSettings = exports.SiteSettings = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const siteSettingsSchema = new mongoose_1.Schema({
    name: { type: String, default: 'GlowTeva Organics' },
    tagline: { type: String, default: 'Pure by Nature. Luxury by Choice.' },
    description: String,
    logo: String,
    favicon: String,
    contactEmail: String,
    contactPhone: String,
    address: String,
    socialLinks: {
        instagram: String,
        facebook: String,
        twitter: String,
        pinterest: String,
        youtube: String,
        tiktok: String,
    },
    seo: {
        metaTitle: String,
        metaDescription: String,
        ogImage: String,
    },
}, { timestamps: true });
const paymentSettingsSchema = new mongoose_1.Schema({
    codEnabled: { type: Boolean, default: true },
    bankTransferEnabled: { type: Boolean, default: true },
    jazzcashEnabled: { type: Boolean, default: true },
    easypaisaEnabled: { type: Boolean, default: true },
    bankTransfer: {
        bankName: { type: String, default: '' },
        accountTitle: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        iban: { type: String, default: '' },
        branch: { type: String, default: '' },
        instructions: { type: String, default: '' },
    },
    jazzcash: {
        accountName: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        instructions: { type: String, default: '' },
    },
    easypaisa: {
        accountName: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        instructions: { type: String, default: '' },
    },
    generalInstructions: { type: String, default: '' },
}, { timestamps: true });
const heroSectionSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    subtitle: String,
    description: String,
    image: String,
    ctaText: { type: String, default: 'Shop Now' },
    ctaLink: { type: String, default: '/shop' },
    position: { type: Number, default: 0 },
    active: { type: Boolean, default: false },
}, { timestamps: true });
const blogPostSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: String,
    content: String,
    featuredImage: String,
    author: String,
    tags: [String],
    published: { type: Boolean, default: false },
    publishedAt: Date,
}, { timestamps: true });
const mediaSchema = new mongoose_1.Schema({
    url: { type: String, required: true },
    alt: String,
    type: { type: String, enum: ['image', 'video'], required: true },
    folder: { type: String, default: 'general' },
    size: { type: Number, required: true },
}, { timestamps: true });
exports.SiteSettings = mongoose_1.default.model('SiteSettings', siteSettingsSchema);
exports.PaymentSettings = mongoose_1.default.model('PaymentSettings', paymentSettingsSchema);
exports.HeroSection = mongoose_1.default.model('HeroSection', heroSectionSchema);
exports.BlogPost = mongoose_1.default.model('BlogPost', blogPostSchema);
exports.Media = mongoose_1.default.model('Media', mediaSchema);
//# sourceMappingURL=Settings.js.map