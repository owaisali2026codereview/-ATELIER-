import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  toggleWishlist,
  getWishlist,
  forgotPassword,
  resetPassword,
} from './auth.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/toggle', protect, toggleWishlist);

export default router;
