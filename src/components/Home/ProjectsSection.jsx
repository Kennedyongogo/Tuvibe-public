import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Paper,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  VolunteerActivism,
  LocationOn,
  Schedule,
  People,
  ChevronLeft,
  ChevronRight,
  Category,
} from "@mui/icons-material";

const MotionBox = motion(Box);

const getStatusColor = (status) => {
  const colors = {
    in_progress: "primary",
    completed: "success",
    planning: "warning",
    on_hold: "error",
  };
  return colors[status] || "default";
};

const getStatusLabel = (status) => {
  const labels = {
    in_progress: "In Progress",
    completed: "Completed",
    planning: "Planning",
    on_hold: "On Hold",
  };
  return labels[status] || status;
};

const getCategoryLabel = (category) => {
  const labels = {
    volunteer: "Volunteer Program",
    education: "Education",
    health: "Healthcare",
    empowerment: "Empowerment",
    poverty: "Poverty Alleviation",
    mental_health: "Mental Health",
  };
  return labels[category] || category;
};

export default function ProjectsSection() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Determine how many cards to show based on screen size
  const cardsToShow = isMobile ? 1 : isTablet ? 2 : 3;
  const maxIndex = Math.max(0, projects.length - cardsToShow);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/public-projects");
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();

      if (data.success && data.data) {
        // Map API data to component format
        const mappedProjects = data.data.map((project) => {
          // Determine project image with robust fallback logic
          let projectImage = "/foundation-logo.png"; // Default foundation logo
          
          if (project.update_images && Array.isArray(project.update_images) && project.update_images.length > 0) {
            // Find the first valid image path
            const validImage = project.update_images.find(img => 
              img && img.path && typeof img.path === 'string' && img.path.trim() !== ''
            );
            if (validImage) {
              projectImage = `/${validImage.path}`;
            }
          }
          
          return {
            id: project.id,
            title: project.name,
            description: project.description,
            image: projectImage,
            location: `${project.subcounty}, ${project.county}`,
            category: project.category,
            status: project.status,
            startDate: project.start_date,
            endDate: project.end_date,
            progress: project.progress || 0,
            targetIndividual: project.target_individual,
            creatorName: project.creator?.full_name,
            assigneeName: project.assignee?.full_name,
            updateImages: project.update_images || [],
          };
        });
        setProjects(mappedProjects);
      } else {
        setProjects([]);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching projects:", err);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const getVisibleProjects = () => {
    return projects.slice(currentIndex, currentIndex + cardsToShow);
  };

  const handleViewDetails = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <Box
      id="projects-section"
      sx={{
        py: 4,
        backgroundColor: "#f8f9fa",
      }}
    >
      <Box
        sx={{
          maxWidth: "1400px",
          margin: "0 auto",
          px: { xs: 2, sm: 4, md: 6 },
        }}
      >
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Paper
            elevation={6}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              backgroundColor: "white",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          >
            <Box sx={{ p: 6 }}>
              <Box
                sx={{
                  textAlign: "center",
                  mb: 6,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <VolunteerActivism
                    sx={{ fontSize: "2.5rem", color: "primary.main" }}
                  />
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                      fontSize: "1.5rem",
                    }}
                  >
                    Our Projects
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ maxWidth: 600, mx: "auto", fontSize: "0.875rem" }}
                >
                  Discover our ongoing and completed community empowerment initiatives across Kenya
                </Typography>
              </Box>

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              ) : projects.length === 0 ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                  No projects available at the moment.
                </Alert>
              ) : (
                <Box>
                  {/* Navigation Controls */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <IconButton
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                      sx={{
                        backgroundColor: "primary.main",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "primary.dark",
                        },
                        "&:disabled": {
                          backgroundColor: "grey.300",
                          color: "grey.500",
                        },
                      }}
                    >
                      <ChevronLeft />
                    </IconButton>

                    <Typography variant="body1" color="text.secondary">
                      Showing {currentIndex + 1}-
                      {Math.min(currentIndex + cardsToShow, projects.length)} of{" "}
                      {projects.length} projects
                    </Typography>

                    <IconButton
                      onClick={handleNext}
                      disabled={currentIndex >= maxIndex}
                      sx={{
                        backgroundColor: "primary.main",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "primary.dark",
                        },
                        "&:disabled": {
                          backgroundColor: "grey.300",
                          color: "grey.500",
                        },
                      }}
                    >
                      <ChevronRight />
                    </IconButton>
                  </Box>

                  {/* Projects Gallery */}
                  <Grid container spacing={3} justifyContent="center">
                    {getVisibleProjects().map((project, index) => (
                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                          md: 4,
                        }}
                        key={project.id}
                      >
                        <MotionBox
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <Card
                            sx={{
                              height: { xs: "480px", sm: "520px" },
                              width: "100%",
                              display: "flex",
                              flexDirection: "column",
                              transition:
                                "transform 0.3s ease, box-shadow 0.3s ease",
                              "&:hover": {
                                transform: "translateY(-8px)",
                                boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                              },
                            }}
                          >
                            <CardMedia
                              component="img"
                              height={isMobile ? "140" : "180"}
                              image={project.image}
                              alt={project.title}
                              sx={{
                                objectFit: "cover",
                                flexShrink: 0,
                              }}
                            />
                            <CardContent
                              sx={{
                                flexGrow: 1,
                                p: { xs: 2, sm: 3 },
                                display: "flex",
                                flexDirection: "column",
                                minHeight: { xs: "300px", sm: "340px" },
                              }}
                            >
                              <Box sx={{ mb: { xs: 1, sm: 2 } }}>
                                <Box sx={{ display: "flex", gap: 0.5, mb: { xs: 1, sm: 2 }, flexWrap: "wrap" }}>
                                  <Chip
                                    label={getStatusLabel(project.status)}
                                    color={getStatusColor(project.status)}
                                    size="small"
                                  />
                                  <Chip
                                    label={getCategoryLabel(project.category)}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                  />
                                </Box>
                                <Typography
                                  variant="h6"
                                  component="h3"
                                  sx={{
                                    fontWeight: 600,
                                    mb: { xs: 0.5, sm: 1 },
                                    color: "text.primary",
                                    fontSize: { xs: "1rem", sm: "1.25rem" },
                                  }}
                                >
                                  {project.title}
                                </Typography>
                              </Box>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  mb: { xs: 1, sm: 2 },
                                  overflow: "hidden",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  lineHeight: 1.4,
                                  flexGrow: 1,
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                }}
                              >
                                {project.description}
                              </Typography>

                              <Box sx={{ mb: { xs: 0.5, sm: 1 } }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    mb: { xs: 0.25, sm: 0.5 },
                                  }}
                                >
                                  <Category
                                    sx={{ fontSize: { xs: 12, sm: 14 }, color: "primary.main" }}
                                  />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
                                  >
                                    {getCategoryLabel(project.category)}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    mb: { xs: 0.25, sm: 0.5 },
                                  }}
                                >
                                  <LocationOn
                                    sx={{ fontSize: { xs: 12, sm: 14 }, color: "primary.main" }}
                                  />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
                                  >
                                    {project.location}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    mb: { xs: 0.25, sm: 0.5 },
                                  }}
                                >
                                  <People
                                    sx={{ fontSize: { xs: 12, sm: 14 }, color: "primary.main" }}
                                  />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
                                  >
                                    Target: {project.targetIndividual}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    mb: { xs: 0.25, sm: 0.5 },
                                  }}
                                >
                                  <Schedule
                                    sx={{ fontSize: { xs: 12, sm: 14 }, color: "primary.main" }}
                                  />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
                                  >
                                    Started: {formatDate(project.startDate)}
                                  </Typography>
                                </Box>
                              </Box>

                              <Box sx={{ mb: { xs: 0.5, sm: 1 } }}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: { xs: 0.25, sm: 0.5 }, fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
                                >
                                  Progress: {project.progress}%
                                </Typography>
                                <Box
                                  sx={{
                                    width: "100%",
                                    height: { xs: 3, sm: 4 },
                                    backgroundColor: "grey.200",
                                    borderRadius: 2,
                                    overflow: "hidden",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: `${project.progress}%`,
                                      height: "100%",
                                      backgroundColor:
                                        project.status === "completed"
                                          ? "success.main"
                                          : "primary.main",
                                      transition: "width 0.3s ease",
                                    }}
                                  />
                                </Box>
                              </Box>

                              <Box sx={{ mt: "auto", pt: { xs: 0.5, sm: 1 } }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  onClick={() => handleViewDetails(project.id)}
                                  sx={{
                                    borderColor: "primary.main",
                                    color: "primary.main",
                                    fontSize: "0.875rem",
                                    py: 1,
                                    "&:hover": {
                                      borderColor: "primary.dark",
                                      backgroundColor: "primary.light",
                                      color: "white",
                                    },
                                  }}
                                >
                                  View Details
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </MotionBox>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Page Indicators */}
                  {projects.length > cardsToShow && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        mt: 4,
                      }}
                    >
                      {Array.from({
                        length: Math.ceil(projects.length / cardsToShow),
                      }).map((_, index) => (
                        <Box
                          key={index}
                          onClick={() => setCurrentIndex(index * cardsToShow)}
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor:
                              Math.floor(currentIndex / cardsToShow) === index
                                ? "primary.main"
                                : "grey.300",
                            cursor: "pointer",
                            transition: "background-color 0.3s ease",
                            "&:hover": {
                              backgroundColor: "primary.light",
                            },
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </MotionBox>
      </Box>
    </Box>
  );
}
