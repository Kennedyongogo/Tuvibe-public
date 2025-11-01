import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Fade,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
} from "@mui/material";
import {
  Login,
  PersonAdd,
  Menu as MenuIcon,
  Close,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function PublicHeader() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    gender: "",
    age: "",
    city: "",
    category: "Regular",
  });
  const [loginFormData, setLoginFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = () => {
    setLoginDialogOpen(true);
  };

  const handleLoginClose = () => {
    setLoginDialogOpen(false);
    setLoginFormData({
      email: "",
      password: "",
    });
  };

  const handleRegister = () => {
    setRegisterDialogOpen(true);
  };

  const handleRegisterClose = () => {
    setRegisterDialogOpen(false);
    setFormData({
      name: "",
      phone: "",
      email: "",
      password: "",
      gender: "",
      age: "",
      city: "",
      category: "Regular",
    });
  };

  const handleInputChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleLoginInputChange = (field) => (e) => {
    setLoginFormData({ ...loginFormData, [field]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    // Close the login dialog first so SweetAlert appears on top
    handleLoginClose();

    // Small delay to ensure dialog is closed before showing SweetAlert
    setTimeout(async () => {
      // Show loading alert first (like LoginPage.jsx)
      Swal.fire({
        title: "Signing in...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
          // Apply gold styling
          const swal = document.querySelector(".swal2-popup");
          if (swal) {
            swal.style.borderRadius = "20px";
            swal.style.border = "1px solid rgba(212, 175, 55, 0.3)";
            swal.style.boxShadow = "0 20px 60px rgba(212, 175, 55, 0.25)";
            swal.style.background =
              "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)";
            swal.style.backdropFilter = "blur(20px)";
          }
          const title = document.querySelector(".swal2-title");
          if (title) {
            title.style.color = "#1a1a1a";
            title.style.fontWeight = "700";
            title.style.fontSize = "1.5rem";
            title.style.background = "linear-gradient(45deg, #D4AF37, #B8941F)";
            title.style.webkitBackgroundClip = "text";
            title.style.webkitTextFillColor = "transparent";
            title.style.backgroundClip = "text";
          }
        },
      });

      try {
        const response = await fetch("/api/public/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(loginFormData),
        });

        const data = await response.json();

        if (!response.ok) {
          Swal.fire({
            icon: "error",
            title: "Login Failed",
            text:
              data.message || "Invalid email or password. Please try again.",
            confirmButtonColor: "#D4AF37",
            didOpen: () => {
              const swal = document.querySelector(".swal2-popup");
              if (swal) {
                swal.style.borderRadius = "20px";
                swal.style.border = "1px solid rgba(212, 175, 55, 0.3)";
                swal.style.boxShadow = "0 20px 60px rgba(212, 175, 55, 0.25)";
                swal.style.background =
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)";
                swal.style.backdropFilter = "blur(20px)";
              }
              const title = document.querySelector(".swal2-title");
              if (title) {
                title.style.color = "#1a1a1a";
                title.style.fontWeight = "700";
                title.style.fontSize = "1.5rem";
                title.style.background =
                  "linear-gradient(45deg, #D4AF37, #B8941F)";
                title.style.webkitBackgroundClip = "text";
                title.style.webkitTextFillColor = "transparent";
                title.style.backgroundClip = "text";
              }
            },
          });
        } else {
          // Check if login was successful
          if (data.success) {
            // Store token and user data
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("user", JSON.stringify(data.data.user));

            Swal.fire({
              icon: "success",
              title: "Success!",
              text: data.message || "Login successful!",
              timer: 1500,
              showConfirmButton: false,
              confirmButtonColor: "#D4AF37",
              didOpen: () => {
                const swal = document.querySelector(".swal2-popup");
                if (swal) {
                  swal.style.borderRadius = "20px";
                  swal.style.border = "1px solid rgba(212, 175, 55, 0.3)";
                  swal.style.boxShadow = "0 20px 60px rgba(212, 175, 55, 0.25)";
                  swal.style.background =
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)";
                  swal.style.backdropFilter = "blur(20px)";
                }
                const title = document.querySelector(".swal2-title");
                if (title) {
                  title.style.color = "#1a1a1a";
                  title.style.fontWeight = "700";
                  title.style.fontSize = "1.5rem";
                  title.style.background =
                    "linear-gradient(45deg, #D4AF37, #B8941F)";
                  title.style.webkitBackgroundClip = "text";
                  title.style.webkitTextFillColor = "transparent";
                  title.style.backgroundClip = "text";
                }
                const icon = document.querySelector(".swal2-success");
                if (icon) {
                  icon.style.color = "#D4AF37";
                  const circles = icon.querySelectorAll("circle");
                  circles.forEach((circle) => {
                    circle.style.stroke = "#D4AF37";
                  });
                  const paths = icon.querySelectorAll("path");
                  paths.forEach((path) => {
                    path.style.stroke = "#D4AF37";
                    path.style.fill = "#D4AF37";
                  });
                }
                const timerBar = document.querySelector(
                  ".swal2-timer-progress-bar"
                );
                if (timerBar) {
                  timerBar.style.background =
                    "linear-gradient(45deg, #D4AF37, #B8941F)";
                }
              },
            });

            setTimeout(() => {
              // Redirect to home
              navigate("/home");
            }, 1500);
          } else {
            Swal.fire({
              icon: "error",
              title: "Login Failed",
              text:
                data.message || "Invalid email or password. Please try again.",
              confirmButtonColor: "#D4AF37",
              didOpen: () => {
                const swal = document.querySelector(".swal2-popup");
                if (swal) {
                  swal.style.borderRadius = "20px";
                  swal.style.border = "1px solid rgba(212, 175, 55, 0.3)";
                  swal.style.boxShadow = "0 20px 60px rgba(212, 175, 55, 0.25)";
                  swal.style.background =
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)";
                  swal.style.backdropFilter = "blur(20px)";
                }
                const title = document.querySelector(".swal2-title");
                if (title) {
                  title.style.color = "#1a1a1a";
                  title.style.fontWeight = "700";
                  title.style.fontSize = "1.5rem";
                  title.style.background =
                    "linear-gradient(45deg, #D4AF37, #B8941F)";
                  title.style.webkitBackgroundClip = "text";
                  title.style.webkitTextFillColor = "transparent";
                  title.style.backgroundClip = "text";
                }
              },
            });
          }
        }
      } catch (error) {
        console.error("Login error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Login failed. Please try again.",
          confirmButtonColor: "#D4AF37",
          didOpen: () => {
            const swal = document.querySelector(".swal2-popup");
            if (swal) {
              swal.style.borderRadius = "20px";
              swal.style.border = "1px solid rgba(212, 175, 55, 0.3)";
              swal.style.boxShadow = "0 20px 60px rgba(212, 175, 55, 0.25)";
              swal.style.background =
                "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)";
              swal.style.backdropFilter = "blur(20px)";
            }
            const title = document.querySelector(".swal2-title");
            if (title) {
              title.style.color = "#1a1a1a";
              title.style.fontWeight = "700";
              title.style.fontSize = "1.5rem";
              title.style.background =
                "linear-gradient(45deg, #D4AF37, #B8941F)";
              title.style.webkitBackgroundClip = "text";
              title.style.webkitTextFillColor = "transparent";
              title.style.backgroundClip = "text";
            }
          },
        });
      }
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Prepare data - only include non-empty optional fields
    const submitData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
    };
    if (formData.gender) submitData.gender = formData.gender;
    if (formData.age) submitData.age = parseInt(formData.age);
    if (formData.city) submitData.city = formData.city;
    if (formData.category) submitData.category = formData.category;

    // Close the registration dialog first so SweetAlert appears on top
    handleRegisterClose();

    // Small delay to ensure dialog is closed before showing SweetAlert
    setTimeout(async () => {
      // Show loading alert first
      Swal.fire({
        title: "Registering...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
          // Apply gold styling
          const swal = document.querySelector(".swal2-popup");
          if (swal) {
            swal.style.borderRadius = "20px";
            swal.style.border = "1px solid rgba(212, 175, 55, 0.3)";
            swal.style.boxShadow = "0 20px 60px rgba(212, 175, 55, 0.25)";
            swal.style.background =
              "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)";
            swal.style.backdropFilter = "blur(20px)";
          }
          const title = document.querySelector(".swal2-title");
          if (title) {
            title.style.color = "#1a1a1a";
            title.style.fontWeight = "700";
            title.style.fontSize = "1.5rem";
            title.style.background = "linear-gradient(45deg, #D4AF37, #B8941F)";
            title.style.webkitBackgroundClip = "text";
            title.style.webkitTextFillColor = "transparent";
            title.style.backgroundClip = "text";
          }
        },
      });

      try {
        const response = await fetch("/api/public/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(submitData),
        });

        const data = await response.json();

        if (!response.ok) {
          Swal.fire({
            icon: "error",
            title: "Registration Failed",
            text: data.message || "Something went wrong. Please try again.",
            confirmButtonColor: "#D4AF37",
            didOpen: () => {
              const swal = document.querySelector(".swal2-popup");
              if (swal) {
                swal.style.borderRadius = "20px";
                swal.style.border = "1px solid rgba(212, 175, 55, 0.3)";
                swal.style.boxShadow = "0 20px 60px rgba(212, 175, 55, 0.25)";
                swal.style.background =
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)";
                swal.style.backdropFilter = "blur(20px)";
              }
              const title = document.querySelector(".swal2-title");
              if (title) {
                title.style.color = "#1a1a1a";
                title.style.fontWeight = "700";
                title.style.fontSize = "1.5rem";
                title.style.background =
                  "linear-gradient(45deg, #D4AF37, #B8941F)";
                title.style.webkitBackgroundClip = "text";
                title.style.webkitTextFillColor = "transparent";
                title.style.backgroundClip = "text";
              }
            },
          });
        } else {
          // Check if registration was successful
          if (data.success) {
            Swal.fire({
              icon: "success",
              title: "Registration Successful!",
              text:
                data.message || "Your account has been created successfully.",
              timer: 5000,
              timerProgressBar: true,
              showConfirmButton: false,
              confirmButtonColor: "#D4AF37",
              didOpen: () => {
                const swal = document.querySelector(".swal2-popup");
                if (swal) {
                  swal.style.borderRadius = "20px";
                  swal.style.border = "1px solid rgba(212, 175, 55, 0.3)";
                  swal.style.boxShadow = "0 20px 60px rgba(212, 175, 55, 0.25)";
                  swal.style.background =
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)";
                  swal.style.backdropFilter = "blur(20px)";
                }
                const title = document.querySelector(".swal2-title");
                if (title) {
                  title.style.color = "#1a1a1a";
                  title.style.fontWeight = "700";
                  title.style.fontSize = "1.75rem";
                  title.style.background =
                    "linear-gradient(45deg, #D4AF37, #B8941F)";
                  title.style.webkitBackgroundClip = "text";
                  title.style.webkitTextFillColor = "transparent";
                  title.style.backgroundClip = "text";
                }
                const icon = document.querySelector(".swal2-success");
                if (icon) {
                  icon.style.color = "#D4AF37";
                  const circles = icon.querySelectorAll("circle");
                  circles.forEach((circle) => {
                    circle.style.stroke = "#D4AF37";
                  });
                  const paths = icon.querySelectorAll("path");
                  paths.forEach((path) => {
                    path.style.stroke = "#D4AF37";
                    path.style.fill = "#D4AF37";
                  });
                }
                const timerBar = document.querySelector(
                  ".swal2-timer-progress-bar"
                );
                if (timerBar) {
                  timerBar.style.background =
                    "linear-gradient(45deg, #D4AF37, #B8941F)";
                }
              },
            });

            setTimeout(() => {
              // Open login dialog
              handleLogin();
            }, 5000);
          } else {
            Swal.fire({
              icon: "error",
              title: "Registration Failed",
              text: data.message || "Something went wrong. Please try again.",
              confirmButtonColor: "#D4AF37",
              didOpen: () => {
                const swal = document.querySelector(".swal2-popup");
                if (swal) {
                  swal.style.borderRadius = "20px";
                  swal.style.border = "1px solid rgba(212, 175, 55, 0.3)";
                  swal.style.boxShadow = "0 20px 60px rgba(212, 175, 55, 0.25)";
                  swal.style.background =
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)";
                  swal.style.backdropFilter = "blur(20px)";
                }
                const title = document.querySelector(".swal2-title");
                if (title) {
                  title.style.color = "#1a1a1a";
                  title.style.fontWeight = "700";
                  title.style.fontSize = "1.5rem";
                  title.style.background =
                    "linear-gradient(45deg, #D4AF37, #B8941F)";
                  title.style.webkitBackgroundClip = "text";
                  title.style.webkitTextFillColor = "transparent";
                  title.style.backgroundClip = "text";
                }
              },
            });
          }
        }
      } catch (error) {
        console.error("Registration error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Registration failed. Please try again.",
          confirmButtonColor: "#D4AF37",
          didOpen: () => {
            const swal = document.querySelector(".swal2-popup");
            if (swal) {
              swal.style.borderRadius = "20px";
              swal.style.border = "1px solid rgba(212, 175, 55, 0.3)";
              swal.style.boxShadow = "0 20px 60px rgba(212, 175, 55, 0.25)";
              swal.style.background =
                "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)";
              swal.style.backdropFilter = "blur(20px)";
            }
            const title = document.querySelector(".swal2-title");
            if (title) {
              title.style.color = "#1a1a1a";
              title.style.fontWeight = "700";
              title.style.fontSize = "1.5rem";
              title.style.background =
                "linear-gradient(45deg, #D4AF37, #B8941F)";
              title.style.webkitBackgroundClip = "text";
              title.style.webkitTextFillColor = "transparent";
              title.style.backgroundClip = "text";
            }
          },
        });
      }
    }, 100);
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: scrolled
            ? "rgba(255, 248, 220, 0.98)"
            : "rgba(255, 236, 179, 0.5)",
          backdropFilter: scrolled ? "blur(20px)" : "blur(10px)",
          boxShadow: scrolled
            ? "0 8px 32px rgba(212, 175, 55, 0.25)"
            : "0 4px 20px rgba(212, 175, 55, 0.2)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          borderBottom: scrolled
            ? "2px solid rgba(212, 175, 55, 0.4)"
            : "2px solid rgba(212, 175, 55, 0.3)",
          backgroundImage: scrolled
            ? "linear-gradient(135deg, rgba(255, 248, 220, 0.98) 0%, rgba(255, 236, 179, 0.95) 100%)"
            : "linear-gradient(135deg, rgba(255, 236, 179, 0.5) 0%, rgba(245, 230, 211, 0.6) 100%)",
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {/* Enhanced Logo Section */}
            <Fade in={true} timeout={1000}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "scale(1.05) translateY(-2px)",
                  },
                }}
                onClick={() => navigate("/")}
              >
                <img
                  src="/tuvibe.png"
                  alt="Tuvibe Logo"
                  style={{
                    height: scrolled ? "56px" : "64px",
                    width: "auto",
                    transition: "height 0.4s ease",
                    filter: scrolled
                      ? "none"
                      : "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                  }}
                />
                <Box sx={{ ml: 2, display: { xs: "none", sm: "block" } }}>
                  <Typography
                    sx={{
                      fontWeight: "700",
                      fontSize: { sm: "1.1rem", md: "1.25rem" },
                      color: scrolled ? "primary.main" : "#2C2C2C",
                      lineHeight: 1.2,
                      transition: "all 0.3s ease",
                      textShadow: scrolled
                        ? "none"
                        : "2px 2px 4px rgba(255,255,255,0.5)",
                      background: scrolled
                        ? "linear-gradient(45deg, #D4AF37, #B8941F)"
                        : "linear-gradient(45deg, #D4AF37, #E8D5A3)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Tuvibe
                  </Typography>
                </Box>
              </Box>
            </Fade>

            {/* Register and Login Buttons - Desktop Only */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                gap: 2,
                alignItems: "center",
              }}
            >
              <Fade in={true} timeout={1000}>
                <Button
                  onClick={handleRegister}
                  startIcon={<PersonAdd sx={{ color: "#D4AF37" }} />}
                  variant="outlined"
                  sx={{
                    color: "#D4AF37",
                    borderColor: "#D4AF37",
                    borderWidth: "2px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    px: 3,
                    py: 1.25,
                    borderRadius: "25px",
                    textTransform: "none",
                    outline: "none",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      backgroundColor: "rgba(212, 175, 55, 0.15)",
                      borderColor: "#B8941F",
                      borderWidth: "2px",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(212, 175, 55, 0.4)",
                      "& .MuiSvgIcon-root": {
                        color: "#B8941F",
                      },
                    },
                    "&:focus": {
                      outline: "none",
                      boxShadow: "none",
                    },
                    "&:focus-visible": {
                      outline: "none",
                      boxShadow: "none",
                    },
                    "&.Mui-focusVisible": {
                      outline: "none",
                      boxShadow: "none",
                    },
                  }}
                >
                  Register
                </Button>
              </Fade>
              <Fade in={true} timeout={1200}>
                <Button
                  onClick={handleLogin}
                  startIcon={<Login sx={{ color: "white" }} />}
                  variant="contained"
                  sx={{
                    backgroundColor: "#D4AF37",
                    color: "white",
                    fontSize: "1rem",
                    fontWeight: 600,
                    px: 3,
                    py: 1.25,
                    borderRadius: "25px",
                    textTransform: "none",
                    outline: "none",
                    background: "linear-gradient(45deg, #D4AF37, #B8941F)",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #B8941F, #D4AF37)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(212, 175, 55, 0.5)",
                    },
                    "&:focus": {
                      outline: "none",
                      boxShadow: "none",
                    },
                    "&:focus-visible": {
                      outline: "none",
                      boxShadow: "none",
                    },
                    "&.Mui-focusVisible": {
                      outline: "none",
                      boxShadow: "none",
                    },
                  }}
                >
                  Login
                </Button>
              </Fade>
            </Box>

            {/* Hamburger Menu - Mobile Only */}
            <Fade in={true} timeout={1200}>
              <IconButton
                sx={{
                  display: { xs: "flex", md: "none" },
                  color: "#D4AF37",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  borderRadius: "12px",
                  outline: "none",
                  border: "2px solid rgba(212, 175, 55, 0.3)",
                  "&:hover": {
                    backgroundColor: "rgba(212, 175, 55, 0.15)",
                    borderColor: "#D4AF37",
                    transform: "rotate(90deg) scale(1.1)",
                    boxShadow: "0 8px 25px rgba(212, 175, 55, 0.4)",
                    color: "#B8941F",
                  },
                  "&:focus": {
                    outline: "none",
                    boxShadow: "none",
                  },
                  "&:focus-visible": {
                    outline: "none",
                    boxShadow: "none",
                  },
                  "&.Mui-focusVisible": {
                    outline: "none",
                    boxShadow: "none",
                  },
                }}
                onClick={() => setMobileMenuOpen(true)}
              >
                <MenuIcon sx={{ fontSize: "1.8rem" }} />
              </IconButton>
            </Fade>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "280px", sm: "320px" },
            backgroundColor: "rgba(255, 248, 220, 0.98)",
            backgroundImage:
              "linear-gradient(135deg, rgba(255, 248, 220, 0.98) 0%, rgba(255, 236, 179, 0.95) 100%)",
            backdropFilter: "blur(20px)",
            borderLeft: "3px solid rgba(212, 175, 55, 0.5)",
            boxShadow: "0 8px 32px rgba(212, 175, 55, 0.25)",
            height: "auto",
            top: "80px",
            bottom: "auto",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(45deg, #D4AF37, #B8941F)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
              }}
            >
              Menu
            </Typography>
            <IconButton
              onClick={() => setMobileMenuOpen(false)}
              size="small"
              sx={{
                transition: "all 0.3s ease",
                borderRadius: "8px",
                "&:hover": {
                  transform: "rotate(90deg)",
                  backgroundColor: "rgba(212, 175, 55, 0.1)",
                },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2, borderColor: "rgba(212, 175, 55, 0.2)" }} />
          <List sx={{ py: 0 }}>
            <ListItemButton
              onClick={() => {
                handleRegister();
                setMobileMenuOpen(false);
              }}
              sx={{
                borderRadius: "12px",
                mb: 1,
                py: 1.5,
                px: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(212, 175, 55, 0.15)",
                  transform: "translateX(8px)",
                  boxShadow: "0 4px 12px rgba(212, 175, 55, 0.2)",
                  "& .icon": {
                    color: "#D4AF37",
                    transform: "rotate(180deg)",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "#D4AF37",
                  minWidth: 36,
                  "& .icon": {
                    transition: "all 0.3s ease",
                  },
                }}
              >
                <PersonAdd className="icon" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Register"
                primaryTypographyProps={{
                  fontSize: { xs: "0.95rem", sm: "1.1rem" },
                  fontWeight: 600,
                  color: "text.primary",
                }}
              />
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                handleLogin();
                setMobileMenuOpen(false);
              }}
              sx={{
                borderRadius: "12px",
                mb: 1,
                py: 1.5,
                px: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(212, 175, 55, 0.15)",
                  transform: "translateX(8px)",
                  boxShadow: "0 4px 12px rgba(212, 175, 55, 0.2)",
                  "& .icon": {
                    color: "#D4AF37",
                    transform: "rotate(180deg)",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "#D4AF37",
                  minWidth: 36,
                  "& .icon": {
                    transition: "all 0.3s ease",
                  },
                }}
              >
                <Login className="icon" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Login"
                primaryTypographyProps={{
                  fontSize: { xs: "0.95rem", sm: "1.1rem" },
                  fontWeight: 600,
                  color: "text.primary",
                }}
              />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      {/* Registration Dialog */}
      <Dialog
        open={registerDialogOpen}
        onClose={handleRegisterClose}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            backgroundColor: "rgba(255, 248, 220, 0.98)",
            backgroundImage:
              "linear-gradient(135deg, rgba(255, 248, 220, 0.98) 0%, rgba(255, 236, 179, 0.95) 100%)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 60px rgba(212, 175, 55, 0.3)",
            border: "2px solid rgba(212, 175, 55, 0.3)",
            maxHeight: "95vh",
            width: { xs: "90%", sm: "85%", md: "75%" },
            maxWidth: "700px",
            margin: "auto",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(45deg, #D4AF37, #B8941F)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
            fontSize: { xs: "1.5rem", sm: "1.75rem" },
            textAlign: "center",
            pb: 1,
            pt: { xs: 2, sm: 2.5 },
          }}
        >
          Create Account
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ px: { xs: 3, sm: 4 }, py: { xs: 2, sm: 2.5 }, overflow: "auto" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Required Fields */}
              <TextField
                required
                label="Name"
                value={formData.name}
                onChange={handleInputChange("name")}
                fullWidth
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "& fieldset": {
                      borderColor: "rgba(212, 175, 55, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(212, 175, 55, 0.6)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#D4AF37",
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiInputBase-input": {
                    py: 1.5,
                    lineHeight: 1.5,
                  },
                  "& .MuiInputLabel-root": {
                    transform: "translate(14px, 18px) scale(1)",
                    "&.MuiInputLabel-shrink": {
                      transform: "translate(14px, -9px) scale(0.75)",
                    },
                    "&.Mui-focused": {
                      color: "#D4AF37",
                    },
                  },
                }}
              />
              <TextField
                required
                label="Phone"
                value={formData.phone}
                onChange={handleInputChange("phone")}
                fullWidth
                variant="outlined"
                placeholder="+1234567890"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "& fieldset": {
                      borderColor: "rgba(212, 175, 55, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(212, 175, 55, 0.6)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#D4AF37",
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiInputBase-input": {
                    py: 1.5,
                    lineHeight: 1.5,
                  },
                  "& .MuiInputLabel-root": {
                    transform: "translate(14px, 18px) scale(1)",
                    "&.MuiInputLabel-shrink": {
                      transform: "translate(14px, -9px) scale(0.75)",
                    },
                    "&.Mui-focused": {
                      color: "#D4AF37",
                    },
                  },
                }}
              />
              <TextField
                required
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                fullWidth
                variant="outlined"
                placeholder="john@example.com"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "& fieldset": {
                      borderColor: "rgba(212, 175, 55, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(212, 175, 55, 0.6)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#D4AF37",
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiInputBase-input": {
                    py: 1.5,
                    lineHeight: 1.5,
                  },
                  "& .MuiInputLabel-root": {
                    transform: "translate(14px, 18px) scale(1)",
                    "&.MuiInputLabel-shrink": {
                      transform: "translate(14px, -9px) scale(0.75)",
                    },
                    "&.Mui-focused": {
                      color: "#D4AF37",
                    },
                  },
                }}
              />
              <TextField
                required
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange("password")}
                fullWidth
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "& fieldset": {
                      borderColor: "rgba(212, 175, 55, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(212, 175, 55, 0.6)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#D4AF37",
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiInputBase-input": {
                    py: 1.5,
                    lineHeight: 1.5,
                  },
                  "& .MuiInputLabel-root": {
                    transform: "translate(14px, 18px) scale(1)",
                    "&.MuiInputLabel-shrink": {
                      transform: "translate(14px, -9px) scale(0.75)",
                    },
                    "&.Mui-focused": {
                      color: "#D4AF37",
                    },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: "#D4AF37" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Optional Fields */}
              <FormControl fullWidth>
                <InputLabel sx={{ "&.Mui-focused": { color: "#D4AF37" } }}>
                  Gender
                </InputLabel>
                <Select
                  value={formData.gender}
                  onChange={handleInputChange("gender")}
                  label="Gender"
                  sx={{
                    borderRadius: "12px",
                    "& .MuiSelect-select": {
                      py: 1.5,
                      lineHeight: 1.5,
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(212, 175, 55, 0.3)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(212, 175, 55, 0.6)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#D4AF37",
                      borderWidth: "2px",
                    },
                  }}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Age"
                type="number"
                value={formData.age}
                onChange={handleInputChange("age")}
                fullWidth
                variant="outlined"
                inputProps={{ min: 18, max: 100 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "& fieldset": {
                      borderColor: "rgba(212, 175, 55, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(212, 175, 55, 0.6)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#D4AF37",
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiInputBase-input": {
                    py: 1.5,
                    lineHeight: 1.5,
                  },
                  "& .MuiInputLabel-root": {
                    transform: "translate(14px, 18px) scale(1)",
                    "&.MuiInputLabel-shrink": {
                      transform: "translate(14px, -9px) scale(0.75)",
                    },
                    "&.Mui-focused": {
                      color: "#D4AF37",
                    },
                  },
                }}
              />

              <TextField
                label="City"
                value={formData.city}
                onChange={handleInputChange("city")}
                fullWidth
                variant="outlined"
                placeholder="Nairobi"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "& fieldset": {
                      borderColor: "rgba(212, 175, 55, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(212, 175, 55, 0.6)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#D4AF37",
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiInputBase-input": {
                    py: 1.5,
                    lineHeight: 1.5,
                  },
                  "& .MuiInputLabel-root": {
                    transform: "translate(14px, 18px) scale(1)",
                    "&.MuiInputLabel-shrink": {
                      transform: "translate(14px, -9px) scale(0.75)",
                    },
                    "&.Mui-focused": {
                      color: "#D4AF37",
                    },
                  },
                }}
              />

              <FormControl fullWidth>
                <InputLabel sx={{ "&.Mui-focused": { color: "#D4AF37" } }}>
                  Category
                </InputLabel>
                <Select
                  value={formData.category}
                  onChange={handleInputChange("category")}
                  label="Category"
                  sx={{
                    borderRadius: "12px",
                    "& .MuiSelect-select": {
                      py: 1.5,
                      lineHeight: 1.5,
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(212, 175, 55, 0.3)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(212, 175, 55, 0.6)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#D4AF37",
                      borderWidth: "2px",
                    },
                  }}
                >
                  <MenuItem value="Regular">Regular</MenuItem>
                  <MenuItem value="Sugar Mummy">Sugar Mummy</MenuItem>
                  <MenuItem value="Sponsor">Sponsor</MenuItem>
                  <MenuItem value="Ben 10">Ben 10</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              px: { xs: 3, sm: 4 },
              pb: { xs: 2, sm: 2.5 },
              pt: { xs: 1, sm: 1.5 },
              gap: { xs: 1.5, sm: 2 },
              justifyContent: "center",
            }}
          >
            <Button
              onClick={handleRegisterClose}
              variant="outlined"
              sx={{
                borderRadius: "25px",
                px: { xs: 3, sm: 4 },
                py: 1,
                textTransform: "none",
                fontWeight: 600,
                fontSize: { xs: "0.875rem", sm: "1rem" },
                borderColor: "primary.main",
                color: "primary.main",
                "&:hover": {
                  borderColor: "primary.dark",
                  backgroundColor: "rgba(212, 175, 55, 0.1)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                borderRadius: "25px",
                px: { xs: 3, sm: 4 },
                py: 1,
                textTransform: "none",
                fontWeight: 600,
                fontSize: { xs: "0.875rem", sm: "1rem" },
                background: "linear-gradient(45deg, #D4AF37, #B8941F)",
                "&:hover": {
                  background: "linear-gradient(45deg, #B8941F, #D4AF37)",
                  boxShadow: "0 8px 25px rgba(212, 175, 55, 0.4)",
                },
              }}
            >
              Register
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Login Dialog */}
      <Dialog
        open={loginDialogOpen}
        onClose={handleLoginClose}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            backgroundColor: "rgba(255, 248, 220, 0.98)",
            backgroundImage:
              "linear-gradient(135deg, rgba(255, 248, 220, 0.98) 0%, rgba(255, 236, 179, 0.95) 100%)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 60px rgba(212, 175, 55, 0.3)",
            border: "2px solid rgba(212, 175, 55, 0.3)",
            maxHeight: "95vh",
            width: { xs: "90%", sm: "75%", md: "56.25%" },
            maxWidth: "520px",
            margin: "auto",
            minHeight: { xs: "auto", sm: "320px" },
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(45deg, #D4AF37, #B8941F)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
            fontSize: { xs: "1.5rem", sm: "1.75rem" },
            textAlign: "center",
            pb: 1,
            pt: { xs: 2, sm: 2.5 },
          }}
        >
          Login
        </DialogTitle>
        <form onSubmit={handleLoginSubmit}>
          <DialogContent sx={{ px: { xs: 3, sm: 4 }, py: { xs: 2, sm: 2.5 }, overflow: "auto" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                required
                label="Email"
                type="email"
                value={loginFormData.email}
                onChange={handleLoginInputChange("email")}
                fullWidth
                variant="outlined"
                placeholder="john@example.com"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "& fieldset": {
                      borderColor: "rgba(212, 175, 55, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(212, 175, 55, 0.6)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#D4AF37",
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiInputBase-input": {
                    py: 1.5,
                    lineHeight: 1.5,
                  },
                  "& .MuiInputLabel-root": {
                    transform: "translate(14px, 18px) scale(1)",
                    "&.MuiInputLabel-shrink": {
                      transform: "translate(14px, -9px) scale(0.75)",
                    },
                    "&.Mui-focused": {
                      color: "#D4AF37",
                    },
                  },
                }}
              />
              <TextField
                required
                label="Password"
                type={showLoginPassword ? "text" : "password"}
                value={loginFormData.password}
                onChange={handleLoginInputChange("password")}
                fullWidth
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "& fieldset": {
                      borderColor: "rgba(212, 175, 55, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(212, 175, 55, 0.6)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#D4AF37",
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiInputBase-input": {
                    py: 1.5,
                    lineHeight: 1.5,
                  },
                  "& .MuiInputLabel-root": {
                    transform: "translate(14px, 18px) scale(1)",
                    "&.MuiInputLabel-shrink": {
                      transform: "translate(14px, -9px) scale(0.75)",
                    },
                    "&.Mui-focused": {
                      color: "#D4AF37",
                    },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        edge="end"
                        sx={{ color: "#D4AF37" }}
                      >
                        {showLoginPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              px: { xs: 3, sm: 4 },
              pb: { xs: 2, sm: 2.5 },
              pt: { xs: 1, sm: 1.5 },
              gap: { xs: 1.5, sm: 2 },
              justifyContent: "center",
            }}
          >
            <Button
              onClick={handleLoginClose}
              variant="outlined"
              sx={{
                borderRadius: "25px",
                px: { xs: 3, sm: 4 },
                py: 1,
                textTransform: "none",
                fontWeight: 600,
                borderColor: "primary.main",
                color: "primary.main",
                fontSize: { xs: "0.875rem", sm: "1rem" },
                "&:hover": {
                  borderColor: "primary.dark",
                  backgroundColor: "rgba(212, 175, 55, 0.1)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                borderRadius: "25px",
                px: { xs: 3, sm: 4 },
                py: 1,
                textTransform: "none",
                fontWeight: 600,
                fontSize: { xs: "0.875rem", sm: "1rem" },
                background: "linear-gradient(45deg, #D4AF37, #B8941F)",
                "&:hover": {
                  background: "linear-gradient(45deg, #B8941F, #D4AF37)",
                  boxShadow: "0 8px 25px rgba(212, 175, 55, 0.4)",
                },
              }}
            >
              Login
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Toolbar
        sx={{
          height: scrolled ? "72px" : "80px",
          transition: "height 0.4s ease",
        }}
      />
    </>
  );
}
