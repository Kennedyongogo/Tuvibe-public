import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  IconButton,
  Stack,
  CircularProgress,
  Tooltip,
  Tabs,
  Tab,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  LocationOn,
  Cake,
  Favorite,
  FavoriteBorder,
  Chat,
  Verified,
  Person,
  Star,
  AccessTime,
  Visibility,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import ViewProfile from "../components/ViewProfile";

export default function PremiumLounge({ user }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState({});
  const [favoriting, setFavoriting] = useState({});
  const [favorites, setFavorites] = useState({});
  const [selectedTab, setSelectedTab] = useState(0);
  const [tokenCost, setTokenCost] = useState(0);
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [viewingUserId, setViewingUserId] = useState(null);
  const [lookingForPosts, setLookingForPosts] = useState({}); // Map of userId -> post
  const [lookingForDialogOpen, setLookingForDialogOpen] = useState(false);
  const [selectedLookingForPost, setSelectedLookingForPost] = useState(null);

  const categories = [
    { label: "Sugar Mummy", value: "Sugar Mummy" },
    { label: "Sponsor", value: "Sponsor" },
    { label: "Ben 10", value: "Ben 10" },
  ];

  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
    if (imageUrl.startsWith("/uploads/")) return imageUrl;
    if (imageUrl.startsWith("profiles/")) return `/uploads/${imageUrl}`;
    return imageUrl;
  };

  const fetchPremiumUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to access Premium Lounge",
        confirmButtonColor: "#D4AF37",
      }).then(() => {
        navigate("/");
      });
      return;
    }

    try {
      setLoading(true);
      const selectedCategory = categories[selectedTab].value;
      const response = await fetch(
        `/api/verification/lounge/${encodeURIComponent(selectedCategory)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        const fetchedUsers = data.data.users || [];
        setUsers(fetchedUsers);
        setTokenCost(data.data.cost || 0);
        
        // Fetch "Looking For" posts for these users
        if (fetchedUsers.length > 0) {
          fetchLookingForPosts(fetchedUsers.map(u => u.id));
        }
      } else {
        if (response.status === 401) {
          Swal.fire({
            icon: "warning",
            title: "Login Required",
            text: data.message || "Please login to access Premium Lounge",
            confirmButtonColor: "#D4AF37",
          }).then(() => {
            navigate("/");
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.message || "Failed to load premium users",
            confirmButtonColor: "#D4AF37",
          });
        }
      }
    } catch (err) {
      console.error("Error fetching premium users:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load premium lounge",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("/api/favourites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        const favMap = {};
        data.data.forEach((fav) => {
          favMap[fav.favourite_user_id] = fav.id;
        });
        setFavorites(favMap);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  useEffect(() => {
    fetchPremiumUsers();
    if (localStorage.getItem("token")) {
      fetchFavorites();
    }
  }, [selectedTab]);

  // Fetch "Looking For" posts for multiple users
  const fetchLookingForPosts = async (userIds) => {
    if (userIds.length === 0) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `/api/posts/by-users?user_ids=${userIds.join(",")}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        // Convert array to map by user_id
        const postsMap = {};
        data.data.forEach((post) => {
          postsMap[post.public_user_id] = post;
        });
        setLookingForPosts(postsMap);
      }
    } catch (err) {
      console.error("Error fetching Looking For posts:", err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setUsers([]);
    setLookingForPosts({}); // Clear posts when switching tabs
  };

  const handleWhatsAppUnlock = async (targetUserId, targetUserName) => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to unlock WhatsApp contact",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    try {
      setUnlocking((prev) => ({ ...prev, [targetUserId]: true }));

      // Get the cost
      const costResponse = await fetch(
        `/api/chat/cost?target_user_id=${targetUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const costData = await costResponse.json();

      if (!costData.success) {
        throw new Error(costData.message || "Failed to get chat cost");
      }

      const cost = costData.data.cost;
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

      if (Number(currentUser.token_balance || 0) < cost) {
        Swal.fire({
          icon: "warning",
          title: "Insufficient Tokens",
          html: `<p>You need ${cost} tokens to unlock this contact.</p><p>Your balance: ${currentUser.token_balance || 0} tokens</p>`,
          confirmButtonText: "Buy Tokens",
          cancelButtonText: "Cancel",
          showCancelButton: true,
          confirmButtonColor: "#D4AF37",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/wallet");
          }
        });
        return;
      }

      const confirmResult = await Swal.fire({
        icon: "question",
        title: "Unlock WhatsApp Contact?",
        html: `<p>This will cost you <strong>${cost} tokens</strong></p><p>Your balance: ${currentUser.token_balance || 0} tokens</p>`,
        showCancelButton: true,
        confirmButtonText: "Unlock",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#D4AF37",
      });

      if (!confirmResult.isConfirmed) return;

      const unlockResponse = await fetch("/api/chat/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ target_user_id: targetUserId }),
      });

      const unlockData = await unlockResponse.json();

      if (!unlockResponse.ok) {
        throw new Error(unlockData.message || "Failed to unlock contact");
      }

      if (unlockData.success && unlockData.data) {
        const updatedUser = {
          ...currentUser,
          token_balance: (
            Number(currentUser.token_balance || 0) - cost
          ).toFixed(2),
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        Swal.fire({
          icon: "success",
          title: "Contact Unlocked!",
          html: `
            <div style="text-align: center;">
              <p style="margin-bottom: 12px; font-size: 1rem;">You can now chat with <strong>${targetUserName}</strong> via WhatsApp</p>
              <p style="margin-bottom: 8px; color: rgba(26, 26, 26, 0.7); font-size: 0.9rem;">Phone Number:</p>
              <p style="margin-bottom: 16px; font-size: 1.1rem; font-weight: 600; color: #D4AF37;">${unlockData.data.phone}</p>
              <p style="margin-bottom: 0; font-size: 0.85rem; color: rgba(26, 26, 26, 0.6);">
                ${/Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) 
                  ? "Opening WhatsApp app..." 
                  : "Opening WhatsApp Web..."}
              </p>
            </div>
          `,
          showConfirmButton: true,
          confirmButtonText: "Open WhatsApp",
          showCancelButton: true,
          cancelButtonText: "Copy Number",
          confirmButtonColor: "#D4AF37",
          cancelButtonColor: "rgba(26, 26, 26, 0.3)",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = unlockData.data.whatsapp_link;
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            navigator.clipboard.writeText(unlockData.data.phone).then(() => {
              Swal.fire({
                icon: "success",
                title: "Copied!",
                text: "Phone number copied to clipboard",
                timer: 1500,
                showConfirmButton: false,
                confirmButtonColor: "#D4AF37",
              });
            });
          }
        });
      }
    } catch (error) {
      console.error("Unlock error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to unlock contact",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setUnlocking((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  const handleFavorite = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to favorite users",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    const isFavorited = favorites[userId];
    const favoriteId = favorites[userId];

    try {
      setFavoriting((prev) => ({ ...prev, [userId]: true }));

      if (isFavorited && favoriteId) {
        const response = await fetch(`/api/favourites/${favoriteId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setFavorites((prev) => {
            const newFavs = { ...prev };
            delete newFavs[userId];
            return newFavs;
          });
        }
      } else {
        const response = await fetch("/api/favourites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ favourite_user_id: userId }),
        });

        const data = await response.json();
        if (data.success) {
          setFavorites((prev) => ({
            ...prev,
            [userId]: data.data.id,
          }));
        }
      }
    } catch (error) {
      console.error("Favorite error:", error);
    } finally {
      setFavoriting((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Sugar Mummy":
        return "rgba(255, 192, 203, 0.3)";
      case "Sponsor":
        return "rgba(176, 196, 222, 0.3)";
      case "Ben 10":
        return "rgba(152, 251, 152, 0.3)";
      default:
        return "rgba(212, 175, 55, 0.15)";
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
          }}
        >
          <Star sx={{ fontSize: 40, color: "#D4AF37" }} />
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(45deg, #D4AF37, #B8941F)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "1.75rem", sm: "2.125rem" },
              }}
            >
              Premium Lounge
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(26, 26, 26, 0.7)",
                mt: 0.5,
              }}
            >
              Exclusive verified premium profiles
            </Typography>
          </Box>
        </Box>

        {/* Token Cost Banner */}
        {tokenCost > 0 && (
          <Card
            sx={{
              p: 2,
              mb: 3,
              borderRadius: "12px",
              background:
                "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(184, 148, 31, 0.1) 100%)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(26, 26, 26, 0.7)",
                    mb: 0.5,
                    fontSize: "0.875rem",
                  }}
                >
                  Token Cost per Chat
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#D4AF37",
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  }}
                >
                  {tokenCost} Tokens
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate("/wallet")}
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
                Buy Tokens
              </Button>
            </Box>
          </Card>
        )}

        {/* Category Tabs */}
        <Card
          sx={{
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid rgba(212, 175, 55, 0.2)",
          }}
        >
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "#D4AF37",
                height: 3,
              },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "rgba(26, 26, 26, 0.6)",
                "&.Mui-selected": {
                  color: "#D4AF37",
                },
              },
            }}
          >
            {categories.map((category) => (
              <Tab key={category.value} label={category.label} />
            ))}
          </Tabs>
        </Card>
      </Box>

      {/* Users Grid */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress sx={{ color: "#D4AF37" }} />
        </Box>
      ) : users.length === 0 ? (
        <Card
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: "16px",
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
            border: "1px solid rgba(212, 175, 55, 0.2)",
          }}
        >
          <Star sx={{ fontSize: 64, color: "rgba(212, 175, 55, 0.5)", mb: 2 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#1a1a1a",
              mb: 1,
            }}
          >
            No verified {categories[selectedTab].label} profiles yet
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(26, 26, 26, 0.6)",
            }}
          >
            Verified premium profiles will appear here
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {users.map((userData) => (
            <Card
              key={userData.id}
              sx={{
                height: "100%",
                minHeight: { xs: "auto", sm: "250px" },
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                borderRadius: "16px",
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
                border: "2px solid rgba(212, 175, 55, 0.3)",
                boxShadow: "0 4px 20px rgba(212, 175, 55, 0.15)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 30px rgba(212, 175, 55, 0.25)",
                  border: "2px solid rgba(212, 175, 55, 0.5)",
                },
                overflow: "hidden",
              }}
            >
              {/* Photo Section */}
              <Box
                sx={{
                  position: "relative",
                  width: { xs: "100%", sm: "200px", md: "200px" },
                  minWidth: { xs: "100%", sm: "200px", md: "200px" },
                  height: { xs: "250px", sm: "250px", md: "250px", lg: "100%" },
                  minHeight: { xs: "250px", sm: "250px", md: "250px", lg: "250px" },
                  backgroundColor: "rgba(212, 175, 55, 0.1)",
                  overflow: "visible",
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    minHeight: "250px",
                    overflow: "hidden",
                  }}
                >
                  {userData.photo ? (
                    <Box
                      component="img"
                      src={buildImageUrl(userData.photo)}
                      alt={userData.name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: { xs: "120px", sm: "150px", md: "120px" },
                          height: { xs: "120px", sm: "150px", md: "120px" },
                          bgcolor: "#D4AF37",
                          fontSize: { xs: "3rem", sm: "4rem", md: "3rem" },
                          fontWeight: 700,
                        }}
                      >
                        {userData.name?.charAt(0)?.toUpperCase() || "U"}
                      </Avatar>
                    </Box>
                  )}
                </Box>

                {/* Favorite Button */}
                {localStorage.getItem("token") && (
                  <IconButton
                    onClick={() => handleFavorite(userData.id)}
                    disabled={favoriting[userData.id]}
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      bgcolor: "rgba(255, 255, 255, 0.9)",
                      color: favorites[userData.id] ? "#F44336" : "#666",
                      zIndex: 20,
                      width: { xs: "36px", sm: "40px", md: "36px" },
                      height: { xs: "36px", sm: "40px", md: "36px" },
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 1)",
                        transform: "scale(1.1)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    {favoriting[userData.id] ? (
                      <CircularProgress size={20} />
                    ) : favorites[userData.id] ? (
                      <Favorite />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>
                )}

                {/* Online Badge */}
                {Boolean(userData.is_online) && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: { xs: "14px", sm: "16px", md: "14px" },
                      height: { xs: "14px", sm: "16px", md: "14px" },
                      borderRadius: "50%",
                      bgcolor: "#4CAF50",
                      border: "3px solid white",
                      boxShadow: "0 2px 8px rgba(76, 175, 80, 0.5)",
                      zIndex: 20,
                    }}
                    title="Online"
                  />
                )}

                {/* Verified Badge */}
                {userData.isVerified && (
                  <Chip
                    icon={
                      <Verified
                        sx={{ fontSize: "1rem !important", color: "#D4AF37" }}
                      />
                    }
                    label="Verified"
                    size="small"
                    sx={{
                      position: "absolute",
                      bottom: { xs: 8, sm: 8, md: 8, lg: 8 },
                      right: { xs: 8, sm: 8, md: 8, lg: 8 },
                      bgcolor: "rgba(255, 255, 255, 0.95)",
                      fontWeight: 600,
                      fontSize: { xs: "0.65rem", sm: "0.7rem", md: "0.7rem", lg: "0.75rem" },
                      border: "1px solid rgba(212, 175, 55, 0.3)",
                      zIndex: 25,
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    }}
                  />
                )}
              </Box>

              {/* Content Section */}
              <CardContent
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  p: 2,
                }}
              >
                {/* Name and Category */}
                <Box sx={{ mb: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "1rem", sm: "1.125rem" },
                        color: "#1a1a1a",
                        lineHeight: 1.2,
                        flex: 1,
                      }}
                    >
                      {userData.name}
                    </Typography>
                    {lookingForPosts[userData.id] && (
                      <Tooltip title="View What They're Looking For">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedLookingForPost({
                              userName: userData.name,
                              content: lookingForPosts[userData.id].content,
                              createdAt: lookingForPosts[userData.id].createdAt,
                            });
                            setLookingForDialogOpen(true);
                          }}
                          sx={{
                            color: "#D4AF37",
                            "&:hover": {
                              backgroundColor: "rgba(212, 175, 55, 0.1)",
                              transform: "scale(1.1)",
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  <Chip
                    label={userData.category || "Regular"}
                    size="small"
                    sx={{
                      bgcolor: getCategoryColor(userData.category),
                      color: "#1a1a1a",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      height: "22px",
                    }}
                  />
                </Box>

                <Divider sx={{ my: 1, borderColor: "rgba(212, 175, 55, 0.2)" }} />

                {/* Info */}
                <Stack spacing={0.5} sx={{ mb: 1.5, flexGrow: 1 }}>
                  {userData.city && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <LocationOn
                        sx={{ fontSize: "1rem", color: "rgba(26, 26, 26, 0.6)" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: "rgba(26, 26, 26, 0.7)",
                          fontSize: "0.8rem",
                        }}
                      >
                        {userData.city}
                      </Typography>
                    </Box>
                  )}
                  {userData.age && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Cake
                        sx={{ fontSize: "1rem", color: "rgba(26, 26, 26, 0.6)" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: "rgba(26, 26, 26, 0.7)",
                          fontSize: "0.8rem",
                        }}
                      >
                        {userData.age} years old
                      </Typography>
                    </Box>
                  )}
                </Stack>

                {/* Bio Preview */}
                {userData.bio && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(26, 26, 26, 0.7)",
                      fontSize: "0.8rem",
                      mb: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {userData.bio}
                  </Typography>
                )}

                {/* Actions */}
                <Stack direction="row" spacing={1} sx={{ mt: "auto" }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setViewingUserId(userData.id);
                      setViewProfileOpen(true);
                    }}
                    sx={{
                      borderColor: "rgba(212, 175, 55, 0.5)",
                      color: "#1a1a1a",
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: "8px",
                      fontSize: "0.75rem",
                      flex: 1,
                      "&:hover": {
                        borderColor: "#D4AF37",
                        bgcolor: "rgba(212, 175, 55, 0.1)",
                      },
                    }}
                  >
                    View Profile
                  </Button>
                  <Tooltip title="Unlock WhatsApp Contact">
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      startIcon={
                        unlocking[userData.id] ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <Chat />
                        )
                      }
                      onClick={() =>
                        handleWhatsAppUnlock(userData.id, userData.name)
                      }
                      disabled={unlocking[userData.id]}
                      sx={{
                        background: "linear-gradient(135deg, #D4AF37, #B8941F)",
                        color: "#1a1a1a",
                        fontWeight: 600,
                        textTransform: "none",
                        borderRadius: "8px",
                        fontSize: "0.75rem",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #B8941F, #D4AF37)",
                          transform: "translateY(-1px)",
                        },
                        "&:disabled": {
                          background: "rgba(212, 175, 55, 0.3)",
                        },
                      }}
                    >
                      Chat ({tokenCost} tokens)
                    </Button>
                  </Tooltip>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* View Profile Dialog */}
      <ViewProfile
        open={viewProfileOpen}
        onClose={() => {
          setViewProfileOpen(false);
          setViewingUserId(null);
        }}
        userId={viewingUserId}
      />

      {/* "Looking For" Dialog */}
      <Dialog
        open={lookingForDialogOpen}
        onClose={() => {
          setLookingForDialogOpen(false);
          setSelectedLookingForPost(null);
        }}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "16px",
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #D4AF37, #B8941F)",
            color: "#1a1a1a",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1,
            pb: 2,
          }}
        >
          <Visibility sx={{ color: "#1a1a1a" }} />
          {selectedLookingForPost?.userName
            ? `${selectedLookingForPost.userName}'s Looking For`
            : "Looking For"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedLookingForPost?.content && (
            <Box>
              <Typography
                variant="body1"
                sx={{
                  color: "#1a1a1a",
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  fontSize: "1rem",
                  mb: 2,
                }}
              >
                {selectedLookingForPost.content}
              </Typography>
              {selectedLookingForPost.createdAt && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(26, 26, 26, 0.5)",
                    fontStyle: "italic",
                  }}
                >
                  Posted on{" "}
                  {new Date(selectedLookingForPost.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            borderTop: "1px solid rgba(212, 175, 55, 0.2)",
            backgroundColor: "rgba(212, 175, 55, 0.05)",
          }}
        >
          <Button
            onClick={() => {
              setLookingForDialogOpen(false);
              setSelectedLookingForPost(null);
            }}
            sx={{
              color: "#1a1a1a",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(212, 175, 55, 0.1)",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

