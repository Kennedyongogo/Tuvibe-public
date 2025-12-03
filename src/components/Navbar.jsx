import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Tooltip,
  Button,
} from "@mui/material";
import {
  Home,
  Explore,
  Logout,
  Store,
  Person,
  GridView,
  Report,
  Lock,
  Timeline,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import PublicResetPasswordDialog from "./Account/PublicResetPasswordDialog";
import { getDisplayInitial, getDisplayName } from "../utils/userDisplay";
import IncognitoToggle from "./IncognitoToggle";

const drawerWidth = 260;

export default function Navbar({
  user,
  setUser,
  isSuspended = false,
  onLogout,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [bottomNavValue, setBottomNavValue] = useState(0);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const prevPathnameRef = useRef(location.pathname);
  const anchorElRef = useRef(null);

  const baseMenuItems = [
    {
      text: "Home",
      icon: <Home />,
      path: "/home",
      mobileLabel: "Home",
      requiresSubscription: false,
    },
    {
      text: "Timeline",
      icon: <Timeline />,
      path: "/timeline",
      mobileLabel: "Timeline",
      requiresSubscription: true,
      reason:
        "Timeline allows you to view and interact with posts, stories, and updates from other members. Subscribe to a plan to access this feature and stay connected with the TuVibe community.",
    },
    {
      text: "Explore",
      icon: <Explore />,
      path: "/explore",
      mobileLabel: "Explore",
      requiresSubscription: true,
      reason:
        "Explore lets you discover and connect with other members based on your preferences. Subscribe to unlock unlimited profile browsing and find your perfect match.",
    },
    {
      text: "TuVibe Market",
      icon: <Store />,
      path: "/market",
      mobileLabel: "Market",
      requiresSubscription: true,
      reason:
        "TuVibe Market is where members buy and sell items within the community. Subscribe to access the marketplace and start trading with verified members.",
    },
    {
      text: "Profile",
      icon: <Person />,
      path: "/profile",
      mobileLabel: "Profile",
      requiresSubscription: false,
    },
  ];
  const menuItems = isSuspended ? [] : baseMenuItems;

  // Check if user has active subscription
  const hasActiveSubscription = subscription?.status === "active";

  // Show subscription required dialog
  const showSubscriptionRequiredDialog = (itemName, reason) => {
    Swal.fire({
      icon: "info",
      title: "Subscription Required",
      html: `
        <div style="text-align: left;">
          <p style="margin-bottom: 12px; font-size: 0.9rem; color: #333;">
            <strong>${itemName}</strong> requires an active subscription.
          </p>
          <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
            <p style="margin: 0; font-size: 0.85rem; color: #666; line-height: 1.4;">
              ${reason}
            </p>
          </div>
          <p style="margin: 0; font-size: 0.85em; color: #333;">
            Subscribe now to unlock all premium features and get the most out of TuVibe!
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "View Plans",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#D4AF37",
      cancelButtonColor: "#666",
      didOpen: () => {
        const swal = document.querySelector(".swal2-popup");
        const isSmallScreen = window.innerWidth <= 768;

        if (swal) {
          swal.style.borderRadius = "20px";
          swal.style.border = "1px solid rgba(212, 175, 55, 0.3)";
          swal.style.boxShadow = "0 20px 60px rgba(212, 175, 55, 0.25)";

          if (isSmallScreen) {
            swal.style.maxWidth = "90vw";
            swal.style.width = "90vw";
            swal.style.padding = "1rem";
            swal.style.maxHeight = "90vh";
            swal.style.overflowY = "auto";
          }
        }

        if (isSmallScreen) {
          // Reduce icon size on mobile
          const icon = document.querySelector(".swal2-icon");
          if (icon) {
            icon.style.width = "3rem";
            icon.style.height = "3rem";
            icon.style.marginBottom = "0.5rem";
          }
          // Reduce title size on mobile
          const title = document.querySelector(".swal2-title");
          if (title) {
            title.style.fontSize = "1.25rem";
            title.style.padding = "0.5rem 0";
          }
          // Reduce content padding on mobile
          const content = document.querySelector(".swal2-html-container");
          if (content) {
            content.style.padding = "0.5rem 0";
          }
          // Reduce button container padding on mobile
          const actions = document.querySelector(".swal2-actions");
          if (actions) {
            actions.style.marginTop = "0.75rem";
            actions.style.padding = "0";
          }
          // Make buttons more compact on mobile
          const buttons = document.querySelectorAll(
            ".swal2-confirm, .swal2-cancel"
          );
          buttons.forEach((btn) => {
            btn.style.padding = "0.5rem 1rem";
            btn.style.fontSize = "0.875rem";
            btn.style.margin = "0.25rem";
          });
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/pricing");
      }
    });
  };

  // Handle menu item click
  const handleMenuItemClick = (item) => {
    // If item requires subscription and user doesn't have one, show dialog
    if (item.requiresSubscription && !hasActiveSubscription) {
      showSubscriptionRequiredDialog(item.text, item.reason);
      return;
    }
    // Otherwise, navigate normally
    navigate(item.path);
  };

  const handleProfileMenuOpen = (event) => {
    const target = event.currentTarget;
    setAnchorEl(target);
    anchorElRef.current = target;
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
    anchorElRef.current = null;
  };

  // Auto-close menu when navigating TO profile page (not when already there)
  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevPathnameRef.current;

    // Only close if we're navigating TO profile (not already on it) and menu is open
    if (currentPath.includes("/profile") && !prevPath.includes("/profile")) {
      if (anchorElRef.current) {
        setAnchorEl(null);
        anchorElRef.current = null;
      }
    }

    // Update the ref for next time
    prevPathnameRef.current = currentPath;
  }, [location.pathname]);

  // Update bottom navigation value based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const activeIndex = menuItems.findIndex(
      (item) => item.path === currentPath
    );
    if (activeIndex !== -1) {
      setBottomNavValue(activeIndex);
    } else {
      // Reset to 0 if current path doesn't match any menu item
      setBottomNavValue(0);
    }
  }, [location.pathname, menuItems]);

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setSubscription(null);
        return;
      }

      try {
        const response = await fetch("/api/subscriptions/status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (
          data.success &&
          data.data?.hasSubscription &&
          data.data.subscription
        ) {
          setSubscription(data.data.subscription);
        } else {
          setSubscription(null);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        setSubscription(null);
      }
    };

    fetchSubscription();
  }, [user]);

  // Set up SSE for real-time subscription updates
  useEffect(() => {
    if (!user?.id) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    let sseEventSource = null;

    try {
      const isDev = import.meta.env.DEV;
      const protocol = window.location.protocol;
      const host = window.location.hostname;
      const apiPort = isDev ? "4000" : window.location.port || "";
      const sseUrl = isDev
        ? `${protocol}//${host}:${apiPort}/api/sse/events?token=${encodeURIComponent(token)}`
        : `${protocol}//${host}${apiPort ? `:${apiPort}` : ""}/api/sse/events?token=${encodeURIComponent(token)}`;

      sseEventSource = new EventSource(sseUrl);

      sseEventSource.addEventListener("subscription:created", (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(
            "📡 [Navbar] SSE: Subscription created event received",
            data
          );
          if (data.subscription) {
            setSubscription(data.subscription);
          } else {
            // Refetch to get full subscription data
            fetch("/api/subscriptions/status", {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((res) => res.json())
              .then((data) => {
                if (
                  data.success &&
                  data.data?.hasSubscription &&
                  data.data.subscription
                ) {
                  setSubscription(data.data.subscription);
                } else {
                  setSubscription(null);
                }
              })
              .catch((err) =>
                console.error("Error refetching subscription:", err)
              );
          }
        } catch (err) {
          console.error(
            "❌ [Navbar] Error parsing SSE subscription:created event:",
            err
          );
        }
      });

      sseEventSource.addEventListener("subscription:updated", (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(
            "📡 [Navbar] SSE: Subscription updated event received",
            data
          );
          if (data.subscription) {
            setSubscription(data.subscription);
          } else {
            // Refetch to get full subscription data
            fetch("/api/subscriptions/status", {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((res) => res.json())
              .then((data) => {
                if (
                  data.success &&
                  data.data?.hasSubscription &&
                  data.data.subscription
                ) {
                  setSubscription(data.data.subscription);
                } else {
                  setSubscription(null);
                }
              })
              .catch((err) =>
                console.error("Error refetching subscription:", err)
              );
          }
        } catch (err) {
          console.error(
            "❌ [Navbar] Error parsing SSE subscription:updated event:",
            err
          );
        }
      });

      sseEventSource.addEventListener("subscription:expired", (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(
            "📡 [Navbar] SSE: Subscription expired event received",
            data
          );
          // Refetch to get updated subscription status
          fetch("/api/subscriptions/status", {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((data) => {
              if (
                data.success &&
                data.data?.hasSubscription &&
                data.data.subscription
              ) {
                setSubscription(data.data.subscription);
              } else {
                setSubscription(null);
              }
            })
            .catch((err) =>
              console.error("Error refetching subscription:", err)
            );
        } catch (err) {
          console.error(
            "❌ [Navbar] Error parsing SSE subscription:expired event:",
            err
          );
        }
      });

      sseEventSource.onopen = () => {
        console.log("✅ [Navbar] SSE connected for subscription updates");
      };

      sseEventSource.onerror = (error) => {
        console.warn("⚠️ [Navbar] SSE error for subscription updates:", error);
      };
    } catch (err) {
      console.warn(
        "⚠️ [Navbar] SSE not available for subscription updates:",
        err
      );
    }

    return () => {
      if (sseEventSource) {
        sseEventSource.close();
        sseEventSource = null;
      }
    };
  }, [user?.id]);

  const handleLogout = async () => {
    // Close menu first to prevent interference
    handleProfileMenuClose();

    // Small delay to ensure menu is closed before showing Swal
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (onLogout) {
      await onLogout();
      return;
    }

    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#D4AF37",
      cancelButtonColor: "#666",
      allowOutsideClick: false,
      allowEscapeKey: true,
      customClass: {
        popup: "swal-popup-gold",
      },
      didOpen: () => {
        // Style the popup
        const swal = document.querySelector(".swal2-popup");
        if (swal) {
          swal.style.borderRadius = "20px";
          swal.style.border = "1px solid rgba(212, 175, 55, 0.3)";
          swal.style.boxShadow = "0 20px 60px rgba(212, 175, 55, 0.25)";
        }
      },
    });

    if (result.isConfirmed) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Call logout endpoint to update online status on server
          await fetch("/api/public/logout", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          console.error("Logout API call failed:", error);
          // Continue with logout even if API call fails
        }
      }

      // Clear all localStorage and navigate to home
      localStorage.clear();
      navigate("/", { replace: true });
    }
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "64px", // Match AppBar/Toolbar height
          height: "64px",
          px: 3,
          py: 0,
          background:
            "linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(245, 230, 211, 0.05) 100%)",
          borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
        }}
      >
        <img
          src="/tuvibe.png"
          alt="Tuvibe Logo"
          style={{ height: "36px", width: "auto" }}
        />
        <Typography
          variant="h6"
          sx={{
            ml: 1.5,
            fontWeight: 700,
            background: "linear-gradient(45deg, #D4AF37, #B8941F)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "1.25rem",
          }}
        >
          Tuvibe
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "rgba(212, 175, 55, 0.2)" }} />

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, px: 2, pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isDisabled =
            item.requiresSubscription && !hasActiveSubscription;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <Tooltip
                title={
                  isDisabled
                    ? "Subscription required - Click to learn more"
                    : ""
                }
                arrow
                placement="right"
                enterDelay={200}
                leaveDelay={0}
                disableHoverListener={!isDisabled}
              >
                <ListItemButton
                  onClick={() => handleMenuItemClick(item)}
                  sx={{
                    borderRadius: "12px",
                    backgroundColor: isActive
                      ? "rgba(212, 175, 55, 0.15)"
                      : "transparent",
                    opacity: isDisabled ? 0.6 : 1,
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: isDisabled
                        ? "rgba(212, 175, 55, 0.08)"
                        : "rgba(212, 175, 55, 0.1)",
                    },
                    py: 1.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive
                        ? "#D4AF37"
                        : isDisabled
                          ? "rgba(26, 26, 26, 0.5)"
                          : "rgba(26, 26, 26, 0.7)",
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          component="span"
                          sx={{
                            fontWeight: isActive ? 600 : 500,
                            color: isActive
                              ? "#1a1a1a"
                              : isDisabled
                                ? "rgba(26, 26, 26, 0.5)"
                                : "rgba(26, 26, 26, 0.7)",
                            fontSize: "0.95rem",
                          }}
                        >
                          {item.text}
                        </Typography>
                        {isDisabled && (
                          <Lock
                            sx={{
                              fontSize: "0.875rem",
                              color: "rgba(212, 175, 55, 0.7)",
                            }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
        {menuItems.length === 0 && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              border: "1px dashed rgba(212, 175, 55, 0.4)",
              backgroundColor: "rgba(212, 175, 55, 0.08)",
              color: "#7f8c8d",
            }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              Account Suspended
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Access to navigation is temporarily disabled. Use the appeal
              button on the main screen to contact support or logout to return
              later.
            </Typography>
          </Box>
        )}
      </List>

      {/* User Section */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid rgba(212, 175, 55, 0.2)",
          background:
            "linear-gradient(135deg, rgba(245, 230, 211, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 1.5,
            borderRadius: "12px",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: "#D4AF37",
              fontWeight: 600,
            }}
          >
            {getDisplayInitial(user, {
              fallback: "U",
              currentUserId: user?.id,
            })}
          </Avatar>
          <Box sx={{ ml: 1.5, flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "#1a1a1a",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {getDisplayName(user, {
                fallback: "User",
                currentUserId: user?.id,
              })}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(26, 26, 26, 0.6)",
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email || ""}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
          borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
        }}
      >
        <Toolbar>
          <Box sx={{ flexGrow: 1 }} />
          {!isSuspended && (
            <>
              {subscription?.plan === "Gold" &&
                subscription?.status === "active" && (
                  <IncognitoToggle user={user} subscription={subscription} />
                )}
              <Button
                variant="contained"
                onClick={() => navigate("/pricing")}
                sx={{
                  mr: 2,
                  borderRadius: "999px",
                  textTransform: "none",
                  fontWeight: 700,
                  px: 2.5,
                  py: 0.75,
                  background:
                    "linear-gradient(90deg, #D4AF37 0%, #B8941F 100%)",
                  boxShadow: "0 4px 10px rgba(212, 175, 55, 0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #B8941F 0%, #D4AF37 100%)",
                    boxShadow: "0 6px 16px rgba(212, 175, 55, 0.4)",
                  },
                }}
              >
                Subscribe
              </Button>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Avatar
                  src={
                    user?.photo
                      ? user.photo.startsWith("http")
                        ? user.photo
                        : user.photo.startsWith("/")
                          ? user.photo
                          : `/uploads/${user.photo}`
                      : undefined
                  }
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "#D4AF37",
                    fontWeight: 600,
                    fontSize: "1rem",
                    border: "2px solid rgba(212, 175, 55, 0.3)",
                  }}
                >
                  {getDisplayInitial(user, {
                    fallback: "U",
                    currentUserId: user?.id,
                  })}
                </Avatar>
                <Tooltip title="Explore more" arrow>
                  <Box
                    component="button"
                    onClick={handleProfileMenuOpen}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      border: "none",
                      background: "transparent",
                      padding: 0.5,
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "rgba(212, 175, 55, 0.1)",
                      },
                    }}
                  >
                    <GridView
                      sx={{
                        fontSize: 28,
                        color: "#D4AF37",
                      }}
                    />
                  </Box>
                </Tooltip>
              </Box>
              <Menu
                id="account-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                PaperProps={{
                  sx: {
                    borderRadius: "12px",
                    mt: 1,
                    minWidth: 200,
                    boxShadow: "0 8px 32px rgba(212, 175, 55, 0.15)",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                  },
                }}
                disableScrollLock={true}
              >
                <MenuItem
                  onClick={() => {
                    handleProfileMenuClose();
                    navigate("/reports");
                  }}
                >
                  <Report sx={{ mr: 2, color: "#D4AF37" }} />
                  Reports
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleProfileMenuClose();
                    setTimeout(() => setResetPasswordOpen(true), 100);
                  }}
                >
                  <Lock sx={{ mr: 2, color: "#D4AF37" }} />
                  Reset Password
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                >
                  <Logout sx={{ mr: 2, color: "#D4AF37" }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
          <PublicResetPasswordDialog
            open={resetPasswordOpen}
            onClose={() => setResetPasswordOpen(false)}
            user={user}
          />
        </Toolbar>
      </AppBar>

      {/* Drawer - Desktop Only */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid rgba(212, 175, 55, 0.2)",
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.1) 100%)",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Bottom Navigation - Mobile Only */}
      {menuItems.length > 0 && (
        <Paper
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            display: { xs: "block", md: "none" },
            borderTop: "1px solid rgba(212, 175, 55, 0.2)",
            boxShadow: "0 -4px 20px rgba(212, 175, 55, 0.1)",
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
          }}
          elevation={3}
        >
          <BottomNavigation
            value={bottomNavValue}
            onChange={(event, newValue) => {
              const item = menuItems[newValue];
              // Check if item requires subscription
              if (item.requiresSubscription && !hasActiveSubscription) {
                showSubscriptionRequiredDialog(item.text, item.reason);
                // Don't update bottomNavValue or navigate
                return;
              }
              setBottomNavValue(newValue);
              navigate(item.path);
            }}
            showLabels
            sx={{
              backgroundColor: "transparent",
              height: 70,
              "& .MuiBottomNavigationAction-root": {
                color: "rgba(26, 26, 26, 0.6)",
                minWidth: 0,
                padding: "6px 12px",
                outline: "none",
                "&:focus": {
                  outline: "none",
                },
                "&:focus-visible": {
                  outline: "none",
                },
                "&.Mui-selected": {
                  color: "#D4AF37",
                  fontWeight: 600,
                },
                "&.Mui-disabled": {
                  opacity: 0.5,
                  cursor: "pointer",
                },
              },
              "& .MuiBottomNavigationAction-label": {
                fontSize: "0.7rem",
                fontWeight: 500,
                marginTop: "4px",
                "&.Mui-selected": {
                  fontSize: "0.7rem",
                  fontWeight: 600,
                },
              },
            }}
          >
            {menuItems.map((item, index) => {
              const isDisabled =
                item.requiresSubscription && !hasActiveSubscription;
              return (
                <Tooltip
                  key={item.text}
                  title={
                    isDisabled
                      ? "Subscription required - Tap to learn more"
                      : ""
                  }
                  arrow
                  placement="top"
                >
                  <BottomNavigationAction
                    label={item.mobileLabel || item.text}
                    icon={
                      <Box sx={{ position: "relative" }}>
                        {item.icon}
                        {isDisabled && (
                          <Lock
                            sx={{
                              position: "absolute",
                              top: -4,
                              right: -4,
                              fontSize: "0.625rem",
                              color: "#D4AF37",
                              backgroundColor: "white",
                              borderRadius: "50%",
                              padding: "2px",
                            }}
                          />
                        )}
                      </Box>
                    }
                    value={index}
                    sx={{
                      opacity: isDisabled ? 0.6 : 1,
                      cursor: isDisabled ? "pointer" : "default",
                    }}
                  />
                </Tooltip>
              );
            })}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
