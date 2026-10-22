import express from 'express';
import {
  getCoupons,
  createCoupon,
  deleteCoupon,
  validateCoupon,
} from './coupon.controller.js';
import { protect, authorizeRoles } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Public validation endpoint for storefront checkout & cart drawer
router.post('/validate', validateCoupon);

// Admin-managed coupon routes (Guarded: Admin only)
router.get('/', protect, authorizeRoles('admin', 'super_admin', 'tailor_admin'), getCoupons);
router.post('/', protect, authorizeRoles('admin', 'super_admin', 'tailor_admin'), createCoupon);
router.delete('/:id', protect, authorizeRoles('admin', 'super_admin', 'tailor_admin'), deleteCoupon);

export default router;
