import express from 'express';
import {
  getCategories,
  createCategory,
  deleteCategory,
} from './category.controller.js';
import { protect, authorizeRoles } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Public: Catalog navigation can fetch categories
router.get('/', getCategories);

// Guarded: Admin only category creation & removal
router.post('/', protect, authorizeRoles('admin', 'super_admin', 'tailor_admin'), createCategory);
router.delete('/:id', protect, authorizeRoles('admin', 'super_admin', 'tailor_admin'), deleteCategory);

export default router;
