import {
  getAllCouponsService,
  createCouponService,
  deleteCouponService,
  validateCouponService,
} from './coupon.service.js';

export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await getAllCouponsService();
    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const newCoupon = await createCouponService(req.body);
    res.status(201).json({
      success: true,
      data: newCoupon,
      message: 'Promotional coupon created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    await deleteCouponService(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    const result = await validateCouponService(code, Number(subtotal) || 0);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
