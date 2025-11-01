import React from "react";
import { Box, Typography, Card, Avatar } from "@mui/material";
import { Explore, Store, Wallet, Star } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function Dashboard({ user }) {
  const navigate = useNavigate();
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
      title: "Premium Status",
      value: user?.category || "Regular",
      icon: <Star />,
      color: "#FFD6CC",
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
              flex: { xs: "0 0 100%", sm: "0 0 calc(33.333% - 16px)", md: "1 1 0%" },
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
            sx={{
              p: 2,
              borderRadius: "12px",
              backgroundColor: "rgba(212, 175, 55, 0.1)",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              flex: { xs: "0 0 100%", sm: "0 0 calc(33.333% - 11px)", md: "1 1 0%" },
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
            sx={{
              p: 2,
              borderRadius: "12px",
              backgroundColor: "rgba(212, 175, 55, 0.1)",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              flex: { xs: "0 0 100%", sm: "0 0 calc(33.333% - 11px)", md: "1 1 0%" },
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
              flex: { xs: "0 0 100%", sm: "0 0 calc(33.333% - 11px)", md: "1 1 0%" },
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
