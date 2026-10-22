import { createNewOrder, getOrderByNumber, getUserOrders } from './order.service.js';
import { dispatchNotification } from '../notifications/notification.service.js';

export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, shippingMethod, paymentMethod, couponCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No garments found in bag. Order cannot be empty.',
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.firstName?.trim() ||
      !shippingAddress.lastName?.trim() ||
      !shippingAddress.email?.trim() ||
      !shippingAddress.phone?.trim() ||
      !shippingAddress.address?.trim() ||
      !shippingAddress.city?.trim() ||
      !shippingAddress.country?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'All shipping coordinates (First Name, Last Name, Email, Phone, Address, City, Country) are required.',
      });
    }

    const email = shippingAddress.email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email) || email.includes('..')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid contact email address (e.g. patron@gmail.com).',
      });
    }

    const cleanPhone = shippingAddress.phone.trim().replace(/\D/g, '');
    if (!/^03\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Pakistan telephone number (11 digits starting with 03).',
      });
    }

    const userId = req.user ? (req.user.id || req.user._id) : null;
    const order = await createNewOrder(
      { items, shippingAddress, shippingMethod, paymentMethod, couponCode },
      userId
    );

    // Dispatch Customer & Admin Notifications
    if (userId) {
      await dispatchNotification({
        user: userId,
        recipientRole: 'customer',
        title: `Order #${order.orderNumber} Confirmed`,
        message: `Your luxury bespoke order for ${order.items?.length || 1} piece(s) totaling Rs. ${order.totalAmount?.toLocaleString()} has been received and is undergoing master artisan review.`,
        type: 'order',
        referenceId: order.orderNumber,
      });
    }

    await dispatchNotification({
      recipientRole: 'admin',
      title: `New Order Placed: #${order.orderNumber}`,
      message: `A client placed order #${order.orderNumber} totaling Rs. ${order.totalAmount?.toLocaleString()}. Ready for tailoring queue allocation.`,
      type: 'order',
      referenceId: order.orderNumber,
    });

    res.status(201).json({
      success: true,
      message: 'Luxury sartorial order placed successfully.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await getOrderByNumber(req.params.orderNumber);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order reference not found in archive.',
      });
    }

    // Authorization Barrier (BOLA / IDOR Protection)
    const isAdmin =
      req.user &&
      ['admin', 'super_admin', 'tailor_admin'].includes(req.user.role);

    const isOrderOwner =
      req.user &&
      order.user &&
      (order.user._id || order.user).toString() === (req.user.id || req.user._id).toString();

    const isGuestAuthorized =
      req.query.email &&
      order.shippingAddress &&
      req.query.email.toLowerCase().trim() === order.shippingAddress.email.toLowerCase().trim();

    if (!isAdmin && !isOrderOwner && !isGuestAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Access clearance denied. You can only view orders registered to your verified patron account or with matching email verification.',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await getUserOrders(req.user.id || req.user._id);
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};
