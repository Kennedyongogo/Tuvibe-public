import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import Swal from "sweetalert2";

import Navbar from "./Navbar";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Explore from "../pages/Explore";
import Wallet from "../pages/Wallet";
import PremiumLounge from "../pages/PremiumLounge";
import Market from "../pages/Market";
import Reports from "../pages/Reports";
import SuspensionGate from "./Suspension/SuspensionGate";
import SuspensionAppealModal from "./Suspension/SuspensionAppealModal";
import useSuspensionSocket from "../hooks/useSuspensionSocket";

function PageRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suspension, setSuspension] = useState(null);
  const [loadingSuspension, setLoadingSuspension] = useState(false);
  const [suspensionReady, setSuspensionReady] = useState(false);
  const initialSuspensionCheckRef = useRef(true);
  const prevUserIdRef = useRef(null);
  const [appealOpen, setAppealOpen] = useState(false);

  const authToken = useMemo(() => localStorage.getItem("token"), [user]);

  const checkAuthentication = useCallback(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser((prevUser) => {
          if (!prevUser || prevUser.id !== parsedUser.id) {
            initialSuspensionCheckRef.current = true;
            prevUserIdRef.current = parsedUser.id;
            return parsedUser;
          }
          return prevUser;
        });
        setLoading(false);
        return true;
      } catch (error) {
        localStorage.clear();
        setUser(null);
        setSuspensionReady(true);
        setLoading(false);
        navigate("/", { replace: true });
        return false;
      }
    }

    setUser(null);
    setSuspension(null);
    setAppealOpen(false);
    setSuspensionReady(true);
    initialSuspensionCheckRef.current = true;
    prevUserIdRef.current = null;
    setLoading(false);
    navigate("/", { replace: true });
    return false;
  }, [navigate]);

  const fetchSuspensionStatus = useCallback(
    async (shouldGate = false) => {
      const token = localStorage.getItem("token");
      if (!token || !user) {
        setSuspension(null);
        setSuspensionReady(true);
        initialSuspensionCheckRef.current = false;
        return;
      }

      try {
        setLoadingSuspension(true);
        if (initialSuspensionCheckRef.current || shouldGate) {
          setSuspensionReady(false);
        }
        const response = await fetch("/api/suspensions/me/status", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(
            payload.message || "Failed to load suspension status"
          );
        }

        const suspensionData = payload.data || null;
        setSuspension(suspensionData);
        if (!suspensionData) {
          setAppealOpen(false);
        }
      } catch (error) {
        console.error("[PageRoutes] fetchSuspensionStatus error:", error);
      } finally {
        setLoadingSuspension(false);
        setSuspensionReady(true);
        initialSuspensionCheckRef.current = false;
      }
    },
    [user]
  );

  const requestLogout = useCallback(async () => {
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
        const swal = document.querySelector(".swal2-popup");
        if (swal) {
          swal.style.borderRadius = "20px";
          swal.style.border = "1px solid rgba(212, 175, 55, 0.3)";
          swal.style.boxShadow = "0 20px 60px rgba(212, 175, 55, 0.25)";
        }
      },
    });

    if (!result.isConfirmed) {
      return;
    }

    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch("/api/public/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Logout API call failed:", error);
      }
    }

    localStorage.clear();
    setUser(null);
    setSuspension(null);
    setAppealOpen(false);
    setSuspensionReady(true);
    initialSuspensionCheckRef.current = true;
    prevUserIdRef.current = null;
    setLoading(false);
    navigate("/", { replace: true });
  }, [navigate]);

  const handleSuspensionUpdated = useCallback((updated) => {
    if (!updated || updated.status === "revoked") {
      setSuspension(null);
      setAppealOpen(false);
      return;
    }

    setSuspension((prev) => ({
      ...(prev || {}),
      ...updated,
    }));
  }, []);

  const suspensionHandlers = useMemo(() => {
    if (!user) return {};

    return {
      "suspension:update": (payload) => {
        if (payload?.public_user_id !== user.id) return;
        handleSuspensionUpdated(payload);
      },
      "suspension:revoked": (payload) => {
        if (payload?.public_user_id !== user.id) return;
        handleSuspensionUpdated(null);
      },
      "suspension:message:new": (payload) => {
        const suspensionId =
          payload?.suspensionId || payload?.message?.suspension_id;
        if (!suspensionId || suspensionId !== suspension?.id) return;
        if (appealOpen) return;

        const unread =
          payload?.unreadCounts?.user ??
          (typeof payload?.unreadCounts === "number"
            ? payload.unreadCounts
            : undefined);

        handleSuspensionUpdated({
          ...(suspension || {}),
          unreadCount:
            unread !== undefined ? unread : suspension?.unreadCount || 0,
        });
      },
      "suspension:messages:read": (payload) => {
        if (payload?.suspensionId !== suspension?.id) return;
        const unread =
          payload?.unreadCounts?.user ??
          (typeof payload?.unreadCounts === "number"
            ? payload.unreadCounts
            : 0);

        handleSuspensionUpdated({
          ...(suspension || {}),
          unreadCount: unread,
        });
      },
    };
  }, [user, suspension, handleSuspensionUpdated, appealOpen]);

  const suspensionSocket = useSuspensionSocket({
    token: authToken,
    enabled: Boolean(user && authToken),
    eventHandlers: suspensionHandlers,
  });

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  useEffect(() => {
    if (user) {
      const isNewUser = prevUserIdRef.current !== user.id;
      if (isNewUser) {
        initialSuspensionCheckRef.current = true;
        prevUserIdRef.current = user.id;
      }
      fetchSuspensionStatus(isNewUser);
    } else {
      setSuspension(null);
      setAppealOpen(false);
      setSuspensionReady(true);
      initialSuspensionCheckRef.current = false;
      prevUserIdRef.current = null;
    }
  }, [user, fetchSuspensionStatus]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      if (user) {
        setUser(null);
        setSuspensionReady(true);
        navigate("/", { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    const handlePopState = () => {
      setTimeout(() => {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        if (!token || !savedUser) {
          setSuspensionReady(true);
          navigate("/", { replace: true });
        }
      }, 0);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) return;

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
            const updatedUser = { ...data.data };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            await fetchSuspensionStatus();
          }
        }
      } catch (error) {
        console.error("Failed to refresh online status:", error);
      }
    };

    refreshOnlineStatus();
    const heartbeatInterval = setInterval(refreshOnlineStatus, 2 * 60 * 1000);
    return () => clearInterval(heartbeatInterval);
  }, [user, fetchSuspensionStatus]);

  useEffect(() => {
    if (
      !suspension?.id ||
      !suspensionSocket?.joinSuspension ||
      !suspensionSocket?.leaveSuspension ||
      !suspensionSocket?.isConnected
    ) {
      return undefined;
    }

    const targetId = suspension.id;
    suspensionSocket.joinSuspension(targetId);

    return () => {
      suspensionSocket.leaveSuspension(targetId);
    };
  }, [
    suspension?.id,
    suspensionSocket?.isConnected,
    suspensionSocket?.joinSuspension,
    suspensionSocket?.leaveSuspension,
  ]);

  useEffect(() => {
    if (!suspension) {
      setAppealOpen(false);
    }
  }, [suspension]);

  const showGlobalLoader = loading || !suspensionReady;

  if (showGlobalLoader) {
    return (
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FAFAFA",
        }}
      >
        <CircularProgress sx={{ color: "#D4AF37" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Navbar
        user={user}
        setUser={setUser}
        isSuspended={Boolean(suspension)}
        onLogout={requestLogout}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mt: { xs: 8, sm: 9 },
          pb: { xs: 10, md: 3 },
          backgroundColor: "#FAFAFA",
          minHeight: "100vh",
        }}
      >
        {suspension ? (
          <SuspensionGate
            user={user}
            suspension={suspension}
            onAppealClick={() => setAppealOpen(true)}
            onLogout={requestLogout}
            loading={loadingSuspension}
          />
        ) : (
          <Routes>
            <Route
              path="home"
              element={<Dashboard user={user} setUser={setUser} />}
            />
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
      <SuspensionAppealModal
        open={appealOpen && Boolean(suspension)}
        onClose={() => setAppealOpen(false)}
        suspension={suspension}
        token={authToken}
        socketContext={suspensionSocket}
        onSuspensionUpdated={handleSuspensionUpdated}
      />
    </Box>
  );
}

export default PageRoutes;
