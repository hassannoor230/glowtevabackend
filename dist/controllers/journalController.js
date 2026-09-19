"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteJournal = exports.updateJournal = exports.createJournal = exports.getFeaturedJournals = exports.getJournalBySlug = exports.getJournals = void 0;
const Journal_js_1 = require("../models/Journal.js");
const asyncHandler_js_1 = require("../utils/asyncHandler.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
const slugify_js_1 = require("../utils/slugify.js");
exports.getJournals = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const category = req.query.category;
    const filter = { published: true };
    if (category)
        filter.category = category;
    const [journals, total] = await Promise.all([
        Journal_js_1.Journal.find(filter).sort({ publishedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        Journal_js_1.Journal.countDocuments(filter),
    ]);
    return (0, apiResponse_js_1.success)(res, {
        journals,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});
exports.getJournalBySlug = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const journal = await Journal_js_1.Journal.findOne({ slug: req.params.slug, published: true }).lean();
    if (!journal)
        return (0, apiResponse_js_1.error)(res, 'Article not found', 404);
    return (0, apiResponse_js_1.success)(res, journal);
});
exports.getFeaturedJournals = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const journals = await Journal_js_1.Journal.find({ published: true, featured: true }).limit(3).lean();
    return (0, apiResponse_js_1.success)(res, journals);
});
exports.createJournal = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const data = req.body;
    const slug = (0, slugify_js_1.slugify)(data.title);
    const journal = await Journal_js_1.Journal.create({
        ...data,
        slug,
        publishedAt: data.published ? new Date() : undefined,
    });
    return (0, apiResponse_js_1.success)(res, journal, 'Article created', 201);
});
exports.updateJournal = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const data = req.body;
    if (data.title)
        data.slug = (0, slugify_js_1.slugify)(data.title);
    const journal = await Journal_js_1.Journal.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!journal)
        return (0, apiResponse_js_1.error)(res, 'Article not found', 404);
    return (0, apiResponse_js_1.success)(res, journal, 'Article updated');
});
exports.deleteJournal = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const journal = await Journal_js_1.Journal.findByIdAndDelete(req.params.id);
    if (!journal)
        return (0, apiResponse_js_1.error)(res, 'Article not found', 404);
    return (0, apiResponse_js_1.success)(res, null, 'Article deleted');
});
//# sourceMappingURL=journalController.js.map