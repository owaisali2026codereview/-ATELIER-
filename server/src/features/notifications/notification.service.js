import mongoose from 'mongoose';
import { Notification } from './notification.model.js';

/**
 * Dispatch an in-app and email advisory notification
 */
export const dispatchNotification = async ({
  user = null,
  recipientRole = 'customer',
  title,
  message,
  type = 'system',
  referenceId = null,
}) => {
  try {
    const validUser = (user && mongoose.Types.ObjectId.isValid(user)) ? user : null;

    if (mongoose.connection.readyState === 1) {
      const notification = await Notification.create({
        user: validUser,
        recipientRole,
        title,
        message,
        type,
        referenceId,
      });

      console.log(
        `[Maison Atelier Notification Dispatched] → To: [${recipientRole}${validUser ? `:${validUser}` : ''}] | Type: ${type} | "${title}" - ${message}`
      );

      return notification;
    }

    console.log(`[Memory Notification]: ${title} - ${message}`);
    return null;
  } catch (error) {
    console.warn('[Notification Dispatch Warning]:', error.message);
    return null;
  }
};

/**
 * Fetch notifications for a user or admin role
 */
export const fetchNotifications = async (userId, userRole) => {
  if (mongoose.connection.readyState !== 1) {
    return [];
  }
  try {
    const orConditions = [{ recipientRole: 'all' }];

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      orConditions.push({ user: userId });
    }

    if (userRole === 'tailor_admin' || userRole === 'super_admin' || userRole === 'admin') {
      orConditions.push({ recipientRole: 'admin' }, { recipientRole: 'tailor_admin' });
    }

    return await Notification.find({ $or: orConditions }).sort({ createdAt: -1 }).limit(30);
  } catch (error) {
    console.warn('[Fetch Notifications Error]:', error.message);
    return [];
  }
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (id, userId) => {
  return await Notification.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true }
  );
};

/**
 * Mark all notifications for a user as read
 */
export const markAllAsRead = async (userId, userRole) => {
  const query = {
    $or: [{ user: userId }, { recipientRole: userRole }],
    isRead: false,
  };
  return await Notification.updateMany(query, { isRead: true });
};
