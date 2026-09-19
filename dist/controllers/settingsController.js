"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentSettings = exports.getPaymentSettings = exports.updateBlogSettings = exports.updateHeroSettings = exports.updateSiteSettings = exports.getSettings = void 0;
const Settings_js_1 = require("../models/Settings.js");
const asyncHandler_js_1 = require("../utils/asyncHandler.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
exports.getSettings = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const [siteSettings, heroSections, blogPosts, media] = await Promise.all([
        Settings_js_1.SiteSettings.findOne().lean(),
        Settings_js_1.HeroSection.find().sort({ position: 1 }).lean(),
        Settings_js_1.BlogPost.find().sort({ createdAt: -1 }).limit(50).lean(),
        Settings_js_1.Media.find().sort({ createdAt: -1 }).limit(100).lean(),
    ]);
    return (0, apiResponse_js_1.success)(res, {
        site: siteSettings || {
            name: 'GlowTeva Organics',
            tagline: 'Pure by Nature. Luxury by Choice.',
            description: '',
            logo: '',
            favicon: '',
            contactEmail: '',
            contactPhone: '',
            address: '',
            socialLinks: {
                instagram: '',
                facebook: '',
                twitter: '',
                pinterest: '',
                youtube: '',
                tiktok: '',
            },
            seo: {
                metaTitle: '',
                metaDescription: '',
                ogImage: '',
            },
        },
        hero: heroSections || [],
        blog: blogPosts || [],
        media: media || [],
    });
});
exports.updateSiteSettings = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    let settings = await Settings_js_1.SiteSettings.findOne();
    if (settings) {
        settings = await Settings_js_1.SiteSettings.findOneAndUpdate({}, req.body, { new: true, runValidators: true });
    }
    else {
        settings = await Settings_js_1.SiteSettings.create(req.body);
    }
    return (0, apiResponse_js_1.success)(res, settings, 'Site settings updated successfully');
});
exports.updateHeroSettings = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const heroSections = req.body;
    await Settings_js_1.HeroSection.deleteMany({});
    if (heroSections.length > 0) {
        await Settings_js_1.HeroSection.insertMany(heroSections);
    }
    const updated = await Settings_js_1.HeroSection.find().sort({ position: 1 }).lean();
    return (0, apiResponse_js_1.success)(res, updated, 'Hero sections updated successfully');
});
exports.updateBlogSettings = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    return (0, apiResponse_js_1.success)(res, req.body, 'Blog settings updated successfully');
});
exports.getPaymentSettings = (0, asyncHandler_js_1.asyncHandler)(async (_req, res) => {
    const settings = await Settings_js_1.PaymentSettings.findOne().lean();
    return (0, apiResponse_js_1.success)(res, settings || await Settings_js_1.PaymentSettings.create({}));
});
exports.updatePaymentSettings = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const settings = await Settings_js_1.PaymentSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
    return (0, apiResponse_js_1.success)(res, settings, 'Payment settings updated successfully');
});
//# sourceMappingURL=settingsController.js.map