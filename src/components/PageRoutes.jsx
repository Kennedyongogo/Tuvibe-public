import React, { useEffect, useState, useCallback } from "react";
import {
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import Navbar from "./Navbar";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Explore from "../pages/Explore";
import Wallet from "../pages/Wallet";
import PremiumLounge from "../pages/PremiumLounge";
import Market from "../pages/Market";
import Reports from "../pages/Reports";

function PageRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to check and validate authentication
  const checkAuthentication = useCallback(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser((prevUser) => {
          // Only update if user data actually changed
          if (!prevUser || prevUser.id !== parsedUser.id) {
            return parsedUser;
          }
          return prevUser;
        });
        setLoading(false);
        return true;
      } catch (error) {
        // Invalid user data, clear it
        localStorage.clear();
        setUser(null);
        setLoading(false);
        navigate("/", { replace: true });
        return false;
      }
    } else {
      // No token or user, redirect to login
      setUser(null);
      setLoading(false);
      navigate("/", { replace: true });
      return false;
    }
  }, [navigate]);

  // Check authentication only on mount
  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  // Lightweight check on route change - only if token is missing
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    // Only check if we detect the token/user was removed
    if (!token || !savedUser) {
      if (user) {
        // User was logged out, clear state
        setUser(null);
        navigate("/", { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    // Listen for browser back/forward button (popstate event)
    const handlePopState = () => {
      // Small delay to ensure localStorage is checked after navigation
      setTimeout(() => {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        if (!token || !savedUser) {
          navigate("/", { replace: true });
        }
      }, 0);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  // Keep-alive heartbeat to maintain online status
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) return;

    // Function to refresh online status by calling /me endpoint
    const refreshOnlineStatus = async () => {
      try {
        const response = await fetch("/api/public/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // Update user data in localStorage with latest info
            const updatedUser = { ...data.data };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
          }
        }
      } catch (error) {
        console.error("Failed to refresh online status:", error);
      }
    };

    // Call immediately on mount (if user is logged in)
    refreshOnlineStatus();

    // Set up interval to refresh every 2 minutes (120000ms)
    // This keeps logged_in_at timestamp updated, maintaining online status
    const heartbeatInterval = setInterval(refreshOnlineStatus, 2 * 60 * 1000);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [user]);

  return (
    <Box sx={{ display: "flex" }}>
      <Navbar user={user} setUser={setUser} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mt: { xs: 8, sm: 9 },
          backgroundColor: "#FAFAFA",
          minHeight: "100vh",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <CircularProgress sx={{ color: "#D4AF37" }} />
          </Box>
        ) : (
          <Routes>
            <Route path="home" element={<Dashboard user={user} />} />
            <Route path="explore" element={<Explore user={user} />} />
            <Route path="premium" element={<PremiumLounge user={user} />} />
            <Route path="market" element={<Market user={user} />} />
            <Route
              path="wallet"
              element={<Wallet user={user} setUser={setUser} />}
            />
            <Route
              path="profile"
              element={<Profile user={user} setUser={setUser} />}
            />
            <Route path="reports" element={<Reports user={user} />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        )}
      </Box>
    </Box>
  );
}

export default PageRoutes;
