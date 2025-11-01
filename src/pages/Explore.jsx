import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Avatar,
  Button,
  Chip,
  IconButton,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Pagination,
  Tooltip,
  Badge,
  Divider,
} from "@mui/material";
import {
  LocationOn,
  Cake,
  Favorite,
  FavoriteBorder,
  Chat,
  Verified,
  Search,
  FilterList,
  Clear,
  Person,
  AccessTime,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import ViewProfile from "../components/ViewProfile";

export default function Explore({ user }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState({});
  const [favoriting, setFavoriting] = useState({});
  const [favorites, setFavorites] = useState({}); // Map of favourite_user_id -> favourite_id
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [viewingUserId, setViewingUserId] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    city: "",
    category: "",
    online: "",
    search: "",
  });

  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
    if (imageUrl.startsWith("/uploads/")) return imageUrl;
    if (imageUrl.startsWith("profiles/")) return `/uploads/${imageUrl}`;
    return imageUrl;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: "12",
      });

      if (filters.city) queryParams.append("city", filters.city);
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.online) queryParams.append("online", filters.online);
      if (filters.search) queryParams.append("q", filters.search);

      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/public?${queryParams}`, {
        method: "GET",
        headers,
      });

      const data = await response.json();

      if (data.success) {
        // Debug: Log online status
        const onlineUsers = (data.data || []).filter(u => u.is_online);
        if (onlineUsers.length > 0) {
          console.log("Online users:", onlineUsers.map(u => ({ name: u.name, is_online: u.is_online })));
        }
        setUsers(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalUsers(data.pagination?.total || 0);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to load users",
          confirmButtonColor: "#D4AF37",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load users. Please try again.",
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
    fetchUsers();
    if (localStorage.getItem("token")) {
      fetchFavorites();
    }
  }, [page, filters]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filter changes
  };

  const handleClearFilters = () => {
    setFilters({
      city: "",
      category: "",
      online: "",
      search: "",
    });
    setPage(1);
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

      // First get the cost
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

      // Check user balance
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (Number(user.token_balance || 0) < cost) {
        Swal.fire({
          icon: "warning",
          title: "Insufficient Tokens",
          html: `<p>You need ${cost} tokens to unlock this contact.</p><p>Your balance: ${user.token_balance || 0} tokens</p>`,
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
        return;
      }

      // Confirm unlock
      const confirmResult = await Swal.fire({
        icon: "question",
        title: "Unlock WhatsApp Contact?",
        html: `<p>This will cost you <strong>${cost} tokens</strong></p><p>Your balance: ${user.token_balance || 0} tokens</p>`,
        showCancelButton: true,
        confirmButtonText: "Unlock",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#D4AF37",
        didOpen: () => {
          const swal = document.querySelector(".swal2-popup");
          if (swal) {
            swal.style.borderRadius = "20px";
          }
        },
      });

      if (!confirmResult.isConfirmed) return;

      // Perform unlock
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
        // Update user balance in localStorage
        const updatedUser = {
          ...user,
          token_balance: (
            Number(user.token_balance || 0) - cost
          ).toFixed(2),
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Show success dialog with phone number and WhatsApp link
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
          didOpen: () => {
            const swal = document.querySelector(".swal2-popup");
            if (swal) {
              swal.style.borderRadius = "20px";
            }
          },
        }).then((result) => {
          if (result.isConfirmed) {
            // Open WhatsApp (app on mobile, web on desktop)
            window.location.href = unlockData.data.whatsapp_link;
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            // Copy phone number to clipboard
            navigator.clipboard.writeText(unlockData.data.phone).then(() => {
              Swal.fire({
                icon: "success",
                title: "Copied!",
                text: "Phone number copied to clipboard",
                timer: 1500,
                showConfirmButton: false,
                confirmButtonColor: "#D4AF37",
                didOpen: () => {
                  const swal = document.querySelector(".swal2-popup");
                  if (swal) {
                    swal.style.borderRadius = "20px";
                  }
                },
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
        // Remove favorite
        const response = await fetch(`/api/favourites/${favoriteId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setFavorites((prev) => {
            const newFavs = { ...prev };
            delete newFavs[userId];
            return newFavs;
          });
        }
      } else {
        // Add favorite
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
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update favorite",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setFavoriting((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Sugar Mummy":
        return "#FFB6C1";
      case "Sponsor":
        return "#B0E0E6";
      case "Ben 10":
        return "#E6E6FA";
      default:
        return "rgba(212, 175, 55, 0.15)";
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: { xs: "1.75rem", sm: "2.125rem" },
            background: "linear-gradient(45deg, #D4AF37, #B8941F)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          Explore Users
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "rgba(26, 26, 26, 0.7)",
            fontSize: { xs: "0.875rem", sm: "1rem" },
          }}
        >
          Discover and connect with others
        </Typography>
      </Box>

      {/* Filters */}
      <Card
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
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
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <FilterList sx={{ color: "#D4AF37" }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#1a1a1a",
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            Filters
          </Typography>
          {(filters.city ||
            filters.category ||
            filters.online ||
            filters.search) && (
            <Button
              startIcon={<Clear />}
              onClick={handleClearFilters}
              size="small"
              sx={{
                color: "#D4AF37",
                fontWeight: 600,
                textTransform: "none",
                ml: "auto",
              }}
            >
              Clear
            </Button>
          )}
        </Box>

        <Grid container spacing={2}>
          {/* Search */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name or city..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#D4AF37" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&:hover fieldset": {
                    borderColor: "rgba(212, 175, 55, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#D4AF37",
                  },
                },
              }}
            />
          </Grid>

          {/* Category Filter */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                label="Category"
                sx={{
                  borderRadius: "12px",
                  "& .MuiSelect-icon": {
                    color: "#D4AF37",
                  },
                }}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="Regular">Regular</MenuItem>
                <MenuItem value="Sugar Mummy">Sugar Mummy</MenuItem>
                <MenuItem value="Sponsor">Sponsor</MenuItem>
                <MenuItem value="Ben 10">Ben 10</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* City Filter */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              placeholder="City"
              value={filters.city}
              onChange={(e) => handleFilterChange("city", e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn sx={{ color: "#D4AF37", fontSize: "1.2rem" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&:hover fieldset": {
                    borderColor: "rgba(212, 175, 55, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#D4AF37",
                  },
                },
              }}
            />
          </Grid>

          {/* Online Status Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.online}
                onChange={(e) => handleFilterChange("online", e.target.value)}
                label="Status"
                sx={{
                  borderRadius: "12px",
                  "& .MuiSelect-icon": {
                    color: "#D4AF37",
                  },
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Online</MenuItem>
                <MenuItem value="false">Offline</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Results Count */}
      {!loading && (
        <Typography
          variant="body2"
          sx={{
            color: "rgba(26, 26, 26, 0.6)",
            mb: 2,
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
          }}
        >
          Showing {users.length} of {totalUsers} users
        </Typography>
      )}

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
          <Person sx={{ fontSize: 64, color: "rgba(212, 175, 55, 0.5)", mb: 2 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#1a1a1a",
              mb: 1,
            }}
          >
            No users found
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(26, 26, 26, 0.6)",
            }}
          >
            Try adjusting your filters or search terms
          </Typography>
        </Card>
      ) : (
        <>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
            {users.map((userData) => (
              <Box key={userData.id}>
                <Card
                  sx={{
                    height: "100%",
                    minHeight: { xs: "auto", sm: "250px" },
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    borderRadius: "16px",
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                    boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 30px rgba(212, 175, 55, 0.2)",
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
                      backgroundColor: "rgba(212, 175, 55, 0.1)",
                      overflow: "visible",
                      flexShrink: 0,
                    }}
                  >
                    {/* Image/Avatar Container */}
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
                          bottom: 8,
                          right: 8,
                          bgcolor: "rgba(255, 255, 255, 0.95)",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          border: "1px solid rgba(212, 175, 55, 0.3)",
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
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: "1rem", sm: "1.125rem" },
                          color: "#1a1a1a",
                          mb: 0.5,
                          lineHeight: 1.2,
                        }}
                      >
                        {userData.name}
                      </Typography>
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
                            sx={{
                              fontSize: "1rem",
                              color: "#D4AF37",
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(26, 26, 26, 0.7)",
                              fontSize: "0.75rem",
                            }}
                          >
                            {userData.city}
                          </Typography>
                        </Box>
                      )}
                      {userData.age && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Cake
                            sx={{
                              fontSize: "1rem",
                              color: "#D4AF37",
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(26, 26, 26, 0.7)",
                              fontSize: "0.75rem",
                            }}
                          >
                            {userData.age} years old
                          </Typography>
                        </Box>
                      )}
                      {/* Show last seen only when user is offline */}
                      {!userData.is_online && userData.last_seen_at && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <AccessTime
                            sx={{
                              fontSize: "0.9rem",
                              color: "rgba(26, 26, 26, 0.5)",
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(26, 26, 26, 0.6)",
                              fontSize: "0.7rem",
                              fontStyle: "italic",
                            }}
                          >
                            Last seen {(() => {
                              const lastSeen = new Date(userData.last_seen_at);
                              const now = new Date();
                              const diffMs = now - lastSeen;
                              const diffMins = Math.floor(diffMs / 60000);
                              const diffHours = Math.floor(diffMs / 3600000);
                              const diffDays = Math.floor(diffMs / 86400000);
                              
                              if (diffMins < 1) return "just now";
                              if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
                              if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
                              if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
                              return lastSeen.toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              });
                            })()}
                          </Typography>
                        </Box>
                      )}
                      {userData.bio && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(26, 26, 26, 0.7)",
                            fontSize: "0.7rem",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            mt: 0.5,
                          }}
                        >
                          {userData.bio}
                        </Typography>
                      )}
                    </Stack>

                    {/* Actions */}
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={() => {
                          // Navigate to profile page - if user is viewing own profile, show it
                          // Otherwise show public profile view dialog
                          if (user?.id === userData.id) {
                            navigate("/profile");
                          } else {
                            setViewingUserId(userData.id);
                            setViewProfileOpen(true);
                          }
                        }}
                        sx={{
                          borderColor: "rgba(212, 175, 55, 0.5)",
                          color: "#1a1a1a",
                          fontWeight: 600,
                          textTransform: "none",
                          borderRadius: "8px",
                          fontSize: "0.75rem",
                          "&:hover": {
                            borderColor: "#D4AF37",
                            bgcolor: "rgba(212, 175, 55, 0.1)",
                          },
                        }}
                      >
                        View
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
                            background:
                              "linear-gradient(135deg, #D4AF37, #B8941F)",
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
                          Chat
                        </Button>
                      </Tooltip>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 4,
              }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "#1a1a1a",
                    fontWeight: 600,
                    "&.Mui-selected": {
                      background: "linear-gradient(135deg, #D4AF37, #B8941F)",
                      color: "#1a1a1a",
                      "&:hover": {
                        background: "linear-gradient(135deg, #B8941F, #D4AF37)",
                      },
                    },
                  },
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* View Profile Dialog */}
      <ViewProfile
        open={viewProfileOpen}
        onClose={() => {
          setViewProfileOpen(false);
          setViewingUserId(null);
        }}
        userId={viewingUserId}
        user={user}
      />
    </Box>
  );
}

