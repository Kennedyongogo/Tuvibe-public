import React, { useState, useEffect } from "react";
import { Typography, Box, Container, Tooltip, Button, Fade, Slide } from "@mui/material";
import Hero1 from "../../assets/images/foundation1.jpg";
import Hero2 from "../../assets/images/foundation2.jpg";
import Hero3 from "../../assets/images/foundation3.jpg";
import { School, VolunteerActivism, Psychology, ArrowForward } from "@mui/icons-material";

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const images = [Hero1, Hero2, Hero3];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleExploreMission = () => {
    const missionSection = document.getElementById('mission-section');
    if (missionSection) {
      missionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Box
      id="hero-section"
      sx={{
        position: "relative",
        height: { xs: "100vh", md: "100vh" },
        width: "100%",
        overflow: "hidden",
        marginTop: "-64px",
      }}
    >
      {/* Background Images with Enhanced Overlay */}
      {images.map((image, index) => (
        <Box
          key={index}
          component="img"
          src={image}
          alt={`${index + 1}`}
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.4) saturate(1.2)",
            opacity: currentImageIndex === index ? 1 : 0,
            transition: "opacity 1.5s ease-in-out",
          }}
        />
      ))}

      {/* Enhanced Gradient Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, rgba(33, 150, 243, 0.3) 0%, rgba(76, 175, 80, 0.2) 50%, rgba(255, 152, 0, 0.2) 100%)",
          zIndex: 1,
        }}
      />

      {/* Floating Particles Animation */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          "&::before": {
            content: '""',
            position: "absolute",
            top: "20%",
            left: "10%",
            width: "4px",
            height: "4px",
            background: "rgba(255, 255, 255, 0.6)",
            borderRadius: "50%",
            animation: "float 6s ease-in-out infinite",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: "60%",
            right: "15%",
            width: "6px",
            height: "6px",
            background: "rgba(33, 150, 243, 0.8)",
            borderRadius: "50%",
            animation: "float 8s ease-in-out infinite reverse",
          },
        }}
      />

      {/* Content Overlay */}
      <Box
        sx={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          color: "white",
          zIndex: 3,
          px: { xs: 2, sm: 4, md: 6 },
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <Fade in={isVisible} timeout={1000}>
        <Box
          sx={{
              maxWidth: "700px",
              animation: "slideInUp 1.2s ease-out",
          }}
        >
          <Typography
            variant="h1"
            sx={{
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem", lg: "4rem" },
                fontWeight: 700,
              mb: 2,
                textShadow: "3px 3px 6px rgba(0,0,0,0.4)",
                background: "linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.1,
            }}
          >
            Welcome to Mwalimu Hope Foundation
          </Typography>
          <Typography
              variant="h4"
            sx={{
              mb: 4,
                textShadow: "2px 2px 4px rgba(0,0,0,0.4)",
                opacity: 0.95,
                fontWeight: 400,
                fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" },
                color: "#e3f2fd",
            }}
          >
            Empowering Minds, Restoring Hope
          </Typography>
            
            {/* Enhanced Call-to-Action Button */}
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 1 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                endIcon={<ArrowForward />}
                onClick={handleExploreMission}
                sx={{
                  px: 4,
                  py: 2,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: "50px",
                  background: "linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)",
                  boxShadow: "0 8px 32px rgba(33, 150, 243, 0.3)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-3px) scale(1.05)",
                    boxShadow: "0 12px 40px rgba(33, 150, 243, 0.4)",
                    background: "linear-gradient(45deg, #1976d2 30%, #1cb5e0 90%)",
                  },
                }}
              >
                Explore Our Mission
              </Button>
            </Box>

            {/* Stats Counter */}
            <Box
              sx={{
                display: "flex",
                gap: { xs: 2, sm: 3, md: 4 },
                flexWrap: "wrap",
                mb: 6,
                "& > *": {
                  textAlign: "center",
                  "& .number": {
                    fontSize: { xs: "1.2rem", sm: "1.5rem", md: "1.8rem" },
                    fontWeight: 700,
                    color: "#2196f3",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                  },
                  "& .label": {
                    fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.8rem" },
                    opacity: 0.9,
                    textTransform: "uppercase",
                    letterSpacing: { xs: "0.5px", md: "1px" },
                  },
                },
              }}
            >
              <Box>
                <Typography className="number">500+</Typography>
                <Typography className="label">Lives Changed</Typography>
              </Box>
              <Box>
                <Typography className="number">50+</Typography>
                <Typography className="label">Communities</Typography>
              </Box>
              <Box>
                <Typography className="number">1000+</Typography>
                <Typography className="label">Volunteers</Typography>
          </Box>
        </Box>
          </Box>
        </Fade>
      </Box>

      {/* Enhanced Feature Icons */}
      <Slide direction="up" in={isVisible} timeout={1500}>
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 4,
            p: 2.5,
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(10px)",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Tooltip title="Educational Support" arrow>
          <Box
            sx={{
              display: "flex",
                flexDirection: "column",
              alignItems: "center",
              gap: 1,
              color: "white",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
              "&:hover": {
                  transform: "translateY(-8px) scale(1.1)",
                  "& .icon": {
                    color: "#2196f3",
                    transform: "rotate(360deg)",
                  },
              },
            }}
          >
              <School className="icon" sx={{ fontSize: 28, transition: "all 0.4s ease" }} />
              <Typography sx={{ fontWeight: 500, fontSize: "0.8rem" }}>Educational Support</Typography>
          </Box>
        </Tooltip>
          <Tooltip title="Community Outreach" arrow>
          <Box
            sx={{
              display: "flex",
                flexDirection: "column",
              alignItems: "center",
              gap: 1,
              color: "white",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
              "&:hover": {
                  transform: "translateY(-8px) scale(1.1)",
                  "& .icon": {
                    color: "#4caf50",
                    transform: "rotate(360deg)",
                  },
              },
            }}
          >
              <VolunteerActivism className="icon" sx={{ fontSize: 28, transition: "all 0.4s ease" }} />
              <Typography sx={{ fontWeight: 500, fontSize: "0.8rem" }}>Community Outreach</Typography>
          </Box>
        </Tooltip>
          <Tooltip title="Mental Health Support" arrow>
          <Box
            sx={{
              display: "flex",
                flexDirection: "column",
              alignItems: "center",
              gap: 1,
              color: "white",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
              "&:hover": {
                  transform: "translateY(-8px) scale(1.1)",
                  "& .icon": {
                    color: "#ff9800",
                    transform: "rotate(360deg)",
                  },
              },
            }}
          >
              <Psychology className="icon" sx={{ fontSize: 28, transition: "all 0.4s ease" }} />
              <Typography sx={{ fontWeight: 500, fontSize: "0.8rem" }}>Mental Health Support</Typography>
          </Box>
        </Tooltip>
      </Box>
      </Slide>

      <style>
        {`
          @keyframes slideInUp {
            from { 
              opacity: 0;
              transform: translateY(60px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg);
              opacity: 0.6;
            }
            50% { 
              transform: translateY(-20px) rotate(180deg);
              opacity: 1;
            }
          }
        `}
      </style>
    </Box>
  );
}
