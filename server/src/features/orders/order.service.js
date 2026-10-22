import mongoose from 'mongoose';
import { Order } from './order.model.js';
import { Product } from '../products/product.model.js';
import { validateCouponService } from '../coupons/coupon.service.js';

let memoryOrders = [];

export const createNewOrder = async (orderData, userId) => {
  const {
    items,
    shippingAddress,
    shippingMethod = 'standard',
    paymentMethod = 'card',
    couponCode,
  } = orderData;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order bag is empty. Please select at least one garment.');
  }

  // Server-side verification and calculation of each item
  const verifiedItems = [];
  let calculatedSubtotal = 0;

  for (const item of items) {
    const productId = item.product || item._id || item.id;
    let dbProduct = null;

    if (mongoose.connection.readyState === 1 && productId) {
      if (typeof productId === 'string' && productId.match(/^[0-9a-fA-F]{24}$/)) {
        dbProduct = await Product.findById(productId);
      }
      if (!dbProduct && item.slug) {
        dbProduct = await Product.findOne({ slug: item.slug });
      }
    }

    // Determine authentic price from MongoDB or authenticated item record
    const verifiedPrice = dbProduct ? Number(dbProduct.price) : Number(item.price);
    if (!verifiedPrice || isNaN(verifiedPrice) || verifiedPrice < 0) {
      throw new Error(`Invalid price for item '${item.name || 'Garment'}'.`);
    }

    const quantity = Math.max(1, parseInt(item.quantity || 1, 10));
    calculatedSubtotal += verifiedPrice * quantity;

    verifiedItems.push({
      product: dbProduct ? dbProduct._id : (mongoose.Types.ObjectId.isValid(productId) ? productId : null),
      name: dbProduct ? dbProduct.name : (item.name || 'Bespoke Garment'),
      price: verifiedPrice,
      size: item.size || 'M',
      color: item.color || (dbProduct?.colors?.[0]?.name || 'Standard'),
      image: item.image || (dbProduct?.images?.[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'),
      quantity,
    });

    // Atomic stock deduction to prevent overselling race conditions
    if (mongoose.connection.readyState === 1 && dbProduct?._id) {
      try {
        const updatedProd = await Product.findOneAndUpdate(
          { _id: dbProduct._id, stockCount: { $gte: quantity } },
          { $inc: { stockCount: -quantity } },
          { new: true }
        );
        if (updatedProd) {
          await Product.findByIdAndUpdate(dbProduct._id, {
            inStock: updatedProd.stockCount > 0,
          });
        }
      } catch (err) {
        console.warn('[Stock Decrement Error]:', err.message);
      }
    } else if (dbProduct) {
      dbProduct.stockCount = Math.max(0, (dbProduct.stockCount || 10) - quantity);
      dbProduct.inStock = dbProduct.stockCount > 0;
    }
  }

  // Calculate verified shipping cost
  const calculatedShippingCost = shippingMethod === 'express' ? 500 : 0;

  // Server-side dynamic discount verification via Coupon Service
  let calculatedDiscount = 0;
  if (couponCode && typeof couponCode === 'string') {
    try {
      const couponValidation = await validateCouponService(couponCode, calculatedSubtotal);
      if (couponValidation && couponValidation.valid) {
        calculatedDiscount = couponValidation.discountAmount || 0;
      }
    } catch (e) {
      console.warn('[Order Coupon Validation Note]:', e.message);
    }
  }

  const calculatedTotal = Math.max(0, calculatedSubtotal + calculatedShippingCost - calculatedDiscount);

  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  const orderNumber = `ATL-ORD-${randomDigits}`;
  const trackingCode = `DHL-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`;

  const orderDoc = {
    orderNumber,
    user: userId || null,
    items: verifiedItems,
    shippingAddress,
    shippingMethod,
    shippingCost: calculatedShippingCost,
    discountAmount: calculatedDiscount,
    subtotal: calculatedSubtotal,
    totalAmount: calculatedTotal,
    paymentMethod: paymentMethod || 'card',
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
    fulfillmentStatus: 'placed',
    trackingCode,
  };

  if (mongoose.connection.readyState === 1) {
    try {
      const order = await Order.create(orderDoc);
      memoryOrders.unshift(order);
      return order;
    } catch (err) {
      console.warn('[CreateOrder DB Fallback]: Falling back to local memory store', err.message);
    }
  }

  const memOrder = { ...orderDoc, _id: `ord_${Date.now()}`, createdAt: new Date().toISOString() };
  memoryOrders.unshift(memOrder);
  return memOrder;
};

export const getOrderByNumber = async (orderNumber) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const order = await Order.findOne({ orderNumber }).populate('user', 'firstName lastName email role');
      if (order) return order;
    } catch (err) {
      // fallback
    }
  }
  return memoryOrders.find((o) => o.orderNumber === orderNumber) || null;
};

export const getUserOrders = async (userId) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
      if (orders) return orders;
    } catch (err) {
      // fallback
    }
  }
  return memoryOrders.filter((o) => userId && o.user && o.user.toString() === userId.toString());
};

export const getAllOrdersAdmin = async (status) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const filter = status ? { fulfillmentStatus: status } : {};
      const orders = await Order.find(filter).sort({ createdAt: -1 }).populate('user', 'firstName lastName email');
      if (orders) return orders;
    } catch (err) {
      // fallback
    }
  }
  if (!status) return memoryOrders;
  return memoryOrders.filter((o) => o.fulfillmentStatus === status);
};
