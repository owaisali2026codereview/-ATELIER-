import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
} from './notification.service.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const userRole = req.user ? req.user.role : 'customer';

    const notifications = await fetchNotifications(userId, userRole);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await markAsRead(req.params.id, req.user?.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const userRole = req.user ? req.user.role : 'customer';

    await markAllAsRead(userId, userRole);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
};
