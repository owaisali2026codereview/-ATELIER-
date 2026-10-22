import express from 'express';
import { createOrder, getOrder, getMyOrders } from './order.controller.js';
import { protect, optionalAuth } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', optionalAuth, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:orderNumber', optionalAuth, getOrder);

export default router;
