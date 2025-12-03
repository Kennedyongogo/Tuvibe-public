import React, { useState, useEffect } from "react";
import { Alert, Snackbar } from "@mui/material";
import { getNetworkStatus } from "../utils/fetchWithTimeout";

/**
 * Network Status Component
 * Shows offline/online status and network quality warnings
 */
export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkQuality, setNetworkQuality] = useState("unknown");
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const status = getNetworkStatus();
      setIsOnline(status.isOnline);
      setNetworkQuality(status.quality);
      
      // Show warning for slow networks
      if (status.quality === "slow" && status.isOnline) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };

    // Initial check
    updateStatus();

    // Listen for online/offline events
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    // Listen for connection changes
    if (navigator.connection) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        connection.addEventListener("change", updateStatus);
      }
    }

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      if (navigator.connection) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
          connection.removeEventListener("change", updateStatus);
        }
      }
    };
  }, []);

  if (!isOnline) {
    return (
      <Snackbar
        open={true}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="warning" sx={{ width: "100%" }}>
          You are offline. Some features may not work.
        </Alert>
      </Snackbar>
    );
  }

  if (showWarning && networkQuality === "slow") {
    return (
      <Snackbar
        open={showWarning}
        autoHideDuration={6000}
        onClose={() => setShowWarning(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert 
          severity="info" 
          onClose={() => setShowWarning(false)}
          sx={{ width: "100%" }}
        >
          Slow network detected. Loading may take longer.
        </Alert>
      </Snackbar>
    );
  }

  return null;
}

