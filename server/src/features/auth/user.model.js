import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  isDefault: { type: Boolean, default: false },
  label: { type: String, default: 'Primary Residence' },
  street: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: 'Pakistan' },
});

const measurementsSchema = new mongoose.Schema({
  bustChest: Number,
  naturalWaist: Number,
  hips: Number,
  shoulderWidth: Number,
  height: String,
  unit: { type: String, enum: ['in', 'cm'], default: 'in' },
  lastUpdated: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['customer', 'admin', 'tailor_admin', 'super_admin'],
      default: 'customer',
    },
    vipTier: {
      type: String,
      enum: ['Standard', 'Silver Thread', 'Gold Needle'],
      default: 'Standard',
    },
    phone: { type: String, default: '' },
    addresses: [addressSchema],
    measurementsProfile: measurementsSchema,
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
