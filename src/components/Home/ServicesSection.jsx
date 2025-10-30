import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Card, CardContent, Fade, Slide, Chip } from "@mui/material";
import {
  School,
  Psychology,
  VolunteerActivism,
  LocalHospital,
  Group,
  EmojiPeople,
} from "@mui/icons-material";

const foundationServices = [
  {
    title: "Educational Support",
    description:
      "Providing scholarships, school supplies, and educational resources to underprivileged children across Kenya",
    icon: <School sx={{ fontSize: 40, color: "white" }} />,
    color: "#2196f3",
    gradient: "linear-gradient(135deg, #2196f3, #21cbf3)",
    stats: "500+ Students",
    impact: "High Impact",
    image: "/education.png",
  },
  {
    title: "Mental Health Awareness",
    description:
      "Raising awareness about mental health issues and providing counseling services to communities in need",
    icon: <Psychology sx={{ fontSize: 40, color: "white" }} />,
    color: "#e91e63",
    gradient: "linear-gradient(135deg, #e91e63, #f06292)",
    stats: "200+ Sessions",
    impact: "Critical Need",
    image: "/mental.png",
  },
  {
    title: "Poverty Alleviation",
    description:
      "Implementing sustainable programs to help families break the cycle of poverty through skills training and micro-finance",
    icon: <VolunteerActivism sx={{ fontSize: 40, color: "white" }} />,
    color: "#4caf50",
    gradient: "linear-gradient(135deg, #4caf50, #81c784)",
    stats: "100+ Families",
    impact: "Life Changing",
    image: "/poverty.png",
  },
  {
    title: "Community Empowerment",
    description:
      "Building stronger communities through leadership development, civic education, and social cohesion programs",
    icon: <Group sx={{ fontSize: 40, color: "white" }} />,
    color: "#ff9800",
    gradient: "linear-gradient(135deg, #ff9800, #ffb74d)",
    stats: "50+ Communities",
    impact: "Transformative",
    image: "/community.png",
  },
  {
    title: "Healthcare Access",
    description:
      "Improving healthcare access in rural areas through mobile clinics and health education programs",
    icon: <LocalHospital sx={{ fontSize: 40, color: "white" }} />,
    color: "#9c27b0",
    gradient: "linear-gradient(135deg, #9c27b0, #ba68c8)",
    stats: "1000+ Patients",
    impact: "Essential",
    image: "/health.png",
  },
  {
    title: "Youth Development",
    description:
      "Nurturing the next generation through mentorship programs, career guidance, and life skills training",
    icon: <EmojiPeople sx={{ fontSize: 40, color: "white" }} />,
    color: "#00bcd4",
    gradient: "linear-gradient(135deg, #00bcd4, #4dd0e1)",
    stats: "300+ Youth",
    impact: "Future Focused",
    image: "/youth.png",
  },
];

export default function ServicesSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <Box
      id="mission-section"
      sx={{ 
        py: 6, 
        px: { xs: 2, sm: 3, md: 4 }, 
        bgcolor: "background.paper",
        background: "linear-gradient(135deg, rgba(240, 248, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 50%, rgba(248, 250, 252, 0.9) 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 20% 80%, rgba(33, 150, 243, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(233, 30, 99, 0.1) 0%, transparent 50%)",
          zIndex: 0,
        },
      }}
    >
      <Box sx={{ maxWidth: "1300px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <Fade in={isVisible} timeout={1000}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h2"
              sx={{
                mb: 2,
                fontWeight: 800,
                fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.8rem" },
                background: "linear-gradient(45deg, #2196f3, #e91e63, #4caf50)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: "-8px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: { xs: "60px", sm: "70px", md: "80px" },
                  height: "4px",
                  background: "linear-gradient(45deg, #2196f3, #e91e63)",
                  borderRadius: "2px",
                },
              }}
            >
              Our Mission
            </Typography>
            <Typography
              variant="h5"
              sx={{ 
                mb: 2, 
                maxWidth: { xs: "100%", sm: "800px", md: "900px" }, 
                mx: "auto",
                px: { xs: 1, sm: 0 },
                fontWeight: 500,
                fontSize: { xs: "0.95rem", sm: "1.1rem", md: "1.2rem" },
                lineHeight: 1.6,
                color: "text.primary",
              }}
            >
              Mwalimu Hope Foundation is a charitable foundation established to champion education, 
              mental health awareness, poverty alleviation, and community empowerment initiatives in Kenya.
            </Typography>
            <Box sx={{ 
              display: "flex", 
              justifyContent: "center", 
              gap: { xs: 1, sm: 1.5, md: 2 }, 
              flexWrap: "wrap", 
              mb: 3,
              px: { xs: 1, sm: 0 }
            }}>
              <Chip
                label="Empowering Minds"
                sx={{
                  background: "linear-gradient(45deg, #2196f3, #21cbf3)",
                  color: "white",
                  fontWeight: 600,
                  px: { xs: 1.5, sm: 2 },
                  py: 1,
                  fontSize: { xs: "0.8rem", sm: "0.85rem", md: "0.9rem" },
                }}
              />
              <Chip
                label="Restoring Hope"
                sx={{
                  background: "linear-gradient(45deg, #e91e63, #f06292)",
                  color: "white",
                  fontWeight: 600,
                  px: { xs: 1.5, sm: 2 },
                  py: 1,
                  fontSize: { xs: "0.8rem", sm: "0.85rem", md: "0.9rem" },
                }}
              />
              <Chip
                label="Building Kenya's Future"
                sx={{
                  background: "linear-gradient(45deg, #4caf50, #81c784)",
                  color: "white",
                  fontWeight: 600,
                  px: { xs: 1.5, sm: 2 },
                  py: 1,
                  fontSize: { xs: "0.8rem", sm: "0.85rem", md: "0.9rem" },
                }}
              />
            </Box>
          </Box>
        </Fade>

        <Box sx={{ position: "relative" }}>
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {foundationServices.map((service, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Slide direction="up" in={isVisible} timeout={800 + index * 200}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      zIndex: 1,
                      borderRadius: "20px",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      background: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(10px)",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "4px",
                        background: service.gradient,
                        zIndex: 2,
                      },
                      "&:hover": {
                        transform: "translateY(-12px) scale(1.03)",
                        boxShadow: `0 20px 60px ${service.color}30`,
                        "& .icon-container": {
                          transform: "scale(1.15) rotate(10deg)",
                          boxShadow: `0 12px 30px ${service.color}50`,
                        },
                        "& .stats-chip": {
                          transform: "scale(1.1)",
                        },
                        "& .impact-chip": {
                          transform: "scale(1.1)",
                        },
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, textAlign: "center", p: 2, pt: 3 }}>
                      <Box
                        sx={{
                          width: "100%",
                          height: { xs: "200px", sm: "220px", md: "240px" },
                          borderRadius: "12px",
                          border: `2px solid ${service.color}20`,
                          background: `linear-gradient(135deg, ${service.color}05, ${service.color}02)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          transition: "all 0.3s ease",
                          overflow: "hidden",
                          "&:hover": {
                            borderColor: service.color,
                            background: `linear-gradient(135deg, ${service.color}10, ${service.color}05)`,
                          },
                        }}
                      >
                        <Box
                          component="img"
                          src={service.image}
                          alt={service.title}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "10px",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "scale(1.05)",
                            },
                          }}
                        />
                      </Box>

                      {/* Service Title */}
                      <Typography 
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
                          color: service.color,
                          textAlign: "center",
                          mb: 1.5,
                          mt: 2,
                          px: { xs: 0.5, sm: 0 },
                        }}
                      >
                        {service.title}
                      </Typography>

                      <Typography 
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.5,
                          fontSize: { xs: "0.8rem", sm: "0.85rem", md: "0.9rem" },
                          mb: 1.5,
                          px: { xs: 0.5, sm: 0 },
                        }}
                      >
                        {service.description}
                      </Typography>

                    </CardContent>
                  </Card>
                </Slide>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
