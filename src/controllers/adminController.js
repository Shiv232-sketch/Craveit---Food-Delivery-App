const Order = require('../models/Order');
const User = require('../models/User');
const { MenuItem } = require('../models/Menu');

// @GET /api/admin/dashboard  (admin)
exports.getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, todayOrders, totalUsers, totalItems, activeOrders, revenue] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ role: 'customer' }),
      MenuItem.countDocuments({ isAvailable: true }),
      Order.countDocuments({ status: { $in: ['placed','confirmed','preparing','pickup'] } }),
      Order.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$pricing.grandTotal' } } }
      ]),
    ]);

    const todayRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: today }, 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$pricing.grandTotal' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        todayOrders,
        totalUsers,
        totalItems,
        activeOrders,
        totalRevenue: revenue[0]?.total || 0,
        todayRevenue: todayRevenue[0]?.total || 0,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/admin/orders  (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Order.countDocuments(filter);
    res.json({ success: true, orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/admin/users  (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
