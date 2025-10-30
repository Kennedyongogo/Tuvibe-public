import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  Fade,
  Slide,
} from "@mui/material";
import { motion } from "framer-motion";
import { Email, Phone, LocationOn, Send, VolunteerActivism, School, Psychology, Group } from "@mui/icons-material";
import Swal from "sweetalert2";

const MotionBox = motion(Box);

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    interest: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const interestOptions = [
    { value: "volunteer", label: "Volunteer Opportunities", icon: <VolunteerActivism />, color: "#4caf50" },
    { value: "education", label: "Educational Support", icon: <School />, color: "#2196f3" },
    { value: "mental_health", label: "Mental Health Services", icon: <Psychology />, color: "#e91e63" },
    { value: "community", label: "Community Programs", icon: <Group />, color: "#ff9800" },
    { value: "donation", label: "Donations & Support", icon: <VolunteerActivism />, color: "#9c27b0" },
    { value: "partnership", label: "Partnership Opportunities", icon: <Group />, color: "#00bcd4" },
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);


  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Submit to backend API
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          category: formData.interest,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit inquiry");
      }
      
      // Reset form data
      setFormData({
        name: "",
        email: "",
        message: "",
        interest: "",
        phone: "",
      });

      // Show success SweetAlert
      Swal.fire({
        icon: "success",
        title: "Thank You!",
        text: "Your message has been sent successfully! We'll get back to you soon.",
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
    } catch (error) {
      console.error("Error submitting form:", error);
      // Show error SweetAlert
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message || "Failed to send message. Please try again.",
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
      setLoading(false);
    }
  };

  return (
    <Box
      id="contact-section"
      sx={{
        py: { xs: 4, md: 5 },
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
      <Box
        sx={{
          maxWidth: "1200px",
          margin: "0 auto",
          px: { xs: 2, sm: 3, md: 4 },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Fade in={isVisible} timeout={1000}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
                background: "linear-gradient(45deg, #2196f3, #e91e63, #4caf50)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: "-6px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: { xs: "50px", sm: "60px", md: "70px" },
                  height: "3px",
                  background: "linear-gradient(45deg, #2196f3, #e91e63)",
                  borderRadius: "2px",
                },
              }}
            >
              Get Involved
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "text.primary",
                fontWeight: 500,
                fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                maxWidth: "700px",
                mx: "auto",
                mb: 1,
              }}
            >
              Join us in making a difference. Whether you want to volunteer, donate, or partner with us, 
              we'd love to hear from you.
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ 
                maxWidth: "600px", 
                mx: "auto",
                fontStyle: "italic",
                fontSize: { xs: "0.85rem", md: "0.9rem" },
              }}
            >
              "Together, we can build a brighter future for Kenya"
            </Typography>
          </Box>
        </Fade>

        {/* Contact Form */}
        <Slide direction="up" in={isVisible} timeout={1000}>
              <Paper
                elevation={4}
                sx={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <Box sx={{ p: { xs: 2.5, sm: 3, md: 3.5 } }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      textAlign: "center",
                      background: "linear-gradient(45deg, #2196f3, #e91e63)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontSize: { xs: "1.25rem", md: "1.5rem" },
                    }}
                  >
                    Send us a Message
                  </Typography>

                  <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ width: "100%" }}
                  >
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          variant="outlined"
                          required
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          type="email"
                          variant="outlined"
                          required
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          variant="outlined"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth required>
                          <InputLabel>Area of Interest</InputLabel>
                          <Select
                            value={formData.interest}
                            label="Area of Interest"
                            onChange={(e) => handleInputChange("interest", e.target.value)}
                            sx={{
                              borderRadius: "12px",
                            }}
                          >
                            {interestOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Box sx={{ color: option.color }}>{option.icon}</Box>
                                  {option.label}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={12}>
                        <TextField
                          fullWidth
                          label="Tell us how you'd like to help"
                          multiline
                          rows={3}
                          variant="outlined"
                          required
                          value={formData.message}
                          onChange={(e) => handleInputChange("message", e.target.value)}
                          placeholder="Share your ideas, questions, or how you'd like to contribute to our mission..."
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                            },
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ textAlign: "center", mt: 2.5 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="medium"
                        startIcon={
                          loading ? <CircularProgress size={18} color="inherit" /> : <Send />
                        }
                        disabled={loading}
                        sx={{
                          px: 4,
                          py: 1.25,
                          fontSize: "1rem",
                          fontWeight: 600,
                          borderRadius: "50px",
                          background: "linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)",
                          boxShadow: "0 6px 24px rgba(33, 150, 243, 0.3)",
                          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            transform: "translateY(-2px) scale(1.03)",
                            boxShadow: "0 8px 32px rgba(33, 150, 243, 0.4)",
                            background: "linear-gradient(45deg, #1976d2 30%, #1cb5e0 90%)",
                          },
                        }}
                      >
                        {loading ? "Sending Message..." : "Send Message"}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Paper>
        </Slide>
      </Box>
    </Box>
  );
}
