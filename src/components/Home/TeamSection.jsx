import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Chip,
  Fade,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";

const StyledTeamCard = styled(Card)(({ theme }) => ({
  height: "300px", // Reduced height
  width: "300px", // Increased width
  borderRadius: "16px",
  overflow: "hidden",
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
  border: "1px solid rgba(33, 150, 243, 0.15)",
  transition: "all 0.3s ease-in-out",
  display: "flex",
  flexDirection: "column",
  margin: "0 auto", // Center the cards
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
    borderColor: "rgba(33, 150, 243, 0.3)",
  },
}));

const getRoleColor = (role) => {
  switch (role) {
    case "super-admin":
      return "#e91e63";
    case "admin":
      return "#2196f3";
    case "regular user":
      return "#4caf50";
    default:
      return "#666";
  }
};

export default function TeamSection() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Helper to build URL for uploaded assets using Vite proxy (same as admin portal)
  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;

    // Use relative URLs - Vite proxy will handle routing to backend
    if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
    if (imageUrl.startsWith("/uploads/")) return imageUrl;
    return imageUrl;
  };

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin-users/public?limit=100&sortBy=role&sortOrder=ASC");
      
      if (!response.ok) {
        throw new Error("Failed to fetch team members");
      }

      const data = await response.json();
      setTeamMembers(data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching team members:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 6,
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="error" variant="body1">
          Unable to load team members at this time.
        </Typography>
      </Box>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="text.secondary" variant="body1">
          No team members to display.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 3,
          overflowX: "auto",
          overflowY: "hidden",
          pb: 2,
          px: 1,
          // Smooth scrolling
          scrollBehavior: "smooth",
          // Custom scrollbar styling
          "&::-webkit-scrollbar": {
            height: "10px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "rgba(0,0,0,0.05)",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(33, 150, 243, 0.5)",
            borderRadius: "10px",
            "&:hover": {
              backgroundColor: "rgba(33, 150, 243, 0.8)",
            },
          },
        }}
      >
        {teamMembers.map((member, index) => (
          <Box key={member.id} sx={{ flex: "0 0 auto" }}>
            <Fade in={true} timeout={800 + index * 100}>
              <StyledTeamCard>
                <CardContent sx={{ p: 0, textAlign: "center", display: "flex", flexDirection: "column", height: "100%" }}>
                  {/* Profile Picture - Full width, edge to edge */}
                  <Box 
                    sx={{ 
                      width: "100%",
                      height: "280px",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": {
                        transform: "scale(1.02)",
                      },
                      backgroundColor: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                    onClick={() => {
                      navigate(`/team/${member.id}`);
                    }}
                  >
                    {member.profile_image ? (
                      <Box
                        component="img"
                        src={buildImageUrl(member.profile_image)}
                        alt={member.full_name}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <Box
                      sx={{
                        display: member.profile_image ? "none" : "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                        color: "#999",
                      }}
                    >
                      <PersonIcon sx={{ fontSize: "4rem", mb: 1 }} />
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.9rem",
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      >
                        No Photo
                      </Typography>
                    </Box>
                  </Box>

                  {/* Text Content */}
                  <Box sx={{ p: 2, pb: 1, flex: "1 1 auto", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>

                    {/* Name */}
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 0.5,
                        color: "#2196f3",
                        fontSize: "1.3rem",
                        flex: "0 0 auto",
                        textAlign: "left",
                        lineHeight: 1.1,
                      }}
                    >
                      {member.full_name}
                    </Typography>

                    {/* Position */}
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#4caf50",
                        fontSize: "1rem",
                        fontWeight: 600,
                        flex: "0 0 auto",
                        textAlign: "left",
                        lineHeight: 1.1,
                        mb: 0,
                      }}
                    >
                      {member.position || "No position specified"}
                    </Typography>
                  </Box>
                </CardContent>
              </StyledTeamCard>
            </Fade>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

