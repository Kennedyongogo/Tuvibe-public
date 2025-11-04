import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Avatar,
  Grid,
  CardMedia,
  CardContent,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Explore,
  Store,
  Store as StoreIcon,
  Wallet,
  Star,
  Star as StarIcon,
  WhatsApp as WhatsAppIcon,
  LocalOffer as TagIcon,
  Person,
  LocationOn,
  Cake,
  Verified,
  TrendingUp,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(false);
  const [featuredUsers, setFeaturedUsers] = useState([]);
  const [loadingFeaturedUsers, setLoadingFeaturedUsers] = useState(false);

  // Check if user is in premium category
  const premiumCategories = ["Sugar Mummy", "Sponsor", "Ben 10"];
  const isPremiumCategory =
    user?.category && premiumCategories.includes(user.category);

  // Fetch featured market items and users
  useEffect(() => {
    fetchFeaturedItems();
    fetchFeaturedUsers();
  }, []);

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

      const response = await fetch("/api/public/featured", {
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

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return imagePath;
    return `/uploads/${imagePath}`;
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

  const stats = [
    {
      title: "Token Balance",
      value: user?.token_balance || "0",
      icon: <Wallet />,
      color: "#D4AF37",
    },
    {
      title: "Profile Views",
      value: user?.profile_views || "0",
      icon: <Explore />,
      color: "#B8A9D9",
    },
    {
      title: isPremiumCategory ? "Premium Status" : "Account Category",
      value: user?.category || "Regular",
      icon: <Star />,
      color: isPremiumCategory ? "#FFD6CC" : "#B8A9D9",
    },
  ];

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
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

      {/* Stats Cards */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          mb: 4,
          flexDirection: { xs: "column", sm: "row" },
          width: "100%",
        }}
      >
        {stats.map((stat, index) => (
          <Card
            key={index}
            sx={{
              p: 3,
              borderRadius: "16px",
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
              border: "1px solid rgba(212, 175, 55, 0.2)",
              boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
              transition: "all 0.3s ease",
              flex: {
                xs: "0 0 100%",
                sm: "0 0 calc(33.333% - 16px)",
                md: "1 1 0%",
              },
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 32px rgba(212, 175, 55, 0.2)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(26, 26, 26, 0.7)",
                    mb: 1,
                    fontWeight: 500,
                  }}
                >
                  {stat.title}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#1a1a1a",
                  }}
                >
                  {stat.value}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  bgcolor: `${stat.color}20`,
                  color: stat.color,
                  width: 56,
                  height: 56,
                }}
              >
                {stat.icon}
              </Avatar>
            </Box>
          </Card>
        ))}
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
              const getUserImageUrl = (imagePath) => {
                if (!imagePath) return null;
                if (imagePath.startsWith("http")) return imagePath;
                if (imagePath.startsWith("/")) return imagePath;
                return `/uploads/${imagePath}`;
              };

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
                  {featuredUser.photo &&
                  featuredUser.photo_moderation_status === "approved" ? (
                    <Box
                      component="img"
                      src={getUserImageUrl(featuredUser.photo)}
                      alt={featuredUser.name}
                      sx={{
                        width: "100%",
                        height: 200,
                        objectFit: "cover",
                      }}
                    />
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
                {item.image ? (
                  <CardMedia
                    component="img"
                    height="180"
                    image={getImageUrl(item.image)}
                    alt={item.title}
                    sx={{ objectFit: "cover" }}
                  />
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
                      position: "relative",
                      top: -180,
                      left: 8,
                      mt: 2,
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

      {/* Quick Actions */}
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
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 3,
            color: "#1a1a1a",
          }}
        >
          Quick Actions
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            width: "100%",
          }}
        >
          <Box
            onClick={() => navigate("/explore")}
            sx={{
              p: 2,
              borderRadius: "12px",
              backgroundColor: "rgba(212, 175, 55, 0.1)",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              flex: {
                xs: "0 0 100%",
                sm: "0 0 calc(33.333% - 11px)",
                md: "1 1 0%",
              },
              "&:hover": {
                backgroundColor: "rgba(212, 175, 55, 0.15)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Explore sx={{ fontSize: 40, color: "#D4AF37", mb: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Explore Profiles
            </Typography>
          </Box>
          <Box
            onClick={() => navigate("/market")}
            sx={{
              p: 2,
              borderRadius: "12px",
              backgroundColor: "rgba(212, 175, 55, 0.1)",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              flex: {
                xs: "0 0 100%",
                sm: "0 0 calc(33.333% - 11px)",
                md: "1 1 0%",
              },
              "&:hover": {
                backgroundColor: "rgba(212, 175, 55, 0.15)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Store sx={{ fontSize: 40, color: "#D4AF37", mb: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Browse Market
            </Typography>
          </Box>
          <Box
            onClick={() => navigate("/wallet")}
            sx={{
              p: 2,
              borderRadius: "12px",
              backgroundColor: "rgba(212, 175, 55, 0.1)",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              flex: {
                xs: "0 0 100%",
                sm: "0 0 calc(33.333% - 11px)",
                md: "1 1 0%",
              },
              "&:hover": {
                backgroundColor: "rgba(212, 175, 55, 0.15)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Wallet sx={{ fontSize: 40, color: "#D4AF37", mb: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Buy Tokens
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
