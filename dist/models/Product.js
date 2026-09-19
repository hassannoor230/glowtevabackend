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
exports.Product = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const productOptionSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    values: { type: [String], required: true, validate: (values) => values.length > 0 },
}, { _id: false });
const productVariantSchema = new mongoose_1.Schema({
    sku: { type: String, required: true, trim: true },
    options: { type: mongoose_1.Schema.Types.Mixed, required: true },
    price: { type: Number, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, min: 0, default: 5 },
    weight: String,
    image: String,
    images: { type: [String], default: [] },
    barcode: String,
    status: { type: String, enum: ['active', 'inactive', 'out_of_stock'], default: 'active' },
}, { _id: true, timestamps: true });
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    category: { type: String, required: true, index: true },
    productType: { type: String, required: true, index: true },
    skinConcerns: [{ type: String }],
    ingredients: [{ type: String }],
    benefits: [{ type: String }],
    howToUse: { type: String, default: '' },
    images: [{ type: String }],
    thumbnail: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, unique: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    tags: [{ type: String, default: [] }],
    options: { type: [productOptionSchema], default: [] },
    variants: { type: [productVariantSchema], default: [] },
    status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' },
}, { timestamps: true });
productSchema.index({ name: 'text', description: 'text', ingredients: 'text' });
productSchema.index({ category: 1, productType: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1, bestSeller: 1, newArrival: 1 });
productSchema.index({ 'variants.sku': 1 });
exports.Product = mongoose_1.default.model('Product', productSchema);
//# sourceMappingURL=Product.js.map