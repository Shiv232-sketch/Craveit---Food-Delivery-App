const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @POST /api/payment/create-order  (protected)
// Creates a Razorpay order before payment
exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees

    const options = {
      amount:   Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt:  `craveit_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/payment/verify  (protected)
// Verifies Razorpay payment signature after payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed!' });
    }

    // Update order payment status
    const order = await Order.findById(orderId);
    if (order) {
      order.payment.razorpayOrderId   = razorpay_order_id;
      order.payment.razorpayPaymentId = razorpay_payment_id;
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
      await order.save();
    }

    res.json({ success: true, message: 'Payment verified successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
