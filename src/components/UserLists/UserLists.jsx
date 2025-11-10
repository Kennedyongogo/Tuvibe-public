import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Chat,
  WhatsApp,
  Person,
  LocationOn,
  Cake,
  Verified,
  Delete,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getDisplayInitial, getDisplayName } from "../../utils/userDisplay";

export default function UserLists({
  user,
  showTabs = true,
  defaultTab = "favorites",
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [favorites, setFavorites] = useState([]);
  const [unlockedChats, setUnlockedChats] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [loadingUnlocked, setLoadingUnlocked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  const token = localStorage.getItem("token");

  // Fetch favorites
  const fetchFavorites = async () => {
    try {
      setLoadingFavorites(true);
      const response = await fetch("/api/favourites", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success) {
        setFavorites(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load favorites",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Fetch unlocked chats
  const fetchUnlockedChats = async () => {
    try {
      setLoadingUnlocked(true);
      const response = await fetch("/api/chat", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success) {
        setUnlockedChats(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching unlocked chats:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load unlocked chats",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setLoadingUnlocked(false);
    }
  };

  // Remove favorite
  const removeFavorite = async (favoriteId) => {
    try {
      const response = await fetch(`/api/favourites/${favoriteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setFavorites(favorites.filter((fav) => fav.id !== favoriteId));
        Swal.fire({
          icon: "success",
          title: "Removed",
          text: "Removed from favorites",
          confirmButtonColor: "#D4AF37",
          timer: 1500,
        });
      }
    } catch (err) {
      console.error("Error removing favorite:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to remove favorite",
        confirmButtonColor: "#D4AF37",
      });
    }
  };

  // Open WhatsApp
  const openWhatsApp = (phone) => {
    if (!phone) {
      Swal.fire({
        icon: "warning",
        title: "No Phone Number",
        text: "This user doesn't have a phone number",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }
    const cleanedNumber = phone.replace(/[^0-9+]/g, "");
    const whatsappUrl = `https://wa.me/${cleanedNumber.replace(/^\+/, "")}`;
    window.open(whatsappUrl, "_blank");
  };

  // Get image URL
  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
    if (imageUrl.startsWith("/uploads/")) return imageUrl;
    if (imageUrl.startsWith("profiles/")) return `/uploads/${imageUrl}`;
    return imageUrl;
  };

  // Get all images for a user
  const getAllImages = (userData) => {
    const images = [];
    if (userData.photo && userData.photo_moderation_status === "approved") {
      images.push(buildImageUrl(userData.photo));
    }
    if (userData.photos && Array.isArray(userData.photos)) {
      userData.photos.forEach((photo) => {
        if (photo.path && photo.moderation_status === "approved") {
          images.push(buildImageUrl(photo.path));
        }
      });
    }
    return images;
  };

  // Auto-transition images
  useEffect(() => {
    const allUsers =
      activeTab === "favorites"
        ? favorites.map((f) => f.favouritedUser).filter(Boolean)
        : unlockedChats.map((u) => u.target).filter(Boolean);

    if (allUsers.length === 0) return;

    const intervals = {};
    const newIndices = {};

    allUsers.forEach((userData) => {
      const images = getAllImages(userData);
      const userId = userData.id;

      images.forEach((imageSrc) => {
        const img = new Image();
        img.src = imageSrc;
      });

      newIndices[userId] = 0;

      if (images.length > 1) {
        const imageCount = images.length;
        intervals[userId] = setInterval(() => {
          setCurrentImageIndex((prev) => {
            const currentIdx = prev[userId] || 0;
            const nextIdx = (currentIdx + 1) % imageCount;
            return { ...prev, [userId]: nextIdx };
          });
        }, 3000);
      }
    });

    setCurrentImageIndex(newIndices);

    return () => {
      Object.values(intervals).forEach((interval) => clearInterval(interval));
    };
  }, [favorites, unlockedChats, activeTab]);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === "favorites") {
      fetchFavorites();
    } else {
      fetchUnlockedChats();
    }
  }, [activeTab]);

  // Render user card
  const renderUserCard = (userData, extraData = {}) => {
    const images = getAllImages(userData);
    const currentIdx = currentImageIndex[userData.id] || 0;

    return (
      <Card
        key={userData.id}
        sx={{
          flex: {
            xs: "0 0 100%",
            sm: "0 0 calc(50% - 8px)",
            md: "0 0 calc(20% - 16px)",
          },
          display: "flex",
          flexDirection: "column",
          borderRadius: "12px",
          overflow: "hidden",
          transition: "all 0.3s ease",
          border: "1px solid rgba(212, 175, 55, 0.2)",
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 24px rgba(212, 175, 55, 0.3)",
          },
        }}
        onClick={() => navigate(`/explore`)}
      >
        {images.length > 0 ? (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: 200,
              overflow: "hidden",
              bgcolor: "rgba(212, 175, 55, 0.1)",
            }}
          >
            {images.map((image, index) => (
              <Box
                key={`${userData.id}-img-${index}`}
                component="img"
                src={image}
                alt={getDisplayName(userData, { fallback: "Member" })}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: currentIdx === index ? 1 : 0,
                  transition: "opacity 1.5s ease-in-out",
                  zIndex: currentIdx === index ? 1 : 0,
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              width: "100%",
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(212, 175, 55, 0.1)",
            }}
          >
            <Person sx={{ fontSize: 64, color: "#D4AF37", opacity: 0.3 }} />
          </Box>
        )}
        <CardContent sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "#1a1a1a",
                  fontSize: "0.9rem",
                }}
              >
                {getDisplayName(userData, { fallback: "Member" })}
              </Typography>
              {userData.isVerified && (
                <Verified sx={{ fontSize: 16, color: "#D4AF37" }} />
              )}
            </Box>
            {activeTab === "favorites" && extraData.favoriteId && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(extraData.favoriteId);
                }}
                sx={{
                  color: "#D4AF37",
                  "&:hover": {
                    bgcolor: "rgba(212, 175, 55, 0.1)",
                  },
                }}
              >
                <Delete sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mb: 0.5,
            }}
          >
            <LocationOn sx={{ fontSize: 12, color: "rgba(26, 26, 26, 0.6)" }} />
            <Typography
              variant="caption"
              sx={{ color: "rgba(26, 26, 26, 0.7)" }}
            >
              {userData.county || "N/A"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            <Cake sx={{ fontSize: 12, color: "rgba(26, 26, 26, 0.6)" }} />
            <Typography
              variant="caption"
              sx={{ color: "rgba(26, 26, 26, 0.7)" }}
            >
              {userData.age} years
            </Typography>
          </Box>
          {activeTab === "unlocked" && (
            <Button
              variant="contained"
              size="small"
              fullWidth
              startIcon={<WhatsApp />}
              onClick={(e) => {
                e.stopPropagation();
                openWhatsApp(userData.phone);
              }}
              sx={{
                background: "linear-gradient(135deg, #25D366, #128C7E)",
                color: "white",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "8px",
                mt: 1,
                "&:hover": {
                  background: "linear-gradient(135deg, #128C7E, #25D366)",
                },
              }}
            >
              Chat on WhatsApp
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Card
      sx={{
        p: 4,
        borderRadius: "16px",
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
        border: "1px solid rgba(212, 175, 55, 0.2)",
        boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
      }}
    >
      {showTabs && (
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                color: "rgba(26, 26, 26, 0.6)",
                "&.Mui-selected": {
                  color: "#D4AF37",
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#D4AF37",
              },
            }}
          >
            <Tab
              icon={<Favorite sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label="Favorites"
              value="favorites"
            />
            <Tab
              icon={<Chat sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label="Unlocked Chats"
              value="unlocked"
            />
          </Tabs>
        </Box>
      )}

      {activeTab === "favorites" && (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#1a1a1a",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Favorite sx={{ color: "#D4AF37" }} />
              My Favorites ({favorites.length})
            </Typography>
          </Box>
          {loadingFavorites ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress sx={{ color: "#D4AF37" }} />
            </Box>
          ) : favorites.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
                flexWrap: "wrap",
              }}
            >
              {favorites.map((favorite) =>
                renderUserCard(favorite.favouritedUser, {
                  favoriteId: favorite.id,
                })
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 4, px: 2 }}>
              <FavoriteBorder
                sx={{ fontSize: 64, color: "#D4AF37", opacity: 0.3, mb: 2 }}
              />
              <Typography variant="h6" sx={{ color: "#666", mb: 1 }}>
                No favorites yet
              </Typography>
              <Typography variant="body2" sx={{ color: "#999", mb: 3 }}>
                Start favoriting users to see them here!
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/explore")}
                sx={{
                  background: "linear-gradient(135deg, #D4AF37, #B8941F)",
                  color: "#1a1a1a",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "12px",
                  px: 3,
                  "&:hover": {
                    background: "linear-gradient(135deg, #B8941F, #D4AF37)",
                  },
                }}
              >
                Explore Users
              </Button>
            </Box>
          )}
        </>
      )}

      {activeTab === "unlocked" && (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#1a1a1a",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Chat sx={{ color: "#D4AF37" }} />
              Unlocked Chats ({unlockedChats.length})
            </Typography>
          </Box>
          {loadingUnlocked ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress sx={{ color: "#D4AF37" }} />
            </Box>
          ) : unlockedChats.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
                flexWrap: "wrap",
              }}
            >
              {unlockedChats.map((unlock) =>
                renderUserCard(unlock.target, {
                  unlockDate: unlock.createdAt,
                  tokenCost: unlock.token_cost,
                })
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 4, px: 2 }}>
              <Chat
                sx={{ fontSize: 64, color: "#D4AF37", opacity: 0.3, mb: 2 }}
              />
              <Typography variant="h6" sx={{ color: "#666", mb: 1 }}>
                No unlocked chats yet
              </Typography>
              <Typography variant="body2" sx={{ color: "#999", mb: 3 }}>
                Unlock chats with users to start conversations!
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/explore")}
                sx={{
                  background: "linear-gradient(135deg, #D4AF37, #B8941F)",
                  color: "#1a1a1a",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "12px",
                  px: 3,
                  "&:hover": {
                    background: "linear-gradient(135deg, #B8941F, #D4AF37)",
                  },
                }}
              >
                Explore Users
              </Button>
            </Box>
          )}
        </>
      )}
    </Card>
  );
}
