import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home,
  Explore,
  AccountCircle,
  Logout,
  Store,
  Wallet,
  Star,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

const drawerWidth = 260;

export default function Navbar({ user, setUser }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const prevPathnameRef = useRef(location.pathname);
  const anchorElRef = useRef(null);

  const menuItems = [
    { text: "Home", icon: <Home />, path: "/home" },
    { text: "Explore", icon: <Explore />, path: "/explore" },
    { text: "Premium Lounge", icon: <Star />, path: "/premium" },
    { text: "TuVibe Market", icon: <Store />, path: "/market" },
    { text: "Token Wallet", icon: <Wallet />, path: "/wallet" },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#D4AF37",
      cancelButtonColor: "#666",
      customClass: {
        popup: "swal-popup-gold",
      },
      didOpen: () => {
        const swal = document.querySelector(".swal2-popup");
        if (swal) {
          swal.style.borderRadius = "20px";
          swal.style.border = "1px solid rgba(212, 175, 55, 0.3)";
          swal.style.boxShadow = "0 20px 60px rgba(212, 175, 55, 0.25)";
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear all localStorage (matching admin portal behavior)
        localStorage.clear();
        // Use React Router navigate with replace to prevent back button navigation
        navigate("/", { replace: true });
      }
    });
    handleProfileMenuClose();
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
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: "12px",
                  backgroundColor: isActive
                    ? "rgba(212, 175, 55, 0.15)"
                    : "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(212, 175, 55, 0.1)",
                  },
                  py: 1.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "#D4AF37" : "rgba(26, 26, 26, 0.7)",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#1a1a1a" : "rgba(26, 26, 26, 0.7)",
                    fontSize: "0.95rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
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
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
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
              {user?.name || "User"}
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
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, color: "#1a1a1a", display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            color="inherit"
            onClick={handleProfileMenuOpen}
            aria-label="account menu"
            aria-controls={Boolean(anchorEl) ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={Boolean(anchorEl) ? "true" : undefined}
            sx={{ color: "#1a1a1a" }}
          >
            <AccountCircle sx={{ fontSize: 32 }} />
          </IconButton>
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
                navigate("/profile");
              }}
            >
              <AccountCircle sx={{ mr: 2, color: "#D4AF37" }} />
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 2, color: "#D4AF37" }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid rgba(212, 175, 55, 0.2)",
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.1) 100%)",
            },
          }}
        >
          {drawer}
        </Drawer>
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
    </Box>
  );
}
