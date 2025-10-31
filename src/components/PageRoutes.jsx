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
            <Route
              path="explore"
              element={<Box>Explore Page - Coming Soon</Box>}
            />
            <Route
              path="premium"
              element={<Box>Premium Lounge - Coming Soon</Box>}
            />
            <Route
              path="market"
              element={<Box>TuVibe Market - Coming Soon</Box>}
            />
            <Route
              path="wallet"
              element={<Box>Token Wallet - Coming Soon</Box>}
            />
            <Route
              path="profile"
              element={<Profile user={user} setUser={setUser} />}
            />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        )}
      </Box>
    </Box>
  );
}

export default PageRoutes;
