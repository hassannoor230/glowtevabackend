import { SiteSettings, HeroSection, BlogPost, Media, PaymentSettings } from '../models/Settings.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/apiResponse.js';
import { AuthRequest } from '../middleware/auth.js';

export const getSettings = asyncHandler(async (req: AuthRequest, res) => {
  const [siteSettings, heroSections, blogPosts, media] = await Promise.all([
    SiteSettings.findOne().lean(),
    HeroSection.find().sort({ position: 1 }).lean(),
    BlogPost.find().sort({ createdAt: -1 }).limit(50).lean(),
    Media.find().sort({ createdAt: -1 }).limit(100).lean(),
  ]);

  return success(res, {
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

export const updateSiteSettings = asyncHandler(async (req: AuthRequest, res) => {
  let settings = await SiteSettings.findOne();
  if (settings) {
    settings = await SiteSettings.findOneAndUpdate({}, req.body, { new: true, runValidators: true });
  } else {
    settings = await SiteSettings.create(req.body);
  }
  return success(res, settings, 'Site settings updated successfully');
});

export const updateHeroSettings = asyncHandler(async (req: AuthRequest, res) => {
  const heroSections = req.body;
  await HeroSection.deleteMany({});
  if (heroSections.length > 0) {
    await HeroSection.insertMany(heroSections);
  }
  const updated = await HeroSection.find().sort({ position: 1 }).lean();
  return success(res, updated, 'Hero sections updated successfully');
});

export const updateBlogSettings = asyncHandler(async (req: AuthRequest, res) => {
  return success(res, req.body, 'Blog settings updated successfully');
});

export const getPaymentSettings = asyncHandler(async (_req: AuthRequest, res) => {
  const settings = await PaymentSettings.findOne().lean();
  return success(res, settings || await PaymentSettings.create({}));
});

export const updatePaymentSettings = asyncHandler(async (req: AuthRequest, res) => {
  const settings = await PaymentSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
  return success(res, settings, 'Payment settings updated successfully');
});