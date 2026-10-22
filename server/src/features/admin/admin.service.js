import mongoose from 'mongoose';
import { Order } from '../orders/order.model.js';
import { CustomRequest } from '../custom-studio/customRequest.model.js';
import { Product } from '../products/product.model.js';
import { User } from '../auth/user.model.js';
import { getAllOrdersAdmin } from '../orders/order.service.js';
import { memoryDossiers } from '../custom-studio/studio.service.js';

export const fetchDashboardMetrics = async () => {
  const totalRevenueAgg = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);
  const grossRevenue = totalRevenueAgg[0]?.total || 0;

  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({
    fulfillmentStatus: { $in: ['placed', 'garment_inspection', 'pressing'] },
  });

  const activeDossiers = await CustomRequest.countDocuments({
    tailorStatus: 'feasibility_review',
  });
  const totalDossiers = await CustomRequest.countDocuments();

  const totalPatrons = await User.countDocuments({ role: 'customer' });

  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'firstName lastName email');

  const recentDossiers = await CustomRequest.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'firstName lastName email');

  return {
    grossRevenue,
    totalOrders,
    pendingOrders,
    activeDossiers,
    totalDossiers,
    totalPatrons,
    recentOrders,
    recentDossiers,
  };
};

export const fetchAllDossiers = async (status) => {
  const query = {};
  if (status) query.tailorStatus = status;
  try {
    if (mongoose.connection.readyState === 1) {
      const dbDossiers = await CustomRequest.find(query)
        .sort({ createdAt: -1 })
        .populate('user', 'firstName lastName email phone');
      if (dbDossiers && dbDossiers.length > 0) {
        return dbDossiers;
      }
    }
  } catch (err) {
    console.warn('[FetchAllDossiers DB Error]:', err.message);
  }
  return memoryDossiers;
};

export const updateDossierFeasibility = async (id, updateData) => {
  const { tailorStatus, officialQuoteAmount, tailorNotes } = updateData;

  const dossier = await CustomRequest.findById(id);
  if (!dossier) throw new Error('Bespoke design dossier not found.');

  if (tailorStatus) dossier.tailorStatus = tailorStatus;
  if (officialQuoteAmount !== undefined) dossier.officialQuoteAmount = officialQuoteAmount;
  if (tailorNotes) dossier.tailorNotes = tailorNotes;

  return await dossier.save();
};

export const fetchAllOrders = async (status) => {
  return await getAllOrdersAdmin(status);
};

export const updateOrderFulfillment = async (id, status, trackingCode) => {
  const order = await Order.findById(id);
  if (!order) throw new Error('Order not found.');

  if (status) order.fulfillmentStatus = status;
  if (trackingCode) order.trackingCode = trackingCode;

  return await order.save();
};
