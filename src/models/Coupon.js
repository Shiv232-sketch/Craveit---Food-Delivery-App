const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code:          { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType:  { type: String, enum: ['percentage', 'flat'], required: true },
  discountValue: { type: Number, required: true, min: 1 },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount:   { type: Number, default: null }, // cap for percentage discount
  usageLimit:    { type: Number, default: null }, // null = unlimited
  usedCount:     { type: Number, default: 0 },
  expiryDate:    { type: Date, required: true },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true });

// Check if coupon is valid
couponSchema.methods.isValid = function (orderAmount) {
  if (!this.isActive) return { valid: false, message: 'Coupon is inactive' };
  if (new Date() > this.expiryDate) return { valid: false, message: 'Coupon has expired' };
  if (this.usageLimit && this.usedCount >= this.usageLimit) return { valid: false, message: 'Coupon usage limit reached' };
  if (orderAmount < this.minOrderValue) return { valid: false, message: `Minimum order ₹${this.minOrderValue} required` };
  return { valid: true };
};

// Calculate discount
couponSchema.methods.calculateDiscount = function (orderAmount) {
  let discount = this.discountType === 'percentage'
    ? (orderAmount * this.discountValue) / 100
    : this.discountValue;
  if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount);
  return Math.round(discount);
};

module.exports = mongoose.model('Coupon', couponSchema);
