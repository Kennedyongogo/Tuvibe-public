import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Button,
  Paper,
  useMediaQuery,
  useTheme,
  Avatar,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Person,
  ArrowBack,
  Share,
  Facebook,
  WhatsApp,
  Twitter,
  Google,
} from "@mui/icons-material";

const MotionBox = motion(Box);

export default function TeamMemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teamMember, setTeamMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchTeamMemberDetails();
  }, [id]);

  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
    if (imageUrl.startsWith("/uploads/")) return imageUrl;
    return imageUrl;
  };

  const fetchTeamMemberDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin-users/public/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch team member details");
      }
      const data = await response.json();

      if (data.success && data.data) {
        setTeamMember(data.data);
      } else {
        setError("Team member not found");
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching team member details:", err);
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
    // Scroll to team section after navigation with multiple attempts
    const scrollToTeam = () => {
      const teamSection = document.querySelector('[data-section="team"]');
      if (teamSection) {
        teamSection.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Try again after a short delay if not found
        setTimeout(scrollToTeam, 200);
      }
    };
    setTimeout(scrollToTeam, 300);
  };

  const handleSocialClick = (platform) => {
    const socialLink = teamMember[`${platform}_link`];
    
    // Only open link if it exists, otherwise do nothing
    if (socialLink) {
      window.open(socialLink, "_blank");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !teamMember) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Team member not found"}
        </Alert>
        <Button variant="outlined" onClick={handleBack}>
          <ArrowBack sx={{ mr: 1 }} />
          Back to Team
        </Button>
      </Container>
    );
  }

  return (
    <>
      {/* Global background styles */}
      <style>
        {`
          * {
            box-sizing: border-box;
          }
          html {
            height: 100%;
            overflow-y: scroll;
            scroll-behavior: smooth;
          }
          html, body, #root {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body {
            min-height: 100%;
            overflow-x: hidden;
          }
          #root {
            min-height: 100vh;
          }
        `}
      </style>
      
      <Box 
        sx={{ 
          minHeight: "100vh", 
          position: "relative",
          zIndex: 1,
          background: "transparent",
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 }, position: "relative", zIndex: 1 }}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
              <Button
                variant="contained"
                startIcon={<ArrowBack />}
                onClick={handleBack}
                sx={{ 
                  mb: 3,
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  color: "white",
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  "&:hover": {
                    background: "linear-gradient(135deg, #5568d3, #653a8b)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Back to Team
              </Button>

              {/* Profile Picture - Full Width */}
              <Box sx={{ mb: 0 }}>
                <Box
                  sx={{
                    width: "100%",
                    height: { xs: 400, sm: 500, md: 600 },
                    borderRadius: { xs: 3, md: 4 },
                    overflow: "hidden",
                    border: "6px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      inset: "-3px",
                      borderRadius: { xs: 3, md: 4 },
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      zIndex: -1,
                    }
                  }}
                >
                  {teamMember.profile_image ? (
                    <Box
                      component="img"
                      src={buildImageUrl(teamMember.profile_image)}
                      alt={teamMember.full_name}
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
                      display: teamMember.profile_image ? "none" : "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      color: "white",
                    }}
                  >
                    <Person sx={{ fontSize: { xs: "6rem", sm: "8rem", md: "10rem" }, mb: 2 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      No Photo Available
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Profile Information - No Card, Left Aligned */}
              <Box>
                {/* Name */}
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{ 
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: { xs: "1.5rem", sm: "1.875rem", md: "2.25rem" },
                    textAlign: "left",
                    mb: 0,
                  }}
                >
                  {teamMember.full_name}
                </Typography>

                {/* Position */}
                <Typography
                  variant="h5"
                  sx={{
                    color: "#4caf50",
                    fontSize: { xs: "0.9rem", sm: "1.05rem", md: "1.2rem" },
                    fontWeight: 600,
                    textAlign: "left",
                    mb: 3,
                  }}
                >
                  {teamMember.position || "Team Member"}
                </Typography>

                {/* Description */}
                {teamMember.description && (
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.8,
                      color: "text.primary",
                      fontSize: { xs: "0.75rem", sm: "0.825rem", md: "0.9rem" },
                      textAlign: "left",
                    }}
                  >
                    {teamMember.description}
                  </Typography>
                )}

                {/* No description message */}
                {!teamMember.description && (
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.8,
                      color: "text.secondary",
                      fontSize: { xs: "0.75rem", sm: "0.825rem", md: "0.9rem" },
                      textAlign: "left",
                      fontStyle: "italic",
                    }}
                  >
                    More information about this team member will be available soon.
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Share Section */}
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 3, sm: 4 }, 
                borderRadius: { xs: 3, md: 4 },
                background: "#ffffff",
                border: "1px solid #e0e0e0",
                textAlign: "center",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: "#667eea",
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <Share sx={{ fontSize: "1.5rem" }} />
                Connect with {teamMember?.full_name}
              </Typography>
              
              <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  startIcon={<Facebook />}
                  onClick={() => handleSocialClick("facebook")}
                  sx={{
                    backgroundColor: "#1877f2",
                    "&:hover": { backgroundColor: "#166fe5" },
                    px: 3,
                    py: 1.5,
                    minWidth: 120,
                  }}
                >
                  Facebook
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<WhatsApp />}
                  onClick={() => handleSocialClick("whatsapp")}
                  sx={{
                    backgroundColor: "#25d366",
                    "&:hover": { backgroundColor: "#22c55e" },
                    px: 3,
                    py: 1.5,
                    minWidth: 120,
                  }}
                >
                  WhatsApp
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<Twitter />}
                  onClick={() => handleSocialClick("twitter")}
                  sx={{
                    backgroundColor: "#1da1f2",
                    "&:hover": { backgroundColor: "#1a91da" },
                    px: 3,
                    py: 1.5,
                    minWidth: 120,
                  }}
                >
                  X
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<Google />}
                  onClick={() => handleSocialClick("google")}
                  sx={{
                    backgroundColor: "#db4437",
                    "&:hover": { backgroundColor: "#c23321" },
                    px: 3,
                    py: 1.5,
                    minWidth: 120,
                  }}
                >
                  Google
                </Button>
              </Box>
            </Paper>

          </MotionBox>
        </Container>
      </Box>
    </>
  );
}
