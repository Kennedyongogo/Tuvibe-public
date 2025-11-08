import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { keyframes } from "@mui/system";
import {
  Explore,
  Store,
  Store as StoreIcon,
  Star as StarIcon,
  WhatsApp as WhatsAppIcon,
  LocalOffer as TagIcon,
  Person,
  LocationOn,
  Cake,
  Verified,
  TrendingUp,
  AccessTime,
  Favorite,
  LockOpen,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import UserLists from "../components/UserLists/UserLists";

const goldShine = keyframes`
  0% {
    opacity: 0.35;
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.45), 0 0 22px rgba(212, 175, 55, 0.35);
  }
  50% {
    opacity: 0.9;
    box-shadow: 0 0 26px rgba(255, 215, 0, 0.9), 0 0 46px rgba(212, 175, 55, 0.65);
  }
  100% {
    opacity: 0.35;
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.45), 0 0 22px rgba(212, 175, 55, 0.35);
  }
`;

export default function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(false);
  const [featuredUsers, setFeaturedUsers] = useState([]);
  const [loadingFeaturedUsers, setLoadingFeaturedUsers] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState({}); // Track current image index for each user
  const [currentItemImageIndex, setCurrentItemImageIndex] = useState({}); // Track current image index for each featured item
  const [userListsTab, setUserListsTab] = useState("favorites");
  const [boostDialogOpen, setBoostDialogOpen] = useState(false);
  const [boosting, setBoosting] = useState(false);
  const [boostTimeRemaining, setBoostTimeRemaining] = useState(null);
  const favoritesSectionRef = React.useRef(null);

  // Fetch featured market items and users
  useEffect(() => {
    fetchFeaturedItems();
    fetchFeaturedUsers();
  }, []);

  // Auto-transition images for each featured user
  useEffect(() => {
    if (featuredUsers.length === 0) return;

    const intervals = {};
    // Reset all image indices when users change
    const newIndices = {};

    featuredUsers.forEach((userData) => {
      const images = getAllImages(userData);
      const userId = userData.id;

      // Preload all images for smooth transitions
      images.forEach((imageSrc) => {
        const img = new Image();
        img.src = imageSrc;
      });

      // Always reset to 0 for new users
      newIndices[userId] = 0;

      if (images.length > 1) {
        const imageCount = images.length;

        // Set up interval for this user
        intervals[userId] = setInterval(() => {
          setCurrentImageIndex((prev) => {
            const currentIdx = prev[userId] || 0;
            const nextIdx = (currentIdx + 1) % imageCount;
            return { ...prev, [userId]: nextIdx };
          });
        }, 3000); // Change image every 3 seconds
      }
    });

    // Set all indices to 0
    setCurrentImageIndex(newIndices);

    // Cleanup intervals on unmount or when users change
    return () => {
      Object.values(intervals).forEach((interval) => clearInterval(interval));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featuredUsers]);

  // Auto-transition images for each featured market item
  useEffect(() => {
    if (featuredItems.length === 0) return;

    const intervals = {};
    const newIndices = {};

    featuredItems.forEach((item) => {
      const images = item.images || [];
      const itemId = item.id;

      // Preload all images for smooth transitions
      images.forEach((imagePath) => {
        const img = new Image();
        img.src = getImageUrl(imagePath);
      });

      // Always reset to 0 for new items
      newIndices[itemId] = 0;

      if (images.length > 1) {
        const imageCount = images.length;

        // Set up interval for this item
        intervals[itemId] = setInterval(() => {
          setCurrentItemImageIndex((prev) => {
            const currentIdx = prev[itemId] || 0;
            const nextIdx = (currentIdx + 1) % imageCount;
            return { ...prev, [itemId]: nextIdx };
          });
        }, 3000); // Change image every 3 seconds
      }
    });

    // Set all indices to 0
    setCurrentItemImageIndex(newIndices);

    // Cleanup intervals on unmount or when items change
    return () => {
      Object.values(intervals).forEach((interval) => clearInterval(interval));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featuredItems]);

  useEffect(() => {
    if (!user?.is_featured_until) {
      setBoostTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date();
      const until = new Date(user.is_featured_until);
      const diff = until - now;

      if (diff <= 0) {
        setBoostTimeRemaining(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setBoostTimeRemaining({ hours, minutes });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [user?.is_featured_until]);

  const fetchFeaturedItems = async () => {
    try {
      setLoadingFeatured(true);
      const response = await fetch("/api/market");
      const data = await response.json();

      if (data.success) {
        // Filter and get only featured items, limit to 6
        const featured = (data.data || [])
          .filter((item) => item.is_featured)
          .slice(0, 6);
        setFeaturedItems(featured);
      }
    } catch (err) {
      console.error("Error fetching featured items:", err);
    } finally {
      setLoadingFeatured(false);
    }
  };

  const fetchFeaturedUsers = async () => {
    try {
      setLoadingFeaturedUsers(true);
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/public/featured/boosts?limit=12", {
        headers,
      });
      const data = await response.json();

      if (data.success) {
        setFeaturedUsers(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching featured users:", err);
    } finally {
      setLoadingFeaturedUsers(false);
    }
  };

  const handleBoostProfile = async (hours = 24, cost = 20) => {
    setBoosting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Authentication Required",
          text: "Please login to boost your profile.",
          confirmButtonColor: "#D4AF37",
        });
        return;
      }

      const response = await fetch("/api/tokens/boost", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hours, cost }),
      });

      const data = await response.json();

      if (response.status === 402) {
        setBoostDialogOpen(false);
        await new Promise((resolve) => setTimeout(resolve, 100));

        Swal.fire({
          icon: "warning",
          title: "Insufficient Tokens",
          text: `You need ${cost} tokens to boost your profile. Please purchase more tokens.`,
          confirmButtonColor: "#D4AF37",
          showCancelButton: true,
          cancelButtonColor: "#999",
          confirmButtonText: "Buy Tokens",
          cancelButtonText: "Cancel",
          didOpen: () => {
            const swal = document.querySelector(".swal2-popup");
            if (swal) {
              swal.style.borderRadius = "20px";
              swal.style.border = "1px solid rgba(212, 175, 55, 0.3)";
            }
          },
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/wallet");
          }
        });
        return;
      }

      if (data.success) {
        const userResponse = await fetch("/api/public/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userResponse.json();
        if (userData.success && typeof setUser === "function") {
          setUser(userData.data);
        }

        Swal.fire({
          icon: "success",
          title: "Profile Boosted!",
          html: `Your profile is now boosted for ${hours} hours!<br/>
                 <small>Boost expires: ${new Date(
                   data.data.is_featured_until
                 ).toLocaleString()}</small>`,
          confirmButtonColor: "#D4AF37",
          didOpen: () => {
            const swal = document.querySelector(".swal2-popup");
            if (swal) {
              swal.style.borderRadius = "20px";
              swal.style.border = "1px solid rgba(212, 175, 55, 0.3)";
              swal.style.boxShadow = "0 20px 60px rgba(212, 175, 55, 0.25)";
            }
          },
        });
        setBoostDialogOpen(false);
        fetchFeaturedUsers();
        fetchFeaturedItems();
      } else {
        Swal.fire({
          icon: "error",
          title: "Boost Failed",
          text: data.message || "Failed to boost profile. Please try again.",
          confirmButtonColor: "#D4AF37",
        });
      }
    } catch (err) {
      console.error("Boost profile error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to boost profile. Please try again later.",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setBoosting(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return imagePath;
    return `/uploads/${imagePath}`;
  };

  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
    if (imageUrl.startsWith("/uploads/")) return imageUrl;
    if (imageUrl.startsWith("profiles/")) return `/uploads/${imageUrl}`;
    return imageUrl;
  };

  // Get all images for a user (main photo + photos array)
  const getAllImages = (userData) => {
    const images = [];
    // Add main photo if it exists (only approved)
    if (userData.photo && userData.photo_moderation_status === "approved") {
      images.push(buildImageUrl(userData.photo));
    }
    // Add photos from array if they exist (only approved photos)
    if (userData.photos && Array.isArray(userData.photos)) {
      userData.photos.forEach((photo) => {
        if (photo.path && photo.moderation_status === "approved") {
          images.push(buildImageUrl(photo.path));
        }
      });
    }
    return images;
  };

  const handleWhatsAppClick = (item) => {
    const phoneNumber = item.whatsapp_number || "";
    const cleanedNumber = phoneNumber.replace(/[^0-9+]/g, "");
    const message = encodeURIComponent(
      `Hi! I'm interested in ${item.title} (KES ${parseFloat(item.price).toLocaleString()}). Can you provide more details?`
    );

    if (cleanedNumber) {
      const whatsappUrl = `https://wa.me/${cleanedNumber}?text=${message}`;
      window.open(whatsappUrl, "_blank");
    } else {
      Swal.fire({
        icon: "warning",
        title: "No WhatsApp Number",
        text: "This item doesn't have a WhatsApp contact. Please contact support.",
        confirmButtonColor: "#D4AF37",
      });
    }
  };

  const handleViewMarket = () => {
    navigate("/market");
  };

  const handleScrollToUserLists = (tab) => {
    setUserListsTab(tab);
    if (favoritesSectionRef.current) {
      favoritesSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <Box>
      {/* Welcome Section */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              background: "linear-gradient(45deg, #D4AF37, #B8941F)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Welcome back, {user?.name || "User"}!
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(26, 26, 26, 0.7)" }}>
            Discover, connect, and explore the TuVibe community
          </Typography>
        </Box>
        <Button
          variant="contained"
          sx={{
            alignSelf: { xs: "stretch", sm: "center" },
            width: { xs: "100%", sm: "auto" },
            px: { xs: 2.5, sm: 3.5, md: 4 },
            py: { xs: 1, sm: 1.3, md: 1.5 },
            minWidth: { xs: "100%", sm: 210, md: 240 },
            borderRadius: "999px",
            fontWeight: 700,
            letterSpacing: { xs: "0.6px", sm: "0.8px" },
            textTransform: "uppercase",
            fontSize: { xs: "0.78rem", sm: "0.9rem", md: "0.95rem" },
            color: "#1a1a1a",
            background:
              "linear-gradient(135deg, rgba(255, 215, 0, 0.95), rgba(212, 175, 55, 0.95))",
            boxShadow: `
              0 12px 24px rgba(212, 175, 55, 0.35),
              0 0 12px rgba(255, 215, 0, 0.6)
            `,
            position: "relative",
            overflow: "visible",
            outline: "none",
            "&:focus": {
              outline: "none",
              boxShadow: `
                0 12px 24px rgba(212, 175, 55, 0.35),
                0 0 12px rgba(255, 215, 0, 0.6)
              `,
            },
            "&:focus-visible": {
              outline: "none",
              boxShadow: `
                0 12px 24px rgba(212, 175, 55, 0.35),
                0 0 12px rgba(255, 215, 0, 0.6)
              `,
            },
            "&::before": {
              content: '""',
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "120%",
              height: "120%",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 60%)",
              transform: "translate(-50%, -50%)",
              opacity: 0,
              transition: "opacity 0.4s ease",
            },
            "&:hover": {
              background:
                "linear-gradient(135deg, rgba(255, 230, 80, 1), rgba(212, 175, 55, 1))",
              boxShadow: `
                0 18px 32px rgba(212, 175, 55, 0.45),
                0 0 18px rgba(255, 215, 0, 0.75)
              `,
              transform: "translateY(-2px)",
              "&::before": {
                opacity: 0.8,
              },
            },
            "&:active": {
              transform: "translateY(0)",
              boxShadow: `
                0 10px 20px rgba(212, 175, 55, 0.35),
                0 0 12px rgba(255, 215, 0, 0.6)
              `,
            },
            "&::after": {
              content: '""',
              position: "absolute",
              inset: { xs: "-12px", sm: "-10px", md: "-12px" },
              borderRadius: "999px",
              border: "2px solid rgba(255, 215, 0, 0.6)",
              boxShadow: "0 0 18px rgba(255, 215, 0, 0.55)",
              opacity: 0.5,
              animation: `${goldShine} 3.2s ease-in-out infinite`,
              pointerEvents: "none",
              zIndex: -1,
            },
        }}
        onClick={() => setBoostDialogOpen(true)}
        disabled={boosting}
        >
          Boost Profile
        </Button>
        {boostTimeRemaining ? (
          <Typography
            variant="caption"
            sx={{
              color: "rgba(26, 26, 26, 0.7)",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <AccessTime sx={{ fontSize: 16, color: "#D4AF37" }} />
            Active boost: {boostTimeRemaining.hours}h {boostTimeRemaining.minutes}
            m remaining
          </Typography>
        ) : (
          <Typography
            variant="caption"
            sx={{ color: "rgba(26, 26, 26, 0.6)", fontWeight: 500 }}
          >
            Boost your profile to appear in featured sections.
          </Typography>
        )}
      </Box>

      {/* Quick Access Cards */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 4,
          flexWrap: "nowrap",
          justifyContent: "space-between",
          alignItems: "stretch",
          width: "100%",
        }}
      >
        <Card
          onClick={() => handleScrollToUserLists("favorites")}
          sx={{
            flex: "1 1 0%",
            minWidth: { xs: 160, sm: 220, md: 260 },
            p: { xs: 1.5, sm: 2 },
            borderRadius: "16px",
            textTransform: "none",
            cursor: "pointer",
            position: "relative",
            color: "rgba(0, 0, 0, 0.9)",
            border: "2px solid rgba(255, 255, 255, 0.5)",
            fontWeight: 700,
            letterSpacing: "0.5px",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            boxShadow: `
              0 10px 40px rgba(0, 0, 0, 0.15),
              0 0 0 1px rgba(255, 255, 255, 0.3) inset,
              0 2px 0 rgba(255, 255, 255, 0.6) inset,
              0 -1px 8px rgba(0, 0, 0, 0.1) inset,
              0 0 20px rgba(255, 215, 0, 0.1)
            `,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)",
              transition: "left 0.6s ease",
            },
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.45)",
              borderColor: "rgba(255, 255, 255, 0.8)",
              borderWidth: "2px",
              transform: "translateY(-2px) scale(1.02)",
              boxShadow: `
                0 0 30px rgba(255, 215, 0, 0.4),
                0 15px 50px rgba(0, 0, 0, 0.2),
                0 0 0 1px rgba(255, 255, 255, 0.4) inset,
                0 3px 0 rgba(255, 255, 255, 0.7) inset,
                0 -1px 12px rgba(0, 0, 0, 0.15) inset,
                0 0 30px rgba(255, 215, 0, 0.2)
              `,
              "&::before": {
                left: "100%",
              },
            },
            "&:active": {
              transform: "translateY(0) scale(1)",
              boxShadow: `
                0 0 20px rgba(255, 215, 0, 0.3),
                0 8px 30px rgba(0, 0, 0, 0.15),
                0 0 0 1px rgba(255, 255, 255, 0.3) inset,
                0 1px 0 rgba(255, 255, 255, 0.5) inset
              `,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: { xs: 1.25, sm: 1.5, md: 2 },
            }}
          >
            <Favorite
              sx={{
                fontSize: { xs: "1.35rem", sm: "1.55rem", md: "1.75rem" },
                color: "#ff6b9d",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "0.85rem", sm: "0.98rem", md: "1.1rem" },
                textAlign: "center",
              }}
            >
              Meet Your Favorites
            </Typography>
          </Box>
        </Card>

        <Card
          onClick={() => handleScrollToUserLists("unlocked")}
          sx={{
            flex: "1 1 0%",
            minWidth: { xs: 160, sm: 220, md: 260 },
            p: { xs: 1.5, sm: 2 },
            borderRadius: "16px",
            textTransform: "none",
            cursor: "pointer",
            position: "relative",
            color: "rgba(0, 0, 0, 0.9)",
            border: "2px solid rgba(255, 255, 255, 0.5)",
            fontWeight: 700,
            letterSpacing: "0.5px",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            boxShadow: `
              0 10px 40px rgba(0, 0, 0, 0.15),
              0 0 0 1px rgba(255, 255, 255, 0.3) inset,
              0 2px 0 rgba(255, 255, 255, 0.6) inset,
              0 -1px 8px rgba(0, 0, 0, 0.1) inset,
              0 0 20px rgba(255, 215, 0, 0.1)
            `,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)",
              transition: "left 0.6s ease",
            },
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.45)",
              borderColor: "rgba(255, 255, 255, 0.8)",
              borderWidth: "2px",
              transform: "translateY(-2px) scale(1.02)",
              boxShadow: `
                0 0 30px rgba(255, 215, 0, 0.4),
                0 15px 50px rgba(0, 0, 0, 0.2),
                0 0 0 1px rgba(255, 255, 255, 0.4) inset,
                0 3px 0 rgba(255, 255, 255, 0.7) inset,
                0 -1px 12px rgba(0, 0, 0, 0.15) inset,
                0 0 30px rgba(255, 215, 0, 0.2)
              `,
              "&::before": {
                left: "100%",
              },
            },
            "&:active": {
              transform: "translateY(0) scale(1)",
              boxShadow: `
                0 0 20px rgba(255, 215, 0, 0.3),
                0 8px 30px rgba(0, 0, 0, 0.15),
                0 0 0 1px rgba(255, 255, 255, 0.3) inset,
                0 1px 0 rgba(255, 255, 255, 0.5) inset
              `,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: { xs: 1.25, sm: 1.5, md: 2 },
            }}
          >
            <LockOpen
              sx={{
                fontSize: { xs: "1.35rem", sm: "1.55rem", md: "1.75rem" },
                color: "#D4AF37",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "0.85rem", sm: "0.98rem", md: "1.1rem" },
                textAlign: "center",
              }}
            >
              View Unlocked Chats
            </Typography>
          </Box>
        </Card>
      </Box>

      {/* Featured Users Carousel */}
      <Card
        sx={{
          p: 4,
          mb: 4,
          borderRadius: "16px",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
          border: "1px solid rgba(212, 175, 55, 0.2)",
          boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
        }}
      >
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
            <TrendingUp sx={{ color: "#D4AF37" }} />
            Featured Profiles
          </Typography>
          <Button
            variant="text"
            onClick={() => navigate("/explore")}
            sx={{
              color: "#D4AF37",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(212, 175, 55, 0.1)",
              },
            }}
          >
            View All
          </Button>
        </Box>
        {loadingFeaturedUsers ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: "#D4AF37" }} />
          </Box>
        ) : featuredUsers.length > 0 ? (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
              flexWrap: "wrap",
            }}
          >
            {featuredUsers.slice(0, 10).map((featuredUser) => {
              const images = getAllImages(featuredUser);
              const currentIdx = currentImageIndex[featuredUser.id] || 0;

              return (
                <Card
                  key={featuredUser.id}
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
                          key={`featured-${featuredUser.id}-img-${index}`}
                          component="img"
                          src={image}
                          alt={featuredUser.name}
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
                      <Person
                        sx={{ fontSize: 64, color: "#D4AF37", opacity: 0.3 }}
                      />
                    </Box>
                  )}
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: "#1a1a1a",
                          fontSize: "0.9rem",
                        }}
                      >
                        {featuredUser.name}
                      </Typography>
                      {featuredUser.isVerified && (
                        <Verified sx={{ fontSize: 16, color: "#D4AF37" }} />
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
                      <LocationOn
                        sx={{ fontSize: 12, color: "rgba(26, 26, 26, 0.6)" }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(26, 26, 26, 0.7)" }}
                      >
                        {featuredUser.county}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Cake
                        sx={{ fontSize: 12, color: "rgba(26, 26, 26, 0.6)" }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(26, 26, 26, 0.7)" }}
                      >
                        {featuredUser.age} years
                      </Typography>
                    </Box>
                    {featuredUser.is_featured_until &&
                      new Date(featuredUser.is_featured_until) > new Date() && (
                        <Chip
                          label="Boosted"
                          size="small"
                          sx={{
                            mt: 1,
                            bgcolor: "#D4AF37",
                            color: "#1a1a1a",
                            fontWeight: 600,
                            fontSize: "0.65rem",
                            height: 20,
                          }}
                          icon={
                            <TrendingUp
                              sx={{ fontSize: 12, color: "#1a1a1a" }}
                            />
                          }
                        />
                      )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              px: 2,
            }}
          >
            <Person
              sx={{ fontSize: 64, color: "#D4AF37", opacity: 0.3, mb: 2 }}
            />
            <Typography variant="h6" sx={{ color: "#666", mb: 1 }}>
              No featured profiles yet
            </Typography>
            <Typography variant="body2" sx={{ color: "#999" }}>
              Boost your profile to appear here!
            </Typography>
          </Box>
        )}
      </Card>

      {/* Featured Items Carousel */}
      <Card
        sx={{
          p: 4,
          mb: 4,
          borderRadius: "16px",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
          border: "1px solid rgba(212, 175, 55, 0.2)",
          boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
        }}
      >
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
            <StarIcon sx={{ color: "#FFD700" }} />
            Featured Items
          </Typography>
          <Button
            variant="text"
            onClick={handleViewMarket}
            sx={{
              color: "#D4AF37",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(212, 175, 55, 0.1)",
              },
            }}
          >
            View All
          </Button>
        </Box>
        {loadingFeatured ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: "#D4AF37" }} />
          </Box>
        ) : featuredItems.length > 0 ? (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
              flexWrap: "wrap",
            }}
          >
            {featuredItems.map((item) => (
              <Card
                key={item.id}
                sx={{
                  flex: {
                    xs: "0 0 100%",
                    sm: "0 0 calc(50% - 8px)",
                    md: "0 0 calc(33.333% - 14px)",
                  },
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "12px",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(212, 175, 55, 0.3)",
                  },
                }}
              >
                {item.images && item.images.length > 0 ? (
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: 180,
                      overflow: "hidden",
                    }}
                  >
                    {item.images.map((imagePath, index) => {
                      const currentIdx = currentItemImageIndex[item.id] || 0;
                      return (
                        <Box
                          key={`${item.id}-img-${index}`}
                          component="img"
                          src={getImageUrl(imagePath)}
                          alt={item.title}
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
                      );
                    })}
                    {item.images.length > 1 && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                          color: "white",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          zIndex: 2,
                        }}
                      >
                        +{item.images.length - 1} more
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: 180,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "rgba(212, 175, 55, 0.1)",
                    }}
                  >
                    <StoreIcon
                      sx={{ fontSize: 48, color: "#D4AF37", opacity: 0.3 }}
                    />
                  </Box>
                )}
                {item.tag !== "none" && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      zIndex: 3,
                    }}
                  >
                    <Chip
                      label={item.tag === "hot_deals" ? "🔥 Hot" : "⭐ Weekend"}
                      size="small"
                      sx={{
                        bgcolor:
                          item.tag === "hot_deals"
                            ? "rgba(255, 107, 107, 0.95)"
                            : "rgba(78, 205, 196, 0.95)",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "0.65rem",
                      }}
                    />
                  </Box>
                )}
                <CardContent
                  sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: "#1a1a1a",
                      mb: 1,
                      fontSize: "0.95rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#D4AF37",
                      mb: 2,
                    }}
                  >
                    KES {parseFloat(item.price).toLocaleString()}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<WhatsAppIcon />}
                    onClick={() => handleWhatsAppClick(item)}
                    sx={{
                      background: "linear-gradient(135deg, #25D366, #128C7E)",
                      color: "white",
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: "8px",
                      "&:hover": {
                        background: "linear-gradient(135deg, #128C7E, #25D366)",
                      },
                    }}
                  >
                    Contact
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              px: 2,
            }}
          >
            <StoreIcon
              sx={{ fontSize: 64, color: "#D4AF37", opacity: 0.3, mb: 2 }}
            />
            <Typography variant="h6" sx={{ color: "#666", mb: 1 }}>
              No featured items yet
            </Typography>
            <Typography variant="body2" sx={{ color: "#999", mb: 3 }}>
              Check back soon for exciting featured marketplace items!
            </Typography>
            <Button
              variant="contained"
              onClick={handleViewMarket}
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
              Browse All Items
            </Button>
          </Box>
        )}
      </Card>

      {/* Favorites and Unlocked Chats */}
      <Box ref={favoritesSectionRef}>
        <UserLists
          key={userListsTab}
          user={user}
          showTabs={true}
          defaultTab={userListsTab}
        />
      </Box>

      <Dialog
        open={boostDialogOpen}
        onClose={() => !boosting && setBoostDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            boxShadow: "0 20px 60px rgba(212, 175, 55, 0.25)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(45deg, #D4AF37, #B8941F)",
            color: "#1a1a1a",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1,
            py: 2,
          }}
        >
          <TrendingUp />
          {boostTimeRemaining ? "Extend Profile Boost" : "Boost Your Profile"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert
            severity="info"
            sx={{
              mb: 3,
              borderRadius: "12px",
              bgcolor: "rgba(212, 175, 55, 0.1)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, mb: 1, color: "#1a1a1a" }}
            >
              Why Boost Your Profile?
            </Typography>
            <Box
              component="ul"
              sx={{ m: 0, pl: 2.5, "& li": { mb: 1, fontSize: "0.875rem" } }}
            >
              <li>
                <strong>Higher Visibility:</strong> Boosted profiles appear FIRST
                in search results and Explore page
              </li>
              <li>
                <strong>Featured Section:</strong> Your profile appears in the
                homepage featured carousel for maximum exposure
              </li>
              <li>
                <strong>More Profile Views:</strong> Increased visibility means
                more people discover and view your profile
              </li>
              <li>
                <strong>Boost Score:</strong> Each boost permanently increases
                your boost score, providing long-term ranking benefits
              </li>
              <li>
                <strong>Active Boost Priority:</strong> Profiles with active
                boosts rank above non-boosted profiles, even after your boost
                expires
              </li>
            </Box>
            {boostTimeRemaining && (
              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: "1px solid rgba(212, 175, 55, 0.3)",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  <strong>Active Boost:</strong> {boostTimeRemaining.hours}h{" "}
                  {boostTimeRemaining.minutes}m remaining
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(26, 26, 26, 0.6)",
                    display: "block",
                    mt: 0.5,
                  }}
                >
                  Extending now will add time to your current boost
                </Typography>
              </Box>
            )}
          </Alert>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 2, color: "#1a1a1a" }}
            >
              Boost Options
            </Typography>
            <Stack spacing={2}>
              <Card
                sx={{
                  p: 2,
                  border: "2px solid #D4AF37",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  position: "relative",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(212, 175, 55, 0.3)",
                  },
                }}
                onClick={() => handleBoostProfile(24, 20)}
              >
                <Chip
                  label="POPULAR"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "#D4AF37",
                    color: "#1a1a1a",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ pr: 6 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "#1a1a1a" }}
                    >
                      24 Hours
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(26, 26, 26, 0.6)", mb: 0.5 }}
                    >
                      Standard boost duration
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(26, 26, 26, 0.7)", display: "block" }}
                    >
                      Best value for regular visibility boost
                    </Typography>
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#D4AF37" }}
                  >
                    20 Tokens
                  </Typography>
                </Box>
              </Card>

              <Card
                sx={{
                  p: 2,
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  "&:hover": {
                    borderColor: "#D4AF37",
                    boxShadow: "0 4px 12px rgba(212, 175, 55, 0.2)",
                  },
                }}
                onClick={() => handleBoostProfile(48, 38)}
              >
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
                      sx={{ fontWeight: 700, color: "#1a1a1a" }}
                    >
                      48 Hours
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(26, 26, 26, 0.6)" }}
                    >
                      Extended visibility
                    </Typography>
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#D4AF37" }}
                  >
                    38 Tokens
                  </Typography>
                </Box>
              </Card>

              <Card
                sx={{
                  p: 2,
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  "&:hover": {
                    borderColor: "#D4AF37",
                    boxShadow: "0 4px 12px rgba(212, 175, 55, 0.2)",
                  },
                }}
                onClick={() => handleBoostProfile(72, 55)}
              >
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
                      sx={{ fontWeight: 700, color: "#1a1a1a" }}
                    >
                      72 Hours
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(26, 26, 26, 0.6)" }}
                    >
                      Maximum visibility
                    </Typography>
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#D4AF37" }}
                  >
                    55 Tokens
                  </Typography>
                </Box>
              </Card>
            </Stack>
          </Box>

          <Alert
            severity="warning"
            sx={{ borderRadius: "12px", bgcolor: "rgba(255, 152, 0, 0.1)" }}
          >
            <Typography variant="body2">
              <strong>Current Balance:</strong> {user?.token_balance || "0.00"}{" "}
              Tokens
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setBoostDialogOpen(false)}
            disabled={boosting}
            sx={{
              color: "rgba(26, 26, 26, 0.7)",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          {boosting && (
            <CircularProgress size={24} sx={{ color: "#D4AF37", ml: 2 }} />
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
