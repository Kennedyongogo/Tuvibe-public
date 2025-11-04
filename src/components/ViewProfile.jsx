import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Avatar,
  Chip,
  Stack,
  Divider,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  Close,
  Verified,
  LocationOn,
  Cake,
  Person,
  Star,
  Chat,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";
import Swal from "sweetalert2";

export default function ViewProfile({ open, onClose, userId, user }) {
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (open && userId && userId !== user?.id) {
      fetchProfile();
      checkFavorite();
    }
  }, [open, userId, user?.id]);

  const fetchProfile = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/public/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setProfileUser(data.data);
        // Track profile view
        trackView();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to load profile",
          confirmButtonColor: "#D4AF37",
        });
        onClose();
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load profile",
        confirmButtonColor: "#D4AF37",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const trackView = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/public/users/${userId}/view`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Silently track - no need to show message
    } catch (error) {
      console.error("Error tracking view:", error);
      // Don't show error to user - tracking is optional
    }
  };

  const checkFavorite = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/favourites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        const favorites = data.data || [];
        setIsFavorite(
          favorites.some((fav) => fav.favourite_user_id === userId)
        );
      }
    } catch (error) {
      console.error("Error checking favorite:", error);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const token = localStorage.getItem("token");
      const method = isFavorite ? "DELETE" : "POST";
      const response = await fetch(`/api/favourites/${userId}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update favorite",
        confirmButtonColor: "#D4AF37",
      });
    }
  };

  const buildImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return imagePath.startsWith("/uploads/")
      ? imagePath
      : `/uploads/${imagePath}`;
  };

  if (!open || !userId) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(212, 175, 55, 0.3)",
          border: "2px solid rgba(212, 175, 55, 0.3)",
          maxHeight: "95vh",
          margin: { xs: 2, sm: 4 },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
          pt: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            background: "linear-gradient(45deg, #D4AF37, #B8941F)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
          }}
        >
          Profile
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <CircularProgress sx={{ color: "#D4AF37" }} />
          </Box>
        ) : profileUser ? (
          <Box>
            {/* Profile Header */}
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Avatar
                src={buildImageUrl(profileUser.photo)}
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: "#D4AF37",
                  fontSize: "3rem",
                  fontWeight: 700,
                  border: "4px solid rgba(212, 175, 55, 0.3)",
                  boxShadow: "0 8px 24px rgba(212, 175, 55, 0.2)",
                  mx: "auto",
                  mb: 2,
                }}
              >
                {!profileUser.photo &&
                  (profileUser.name?.charAt(0)?.toUpperCase() || "U")}
              </Avatar>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  color: "#1a1a1a",
                }}
              >
                {profileUser.name}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                justifyContent="center"
                sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}
              >
                {profileUser.isVerified && (
                  <Chip
                    icon={<Verified sx={{ color: "#D4AF37 !important" }} />}
                    label="Verified"
                    sx={{
                      bgcolor: "rgba(212, 175, 55, 0.15)",
                      color: "#1a1a1a",
                      fontWeight: 600,
                    }}
                  />
                )}
                <Chip
                  label={profileUser.category || "Regular"}
                  sx={{
                    bgcolor: "rgba(212, 175, 55, 0.15)",
                    color: "#1a1a1a",
                    fontWeight: 600,
                  }}
                />
                {profileUser.is_online ? (
                  <Chip
                    label="Online"
                    sx={{
                      bgcolor: "rgba(199, 233, 208, 0.3)",
                      color: "#1a1a1a",
                      fontWeight: 600,
                    }}
                  />
                ) : (
                  <Chip
                    label="Offline"
                    sx={{
                      bgcolor: "rgba(26, 26, 26, 0.1)",
                      color: "rgba(26, 26, 26, 0.7)",
                      fontWeight: 600,
                    }}
                  />
                )}
              </Stack>
            </Box>

            <Divider sx={{ my: 2, borderColor: "rgba(212, 175, 55, 0.2)" }} />

            {/* Profile Information */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {profileUser.age && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Cake sx={{ color: "#D4AF37" }} />
                  <Typography variant="body1">
                    <strong>Age:</strong> {profileUser.age}
                  </Typography>
                </Box>
              )}

              {profileUser.gender && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Person sx={{ color: "#D4AF37" }} />
                  <Typography variant="body1">
                    <strong>Gender:</strong> {profileUser.gender}
                  </Typography>
                </Box>
              )}

              {profileUser.county && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationOn sx={{ color: "#D4AF37" }} />
                  <Typography variant="body1">
                    <strong>County:</strong> {profileUser.county}
                  </Typography>
                </Box>
              )}

              {profileUser.bio && (
                <Box sx={{ mt: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(26, 26, 26, 0.7)", mb: 1 }}
                  >
                    <strong>Bio:</strong>
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      p: 2,
                      borderRadius: "12px",
                      bgcolor: "rgba(212, 175, 55, 0.05)",
                      border: "1px solid rgba(212, 175, 55, 0.2)",
                    }}
                  >
                    {profileUser.bio}
                  </Typography>
                </Box>
              )}

              {profileUser.createdAt && (
                <Box sx={{ mt: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(26, 26, 26, 0.7)" }}
                  >
                    <strong>Member since:</strong>{" "}
                    {new Date(profileUser.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 2,
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Button
          startIcon={isFavorite ? <Favorite /> : <FavoriteBorder />}
          onClick={handleToggleFavorite}
          variant="outlined"
          fullWidth={false}
          sx={{
            borderColor: "rgba(212, 175, 55, 0.5)",
            color: "#1a1a1a",
            fontWeight: 600,
            textTransform: "none",
            borderRadius: "12px",
            px: 3,
            "&:hover": {
              borderColor: "#D4AF37",
              bgcolor: "rgba(212, 175, 55, 0.1)",
            },
          }}
        >
          {isFavorite ? "Unfavorite" : "Favorite"}
        </Button>
        <Button
          startIcon={<Chat />}
          variant="contained"
          fullWidth={false}
          onClick={() => {
            // This would trigger WhatsApp unlock - functionality already exists in Explore
            Swal.fire({
              icon: "info",
              title: "WhatsApp Chat",
              text: "Please use the WhatsApp Chat button on the Explore page to unlock contact",
              confirmButtonColor: "#D4AF37",
            });
            onClose();
          }}
          sx={{
            background: "linear-gradient(135deg, #D4AF37, #B8941F)",
            color: "#1a1a1a",
            fontWeight: 600,
            textTransform: "none",
            borderRadius: "12px",
            px: 3,
            flex: { xs: 1, sm: "none" },
            "&:hover": {
              background: "linear-gradient(135deg, #B8941F, #D4AF37)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 24px rgba(212, 175, 55, 0.3)",
            },
          }}
        >
          WhatsApp Chat
        </Button>
      </DialogActions>
    </Dialog>
  );
}
