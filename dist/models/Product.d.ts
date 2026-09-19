import mongoose, { Document } from 'mongoose';
export interface IProduct extends Document {
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    compareAtPrice?: number;
    category: string;
    productType: string;
    skinConcerns: string[];
    ingredients: string[];
    benefits: string[];
    howToUse: string;
    images: string[];
    thumbnail: string;
    stock: number;
    sku: string;
    rating: number;
    reviewCount: number;
    featured: boolean;
    bestSeller: boolean;
    newArrival: boolean;
    tags: string[];
    options: IProductOption[];
    variants: IProductVariant[];
    status: 'active' | 'draft' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}
export interface IProductOption {
    name: string;
    values: string[];
}
export interface IProductVariant {
    _id?: mongoose.Types.ObjectId;
    sku: string;
    options: Record<string, string>;
    price?: number;
    compareAtPrice?: number;
    stock: number;
    lowStockThreshold: number;
    weight?: string;
    image?: string;
    images: string[];
    barcode?: string;
    status: 'active' | 'inactive' | 'out_of_stock';
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const Product: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, {}> & IProduct & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Product.d.ts.map