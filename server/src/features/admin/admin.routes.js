import express from 'express';
import {
  getDashboardMetrics,
  getDossiersQueue,
  updateDossierQuote,
  getOrdersLog,
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  getPatrons,
} from './admin.controller.js';
import { protect, authorizeRoles } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Apply authentication and admin role verification
router.use(protect);
router.use(authorizeRoles('admin', 'tailor_admin', 'super_admin'));

router.get('/dashboard-metrics', getDashboardMetrics);
router.get('/custom-dossiers', getDossiersQueue);
router.patch('/custom-dossiers/:id/quote', updateDossierQuote);
router.get('/orders', getOrdersLog);
router.patch('/orders/:id/status', updateOrderStatus);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/patrons', getPatrons);

export default router;
