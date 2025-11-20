import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Badge,
  Chip,
  Divider,
  CircularProgress,
  Button,
  Paper,
} from "@mui/material";
import {
  NotificationsActive,
  NotificationsOff,
  Favorite,
  Comment,
  CheckCircle,
  AutoStories,
  Delete,
} from "@mui/icons-material";

export default function Notifications({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setNotifications(data.data || []);
      } else {
        setError("Failed to load notifications");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (notificationId) => {
    if (!token) return;

    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;

    const unreadNotifications = notifications.filter((n) => !n.isRead);
    const promises = unreadNotifications.map((notif) => markAsRead(notif.id));
    await Promise.all(promises);
  };

  const getNotificationIcon = (title) => {
    if (title?.includes("Reaction")) {
      return <Favorite sx={{ color: "#e91e63" }} />;
    }
    if (title?.includes("Comment")) {
      return <Comment sx={{ color: "#2196f3" }} />;
    }
    if (title?.includes("Story")) {
      return <AutoStories sx={{ color: "#D4AF37" }} />;
    }
    return <NotificationsActive sx={{ color: "#D4AF37" }} />;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading && notifications.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress sx={{ color: "#D4AF37" }} />
      </Box>
    );
  }

  return (
    <Box>
      <Card
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: "12px", sm: "16px" },
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
          border: "1px solid rgba(212, 175, 55, 0.2)",
          boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            mb: { xs: 2, sm: 3 },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsActive
                sx={{
                  fontSize: { xs: 24, sm: 28, md: 32 },
                  color: "#D4AF37",
                }}
              />
            </Badge>
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                fontWeight: 700,
                background: "linear-gradient(45deg, #D4AF37, #B8941F)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Notifications
            </Typography>
          </Box>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              onClick={markAllAsRead}
              sx={{
                borderColor: "#D4AF37",
                color: "#D4AF37",
                width: { xs: "100%", sm: "auto" },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                "&:hover": {
                  borderColor: "#B8941F",
                  backgroundColor: "rgba(212, 175, 55, 0.1)",
                },
              }}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {notifications.length === 0 ? (
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: { xs: 4, sm: 6 },
                color: "rgba(26, 26, 26, 0.5)",
              }}
            >
              <NotificationsOff sx={{ fontSize: { xs: 48, sm: 64 }, mb: 2 }} />
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                  mb: 1,
                  textAlign: "center",
                }}
              >
                No notifications
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                  textAlign: "center",
                  px: { xs: 2, sm: 0 },
                }}
              >
                You're all caught up! New notifications will appear here.
              </Typography>
            </Box>
          </CardContent>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <Paper
                  elevation={0}
                  sx={{
                    mb: { xs: 0.5, sm: 1 },
                    backgroundColor: notification.isRead
                      ? "transparent"
                      : "rgba(212, 175, 55, 0.05)",
                    transition: "background-color 0.2s",
                    "&:hover": {
                      backgroundColor: "rgba(212, 175, 55, 0.1)",
                    },
                  }}
                >
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      px: { xs: 1, sm: 2 },
                      py: { xs: 1.5, sm: 2 },
                    }}
                    secondaryAction={
                      !notification.isRead && (
                        <IconButton
                          edge="end"
                          onClick={() => markAsRead(notification.id)}
                          sx={{
                            color: "#D4AF37",
                            p: { xs: 0.75, sm: 1 },
                          }}
                          size="small"
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemAvatar sx={{ minWidth: { xs: 44, sm: 56 } }}>
                      <Avatar
                        sx={{
                          bgcolor: notification.isRead
                            ? "rgba(212, 175, 55, 0.2)"
                            : "#D4AF37",
                          width: { xs: 40, sm: 48 },
                          height: { xs: 40, sm: 48 },
                          "& svg": {
                            fontSize: { xs: "20px", sm: "24px" },
                          },
                        }}
                      >
                        {getNotificationIcon(notification.title)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      sx={{
                        pr: {
                          xs: !notification.isRead ? "44px" : 0,
                          sm: !notification.isRead ? "48px" : 0,
                        },
                      }}
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: { xs: "flex-start", sm: "center" },
                            gap: { xs: 0.5, sm: 1 },
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                              fontWeight: notification.isRead ? 500 : 700,
                              color: "rgba(26, 26, 26, 0.9)",
                              lineHeight: 1.4,
                            }}
                          >
                            {notification.title}
                          </Typography>
                          {!notification.isRead && (
                            <Chip
                              label="New"
                              size="small"
                              sx={{
                                height: { xs: 16, sm: 18 },
                                fontSize: { xs: "0.6rem", sm: "0.65rem" },
                                bgcolor: "#D4AF37",
                                color: "white",
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                              color: "rgba(26, 26, 26, 0.7)",
                              mb: 0.5,
                              lineHeight: 1.5,
                              wordBreak: "break-word",
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: { xs: "0.7rem", sm: "0.75rem" },
                              color: "rgba(26, 26, 26, 0.5)",
                            }}
                          >
                            {formatTimeAgo(notification.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </Paper>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Card>
    </Box>
  );
}
