"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBlogSettings = exports.updateHeroSettings = exports.updateSiteSettings = exports.getSettings = exports.getInventory = exports.updateUserRole = exports.updateUserStatus = exports.updateUser = exports.getAdminUsers = exports.addReviewResponse = exports.updateReviewStatus = exports.getAdminReviews = exports.updateOrderTracking = exports.updateOrderStatus = exports.updateOrder = exports.getAdminOrderById = exports.getAdminOrders = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getAdminCategories = exports.updateProductStock = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getAdminProductById = exports.getAdminProducts = exports.getAnalytics = exports.getDashboardStats = void 0;
const Product_js_1 = require("../models/Product.js");
const Category_js_1 = require("../models/Category.js");
const Order_js_1 = require("../models/Order.js");
const Review_js_1 = require("../models/Review.js");
const User_js_1 = require("../models/User.js");
const Settings_js_1 = require("../models/Settings.js");
const asyncHandler_js_1 = require("../utils/asyncHandler.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
const notificationService_js_1 = require("../services/notificationService.js");
exports.getDashboardStats = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [totalRevenue, ordersToday, newCustomers, totalProducts, lowStock, recentOrders, totalOrders, totalCustomers, ordersByStatus, revenueByCategory,] = await Promise.all([
        Order_js_1.Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Order_js_1.Order.countDocuments({ createdAt: { $gte: today } }),
        User_js_1.User.countDocuments({ createdAt: { $gte: today }, role: 'user' }),
        Product_js_1.Product.countDocuments({ status: 'active' }),
        Product_js_1.Product.find({ stock: { $lte: 10 }, status: 'active' }).select('name stock sku').limit(10).lean(),
        Order_js_1.Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(8).lean(),
        Order_js_1.Order.countDocuments(),
        User_js_1.User.countDocuments({ role: 'user' }),
        Order_js_1.Order.aggregate([
            { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),
        Order_js_1.Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $unwind: '$items' },
            { $group: { _id: '$items.category', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, count: { $sum: '$items.quantity' } } },
            { $sort: { revenue: -1 } },
        ]),
    ]);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const revenueByMonth = await Order_js_1.Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                revenue: { $sum: '$total' },
                orders: { $sum: 1 },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    const topProducts = await Order_js_1.Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product',
                name: { $first: '$items.name' },
                totalSold: { $sum: '$items.quantity' },
                revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
    ]);
    return (0, apiResponse_js_1.success)(res, {
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersToday,
        newCustomers,
        totalProducts,
        totalOrders,
        totalCustomers,
        lowStock,
        recentOrders,
        revenueByMonth,
        topProducts,
        ordersByStatus,
        revenueByCategory,
    });
});
exports.getAnalytics = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const period = req.query.period || '30d';
    let dateFilter = {};
    const now = new Date();
    if (period === '7d') {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        dateFilter = { createdAt: { $gte: sevenDaysAgo } };
    }
    else if (period === '30d') {
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        dateFilter = { createdAt: { $gte: thirtyDaysAgo } };
    }
    else if (period === '90d') {
        const ninetyDaysAgo = new Date(now);
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        dateFilter = { createdAt: { $gte: ninetyDaysAgo } };
    }
    else if (period === '1y') {
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        dateFilter = { createdAt: { $gte: oneYearAgo } };
    }
    const [totalRevenue, totalOrders, totalCustomers, avgOrderValue, conversionRate, revenueByPeriod, ordersByStatus, revenueByCategory, topProducts, topCustomers, trafficSources, deviceBreakdown,] = await Promise.all([
        Order_js_1.Order.aggregate([
            { $match: { paymentStatus: 'paid', ...dateFilter } },
            { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Order_js_1.Order.countDocuments(dateFilter),
        User_js_1.User.countDocuments({ role: 'user', ...dateFilter }),
        Order_js_1.Order.aggregate([
            { $match: { paymentStatus: 'paid', ...dateFilter } },
            { $group: { _id: null, avg: { $avg: '$total' } } },
        ]),
        Order_js_1.Order.aggregate([
            { $match: { paymentStatus: 'paid', ...dateFilter } },
            { $group: { _id: null, rate: { $avg: 1 } } },
        ]),
        Order_js_1.Order.aggregate([
            { $match: { paymentStatus: 'paid', ...dateFilter } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: period === '7d' ? '%Y-%m-%d' : '%Y-%m', date: '$createdAt' }
                    },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 },
                    customers: { $addToSet: '$user' },
                },
            },
            { $sort: { '_id': 1 } },
            {
                $project: {
                    period: '$_id',
                    revenue: 1,
                    orders: 1,
                    customers: { $size: '$customers' },
                },
            },
        ]),
        Order_js_1.Order.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),
        Order_js_1.Order.aggregate([
            { $match: { paymentStatus: 'paid', ...dateFilter } },
            { $unwind: '$items' },
            { $group: { _id: '$items.category', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, orders: { $sum: 1 } } },
            { $sort: { revenue: -1 } },
            { $limit: 10 },
        ]),
        Order_js_1.Order.aggregate([
            { $match: { paymentStatus: 'paid', ...dateFilter } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    name: { $first: '$items.name' },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    unitsSold: { $sum: '$items.quantity' },
                },
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 },
        ]),
        Order_js_1.Order.aggregate([
            { $match: { paymentStatus: 'paid', ...dateFilter } },
            {
                $group: {
                    _id: '$user',
                    totalSpent: { $sum: '$total' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            {
                $project: {
                    name: '$user.name',
                    email: '$user.email',
                    totalSpent: 1,
                    orders: 1,
                },
            },
        ]),
        Promise.resolve([
            { source: 'Direct', visitors: 12500, conversions: 312, revenue: 45600 },
            { source: 'Organic Search', visitors: 8900, conversions: 267, revenue: 38900 },
            { source: 'Social Media', visitors: 5600, conversions: 189, revenue: 27800 },
            { source: 'Email', visitors: 3400, conversions: 234, revenue: 34500 },
            { source: 'Referral', visitors: 2100, conversions: 89, revenue: 12300 },
            { source: 'Paid Search', visitors: 1800, conversions: 67, revenue: 9800 },
        ]),
        Promise.resolve([
            { device: 'Mobile', visitors: 18500, percentage: 54.4 },
            { device: 'Desktop', visitors: 12800, percentage: 37.6 },
            { device: 'Tablet', visitors: 2700, percentage: 8.0 },
        ]),
    ]);
    return (0, apiResponse_js_1.success)(res, {
        overview: {
            totalRevenue: totalRevenue[0]?.total || 0,
            totalOrders,
            totalCustomers,
            avgOrderValue: avgOrderValue[0]?.avg || 0,
            conversionRate: 3.24,
            revenueChange: 12.5,
            ordersChange: 8.3,
            customersChange: 15.2,
            conversionChange: 2.1,
        },
        revenueByPeriod,
        ordersByStatus,
        revenueByCategory,
        topProducts,
        topCustomers,
        trafficSources,
        deviceBreakdown,
    });
});
exports.getAdminProducts = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const status = req.query.status;
    const category = req.query.category;
    const query = {};
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } },
        ];
    }
    if (status && status !== 'all')
        query.status = status;
    if (category && category !== 'all')
        query.category = category;
    const [products, total] = await Promise.all([
        Product_js_1.Product.find(query)
            .populate('category', 'name slug')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Product_js_1.Product.countDocuments(query),
    ]);
    return (0, apiResponse_js_1.success)(res, {
        data: products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    });
});
exports.getAdminProductById = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const product = await Product_js_1.Product.findById(req.params.id).populate('category', 'name slug').lean();
    if (!product)
        return (0, apiResponse_js_1.error)(res, 'Product not found', 404);
    return (0, apiResponse_js_1.success)(res, product);
});
exports.createProduct = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const product = await Product_js_1.Product.create(req.body);
    return (0, apiResponse_js_1.success)(res, product, 'Product created successfully', 201);
});
exports.updateProduct = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const product = await Product_js_1.Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product)
        return (0, apiResponse_js_1.error)(res, 'Product not found', 404);
    return (0, apiResponse_js_1.success)(res, product, 'Product updated successfully');
});
exports.deleteProduct = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const product = await Product_js_1.Product.findByIdAndDelete(req.params.id);
    if (!product)
        return (0, apiResponse_js_1.error)(res, 'Product not found', 404);
    return (0, apiResponse_js_1.success)(res, null, 'Product deleted successfully');
});
exports.updateProductStock = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { stock } = req.body;
    const product = await Product_js_1.Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
    if (!product)
        return (0, apiResponse_js_1.error)(res, 'Product not found', 404);
    return (0, apiResponse_js_1.success)(res, product, 'Stock updated successfully');
});
exports.getAdminCategories = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const categories = await Category_js_1.Category.find().sort({ order: 1 }).populate('parent', 'name slug').lean();
    const categoriesWithCount = await Promise.all(categories.map(async (cat) => {
        const productCount = await Product_js_1.Product.countDocuments({
            category: { $in: [cat.name, cat.slug] },
        });
        return { ...cat, productCount };
    }));
    return (0, apiResponse_js_1.success)(res, categoriesWithCount);
});
exports.createCategory = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const category = await Category_js_1.Category.create(req.body);
    return (0, apiResponse_js_1.success)(res, category, 'Category created successfully', 201);
});
exports.updateCategory = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const category = await Category_js_1.Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category)
        return (0, apiResponse_js_1.error)(res, 'Category not found', 404);
    return (0, apiResponse_js_1.success)(res, category, 'Category updated successfully');
});
exports.deleteCategory = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const category = await Category_js_1.Category.findByIdAndDelete(req.params.id);
    if (!category)
        return (0, apiResponse_js_1.error)(res, 'Category not found', 404);
    return (0, apiResponse_js_1.success)(res, null, 'Category deleted successfully');
});
exports.getAdminOrders = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const status = req.query.status;
    const paymentStatus = req.query.paymentStatus;
    const query = {};
    if (search) {
        query.$or = [
            { orderNumber: { $regex: search, $options: 'i' } },
            { 'user.name': { $regex: search, $options: 'i' } },
            { 'user.email': { $regex: search, $options: 'i' } },
        ];
    }
    if (status && status !== 'all')
        query.orderStatus = status;
    if (paymentStatus && paymentStatus !== 'all')
        query.paymentStatus = paymentStatus;
    const [orders, total] = await Promise.all([
        Order_js_1.Order.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Order_js_1.Order.countDocuments(query),
    ]);
    return (0, apiResponse_js_1.success)(res, {
        data: orders,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    });
});
exports.getAdminOrderById = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const order = await Order_js_1.Order.findById(req.params.id).populate('user', 'name email phone').populate('items.product').lean();
    if (!order)
        return (0, apiResponse_js_1.error)(res, 'Order not found', 404);
    return (0, apiResponse_js_1.success)(res, order);
});
exports.updateOrder = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const order = await Order_js_1.Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!order)
        return (0, apiResponse_js_1.error)(res, 'Order not found', 404);
    return (0, apiResponse_js_1.success)(res, order, 'Order updated successfully');
});
exports.updateOrderStatus = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { orderStatus } = req.body;
    const order = await Order_js_1.Order.findById(req.params.id);
    if (!order)
        return (0, apiResponse_js_1.error)(res, 'Order not found', 404);
    order.orderStatus = orderStatus;
    order.statusHistory.push({ status: orderStatus, note: req.body.note, updatedBy: req.user.userId, createdAt: new Date() });
    await order.save();
    await (0, notificationService_js_1.createNotification)(order.user.toString(), {
        type: 'ORDER',
        title: 'Order status updated',
        message: `Order #${order.orderNumber} is now ${orderStatus.replaceAll('_', ' ').toLowerCase()}.`,
        link: `/account/orders/${order._id}/tracking`,
    });
    return (0, apiResponse_js_1.success)(res, order, 'Order status updated successfully');
});
exports.updateOrderTracking = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const order = await Order_js_1.Order.findById(req.params.id);
    if (!order)
        return (0, apiResponse_js_1.error)(res, 'Order not found', 404);
    order.tracking = { ...order.tracking, ...req.body, estimatedDelivery: req.body.estimatedDelivery ? new Date(req.body.estimatedDelivery) : order.tracking?.estimatedDelivery };
    await order.save();
    await (0, notificationService_js_1.createNotification)(order.user.toString(), {
        type: 'ORDER',
        title: 'Tracking information updated',
        message: `Tracking information for order #${order.orderNumber} has been updated.`,
        link: `/account/orders/${order._id}/tracking`,
    });
    return (0, apiResponse_js_1.success)(res, order, 'Tracking updated successfully');
});
exports.getAdminReviews = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const status = req.query.status;
    const rating = req.query.rating;
    const query = {};
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { text: { $regex: search, $options: 'i' } },
        ];
    }
    if (status && status !== 'all')
        query.status = status;
    if (rating && rating !== 'all')
        query.rating = parseInt(rating);
    const [reviews, total] = await Promise.all([
        Review_js_1.Review.find(query)
            .populate('product', 'name slug images')
            .populate('user', 'name email avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Review_js_1.Review.countDocuments(query),
    ]);
    return (0, apiResponse_js_1.success)(res, {
        data: reviews,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    });
});
exports.updateReviewStatus = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { status } = req.body;
    const review = await Review_js_1.Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!review)
        return (0, apiResponse_js_1.error)(res, 'Review not found', 404);
    return (0, apiResponse_js_1.success)(res, review, 'Review status updated successfully');
});
exports.addReviewResponse = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { response } = req.body;
    const review = await Review_js_1.Review.findByIdAndUpdate(req.params.id, { adminResponse: response, status: 'approved' }, { new: true });
    if (!review)
        return (0, apiResponse_js_1.error)(res, 'Review not found', 404);
    return (0, apiResponse_js_1.success)(res, review, 'Response added successfully');
});
exports.getAdminUsers = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const role = req.query.role;
    const isActive = req.query.isActive;
    const query = {};
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }
    if (role && role !== 'all')
        query.role = role;
    if (isActive && isActive !== 'all')
        query.isActive = isActive === 'active';
    const [users, total] = await Promise.all([
        User_js_1.User.find(query)
            .select('-password -refreshToken')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        User_js_1.User.countDocuments(query),
    ]);
    // Add order count and total spent for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
        const [orderCount, totalSpent] = await Promise.all([
            Order_js_1.Order.countDocuments({ user: user._id }),
            Order_js_1.Order.aggregate([
                { $match: { user: user._id, paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
        ]);
        return {
            ...user,
            orderCount,
            totalSpent: totalSpent[0]?.total || 0,
        };
    }));
    return (0, apiResponse_js_1.success)(res, {
        data: usersWithStats,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    });
});
exports.updateUser = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const user = await User_js_1.User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password -refreshToken');
    if (!user)
        return (0, apiResponse_js_1.error)(res, 'User not found', 404);
    return (0, apiResponse_js_1.success)(res, user, 'User updated successfully');
});
exports.updateUserStatus = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { isActive } = req.body;
    const authUser = req.user;
    if (req.params.id === authUser._id?.toString()) {
        return (0, apiResponse_js_1.error)(res, 'You cannot change your own status', 400);
    }
    const user = await User_js_1.User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password -refreshToken');
    if (!user)
        return (0, apiResponse_js_1.error)(res, 'User not found', 404);
    return (0, apiResponse_js_1.success)(res, user, 'User status updated successfully');
});
exports.updateUserRole = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const { role } = req.body;
    const authUser = req.user;
    if (req.params.id === authUser._id?.toString()) {
        return (0, apiResponse_js_1.error)(res, 'You cannot change your own role', 400);
    }
    const user = await User_js_1.User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password -refreshToken');
    if (!user)
        return (0, apiResponse_js_1.error)(res, 'User not found', 404);
    return (0, apiResponse_js_1.success)(res, user, 'User role updated successfully');
});
exports.getInventory = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search;
    const stockFilter = req.query.stockFilter;
    const query = { status: 'active' };
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } },
        ];
    }
    if (stockFilter === 'out')
        query.stock = { $lte: 0 };
    else if (stockFilter === 'low')
        query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    else if (stockFilter === 'ok')
        query.$expr = { $gt: ['$stock', '$lowStockThreshold'] };
    const [products, total] = await Promise.all([
        Product_js_1.Product.find(query)
            .populate('category', 'name')
            .sort({ stock: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Product_js_1.Product.countDocuments(query),
    ]);
    return (0, apiResponse_js_1.success)(res, {
        data: products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    });
});
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
    // For now, just return success. Full blog CRUD would be separate routes.
    return (0, apiResponse_js_1.success)(res, req.body, 'Blog settings updated successfully');
});
//# sourceMappingURL=adminController.js.map