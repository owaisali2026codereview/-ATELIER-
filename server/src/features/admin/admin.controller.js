import {
  fetchDashboardMetrics,
  fetchAllDossiers,
  updateDossierFeasibility,
  fetchAllOrders,
  updateOrderFulfillment,
} from './admin.service.js';
import { Product } from '../products/product.model.js';
import { createProductInDb, updateProductInDb, deleteProductInDb } from '../products/product.service.js';
import { User } from '../auth/user.model.js';
import { dispatchNotification } from '../notifications/notification.service.js';

export const getDashboardMetrics = async (req, res, next) => {
  try {
    const metrics = await fetchDashboardMetrics();
    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

export const getDossiersQueue = async (req, res, next) => {
  try {
    const dossiers = await fetchAllDossiers(req.query.status);
    res.status(200).json({
      success: true,
      count: dossiers.length,
      data: dossiers,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDossierQuote = async (req, res, next) => {
  try {
    const dossier = await updateDossierFeasibility(req.params.id, req.body);

    if (dossier.user) {
      await dispatchNotification({
        user: dossier.user._id || dossier.user,
        recipientRole: 'customer',
        title: `Quotation Ready for Dossier ${dossier.referenceCode}`,
        message: `Your bespoke creation has been priced at Rs. ${dossier.officialQuoteAmount?.toLocaleString() || 'N/A'}. Tailor note: "${dossier.tailorNotes || 'Feasibility confirmed.'}"`,
        type: 'quote',
        referenceId: dossier.referenceCode,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Master tailor quotation & feasibility status updated.',
      data: dossier,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrdersLog = async (req, res, next) => {
  try {
    const orders = await fetchAllOrders(req.query.status);
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingCode } = req.body;
    const order = await updateOrderFulfillment(req.params.id, status, trackingCode);

    if (order.user) {
      const stageDescriptions = {
        garment_inspection: 'Quality Inspection — Master artisan inspection of seams & handwork underway.',
        pressing: 'Finishing & Pressing — Silk steamed, lined, and prepared in archival garment box.',
        dispatched: `Dispatched for White-Glove Delivery. Tracking: ${order.trackingCode || 'DHL-EXP'}`,
        delivered: 'Delivered — Arrived with courier protocol.',
      };

      await dispatchNotification({
        user: order.user._id || order.user,
        recipientRole: 'customer',
        title: `Order #${order.orderNumber} Status: ${order.fulfillmentStatus.replace('_', ' ').toUpperCase()}`,
        message: stageDescriptions[order.fulfillmentStatus] || `Your order status has progressed to ${order.fulfillmentStatus}.`,
        type: 'status_update',
        referenceId: order.orderNumber,
      });
    }

    res.status(200).json({
      success: true,
      message: `Order status advanced to '${order.fulfillmentStatus}'.`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await createProductInDb(req.body);
    res.status(201).json({
      success: true,
      message: 'New archival garment created in catalog.',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await updateProductInDb(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Garment specifications and inventory updated.',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await deleteProductInDb(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Garment removed from catalog archive.',
    });
  } catch (error) {
    next(error);
  }
};

export const getPatrons = async (req, res, next) => {
  try {
    const patrons = await User.find({ role: 'customer' }).select('-password');
    res.status(200).json({
      success: true,
      count: patrons.length,
      data: patrons,
    });
  } catch (error) {
    next(error);
  }
};
