import express from 'express';
import { getSettings, updateSettings } from './setting.controller.js';
import { protect, authorizeRoles } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Public: allows storefront to fetch store phone, contact email, and active gateways
router.get('/', getSettings);

// Guarded: only authenticated administrators can update settings
router.put('/', protect, authorizeRoles('admin', 'super_admin', 'tailor_admin'), updateSettings);

export default router;
