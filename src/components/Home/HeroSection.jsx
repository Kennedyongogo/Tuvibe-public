import React, { useState, useEffect } from "react";
import { Typography, Box, Fade } from "@mui/material";

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
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
      {/* Background Video */}
      <Box
        component="video"
        autoPlay
        loop
        muted
        playsInline
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: { xs: "cover", md: "cover" },
          objectPosition: { xs: "center", md: "center" },
          zIndex: 1,
        }}
      >
        <source src="/videos/tuvibe-video.mp4" type="video/mp4" />
      </Box>

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
            <Typography
              variant="h5"
              sx={{
                fontWeight: 400,
                fontSize: {
                  xs: "0.9rem",
                  sm: "1.1rem",
                  md: "1.3rem",
                  lg: "1.5rem",
                  xl: "1.7rem",
                },
                textAlign: { xs: "center", md: "left" },
                letterSpacing: {
                  xs: "0.5px",
                  sm: "1px",
                  md: "1.5px",
                },
                fontFamily:
                  '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                color: "rgba(255, 255, 255, 0.95)",
                textShadow:
                  "0 2px 10px rgba(0, 0, 0, 0.5), 0 1px 5px rgba(0, 0, 0, 0.3)",
                lineHeight: { xs: 1.4, sm: 1.5, md: 1.6 },
                mt: { xs: 0.5, sm: 1 },
                fontStyle: "italic",
                transition: "all 0.3s ease",
                "&:hover": {
                  color: "rgba(255, 255, 255, 1)",
                  textShadow:
                    "0 2px 15px rgba(255, 255, 255, 0.3), 0 1px 8px rgba(0, 0, 0, 0.5)",
                },
              }}
            >
              Connect. Discover. Vibe.
            </Typography>
          </Box>
        </Fade>
      </Box>

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
