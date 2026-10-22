import express from 'express';
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from './notification.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyNotifications);
router.patch('/read-all', markAllNotificationsRead);
router.patch('/:id/read', markNotificationRead);

export default router;
