import React, { useState, useEffect } from "react";
import { Typography, Box, Tooltip, Fade, Slide } from "@mui/material";
import Hero1 from "../../assets/images/public/tuvibe-1.jpg";
import Hero2 from "../../assets/images/public/tuvibe-2.jpg";
import Hero3 from "../../assets/images/public/tuvibe-3.jpg";
import Hero4 from "../../assets/images/public/tuvibe-4.jpg";
import { School, VolunteerActivism, Psychology } from "@mui/icons-material";

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const images = [Hero1, Hero2, Hero3, Hero4];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      id="hero-section"
      sx={{
        position: "relative",
        height: "100vh",
        maxHeight: "100vh",
        width: "100%",
        overflow: "hidden",
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
            opacity: currentImageIndex === index ? 1 : 0,
            transition: "opacity 1.5s ease-in-out",
          }}
        />
      ))}

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
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          color: "white",
          zIndex: 3,
          px: { xs: 2, sm: 4, md: 6 },
          maxWidth: "1400px",
          margin: "0 auto",
          pb: { xs: 8, sm: 10, md: 12 },
          boxSizing: "border-box",
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
                fontWeight: 900,
                fontSize: {
                  xs: "2.7rem",
                  sm: "3.3rem",
                  md: "4.2rem",
                  lg: "4.8rem",
                  xl: "5.5rem",
                },
                textAlign: { xs: "center", md: "left" },
                letterSpacing: {
                  xs: "1px",
                  sm: "1.5px",
                  md: "2px",
                },
                fontFamily:
                  '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                background: `linear-gradient(135deg, 
                  #FFD700 0%, 
                  #d4af37 30%,
                  #f4d03f 60%, 
                  #FFD700 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow:
                  "0 4px 20px rgba(255, 215, 0, 0.4), 0 2px 10px rgba(212, 175, 55, 0.3), 0 0 30px rgba(255, 215, 0, 0.2)",
                lineHeight: { xs: 1.1, sm: 1.05, md: 1 },
                mb: { xs: 1, sm: 1.5 },
                textTransform: "uppercase",
                filter: "drop-shadow(0 0 15px rgba(255, 215, 0, 0.5))",
                WebkitTextStroke: "0.5px rgba(255, 215, 0, 0.6)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                  filter: "drop-shadow(0 0 20px rgba(255, 215, 0, 0.7))",
                },
              }}
            >
              Tuvibe
            </Typography>
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
            gap: { xs: 1.5, sm: 2.5, md: 3.5 },
            p: { xs: 1, sm: 1.5, md: 2 },
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(10px)",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            zIndex: 4,
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
              <School
                className="icon"
                sx={{
                  fontSize: { xs: 24, sm: 28 },
                  transition: "all 0.4s ease",
                }}
              />
              <Typography
                sx={{
                  fontWeight: 500,
                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                }}
              >
                Educational Support
              </Typography>
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
              <VolunteerActivism
                className="icon"
                sx={{
                  fontSize: { xs: 24, sm: 28 },
                  transition: "all 0.4s ease",
                }}
              />
              <Typography
                sx={{
                  fontWeight: 500,
                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                }}
              >
                Community Outreach
              </Typography>
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
              <Psychology
                className="icon"
                sx={{
                  fontSize: { xs: 24, sm: 28 },
                  transition: "all 0.4s ease",
                }}
              />
              <Typography
                sx={{
                  fontWeight: 500,
                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                }}
              >
                Mental Health Support
              </Typography>
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
