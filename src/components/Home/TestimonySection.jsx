import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Fade,
  Rating,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import StarIcon from "@mui/icons-material/Star";
import AddIcon from "@mui/icons-material/Add";
import Swal from "sweetalert2";

const StyledTestimonyCard = styled(Card)(({ theme }) => ({
  height: "auto",
  width: "350px",
  minHeight: "250px",
  borderRadius: "16px",
  overflow: "hidden",
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
  border: "1px solid rgba(76, 175, 80, 0.15)",
  transition: "all 0.3s ease-in-out",
  display: "flex",
  flexDirection: "column",
  margin: "0 auto",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
}));

export default function TestimonySection() {
  const [testimonies, setTestimonies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    rating: 5,
    description: "",
  });

  useEffect(() => {
    fetchTestimonies();
  }, []);

  const fetchTestimonies = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/testimonies/approved");
      
      if (!response.ok) {
        throw new Error("Failed to fetch testimonies");
      }

      const data = await response.json();
      setTestimonies(data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching testimonies:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
    setFormData({ name: "", rating: 5, description: "" });
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setFormData({ name: "", rating: 5, description: "" });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Validate required fields
      if (!formData.name.trim() || !formData.description.trim()) {
        Swal.fire({
          icon: "error",
          title: "Validation Error!",
          text: "Please fill in all required fields",
          customClass: {
            container: "swal-z-index-fix",
          },
          didOpen: () => {
            const swalContainer = document.querySelector(".swal-z-index-fix");
            if (swalContainer) {
              swalContainer.style.zIndex = "9999";
            }
          },
        });
        return;
      }

      const response = await fetch("/api/testimonies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          rating: formData.rating,
          description: formData.description.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit testimony");
      }

      // Show success SweetAlert
      Swal.fire({
        icon: "success",
        title: "Thank You!",
        text: "Testimony submitted successfully! It will be reviewed before being published.",
        timer: 3000,
        showConfirmButton: false,
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });

      handleDialogClose();
      
      // Refresh testimonies to show any newly approved ones
      await fetchTestimonies();
      
    } catch (err) {
      console.error("Error submitting testimony:", err);
      // Show error SweetAlert
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.message || "Failed to submit testimony. Please try again.",
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    } finally {
      setSubmitting(false);
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
          Unable to load testimonies at this time.
        </Typography>
      </Box>
    );
  }

  if (testimonies.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="text.secondary" variant="body1">
          No testimonies to display.
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
      {/* Create Testimony Button - Above the cards */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 5, mt: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleDialogOpen}
          sx={{
            backgroundColor: "#4caf50",
            color: "white",
            px: 4,
            py: 1.5,
            borderRadius: "25px",
            fontSize: "1rem",
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
            zIndex: 10,
            position: "relative",
            "&:hover": {
              backgroundColor: "#45a049",
              boxShadow: "0 6px 16px rgba(76, 175, 80, 0.4)",
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease-in-out",
          }}
        >
          Share Your Experience
        </Button>
      </Box>

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
        {testimonies.map((testimony, index) => (
          <Box key={testimony.id} sx={{ flex: "0 0 auto" }}>
            <Fade in={true} timeout={800 + index * 100}>
              <StyledTestimonyCard>
                <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
                  {/* Name */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      color: "#4caf50",
                      fontSize: "1.2rem",
                      textAlign: "center",
                    }}
                  >
                    {testimony.name}
                  </Typography>

                  {/* Star Rating */}
                  <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    <Rating
                      value={testimony.rating}
                      readOnly
                      precision={0.5}
                      size="medium"
                      icon={<StarIcon fontSize="inherit" sx={{ color: "#ffc107" }} />}
                      emptyIcon={<StarIcon fontSize="inherit" sx={{ color: "#e0e0e0" }} />}
                    />
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                      textAlign: "left",
                      flex: "1 1 auto",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 8,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {testimony.description}
                  </Typography>
                </CardContent>
              </StyledTestimonyCard>
            </Fade>
          </Box>
        ))}
      </Box>

      {/* Create Testimony Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#4caf50",
            textAlign: "center",
            pb: 1,
          }}
        >
          Share Your Experience
        </DialogTitle>
        
        <DialogContent sx={{ px: 3, pb: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
            {/* Name Input */}
            <TextField
              label="Your Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              fullWidth
              required
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
            />

            {/* Rating Input */}
            <Box>
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                Rating *
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Rating
                  value={formData.rating}
                  onChange={(event, newValue) => handleInputChange("rating", newValue)}
                  precision={1}
                  size="large"
                  icon={<StarIcon fontSize="inherit" sx={{ color: "#ffc107" }} />}
                  emptyIcon={<StarIcon fontSize="inherit" sx={{ color: "#e0e0e0" }} />}
                />
                <Typography variant="body2" sx={{ color: "text.secondary", ml: 1 }}>
                  ({formData.rating} star{formData.rating !== 1 ? 's' : ''})
                </Typography>
              </Box>
            </Box>

            {/* Description Input */}
            <TextField
              label="Your Experience"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              fullWidth
              required
              multiline
              rows={4}
              variant="outlined"
              placeholder="Tell us about your experience with Mwalimu Hope Foundation..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
            onClick={handleDialogClose}
            sx={{
              color: "text.secondary",
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !formData.name.trim() || !formData.description.trim()}
            variant="contained"
            sx={{
              backgroundColor: "#4caf50",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "#45a049",
              },
              "&:disabled": {
                backgroundColor: "#e0e0e0",
                color: "#9e9e9e",
              },
            }}
          >
            {submitting ? "Submitting..." : "Submit Testimony"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

