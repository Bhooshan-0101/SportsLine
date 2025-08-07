const User = require('../models/User');

// Simple in-memory notification store (in production, use Redis or database)
const notifications = new Map();

// Notification types
const NOTIFICATION_TYPES = {
  ORDER_APPROVED: 'order_approved',
  ORDER_REJECTED: 'order_rejected',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_OUT_FOR_DELIVERY: 'order_out_for_delivery',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled'
};

// Create notification
const createNotification = async (userId, type, data) => {
  try {
    const notification = {
      id: Date.now().toString(),
      userId,
      type,
      title: getNotificationTitle(type, data),
      message: getNotificationMessage(type, data),
      data,
      read: false,
      createdAt: new Date()
    };

    // Store notification
    if (!notifications.has(userId)) {
      notifications.set(userId, []);
    }
    notifications.get(userId).push(notification);

    // Keep only last 50 notifications per user
    const userNotifications = notifications.get(userId);
    if (userNotifications.length > 50) {
      notifications.set(userId, userNotifications.slice(-50));
    }

    console.log(`Notification created for user ${userId}:`, notification);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get notification title based on type
const getNotificationTitle = (type, data) => {
  switch (type) {
    case NOTIFICATION_TYPES.ORDER_APPROVED:
      return 'Order Approved';
    case NOTIFICATION_TYPES.ORDER_REJECTED:
      return 'Order Rejected';
    case NOTIFICATION_TYPES.ORDER_SHIPPED:
      return 'Order Shipped';
    case NOTIFICATION_TYPES.ORDER_OUT_FOR_DELIVERY:
      return 'Order Out for Delivery';
    case NOTIFICATION_TYPES.ORDER_DELIVERED:
      return 'Order Delivered';
    case NOTIFICATION_TYPES.ORDER_CANCELLED:
      return 'Order Cancelled';
    default:
      return 'Order Update';
  }
};

// Get notification message based on type
const getNotificationMessage = (type, data) => {
  const orderNumber = data.orderNumber || 'N/A';
  
  switch (type) {
    case NOTIFICATION_TYPES.ORDER_APPROVED:
      return `Your order #${orderNumber} has been approved and is being prepared for shipment.`;
    case NOTIFICATION_TYPES.ORDER_REJECTED:
      return `Your order #${orderNumber} has been rejected. ${data.rejectionReason ? `Reason: ${data.rejectionReason}` : ''}`;
    case NOTIFICATION_TYPES.ORDER_SHIPPED:
      return `Your order #${orderNumber} has been shipped! ${data.trackingNumber ? `Tracking: ${data.trackingNumber}` : ''}`;
    case NOTIFICATION_TYPES.ORDER_OUT_FOR_DELIVERY:
      return `Your order #${orderNumber} is out for delivery and should arrive soon!`;
    case NOTIFICATION_TYPES.ORDER_DELIVERED:
      return `Your order #${orderNumber} has been delivered. Thank you for your business!`;
    case NOTIFICATION_TYPES.ORDER_CANCELLED:
      return `Your order #${orderNumber} has been cancelled. ${data.cancelReason ? `Reason: ${data.cancelReason}` : ''}`;
    default:
      return `Your order #${orderNumber} has been updated.`;
  }
};

// Get user notifications
const getUserNotifications = (userId, limit = 20) => {
  const userNotifications = notifications.get(userId) || [];
  return userNotifications
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
};

// Mark notification as read
const markAsRead = (userId, notificationId) => {
  const userNotifications = notifications.get(userId) || [];
  const notification = userNotifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
  }
  return notification;
};

// Mark all notifications as read
const markAllAsRead = (userId) => {
  const userNotifications = notifications.get(userId) || [];
  userNotifications.forEach(notification => {
    notification.read = true;
  });
  return userNotifications.length;
};

// Get unread count
const getUnreadCount = (userId) => {
  const userNotifications = notifications.get(userId) || [];
  return userNotifications.filter(n => !n.read).length;
};

// Send order status notification
const sendOrderStatusNotification = async (order, oldStatus, newStatus) => {
  try {
    if (!order.customer) return;

    let notificationType;
    let notificationData = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      oldStatus,
      newStatus
    };

    // Determine notification type based on status change
    switch (newStatus) {
      case 'approved':
        notificationType = NOTIFICATION_TYPES.ORDER_APPROVED;
        break;
      case 'rejected':
        notificationType = NOTIFICATION_TYPES.ORDER_REJECTED;
        if (order.approvalStatus?.rejectionReason) {
          notificationData.rejectionReason = order.approvalStatus.rejectionReason.code;
        }
        break;
      case 'shipped':
        notificationType = NOTIFICATION_TYPES.ORDER_SHIPPED;
        if (order.shipping?.trackingNumber) {
          notificationData.trackingNumber = order.shipping.trackingNumber;
        }
        break;
      case 'out_for_delivery':
        notificationType = NOTIFICATION_TYPES.ORDER_OUT_FOR_DELIVERY;
        break;
      case 'delivered':
        notificationType = NOTIFICATION_TYPES.ORDER_DELIVERED;
        break;
      case 'cancelled':
        notificationType = NOTIFICATION_TYPES.ORDER_CANCELLED;
        if (order.cancelReason) {
          notificationData.cancelReason = order.cancelReason;
        }
        break;
      default:
        // Don't send notification for other status changes
        return;
    }

    // Create notification
    await createNotification(order.customer._id || order.customer, notificationType, notificationData);
    
    console.log(`Order status notification sent: ${oldStatus} -> ${newStatus} for order ${order.orderNumber}`);
  } catch (error) {
    console.error('Error sending order status notification:', error);
  }
};

module.exports = {
  NOTIFICATION_TYPES,
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  sendOrderStatusNotification
};
