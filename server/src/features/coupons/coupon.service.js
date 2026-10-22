import mongoose from 'mongoose';
import { Coupon } from './coupon.model.js';

// Fallback in-memory coupon store seeded with luxury defaults
let memoryCoupons = [
  {
    _id: 'coup-1',
    code: 'SAVE10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 0,
    expiryDate: new Date('2026-12-31'),
    usageLimit: 100,
    usageCount: 45,
    isActive: true,
    createdAt: new Date(),
  },
  {
    _id: 'coup-2',
    code: 'WELCOME500',
    discountType: 'fixed',
    discountValue: 500,
    minOrderAmount: 3000,
    expiryDate: new Date('2026-12-31'),
    usageLimit: 500,
    usageCount: 120,
    isActive: true,
    createdAt: new Date(),
  },
  {
    _id: 'coup-3',
    code: 'ATELIER15',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 5000,
    expiryDate: new Date('2026-12-31'),
    usageLimit: 200,
    usageCount: 84,
    isActive: true,
    createdAt: new Date(),
  },
  {
    _id: 'coup-4',
    code: 'MAISONVIP',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 0,
    expiryDate: new Date('2026-12-31'),
    usageLimit: 500,
    usageCount: 12,
    isActive: true,
    createdAt: new Date(),
  },
];

export const getAllCouponsService = async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      const coupons = await Coupon.find().sort({ createdAt: -1 });
      if (coupons && coupons.length > 0) return coupons;
    } catch (e) {
      console.warn('[Coupons DB Fallback]:', e.message);
    }
  }
  return memoryCoupons;
};

export const createCouponService = async (couponData) => {
  const code = (couponData.code || '').trim().toUpperCase();
  if (!code) throw new Error('Coupon code is required.');

  // Parse discount: supports e.g. "15%" or 15 or "500"
  let discountType = couponData.discountType || 'percentage';
  let discountValue = Number(couponData.discountValue);

  if (typeof couponData.discount === 'string') {
    if (couponData.discount.includes('%')) {
      discountType = 'percentage';
      discountValue = parseFloat(couponData.discount.replace('%', ''));
    } else {
      discountType = 'fixed';
      discountValue = parseFloat(couponData.discount.replace(/[^\d.]/g, ''));
    }
  }

  if (isNaN(discountValue) || discountValue <= 0) {
    discountValue = 10;
  }

  const payload = {
    code,
    discountType,
    discountValue,
    minOrderAmount: Number(couponData.minOrderAmount) || 0,
    maxDiscountAmount: couponData.maxDiscountAmount ? Number(couponData.maxDiscountAmount) : null,
    expiryDate: couponData.expiryDate ? new Date(couponData.expiryDate) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    usageLimit: Number(couponData.usageLimit) || 100,
    usageCount: 0,
    isActive: true,
  };

  if (mongoose.connection.readyState === 1) {
    try {
      const existing = await Coupon.findOne({ code });
      if (existing) {
        throw new Error(`Coupon with code ${code} already exists.`);
      }
      return await Coupon.create(payload);
    } catch (e) {
      console.warn('[Coupons DB create fallback]:', e.message);
    }
  }

  // Memory fallback
  const exists = memoryCoupons.find((c) => c.code === code);
  if (exists) throw new Error(`Coupon with code ${code} already exists.`);
  const newCoup = {
    _id: `coup-${Date.now()}`,
    ...payload,
    createdAt: new Date(),
  };
  memoryCoupons.unshift(newCoup);
  return newCoup;
};

export const deleteCouponService = async (id) => {
  if (mongoose.connection.readyState === 1) {
    try {
      await Coupon.findByIdAndDelete(id);
    } catch (e) {
      console.warn('[Coupons DB delete fallback]:', e.message);
    }
  }
  memoryCoupons = memoryCoupons.filter((c) => c._id.toString() !== id.toString());
  return true;
};

export const validateCouponService = async (code, subtotal = 0) => {
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, message: 'Please provide a promo code.' };
  }

  let coupon = null;
  if (mongoose.connection.readyState === 1) {
    try {
      coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
    } catch (e) {
      console.warn('[Coupons DB find fallback]:', e.message);
    }
  }

  if (!coupon) {
    coupon = memoryCoupons.find((c) => c.code === cleanCode && c.isActive);
  }

  if (!coupon) {
    return { valid: false, message: 'Invalid or expired promotional code.' };
  }

  // Expiration check
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    return { valid: false, message: 'This promotional code has expired.' };
  }

  // Usage limit check
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, message: 'This promotional code has reached its maximum redemptions.' };
  }

  // Min order amount check
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order value of Rs. ${coupon.minOrderAmount.toLocaleString()} required for this voucher.`,
    };
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else {
    discountAmount = Math.min(coupon.discountValue, subtotal);
  }

  return {
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount: Math.round(discountAmount),
    message: `Voucher applied: ${coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `Rs. ${coupon.discountValue}`} discount.`,
  };
};
