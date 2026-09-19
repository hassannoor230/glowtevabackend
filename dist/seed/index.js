"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const index_js_1 = require("../config/index.js");
const User_js_1 = require("../models/User.js");
const Product_js_1 = require("../models/Product.js");
const Category_js_1 = require("../models/Category.js");
const Journal_js_1 = require("../models/Journal.js");
const Coupon_js_1 = require("../models/Coupon.js");
const products_js_1 = require("./products.js");
const resetSeed = process.env.SEED_RESET === 'true';
const categoryTree = [
    {
        name: 'Skin Care',
        slug: 'skin-care',
        description: 'Pure, plant-based skincare for radiant, healthy skin',
        order: 1,
        children: [
            { name: 'Face Wash', slug: 'face-wash', description: 'Gentle daily cleansers for fresh, clean skin', order: 1 },
            { name: 'Cleansers', slug: 'cleansers', description: 'Thorough yet gentle cleansing rituals', order: 2 },
            { name: 'Facial Oils', slug: 'facial-oils', description: 'Nourishing botanical oils for glow and softness', order: 3 },
            { name: 'Moisturizers', slug: 'moisturizers', description: 'Comforting creams and lotions for lasting hydration', order: 4 },
            { name: 'Serums', slug: 'serums', description: 'Targeted hydration and treatment layers for a healthy glow', order: 5 },
            { name: 'Face Masks', slug: 'face-masks', description: 'Weekly treatment masks for clarity and revival', order: 6 },
            { name: 'Toners', slug: 'toners', description: 'Refresh, prep, and rehydrate with soft botanical blends', order: 7 },
            { name: 'Scrubs', slug: 'scrubs', description: 'Gentle exfoliating scrubs for radiant skin', order: 8 },
            { name: 'Sunscreen', slug: 'sunscreen', description: 'Broad-spectrum sun protection for daily defense', order: 9 },
            { name: 'Acne Care', slug: 'acne-care', description: 'Targeted care for clear, balanced skin', order: 10 },
            { name: 'Anti-Aging', slug: 'anti-aging', description: 'Formulations to reduce the look of fine lines and wrinkles', order: 11 },
            { name: 'Dark Spot Care', slug: 'dark-spot-care', description: 'Brightening treatments for even skin tone', order: 12 },
            { name: 'Lip Care', slug: 'lip-care', description: 'Comforting daily nourishment for soft, protected lips', order: 13 },
        ],
    },
    {
        name: 'Hair Care',
        slug: 'hair-care',
        description: 'Plant-powered haircare for strength, shine, and scalp health',
        order: 2,
        children: [
            { name: 'Shampoos', slug: 'shampoos', description: 'Gentle cleansing for healthy, balanced hair', order: 1 },
            { name: 'Conditioners', slug: 'conditioners', description: 'Nourishing conditioners for soft, manageable hair', order: 2 },
            { name: 'Hair Oils', slug: 'hair-oils', description: 'Botanical oils for shine and strength', order: 3 },
            { name: 'Hair Serums', slug: 'hair-serums', description: 'Lightweight serums for frizz control and shine', order: 4 },
            { name: 'Hair Masks', slug: 'hair-masks', description: 'Intensive treatment masks for deep nourishment', order: 5 },
            { name: 'Hair Growth', slug: 'hair-growth', description: 'Formulations to support healthy hair growth', order: 6 },
            { name: 'Anti-Dandruff', slug: 'anti-dandruff', description: 'Care for a clean, balanced scalp', order: 7 },
            { name: 'Hair Fall Care', slug: 'hair-fall-care', description: 'Strengthening treatments to reduce hair fall', order: 8 },
            { name: 'Scalp Care', slug: 'scalp-care', description: 'Scalp treatments for a healthy foundation', order: 9 },
        ],
    },
    {
        name: 'Body Care',
        slug: 'body-care',
        description: 'Velvety nourishment for the full body ritual',
        order: 3,
        children: [
            { name: 'Body Wash', slug: 'body-wash', description: 'Gentle body cleansers for soft, fresh skin', order: 1 },
            { name: 'Body Scrubs', slug: 'body-scrubs', description: 'Exfoliating scrubs to polish and smooth', order: 2 },
            { name: 'Body Lotions', slug: 'body-lotions', description: 'Hydrating lotions for long-lasting moisture', order: 3 },
            { name: 'Body Oils', slug: 'body-oils', description: 'Rich body oils for deep nourishment and glow', order: 4 },
            { name: 'Hand & Foot Care', slug: 'hand-foot-care', description: 'Intensive care for hands and feet', order: 5 },
            { name: 'Bath Essentials', slug: 'bath-essentials', description: 'Luxurious bath products for relaxation', order: 6 },
            { name: 'Deodorants', slug: 'deodorants', description: 'Natural deodorants for all-day freshness', order: 7 },
        ],
    },
    {
        name: 'Oral Care',
        slug: 'oral-care',
        description: 'Pure, gentle oral care for a fresh, healthy smile',
        order: 4,
        children: [
            { name: 'Toothpaste', slug: 'toothpaste', description: 'Natural toothpastes for clean, fresh breath', order: 1 },
            { name: 'Tooth Powder', slug: 'tooth-powder', description: 'Mineral-rich tooth powders for gentle cleaning', order: 2 },
            { name: 'Mouthwash', slug: 'mouthwash', description: 'Alcohol-free mouthwashes for fresh breath', order: 3 },
            { name: 'Toothbrushes', slug: 'toothbrushes', description: 'Sustainable toothbrushes with plant-based bristles', order: 4 },
            { name: 'Gum Care', slug: 'gum-care', description: 'Products for healthy, protected gums', order: 5 },
            { name: 'Whitening Care', slug: 'whitening-care', description: 'Gentle whitening treatments for a brighter smile', order: 6 },
        ],
    },
    {
        name: 'Personal Care',
        slug: 'personal-care',
        description: 'Mindful personal care for body and spirit',
        order: 5,
        children: [
            { name: 'Feminine Care', slug: 'feminine-care', description: 'Gentle, natural feminine hygiene products', order: 1 },
            { name: 'Intimate Care', slug: 'intimate-care', description: 'Delicate intimate care for daily comfort', order: 2 },
            { name: 'Hygiene Products', slug: 'hygiene-products', description: 'Daily hygiene essentials made with care', order: 3 },
            { name: 'Hand Care', slug: 'hand-care', description: 'Nourishing hand care treatments and creams', order: 4 },
            { name: 'Foot Care', slug: 'foot-care', description: 'Revitalizing foot care for soft, smooth skin', order: 5 },
            { name: 'Shaving & Grooming', slug: 'shaving-grooming', description: 'Natural shaving and grooming essentials', order: 6 },
        ],
    },
    {
        name: 'Health & Wellness',
        slug: 'health-wellness',
        description: 'Plant-based wellness to support your whole-body health',
        order: 6,
        children: [
            { name: 'Vitamins & Minerals', slug: 'vitamins-minerals', description: 'Plant-based vitamins and mineral supplements', order: 1 },
            { name: 'Herbal Products', slug: 'herbal-products', description: 'Traditional herbal preparations for wellness', order: 2 },
            { name: 'Digestive Wellness', slug: 'digestive-wellness', description: 'Herbal support for healthy digestion', order: 3 },
            { name: 'Immunity Support', slug: 'immunity-support', description: 'Natural immune system boosters', order: 4 },
            { name: 'Energy & Vitality', slug: 'energy-vitality', description: 'Herbal energy and vitality supplements', order: 5 },
            { name: 'Sleep & Relaxation', slug: 'sleep-relaxation', description: 'Calming herbs for restful sleep', order: 6 },
            { name: 'General Wellness', slug: 'general-wellness', description: 'Daily wellness essentials', order: 7 },
            { name: 'Herbal & Natural Remedies', slug: 'herbal-remedies', description: 'Traditional herbal remedies for common ailments', order: 8 },
            { name: 'Herbal Oils', slug: 'herbal-oils', description: 'Infused herbal oils for topical and internal use', order: 9 },
            { name: 'Herbal Extracts', slug: 'herbal-extracts', description: 'Concentrated herbal extracts for maximum potency', order: 10 },
            { name: 'Natural Remedies', slug: 'natural-remedies', description: 'Gentle, natural solutions for everyday wellness', order: 11 },
            { name: 'Traditional Herbal Care', slug: 'traditional-herbal-care', description: 'Time-honored herbal formulations', order: 12 },
        ],
    },
    {
        name: 'Essential Oils & Natural Ingredients',
        slug: 'essential-oils-natural-ingredients',
        description: 'Pure, therapeutic-grade essential oils and natural botanical ingredients',
        order: 7,
        children: [
            { name: 'Essential Oils', slug: 'essential-oils', description: 'Therapeutic-grade essential oils for aromatherapy and topical use', order: 1 },
            { name: 'Natural Ingredients', slug: 'natural-ingredients', description: 'Single-origin botanical ingredients for DIY formulations', order: 2 },
        ],
    },
    {
        name: 'Baby & Mother Care',
        slug: 'baby-mother-care',
        description: 'Gentle, chemical-free care for baby and mother',
        order: 8,
        children: [
            { name: 'Baby Skin Care', slug: 'baby-skin-care', description: 'Delicate skincare for sensitive baby skin', order: 1 },
            { name: 'Baby Hair Care', slug: 'baby-hair-care', description: 'Gentle haircare for baby hair and scalp', order: 2 },
            { name: 'Baby Bath', slug: 'baby-bath', description: 'Nourishing, tear-free bath products', order: 3 },
            { name: 'Mother Care', slug: 'mother-care', description: 'Postnatal and daily care for mothers', order: 4 },
            { name: 'Baby Hygiene', slug: 'baby-hygiene', description: 'Gentle hygiene essentials for babies', order: 5 },
        ],
    },
    {
        name: "Men's Care",
        slug: 'mens-care',
        description: 'Thoughtful grooming for the modern man',
        order: 9,
        children: [
            { name: "Men's Skin Care", slug: 'mens-skin-care', description: 'Simple, effective skincare for men', order: 1 },
            { name: 'Beard Care', slug: 'beard-care', description: 'Natural beard oils and balms', order: 2 },
            { name: 'Hair Care', slug: 'mens-hair-care', description: 'Men\'s haircare for strength and style', order: 3 },
            { name: 'Shaving', slug: 'mens-shaving', description: 'Gentle, effective shaving essentials', order: 4 },
            { name: 'Grooming', slug: 'mens-grooming', description: 'Everyday grooming tools and products', order: 5 },
            { name: "Men's Wellness", slug: 'mens-wellness', description: 'Wellness support tailored for men', order: 6 },
        ],
    },
    {
        name: "Women's Care",
        slug: 'womens-care',
        description: 'Nurturing care crafted for women',
        order: 10,
        children: [
            { name: "Women's Skin Care", slug: 'womens-skin-care', description: 'Skincare formulated for women\'s unique needs', order: 1 },
            { name: 'Hair Care', slug: 'womens-hair-care', description: 'Haircare for strength and vitality', order: 2 },
            { name: 'Feminine Hygiene', slug: 'feminine-hygiene', description: 'Natural feminine hygiene essentials', order: 3 },
            { name: 'Body Care', slug: 'womens-body-care', description: 'Nourishing body care for soft, nourished skin', order: 4 },
            { name: "Women's Wellness", slug: 'womens-wellness', description: 'Wellness support crafted for women', order: 5 },
        ],
    },
    {
        name: 'Medical & Medicated Care',
        slug: 'medical-medicated-care',
        description: 'Therapeutic, medicated care for specific skin and health needs',
        order: 11,
        children: [
            { name: 'Acne & Blemish Care', slug: 'acne-blemish-care', description: 'Targeted treatments for breakouts and blemishes', order: 1 },
            { name: 'Eczema & Sensitive Skin', slug: 'eczema-sensitive-skin', description: 'Soothing care for eczema and sensitive skin', order: 2 },
            { name: 'Pain Relief', slug: 'pain-relief', description: 'Natural topical pain relief solutions', order: 3 },
            { name: 'Antiseptic Care', slug: 'antiseptic-care', description: 'Natural antiseptic preparations for minor cuts and scrapes', order: 4 },
            { name: 'Foot & Fungal Care', slug: 'foot-fungal-care', description: 'Treatments for healthy feet and fungal concerns', order: 5 },
            { name: 'First Aid', slug: 'first-aid', description: 'Essential first aid supplies and treatments', order: 6 },
            { name: 'Medicated Hair Care', slug: 'medicated-hair-care', description: 'Therapeutic hair treatments for scalp conditions', order: 7 },
            { name: 'Therapeutic Skin Care', slug: 'therapeutic-skin-care', description: 'Clinical-grade therapeutic skincare', order: 8 },
        ],
    },
    {
        name: 'Natural & Organic',
        slug: 'natural-organic',
        description: 'Certified organic and all-natural formulations',
        order: 12,
        children: [
            { name: 'Organic Oils', slug: 'organic-oils', description: 'Cold-pressed organic oils for skin and hair', order: 1 },
            { name: 'Organic Skincare', slug: 'organic-skincare', description: 'Certified organic skincare products', order: 2 },
            { name: 'Organic Haircare', slug: 'organic-haircare', description: 'Certified organic haircare products', order: 3 },
            { name: 'Organic Body Care', slug: 'organic-body-care', description: 'Certified organic body care products', order: 4 },
            { name: 'Natural Soaps', slug: 'natural-soaps', description: 'Handcrafted soaps made with natural ingredients', order: 5 },
            { name: 'Natural Extracts', slug: 'natural-extracts', description: 'Concentrated natural extracts for DIY or professional use', order: 6 },
            { name: 'Plant-Based Products', slug: 'plant-based-products', description: '100% plant-based beauty and wellness products', order: 7 },
        ],
    },
];
const journals = [
    {
        title: 'The Art of a Morning Ritual',
        slug: 'the-art-of-a-morning-ritual',
        excerpt: 'How a slower approach to morning skincare can transform not only your skin, but the way you begin each day.',
        content: `There is something profound about beginning the day with intention. At GlowTeva, we believe that skincare is not merely a sequence of products, but a ritual of care—a quiet moment claimed for yourself before the world asks for your attention.

The morning ritual begins with cleansing. Not the aggressive scrubbing of years past, but a gentle oil that dissolves the night’s residue while respecting the skin’s natural balance. Follow with a mist of rose and herbs, then a few drops of facial oil pressed into still-damp skin. Finish with cream if your skin asks for it.

This is not about perfection. It is about presence. About choosing ingredients that feel pure, textures that feel luxurious, and a pace that feels human.`,
        coverImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80',
        category: 'Rituals',
        tags: ['morning', 'routine', 'mindfulness'],
        author: 'GlowTeva Editorial',
        featured: true,
        published: true,
        publishedAt: new Date('2025-11-12'),
        readingTime: 4,
    },
    {
        title: 'Understanding Botanical Oils',
        slug: 'understanding-botanical-oils',
        excerpt: 'A guide to the oils we love—and why they belong in a modern beauty ritual.',
        content: `Botanical oils have been used for centuries to nourish and protect the skin. Today, we refine that tradition with careful sourcing and modern understanding of how different oils interact with different skin types.

Rosehip is rich in essential fatty acids and vitamin A precursors, making it a favorite for dull or mature skin. Jojoba closely resembles the skin’s own sebum, making it remarkably compatible. Argan brings deep nourishment without heaviness. Marula offers antioxidant support and a silky texture.

At GlowTeva, every oil is chosen not only for its botanical story, but for how it feels—and how it performs—on real skin.`,
        coverImage: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=1200&q=80',
        category: 'Ingredients',
        tags: ['oils', 'ingredients', 'education'],
        author: 'GlowTeva Editorial',
        featured: true,
        published: true,
        publishedAt: new Date('2025-10-28'),
        readingTime: 5,
    },
    {
        title: 'A Softer Approach to Beauty',
        slug: 'a-softer-approach-to-beauty',
        excerpt: 'Why we believe beauty should feel calm, intentional, and kind—to your skin and to the planet.',
        content: `Luxury does not require excess. It requires care. Care in the ingredients we select. Care in the way we formulate. Care in the experience of using a product—the weight of the bottle, the texture on the skin, the quiet moment of application.

GlowTeva was founded on the belief that organic beauty can be both pure and elevated. That feminine does not mean frivolous. That nature, refined, can become something extraordinary.

We do not chase trends. We refine rituals. We source with intention. We formulate for skin that deserves better than compromise.`,
        coverImage: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=1200&q=80',
        category: 'Philosophy',
        tags: ['philosophy', 'brand', 'sustainability'],
        author: 'GlowTeva Editorial',
        featured: true,
        published: true,
        publishedAt: new Date('2025-09-15'),
        readingTime: 3,
    },
    {
        title: 'Evening Care: The Ritual of Rest',
        slug: 'evening-care-the-ritual-of-rest',
        excerpt: 'How to close the day with a skincare ritual that prepares both skin and mind for rest.',
        content: `Evening is when the skin does its deepest repair work. Supporting that process with a thoughtful ritual is one of the kindest things you can do for your complexion—and for yourself.

Begin by removing the day: makeup, SPF, the accumulation of urban air. A cleansing oil does this with grace. Follow with toner or mist, then the richer treatments—oils, balms, creams—that your skin has earned. The goal is not to layer everything, but to choose what your skin needs on this particular night.

Dim the lights. Take your time. Let the ritual itself become a signal that the day is complete.`,
        coverImage: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200&q=80',
        category: 'Rituals',
        tags: ['evening', 'routine', 'rest'],
        author: 'GlowTeva Editorial',
        featured: false,
        published: true,
        publishedAt: new Date('2025-12-01'),
        readingTime: 4,
    },
    {
        title: 'Responsible Sourcing at GlowTeva',
        slug: 'responsible-sourcing-at-glowteva',
        excerpt: 'How we choose the ingredients that become our formulas—and the values that guide those choices.',
        content: `Every ingredient in a GlowTeva formula begins with a question: where does it come from, and under what conditions?

We prioritize suppliers who share our commitment to quality and care. We seek botanical materials that are cultivated with respect for the land and the communities involved. We favor recyclable packaging and thoughtful formulation practices that reduce unnecessary waste.

We do not claim perfection. We claim intention—and the ongoing work of improving how we source, formulate, and present every product that bears our name.`,
        coverImage: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80',
        category: 'Sustainability',
        tags: ['sourcing', 'sustainability', 'values'],
        author: 'GlowTeva Editorial',
        featured: false,
        published: true,
        publishedAt: new Date('2025-08-20'),
        readingTime: 4,
    },
];
const seed = async () => {
    try {
        await mongoose_1.default.connect(index_js_1.config.mongodbUri);
        console.log('Connected to MongoDB');
        if (resetSeed) {
            await Promise.all([
                User_js_1.User.deleteMany({}),
                Product_js_1.Product.deleteMany({}),
                Category_js_1.Category.deleteMany({}),
                Journal_js_1.Journal.deleteMany({}),
                Coupon_js_1.Coupon.deleteMany({}),
            ]);
            console.log('Cleared existing data');
        }
        const existingAdmin = await User_js_1.User.findOne({ email: index_js_1.config.adminEmail });
        if (!existingAdmin) {
            const admin = await User_js_1.User.create({
                name: 'GlowTeva Admin',
                email: index_js_1.config.adminEmail,
                password: index_js_1.config.adminPassword,
                role: 'admin',
            });
            console.log(`Admin created: ${admin.email}`);
        }
        else {
            console.log(`Admin already exists: ${existingAdmin.email}`);
        }
        const existingDemoUser = await User_js_1.User.findOne({ email: 'elena@example.com' });
        if (!existingDemoUser) {
            const demoUser = await User_js_1.User.create({
                name: 'Elena Rose',
                email: 'elena@example.com',
                password: 'DemoUser123!',
                role: 'user',
            });
            console.log(`Demo user created: ${demoUser.email}`);
        }
        else {
            console.log(`Demo user already exists: ${existingDemoUser.email}`);
        }
        const mainCategoriesData = categoryTree.map(({ children, ...main }) => main);
        const existingCategories = await Category_js_1.Category.find({
            slug: { $in: mainCategoriesData.map(category => category.slug) },
        });
        const categoryBySlug = new Map(existingCategories.map(category => [category.slug, category]));
        const missingMainCategories = mainCategoriesData.filter(category => !categoryBySlug.has(category.slug));
        const insertedMain = missingMainCategories.length > 0
            ? await Category_js_1.Category.insertMany(missingMainCategories)
            : [];
        for (const category of insertedMain) {
            categoryBySlug.set(category.slug, category);
        }
        const subCategoriesData = [];
        for (const main of categoryTree) {
            if (main.children) {
                for (const child of main.children) {
                    subCategoriesData.push({ ...child, parent: categoryBySlug.get(main.slug)?._id });
                }
            }
        }
        const existingSubCategories = await Category_js_1.Category.find({
            slug: { $in: subCategoriesData.map(category => category.slug) },
        });
        const existingSubCategorySlugs = new Set(existingSubCategories.map(category => category.slug));
        const missingSubCategories = subCategoriesData.filter(category => !existingSubCategorySlugs.has(category.slug));
        const insertedSubs = missingSubCategories.length > 0
            ? await Category_js_1.Category.insertMany(missingSubCategories)
            : [];
        console.log(`Created ${insertedMain.length} main categories and ${insertedSubs.length} subcategories`);
        const existingProductSlugs = new Set((await Product_js_1.Product.find({ slug: { $in: products_js_1.products.map(product => product.slug) } })
            .select('slug'))
            .map(product => product.slug));
        const productsToCreate = products_js_1.products.filter(product => !existingProductSlugs.has(product.slug));
        if (productsToCreate.length > 0) {
            await Product_js_1.Product.insertMany(productsToCreate);
        }
        console.log(`Created ${productsToCreate.length} products`);
        const existingJournalSlugs = new Set((await Journal_js_1.Journal.find({ slug: { $in: journals.map(journal => journal.slug) } })
            .select('slug'))
            .map(journal => journal.slug));
        const journalsToCreate = journals.filter(journal => !existingJournalSlugs.has(journal.slug));
        if (journalsToCreate.length > 0) {
            await Journal_js_1.Journal.insertMany(journalsToCreate);
        }
        console.log(`Created ${journalsToCreate.length} journal articles`);
        const couponData = [
            {
                code: 'GLOW10',
                type: 'percentage',
                value: 10,
                minimumOrder: 50,
                maxDiscount: 30,
                expiryDate: new Date('2027-12-31'),
                usageLimit: 1000,
                active: true,
            },
            {
                code: 'WELCOME15',
                type: 'percentage',
                value: 15,
                minimumOrder: 75,
                maxDiscount: 50,
                expiryDate: new Date('2027-12-31'),
                usageLimit: 500,
                active: true,
            },
        ];
        const existingCouponCodes = new Set((await Coupon_js_1.Coupon.find({ code: { $in: couponData.map(coupon => coupon.code) } })
            .select('code'))
            .map(coupon => coupon.code));
        const couponsToCreate = couponData.filter(coupon => !existingCouponCodes.has(coupon.code));
        if (couponsToCreate.length > 0) {
            await Coupon_js_1.Coupon.create(couponsToCreate);
        }
        console.log(`Created ${couponsToCreate.length} sample coupons`);
        console.log('\n✓ Seed completed successfully');
        console.log(`  Admin: ${index_js_1.config.adminEmail}`);
        console.log(`  Demo user: elena@example.com / DemoUser123!`);
        process.exit(0);
    }
    catch (err) {
        console.error('Seed failed:', err);
        process.exit(1);
    }
};
seed();
//# sourceMappingURL=index.js.map