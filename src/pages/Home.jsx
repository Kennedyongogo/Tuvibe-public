import React from "react";
import { Box, Container, Card, CardContent, Typography, Fade } from "@mui/material";
import HeroSection from "../components/Home/HeroSection";
import ServicesSection from "../components/Home/ServicesSection";
import ProjectsSection from "../components/Home/ProjectsSection";
import CharityMap from "../components/Home/CharityMap";
import ContactSection from "../components/Home/ContactSection";
import TeamSection from "../components/Home/TeamSection";
import TestimonySection from "../components/Home/TestimonySection";
import Footer from "../components/Footer/Footer";
import MapIcon from "@mui/icons-material/Map";

export default function Home() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <HeroSection />
      <ServicesSection />
      <ProjectsSection />
      
      {/* Charity Map Section */}
      <Box
        sx={{
          py: { xs: 4, md: 6 },
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.9) 100%)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 80% 20%, rgba(76, 175, 80, 0.08) 0%, transparent 50%)",
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          <Fade in={true} timeout={1000}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <MapIcon
                  sx={{
                    fontSize: { xs: "2rem", md: "2.5rem" },
                    color: "#4caf50",
                    mr: 1,
                  }}
                />
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
                    background: "linear-gradient(45deg, #4caf50, #2196f3)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Explore Our Impact
                </Typography>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: "text.secondary",
                  fontWeight: 400,
                  fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                  maxWidth: "800px",
                  mx: "auto",
                }}
              >
                Discover our projects across Kenya and see where we're making a difference in communities
              </Typography>
            </Box>
          </Fade>

          <Fade in={true} timeout={1200}>
            <Card
              elevation={8}
              sx={{
                borderRadius: "20px",
                overflow: "hidden",
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                border: "1px solid rgba(76, 175, 80, 0.2)",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <CharityMap />
              </CardContent>
            </Card>
          </Fade>
        </Container>
      </Box>

      <ContactSection />
      
      {/* Testimonials Section */}
      <Box
        id="testimonials-section"
        data-section="testimonials"
        sx={{
          py: { xs: 4, md: 6 },
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.9) 100%)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 50% 50%, rgba(76, 175, 80, 0.08) 0%, transparent 50%)",
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          <Fade in={true} timeout={1000}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
                  background: "linear-gradient(45deg, #4caf50, #ff9800)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Testimonials
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "text.secondary",
                  fontWeight: 400,
                  fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                  maxWidth: "800px",
                  mx: "auto",
                  mt: 2,
                }}
              >
                Hear from the people whose lives we've touched through our community programs
              </Typography>
            </Box>
          </Fade>

          <Fade in={true} timeout={1200}>
            <Card
              elevation={8}
              sx={{
                borderRadius: "20px",
                overflow: "hidden",
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                border: "1px solid rgba(76, 175, 80, 0.2)",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <TestimonySection />
              </CardContent>
            </Card>
          </Fade>
        </Container>
      </Box>
      
      {/* Meet Our Team Section */}
      <Box
        id="team-section"
        data-section="team"
        sx={{
          py: { xs: 4, md: 6 },
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.9) 100%)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 20% 80%, rgba(33, 150, 243, 0.08) 0%, transparent 50%)",
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          <Fade in={true} timeout={1000}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
                  background: "linear-gradient(45deg, #2196f3, #e91e63)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Meet Our Team
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "text.secondary",
                  fontWeight: 400,
                  fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                  maxWidth: "800px",
                  mx: "auto",
                  mt: 2,
                }}
              >
                Dedicated individuals working together to make a difference in our community
              </Typography>
            </Box>
          </Fade>

          <Fade in={true} timeout={1200}>
            <Card
              elevation={8}
              sx={{
                borderRadius: "20px",
                overflow: "hidden",
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                border: "1px solid rgba(33, 150, 243, 0.2)",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <TeamSection />
              </CardContent>
            </Card>
          </Fade>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
