const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    menuItem:  { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name:      String,
    price:     Number,
    emoji:     String,
    qty:       { type: Number, required: true, min: 1 },
    subtotal:  Number,
  }],
  deliveryAddress: {
    type:    { type: String, enum: ['Home', 'Work', 'Other'] },
    name:    String,
    phone:   String,
    flat:    String,
    area:    String,
    city:    String,
    state:   String,
    pincode: String,
    fullAddress: String,
  },
  pricing: {
    subtotal:    { type: Number, required: true },
    taxes:       { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    discount:    { type: Number, default: 0 },
    grandTotal:  { type: Number, required: true },
  },
  coupon: {
    code:          String,
    discountValue: Number,
  },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'preparing', 'pickup', 'delivered', 'cancelled'],
    default: 'placed',
  },
  statusHistory: [{
    status:    String,
    updatedAt: { type: Date, default: Date.now },
    note:      String,
  }],
  payment: {
    method:    { type: String, enum: ['card', 'upi', 'netbanking', 'wallet', 'cod'] },
    status:    { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    razorpayOrderId:   String,
    razorpayPaymentId: String,
    paidAt:    Date,
  },
  otp: {
    code:      String,
    expiresAt: Date,
    verified:  { type: Boolean, default: false },
  },
  rider: {
    name:  String,
    phone: String,
  },
  estimatedDelivery: Date,
  deliveredAt: Date,
}, { timestamps: true });

// Generate 6-digit OTP
orderSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp.code = otp;
  this.otp.expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min
  this.otp.verified = false;
  return otp;
};

module.exports = mongoose.model('Order', orderSchema);
