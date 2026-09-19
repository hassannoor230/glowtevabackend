import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Order } from '../models/Order.js';
import { Review } from '../models/Review.js';
import { User } from '../models/User.js';
import { SiteSettings, HeroSection, BlogPost, Media } from '../models/Settings.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/apiResponse.js';
import { AuthRequest } from '../middleware/auth.js';
import type { IUser } from '../models/User.js';
import { createNotification } from '../services/notificationService.js';

interface AuthUser {
  userId: string;
  role: string;
  _id?: string;
}

export const getDashboardStats = asyncHandler(async (req: AuthRequest, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalRevenue,
    ordersToday,
    newCustomers,
    totalProducts,
    lowStock,
    recentOrders,
    totalOrders,
    totalCustomers,
    ordersByStatus,
    revenueByCategory,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.countDocuments({ createdAt: { $gte: today } }),
    User.countDocuments({ createdAt: { $gte: today }, role: 'user' }),
    Product.countDocuments({ status: 'active' }),
    Product.find({ stock: { $lte: 10 }, status: 'active' }).select('name stock sku').limit(10).lean(),
    Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(8).lean(),
    Order.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.category', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, count: { $sum: '$items.quantity' } } },
      { $sort: { revenue: -1 } },
    ]),
  ]);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const revenueByMonth = await Order.aggregate([
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

  const topProducts = await Order.aggregate([
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

  return success(res, {
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

export const getAnalytics = asyncHandler(async (req: AuthRequest, res) => {
  const period = req.query.period as string || '30d';
  
  let dateFilter = {};
  const now = new Date();
  if (period === '7d') {
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    dateFilter = { createdAt: { $gte: sevenDaysAgo } };
  } else if (period === '30d') {
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    dateFilter = { createdAt: { $gte: thirtyDaysAgo } };
  } else if (period === '90d') {
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    dateFilter = { createdAt: { $gte: ninetyDaysAgo } };
  } else if (period === '1y') {
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    dateFilter = { createdAt: { $gte: oneYearAgo } };
  }

  const [
    totalRevenue,
    totalOrders,
    totalCustomers,
    avgOrderValue,
    conversionRate,
    revenueByPeriod,
    ordersByStatus,
    revenueByCategory,
    topProducts,
    topCustomers,
    trafficSources,
    deviceBreakdown,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { paymentStatus: 'paid', ...dateFilter } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.countDocuments(dateFilter),
    User.countDocuments({ role: 'user', ...dateFilter }),
    Order.aggregate([
      { $match: { paymentStatus: 'paid', ...dateFilter } },
      { $group: { _id: null, avg: { $avg: '$total' } } },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: 'paid', ...dateFilter } },
      { $group: { _id: null, rate: { $avg: 1 } } },
    ]),
    Order.aggregate([
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
    Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: 'paid', ...dateFilter } },
      { $unwind: '$items' },
      { $group: { _id: '$items.category', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, orders: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]),
    Order.aggregate([
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
    Order.aggregate([
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

  return success(res, {
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

export const getAdminProducts = asyncHandler(async (req: AuthRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const status = req.query.status as string;
  const category = req.query.category as string;

  const query: any = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }
  if (status && status !== 'all') query.status = status;
  if (category && category !== 'all') query.category = category;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  return success(res, {
    data: products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

export const getAdminProductById = asyncHandler(async (req: AuthRequest, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug').lean();
  if (!product) return error(res, 'Product not found', 404);
  return success(res, product);
});

export const createProduct = asyncHandler(async (req: AuthRequest, res) => {
  const product = await Product.create(req.body);
  return success(res, product, 'Product created successfully', 201);
});

export const updateProduct = asyncHandler(async (req: AuthRequest, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return error(res, 'Product not found', 404);
  return success(res, product, 'Product updated successfully');
});

export const deleteProduct = asyncHandler(async (req: AuthRequest, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return error(res, 'Product not found', 404);
  return success(res, null, 'Product deleted successfully');
});

export const updateProductStock = asyncHandler(async (req: AuthRequest, res) => {
  const { stock } = req.body;
  const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
  if (!product) return error(res, 'Product not found', 404);
  return success(res, product, 'Stock updated successfully');
});

export const getAdminCategories = asyncHandler(async (req: AuthRequest, res) => {
  const categories = await Category.find().sort({ order: 1 }).populate('parent', 'name slug').lean();
  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => {
      const productCount = await Product.countDocuments({
        category: { $in: [cat.name, cat.slug] },
      });
      return { ...cat, productCount };
    })
  );
  return success(res, categoriesWithCount);
});

export const createCategory = asyncHandler(async (req: AuthRequest, res) => {
  const category = await Category.create(req.body);
  return success(res, category, 'Category created successfully', 201);
});

export const updateCategory = asyncHandler(async (req: AuthRequest, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) return error(res, 'Category not found', 404);
  return success(res, category, 'Category updated successfully');
});

export const deleteCategory = asyncHandler(async (req: AuthRequest, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return error(res, 'Category not found', 404);
  return success(res, null, 'Category deleted successfully');
});

export const getAdminOrders = asyncHandler(async (req: AuthRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const status = req.query.status as string;
  const paymentStatus = req.query.paymentStatus as string;

  const query: any = {};
  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'user.name': { $regex: search, $options: 'i' } },
      { 'user.email': { $regex: search, $options: 'i' } },
    ];
  }
  if (status && status !== 'all') query.orderStatus = status;
  if (paymentStatus && paymentStatus !== 'all') query.paymentStatus = paymentStatus;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(query),
  ]);

  return success(res, {
    data: orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

export const getAdminOrderById = asyncHandler(async (req: AuthRequest, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone').populate('items.product').lean();
  if (!order) return error(res, 'Order not found', 404);
  return success(res, order);
});

export const updateOrder = asyncHandler(async (req: AuthRequest, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!order) return error(res, 'Order not found', 404);
  return success(res, order, 'Order updated successfully');
});

export const updateOrderStatus = asyncHandler(async (req: AuthRequest, res) => {
  const { orderStatus } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return error(res, 'Order not found', 404);
  order.orderStatus = orderStatus;
  order.statusHistory.push({ status: orderStatus, note: req.body.note, updatedBy: req.user!.userId as any, createdAt: new Date() });
  await order.save();
  await createNotification(order.user.toString(), {
    type: 'ORDER',
    title: 'Order status updated',
    message: `Order #${order.orderNumber} is now ${orderStatus.replaceAll('_', ' ').toLowerCase()}.`,
    link: `/account/orders/${order._id}/tracking`,
  });
  return success(res, order, 'Order status updated successfully');
});

export const updateOrderTracking = asyncHandler(async (req: AuthRequest, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return error(res, 'Order not found', 404);
  order.tracking = { ...order.tracking, ...req.body, estimatedDelivery: req.body.estimatedDelivery ? new Date(req.body.estimatedDelivery) : order.tracking?.estimatedDelivery };
  await order.save();
  await createNotification(order.user.toString(), {
    type: 'ORDER',
    title: 'Tracking information updated',
    message: `Tracking information for order #${order.orderNumber} has been updated.`,
    link: `/account/orders/${order._id}/tracking`,
  });
  return success(res, order, 'Tracking updated successfully');
});

export const getAdminReviews = asyncHandler(async (req: AuthRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const status = req.query.status as string;
  const rating = req.query.rating as string;

  const query: any = {};
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { text: { $regex: search, $options: 'i' } },
    ];
  }
  if (status && status !== 'all') query.status = status;
  if (rating && rating !== 'all') query.rating = parseInt(rating);

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('product', 'name slug images')
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Review.countDocuments(query),
  ]);

  return success(res, {
    data: reviews,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

export const updateReviewStatus = asyncHandler(async (req: AuthRequest, res) => {
  const { status } = req.body;
  const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!review) return error(res, 'Review not found', 404);
  return success(res, review, 'Review status updated successfully');
});

export const addReviewResponse = asyncHandler(async (req: AuthRequest, res) => {
  const { response } = req.body;
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { adminResponse: response, status: 'approved' },
    { new: true }
  );
  if (!review) return error(res, 'Review not found', 404);
  return success(res, review, 'Response added successfully');
});

export const getAdminUsers = asyncHandler(async (req: AuthRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const role = req.query.role as string;
  const isActive = req.query.isActive as string;

  const query: any = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role && role !== 'all') query.role = role;
  if (isActive && isActive !== 'all') query.isActive = isActive === 'active';

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  // Add order count and total spent for each user
  const usersWithStats = await Promise.all(
    users.map(async (user) => {
      const [orderCount, totalSpent] = await Promise.all([
        Order.countDocuments({ user: user._id }),
        Order.aggregate([
          { $match: { user: user._id, paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
      ]);
      return {
        ...user,
        orderCount,
        totalSpent: totalSpent[0]?.total || 0,
      };
    })
  );

  return success(res, {
    data: usersWithStats,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

export const updateUser = asyncHandler(async (req: AuthRequest, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password -refreshToken');
  if (!user) return error(res, 'User not found', 404);
  return success(res, user, 'User updated successfully');
});

export const updateUserStatus = asyncHandler(async (req: AuthRequest, res) => {
  const { isActive } = req.body;
  const authUser = req.user as AuthUser;
  if (req.params.id === authUser._id?.toString()) {
    return error(res, 'You cannot change your own status', 400);
  }
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password -refreshToken');
  if (!user) return error(res, 'User not found', 404);
  return success(res, user, 'User status updated successfully');
});

export const updateUserRole = asyncHandler(async (req: AuthRequest, res) => {
  const { role } = req.body;
  const authUser = req.user as AuthUser;
  if (req.params.id === authUser._id?.toString()) {
    return error(res, 'You cannot change your own role', 400);
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password -refreshToken');
  if (!user) return error(res, 'User not found', 404);
  return success(res, user, 'User role updated successfully');
});

export const getInventory = asyncHandler(async (req: AuthRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;
  const stockFilter = req.query.stockFilter as string;

  const query: any = { status: 'active' };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }
  if (stockFilter === 'out') query.stock = { $lte: 0 };
  else if (stockFilter === 'low') query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
  else if (stockFilter === 'ok') query.$expr = { $gt: ['$stock', '$lowStockThreshold'] };

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name')
      .sort({ stock: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  return success(res, {
    data: products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

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
  // For now, just return success. Full blog CRUD would be separate routes.
  return success(res, req.body, 'Blog settings updated successfully');
});