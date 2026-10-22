import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  getProducts,
  getProduct,
  getCategorySummary,
  getProductReviews,
  createProductReview,
} from './product.controller.js';
import { optionalAuth } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Strict Rate Limiter for Review Submissions (Anti-Spam)
const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 reviews per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many critiques submitted from this network. Please allow 15 minutes before submitting again.',
  },
});

router.get('/', getProducts);
router.get('/categories/summary', getCategorySummary);
router.get('/:idOrSlug', getProduct);

// Reviews endpoints
router.get('/:idOrSlug/reviews', getProductReviews);
router.post('/:idOrSlug/reviews', reviewLimiter, optionalAuth, createProductReview);

export default router;
