const Order = require('../models/Order');
const Coupon = require('../models/Coupon');

// @POST /api/orders/place  (protected)
exports.placeOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, payment, couponCode } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ success: false, message: 'No items in order' });

    // Calculate pricing
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const taxes = Math.round(subtotal * 0.05);
    const deliveryFee = subtotal > 300 ? 0 : 40;
    let discount = 0;
    let couponData = null;

    // Apply coupon
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        const validity = coupon.isValid(subtotal);
        if (validity.valid) {
          discount = coupon.calculateDiscount(subtotal);
          couponData = { code: coupon.code, discountValue: discount };
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    const grandTotal = subtotal + taxes + deliveryFee - discount;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: items.map(i => ({ ...i, subtotal: i.price * i.qty })),
      deliveryAddress,
      pricing: { subtotal, taxes, deliveryFee, discount, grandTotal },
      coupon: couponData,
      payment: { method: payment.method, status: 'pending' },
      statusHistory: [{ status: 'placed', note: 'Order placed by customer' }],
      estimatedDelivery: new Date(Date.now() + 35 * 60 * 1000), // 35 min
    });

    // Generate OTP
    const otp = order.generateOTP();
    await order.save();

    // Notify admin via Socket.io
    const io = req.app.get('io');
    io.to('admin_room').emit('new_order', {
      orderId: order._id,
      customerName: req.user.name,
      grandTotal,
      items: items.length,
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        _id: order._id,
        status: order.status,
        otp,
        grandTotal,
        estimatedDelivery: order.estimatedDelivery,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/orders/my-orders  (protected)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/orders/:id  (protected)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Only owner or admin can view
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Mask OTP from response — only show to owner
    const orderData = order.toObject();
    if (req.user.role !== 'admin') {
      orderData.otp = { verified: order.otp.verified }; // hide actual OTP from API (frontend stores it)
    }

    res.json({ success: true, order: orderData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/orders/:id/status  (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note, riderName, riderPhone } = req.body;
    const validStatuses = ['placed','confirmed','preparing','pickup','delivered','cancelled'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}` });

    if (status === 'pickup' && riderName) {
      order.rider = { name: riderName, phone: riderPhone || '' };
    }
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
    }

    await order.save();

    // Notify customer via Socket.io
    const io = req.app.get('io');
    io.to(`order_${order._id}`).emit('order_status_update', {
      orderId: order._id,
      status,
      rider: order.rider,
      message: note || `Your order is now: ${status}`,
    });

    res.json({ success: true, message: 'Order status updated!', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/orders/:id/verify-otp  (protected)
exports.verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.otp.verified) return res.json({ success: true, message: 'OTP already verified' });
    if (order.otp.code !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (new Date() > order.otp.expiresAt) return res.status(400).json({ success: false, message: 'OTP has expired' });

    order.otp.verified = true;
    order.status = 'delivered';
    order.deliveredAt = new Date();
    order.statusHistory.push({ status: 'delivered', note: 'OTP verified by rider' });
    await order.save();

    const io = req.app.get('io');
    io.to(`order_${order._id}`).emit('order_status_update', { orderId: order._id, status: 'delivered', message: '🎉 Order delivered!' });

    res.json({ success: true, message: 'OTP verified! Order marked as delivered.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/orders/refresh-otp/:id  (protected)
exports.refreshOTP = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const otp = order.generateOTP();
    await order.save();
    res.json({ success: true, otp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
