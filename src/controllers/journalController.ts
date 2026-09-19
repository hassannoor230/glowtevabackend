import { Journal } from '../models/Journal.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/apiResponse.js';
import { slugify } from '../utils/slugify.js';
import { AuthRequest } from '../middleware/auth.js';

export const getJournals = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 9;
  const category = req.query.category as string;
  const filter: any = { published: true };
  if (category) filter.category = category;

  const [journals, total] = await Promise.all([
    Journal.find(filter).sort({ publishedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Journal.countDocuments(filter),
  ]);

  return success(res, {
    journals,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getJournalBySlug = asyncHandler(async (req, res) => {
  const journal = await Journal.findOne({ slug: req.params.slug, published: true }).lean();
  if (!journal) return error(res, 'Article not found', 404);
  return success(res, journal);
});

export const getFeaturedJournals = asyncHandler(async (req, res) => {
  const journals = await Journal.find({ published: true, featured: true }).limit(3).lean();
  return success(res, journals);
});

export const createJournal = asyncHandler(async (req: AuthRequest, res) => {
  const data = req.body;
  const slug = slugify(data.title);
  const journal = await Journal.create({
    ...data,
    slug,
    publishedAt: data.published ? new Date() : undefined,
  });
  return success(res, journal, 'Article created', 201);
});

export const updateJournal = asyncHandler(async (req: AuthRequest, res) => {
  const data = req.body;
  if (data.title) data.slug = slugify(data.title);
  const journal = await Journal.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!journal) return error(res, 'Article not found', 404);
  return success(res, journal, 'Article updated');
});

export const deleteJournal = asyncHandler(async (req: AuthRequest, res) => {
  const journal = await Journal.findByIdAndDelete(req.params.id);
  if (!journal) return error(res, 'Article not found', 404);
  return success(res, null, 'Article deleted');
});
