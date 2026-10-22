import express from 'express';
import {
  submitInquiry,
  getInquiriesList,
  updateInquiry,
  deleteInquiryController,
} from './inquiry.controller.js';
import { protect, authorizeRoles, optionalAuth } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Public / client-facing endpoint to send email to official email address
router.post('/', optionalAuth, submitInquiry);

// Admin-facing endpoints to view, update, delete emails
router.get('/', protect, authorizeRoles('admin', 'super_admin', 'tailor_admin'), getInquiriesList);
router.patch('/:id/status', protect, authorizeRoles('admin', 'super_admin', 'tailor_admin'), updateInquiry);
router.delete('/:id', protect, authorizeRoles('admin', 'super_admin', 'tailor_admin'), deleteInquiryController);

export default router;
