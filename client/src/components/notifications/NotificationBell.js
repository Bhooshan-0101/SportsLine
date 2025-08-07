import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  Notifications,
  NotificationsNone,
  CheckCircle,
  Cancel,
  LocalShipping,
  Schedule,
  MarkEmailRead
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';

const NotificationBell = () => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  const statusIcons = {
    order_approved: <CheckCircle color="success" />,
    order_rejected: <Cancel color="error" />,
    order_shipped: <LocalShipping color="primary" />,
    order_out_for_delivery: <LocalShipping color="secondary" />,
    order_delivered: <CheckCircle color="success" />,
    order_cancelled: <Cancel color="error" />
  };

  useEffect(() => {
    if (user && user.role === 'customer') {
      fetchNotifications();
      fetchUnreadCount();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getUserNotifications(user.id);
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount(user.id);
      setUnreadCount(response.data.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(user.id, notificationId);

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead(user.id);

      // Update local state
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (notifications.length === 0) {
      fetchNotifications();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Don't show notification bell for non-customers
  if (!user || user.role !== 'customer') {
    return null;
  }

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ ml: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? <Notifications /> : <NotificationsNone />}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 360, maxHeight: 400 }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Notifications</Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={markAllAsRead}
                startIcon={<MarkEmailRead />}
              >
                Mark all read
              </Button>
            )}
          </Box>
        </Box>

        {loading ? (
          <MenuItem>
            <Typography color="text.secondary">Loading...</Typography>
          </MenuItem>
        ) : notifications.length === 0 ? (
          <MenuItem>
            <Typography color="text.secondary">No notifications</Typography>
          </MenuItem>
        ) : (
          <List sx={{ p: 0, maxHeight: 300, overflow: 'auto' }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <ListItemIcon>
                  {statusIcons[notification.type] || <Schedule />}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(notification.createdAt)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {notification.message}
                      </Typography>
                      {!notification.read && (
                        <Chip
                          label="New"
                          size="small"
                          color="primary"
                          sx={{ mt: 1, height: 20 }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button
                fullWidth
                size="small"
                onClick={() => {
                  handleClose();
                  // Could navigate to a full notifications page
                }}
              >
                View All Notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
