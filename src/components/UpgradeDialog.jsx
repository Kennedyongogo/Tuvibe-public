import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Star, Info } from "@mui/icons-material";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function UpgradeDialog({ open, onClose }) {
  const navigate = useNavigate();
  const [upgradeCategories, setUpgradeCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [upgrading, setUpgrading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);

  // Debug: Log when open prop changes
  useEffect(() => {
    console.log("UpgradeDialog - open prop changed to:", open);
    console.log(
      "UpgradeDialog - Dialog component will render with open=",
      open
    );
  }, [open]);

  // Fetch and update token balance
  useEffect(() => {
    if (open) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setTokenBalance(Number(user.token_balance || 0));
        } catch (err) {
          console.error("Error parsing user data:", err);
        }
      }
    }
  }, [open]);

  // Fetch upgrade costs
  const fetchUpgradeCosts = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("/api/verification/upgrade-costs", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setUpgradeCategories(data.data.categories || []);
      }
    } catch (err) {
      console.error("Error fetching upgrade costs:", err);
    }
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    const selectedCat = upgradeCategories.find(
      (cat) => cat.category === category
    );
    const cost = selectedCat?.cost || 0;

    // Check if balance is zero or insufficient
    if (Number(tokenBalance) === 0 || Number(tokenBalance) < cost) {
      // Close upgrade dialog first
      onClose();

      // Small delay to ensure dialog is closed before showing Swal
      setTimeout(() => {
        Swal.fire({
          icon: "warning",
          title: "Insufficient Tokens",
          html: `<p>You need ${cost} tokens to upgrade to ${category}.</p><p>Your balance: ${Number(tokenBalance).toFixed(2)} tokens</p>`,
          confirmButtonText: "Buy Tokens",
          cancelButtonText: "Cancel",
          showCancelButton: true,
          confirmButtonColor: "#D4AF37",
          didOpen: () => {
            const swal = document.querySelector(".swal2-popup");
            if (swal) {
              swal.style.borderRadius = "20px";
            }
          },
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/wallet");
          }
        });
      }, 100);
      return;
    }

    // If balance is sufficient, select the category
    setSelectedCategory(category);
  };

  // Handle upgrade submission
  const handleUpgrade = async () => {
    if (!selectedCategory) return;

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please log in to upgrade.",
      });
      return;
    }

    // Check balance one more time before submitting
    const selectedCat = upgradeCategories.find(
      (cat) => cat.category === selectedCategory
    );
    const cost = selectedCat?.cost || 0;

    if (Number(tokenBalance) === 0 || Number(tokenBalance) < cost) {
      onClose();
      setTimeout(() => {
        Swal.fire({
          icon: "warning",
          title: "Insufficient Tokens",
          html: `<p>You need ${cost} tokens to upgrade to ${selectedCategory}.</p><p>Your balance: ${Number(tokenBalance).toFixed(2)} tokens</p>`,
          confirmButtonText: "Buy Tokens",
          cancelButtonText: "Cancel",
          showCancelButton: true,
          confirmButtonColor: "#D4AF37",
          didOpen: () => {
            const swal = document.querySelector(".swal2-popup");
            if (swal) {
              swal.style.borderRadius = "20px";
            }
          },
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/wallet");
          }
        });
      }, 100);
      return;
    }

    setUpgrading(true);
    try {
      const response = await fetch("/api/verification/upgrade", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category: selectedCategory }),
      });

      const data = await response.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Upgrade Successful!",
          text: "You have been upgraded to premium and automatically verified.",
          confirmButtonColor: "#D4AF37",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            // Ensure overlay has proper background
            const swal = document.querySelector(".swal2-container");
            if (swal) {
              swal.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
            }
          },
          willClose: () => {
            // Ensure smooth transition before reload
            const swal = document.querySelector(".swal2-container");
            if (swal) {
              swal.style.transition = "opacity 0.2s ease-out";
            }
          },
        }).then(() => {
          // Update local storage with full updated user data from API
          if (data.data && data.data.user) {
            // Use the complete user object from the API response
            const updatedUser = {
              ...data.data.user,
              token_balance: data.data.remainingBalance || data.data.user.token_balance,
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
          } else {
            // Fallback: manually update if API doesn't return user
            const userStr = localStorage.getItem("user");
            if (userStr) {
              const user = JSON.parse(userStr);
              user.category = selectedCategory;
              user.isVerified = true;
              if (data.data && data.data.remainingBalance !== undefined) {
                user.token_balance = data.data.remainingBalance;
              }
              localStorage.setItem("user", JSON.stringify(user));
            }
          }
          // Small delay to ensure smooth transition before reload
          setTimeout(() => {
            window.location.reload();
          }, 100);
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Upgrade Failed",
          text: data.message || "Failed to upgrade. Please try again.",
          confirmButtonColor: "#D4AF37",
        });
      }
    } catch (err) {
      console.error("Error upgrading:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred. Please try again.",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setUpgrading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUpgradeCosts();
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={false}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Star sx={{ color: "#D4AF37" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Upgrade to Premium
            </Typography>
          </Box>
          <Box
            sx={{
              mt: 1,
              p: 1.5,
              bgcolor: "rgba(212, 175, 55, 0.1)",
              borderRadius: 1,
              border: "1px solid rgba(212, 175, 55, 0.3)",
            }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
              Current Balance
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#D4AF37",
              }}
            >
              {Number(tokenBalance).toFixed(2)} tokens
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert
          icon={<Info />}
          severity="info"
          sx={{
            mb: 3,
            backgroundColor: "rgba(212, 175, 55, 0.1)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            "& .MuiAlert-icon": {
              color: "#D4AF37",
            },
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Premium Lounge Access Required
          </Typography>
          <Typography variant="body2">
            Only premium users can access Premium Lounge. Upgrade to a premium
            category to unlock premium features and connect with verified
            premium users.
          </Typography>
        </Alert>
        <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
          Choose a premium category to upgrade. You will be automatically
          verified upon upgrade.
        </Typography>

        {upgradeCategories.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: "#D4AF37" }} />
          </Box>
        ) : (
          <Stack spacing={2}>
            {upgradeCategories.map((cat) => (
              <Card
                key={cat.category}
                onClick={() => handleCategorySelect(cat.category)}
                sx={{
                  cursor: "pointer",
                  border:
                    selectedCategory === cat.category
                      ? "2px solid #D4AF37"
                      : "2px solid transparent",
                  backgroundColor:
                    selectedCategory === cat.category
                      ? "rgba(212, 175, 55, 0.1)"
                      : "transparent",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    border: "2px solid #D4AF37",
                    backgroundColor: "rgba(212, 175, 55, 0.05)",
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {cat.category}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cat.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${cat.cost} tokens`}
                      color="primary"
                      sx={{
                        backgroundColor: "#D4AF37",
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

        {selectedCategory && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: "rgba(212, 175, 55, 0.1)",
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Selected:</strong> {selectedCategory}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cost:{" "}
              {
                upgradeCategories.find(
                  (cat) => cat.category === selectedCategory
                )?.cost
              }{" "}
              tokens
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleUpgrade}
          variant="contained"
          disabled={!selectedCategory || upgrading}
          sx={{
            backgroundColor: "#D4AF37",
            "&:hover": { backgroundColor: "#B8941F" },
          }}
        >
          {upgrading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Upgrading...
            </>
          ) : (
            "Upgrade Now"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
