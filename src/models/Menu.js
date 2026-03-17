const mongoose = require('mongoose');

// ── Category ──
const categorySchema = new mongoose.Schema({
  name:      { type: String, required: true, unique: true, trim: true },
  image:     { type: String, default: '' },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

// ── Menu Item ──
const menuItemSchema = new mongoose.Schema({
  name: {
    type: String, required: [true, 'Item name is required'], trim: true
  },
  description: { type: String, required: true, maxlength: 300 },
  price:       { type: Number, required: [true, 'Price is required'], min: 0 },
  category: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true
  },
  image:       { type: String, default: '' },
  emoji:       { type: String, default: '🍽️' },
  isVeg:       { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  ratings: {
    average: { type: Number, default: 0 },
    count:   { type: Number, default: 0 }
  },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
const MenuItem  = mongoose.model('MenuItem', menuItemSchema);

module.exports = { Category, MenuItem };
