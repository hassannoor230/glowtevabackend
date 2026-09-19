import mongoose, { Document } from 'mongoose';
export interface ISiteSettings extends Document {
    name: string;
    tagline: string;
    description: string;
    logo: string;
    favicon: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    socialLinks: {
        instagram: string;
        facebook: string;
        twitter: string;
        pinterest: string;
        youtube: string;
        tiktok: string;
    };
    seo: {
        metaTitle: string;
        metaDescription: string;
        ogImage: string;
    };
}
export interface IPaymentSettings extends Document {
    codEnabled: boolean;
    bankTransferEnabled: boolean;
    jazzcashEnabled: boolean;
    easypaisaEnabled: boolean;
    bankTransfer: {
        bankName: string;
        accountTitle: string;
        accountNumber: string;
        iban: string;
        branch: string;
        instructions: string;
    };
    jazzcash: {
        accountName: string;
        accountNumber: string;
        instructions: string;
    };
    easypaisa: {
        accountName: string;
        accountNumber: string;
        instructions: string;
    };
    generalInstructions: string;
}
export interface IHeroSection extends Document {
    title: string;
    subtitle: string;
    description: string;
    image: string;
    ctaText: string;
    ctaLink: string;
    position: number;
    active: boolean;
}
export interface IBlogPost extends Document {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    author: string;
    tags: string[];
    published: boolean;
    publishedAt?: Date;
}
export interface IMedia extends Document {
    url: string;
    alt: string;
    type: 'image' | 'video';
    folder: string;
    size: number;
}
export declare const SiteSettings: mongoose.Model<ISiteSettings, {}, {}, {}, mongoose.Document<unknown, {}, ISiteSettings, {}, {}> & ISiteSettings & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const PaymentSettings: mongoose.Model<IPaymentSettings, {}, {}, {}, mongoose.Document<unknown, {}, IPaymentSettings, {}, {}> & IPaymentSettings & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const HeroSection: mongoose.Model<IHeroSection, {}, {}, {}, mongoose.Document<unknown, {}, IHeroSection, {}, {}> & IHeroSection & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const BlogPost: mongoose.Model<IBlogPost, {}, {}, {}, mongoose.Document<unknown, {}, IBlogPost, {}, {}> & IBlogPost & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const Media: mongoose.Model<IMedia, {}, {}, {}, mongoose.Document<unknown, {}, IMedia, {}, {}> & IMedia & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Settings.d.ts.map