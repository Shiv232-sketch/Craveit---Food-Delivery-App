const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String, required: [true, 'Name is required'], trim: true, maxlength: 50
  },
  email: {
    type: String, required: [true, 'Email is required'],
    unique: true, lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String, required: [true, 'Password is required'], minlength: 6, select: false
  },
  phone: { type: String, match: [/^\d{10}$/, 'Enter valid 10-digit phone'] },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  addresses: [{
    type:    { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
    flat:    String,
    area:    String,
    city:    String,
    state:   String,
    pincode: String,
    isDefault: { type: Boolean, default: false }
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
