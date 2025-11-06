import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Fade,
  Button,
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
  IconButton,
  Avatar,
  Card,
  CardContent,
} from "@mui/material";
import {
  Login,
  PersonAdd,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  ArrowForward,
  AutoAwesome,
  PhotoCamera,
  Favorite,
  Sms,
  WhatsApp as WhatsAppIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function HeroSection() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [registerStep, setRegisterStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    gender: "",
    age: "",
    bio: "",
  });
  const [loginFormData, setLoginFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    setIsVisible(true);
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
      bio: "",
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setRegisterStep(1);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          icon: "error",
          title: "Invalid File",
          text: "Please select an image file.",
          confirmButtonColor: "#D4AF37",
        });
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "Please select an image smaller than 10MB.",
          confirmButtonColor: "#D4AF37",
        });
        return;
      }
      setPhotoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleLoginInputChange = (field) => (e) => {
    setLoginFormData({ ...loginFormData, [field]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    handleLoginClose();

    setTimeout(async () => {
      Swal.fire({
        title: "Signing in...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
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
          if (data.success) {
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
    // Only submit if we're on step 2
    if (registerStep !== 2) {
      return;
    }
    const submitData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
    };
    if (formData.gender) submitData.gender = formData.gender;
    if (formData.age) submitData.age = parseInt(formData.age);

    handleRegisterClose();

    setTimeout(async () => {
      Swal.fire({
        title: "Registering...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
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
        let response;
        // If photo file is selected, use FormData for multipart upload
        if (photoFile) {
          const formDataToSend = new FormData();
          // Add all form fields
          formDataToSend.append("name", formData.name);
          formDataToSend.append("phone", formData.phone);
          formDataToSend.append("email", formData.email);
          formDataToSend.append("password", formData.password);
          if (formData.gender) formDataToSend.append("gender", formData.gender);
          if (formData.age)
            formDataToSend.append("age", parseInt(formData.age));
          if (formData.bio) formDataToSend.append("bio", formData.bio);
          // Add photo file
          formDataToSend.append("profile_image", photoFile);

          response = await fetch("/api/public/register", {
            method: "POST",
            headers: {
              Accept: "application/json",
              // Don't set Content-Type - browser will set it with boundary
            },
            body: formDataToSend,
          });
        } else {
          // No photo, use JSON
          if (formData.bio) submitData.bio = formData.bio;
          response = await fetch("/api/public/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(submitData),
          });
        }

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
    <Box
      id="hero-section"
      sx={{
        position: "relative",
        height: "100vh",
        maxHeight: "100vh",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#b88900", // Base darker gold
        // Enhanced gradient overlay with richer golden shades
        background: `
          linear-gradient(135deg, #ffd700 0%, #f7c948 20%, #e6b800 40%, #d4af37 60%, #b8941f 80%, #b88900 100%),
          radial-gradient(circle at 20% 40%, rgba(255, 215, 0, 0.35) 0%, transparent 55%),
          radial-gradient(circle at 80% 70%, rgba(184, 137, 0, 0.45) 0%, transparent 55%),
          radial-gradient(circle at 50% 20%, rgba(247, 201, 72, 0.25) 0%, transparent 45%),
          #b88900
        `,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // Metallic texture with bokeh overlay
          background: `
            radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 30%),
            radial-gradient(circle at 80% 30%, rgba(255, 255, 255, 0.08) 0%, transparent 25%),
            radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.06) 0%, transparent 35%),
            radial-gradient(circle at 90% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 30%),
            radial-gradient(circle at 30% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 25%),
            radial-gradient(circle at 70% 90%, rgba(255, 255, 255, 0.06) 0%, transparent 35%)
          `,
          backgroundSize: "200% 200%",
          animation: "bokehFloat 20s ease-in-out infinite",
          zIndex: 1,
          opacity: 0.7,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // Terrain pattern overlay
          background: `
            polygon(0% 85%, 15% 75%, 30% 82%, 45% 70%, 60% 78%, 75% 72%, 90% 80%, 100% 75%, 100% 100%, 0% 100%),
            polygon(0% 100%, 20% 90%, 40% 95%, 60% 88%, 80% 92%, 100% 88%, 100% 100%, 0% 100%)
          `,
          backgroundSize: "100% 100%",
          backgroundPosition: "0 0, 0 0",
          backgroundRepeat: "no-repeat",
          opacity: 0.3,
          zIndex: 1,
          mixBlendMode: "multiply",
        },
      }}
    >
      {/* Terrain Hills Layer 1 */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "60%",
          zIndex: 1,
          background: `
            radial-gradient(ellipse 120% 100% at 50% 100%, rgba(139, 105, 20, 0.7) 0%, transparent 70%),
            radial-gradient(ellipse 100% 80% at 0% 100%, rgba(184, 148, 31, 0.6) 0%, transparent 60%),
            radial-gradient(ellipse 100% 80% at 100% 100%, rgba(212, 175, 55, 0.5) 0%, transparent 60%)
          `,
          clipPath:
            "polygon(0% 45%, 12% 35%, 25% 42%, 38% 32%, 50% 40%, 62% 35%, 75% 42%, 88% 38%, 100% 45%, 100% 100%, 0% 100%)",
        }}
      />

      {/* Terrain Hills Layer 2 */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "40%",
          zIndex: 1,
          background: `
            radial-gradient(ellipse 150% 100% at 50% 100%, rgba(184, 148, 31, 0.8) 0%, transparent 65%),
            radial-gradient(ellipse 110% 90% at 25% 100%, rgba(139, 105, 20, 0.7) 0%, transparent 55%),
            radial-gradient(ellipse 110% 90% at 75% 100%, rgba(201, 176, 55, 0.6) 0%, transparent 55%)
          `,
          clipPath:
            "polygon(0% 60%, 18% 50%, 35% 58%, 52% 48%, 68% 55%, 85% 52%, 100% 60%, 100% 100%, 0% 100%)",
        }}
      />

      {/* Terrain Hills Layer 3 - Deepest */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "30%",
          zIndex: 1,
          background: `
            radial-gradient(ellipse 180% 120% at 50% 100%, rgba(139, 105, 20, 0.9) 0%, transparent 70%)
          `,
          clipPath:
            "polygon(0% 70%, 10% 65%, 22% 72%, 33% 68%, 44% 73%, 56% 70%, 67% 75%, 78% 72%, 89% 76%, 100% 74%, 100% 100%, 0% 100%)",
        }}
      />

      {/* Particle Animation Layer */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundImage: `
              radial-gradient(2px 2px at 20% 30%, rgba(255, 255, 255, 0.4), transparent),
              radial-gradient(2px 2px at 60% 70%, rgba(255, 255, 255, 0.3), transparent),
              radial-gradient(1px 1px at 50% 50%, rgba(255, 255, 255, 0.5), transparent),
              radial-gradient(1px 1px at 80% 10%, rgba(255, 255, 255, 0.4), transparent),
              radial-gradient(2px 2px at 90% 60%, rgba(255, 255, 255, 0.3), transparent),
              radial-gradient(1px 1px at 33% 80%, rgba(255, 255, 255, 0.4), transparent),
              radial-gradient(1px 1px at 70% 40%, rgba(255, 255, 255, 0.5), transparent),
              radial-gradient(2px 2px at 40% 20%, rgba(255, 255, 255, 0.3), transparent)
            `,
            backgroundRepeat: "repeat",
            backgroundSize: "200% 200%",
            animation: "particleMove 20s linear infinite",
            opacity: 0.6,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundImage: `
              radial-gradient(3px 3px at 15% 25%, rgba(255, 215, 0, 0.5), transparent),
              radial-gradient(2px 2px at 55% 65%, rgba(255, 215, 0, 0.4), transparent),
              radial-gradient(1px 1px at 75% 45%, rgba(255, 215, 0, 0.6), transparent),
              radial-gradient(2px 2px at 35% 85%, rgba(255, 215, 0, 0.4), transparent),
              radial-gradient(1px 1px at 85% 15%, rgba(255, 215, 0, 0.5), transparent)
            `,
            backgroundRepeat: "repeat",
            backgroundSize: "150% 150%",
            animation: "particleMove 25s linear infinite reverse",
            opacity: 0.5,
          },
        }}
      />

      {/* Floating Animated Icons */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {/* Floating Heart 1 */}
        <Box
          sx={{
            position: "absolute",
            left: { xs: "10%", md: "15%" },
            top: { xs: "20%", md: "25%" },
            animation: "floatUpDown 4s ease-in-out infinite",
            animationDelay: "0s",
            opacity: 0.7,
          }}
        >
          <Favorite
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              color: "#ff6b9d",
              filter: "drop-shadow(0 4px 8px rgba(255, 107, 157, 0.4))",
            }}
          />
        </Box>

        {/* Floating Heart 2 */}
        <Box
          sx={{
            position: "absolute",
            right: { xs: "12%", md: "18%" },
            top: { xs: "35%", md: "40%" },
            animation: "floatUpDown 5s ease-in-out infinite",
            animationDelay: "1s",
            opacity: 0.6,
          }}
        >
          <Favorite
            sx={{
              fontSize: { xs: "1.8rem", md: "2.2rem" },
              color: "#ff9f9f",
              filter: "drop-shadow(0 4px 8px rgba(255, 159, 159, 0.4))",
            }}
          />
        </Box>

        {/* Floating Heart 3 */}
        <Box
          sx={{
            position: "absolute",
            left: { xs: "8%", md: "12%" },
            bottom: { xs: "30%", md: "35%" },
            animation: "floatUpDown 4.5s ease-in-out infinite",
            animationDelay: "2s",
            opacity: 0.65,
          }}
        >
          <Favorite
            sx={{
              fontSize: { xs: "2.2rem", md: "2.8rem" },
              color: "#ffc0cb",
              filter: "drop-shadow(0 4px 8px rgba(255, 192, 203, 0.4))",
            }}
          />
        </Box>

        {/* Floating Heart 4 */}
        <Box
          sx={{
            position: "absolute",
            right: { xs: "10%", md: "15%" },
            bottom: { xs: "25%", md: "30%" },
            animation: "floatUpDown 5.5s ease-in-out infinite",
            animationDelay: "1.5s",
            opacity: 0.7,
          }}
        >
          <Favorite
            sx={{
              fontSize: { xs: "1.5rem", md: "2rem" },
              color: "#ff6b9d",
              filter: "drop-shadow(0 4px 8px rgba(255, 107, 157, 0.4))",
            }}
          />
        </Box>

        {/* Floating WhatsApp Icon 1 */}
        <Box
          sx={{
            position: "absolute",
            left: { xs: "5%", md: "8%" },
            top: { xs: "50%", md: "55%" },
            animation: "floatUpDown 4.8s ease-in-out infinite",
            animationDelay: "0.5s",
            opacity: 0.7,
          }}
        >
          <WhatsAppIcon
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              color: "#25D366",
              filter: "drop-shadow(0 4px 8px rgba(37, 211, 102, 0.4))",
            }}
          />
        </Box>

        {/* Floating WhatsApp Icon 2 */}
        <Box
          sx={{
            position: "absolute",
            right: { xs: "8%", md: "12%" },
            top: { xs: "60%", md: "65%" },
            animation: "floatUpDown 5.2s ease-in-out infinite",
            animationDelay: "2.5s",
            opacity: 0.65,
          }}
        >
          <WhatsAppIcon
            sx={{
              fontSize: { xs: "1.8rem", md: "2.2rem" },
              color: "#128C7E",
              filter: "drop-shadow(0 4px 8px rgba(18, 140, 126, 0.4))",
            }}
          />
        </Box>

        {/* Floating Text/Message Icon 1 */}
        <Box
          sx={{
            position: "absolute",
            left: { xs: "15%", md: "20%" },
            top: { xs: "65%", md: "70%" },
            animation: "floatUpDown 4.3s ease-in-out infinite",
            animationDelay: "1.2s",
            opacity: 0.7,
          }}
        >
          <Sms
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              color: "#D4AF37",
              filter: "drop-shadow(0 4px 8px rgba(212, 175, 55, 0.5))",
            }}
          />
        </Box>

        {/* Floating Text/Message Icon 2 */}
        <Box
          sx={{
            position: "absolute",
            right: { xs: "15%", md: "20%" },
            bottom: { xs: "40%", md: "45%" },
            animation: "floatUpDown 5s ease-in-out infinite",
            animationDelay: "0.8s",
            opacity: 0.65,
          }}
        >
          <Sms
            sx={{
              fontSize: { xs: "1.8rem", md: "2.2rem" },
              color: "#f7c948",
              filter: "drop-shadow(0 4px 8px rgba(247, 201, 72, 0.5))",
            }}
          />
        </Box>

        {/* Floating Text/Message Icon 3 */}
        <Box
          sx={{
            position: "absolute",
            left: { xs: "12%", md: "18%" },
            bottom: { xs: "50%", md: "55%" },
            animation: "floatUpDown 4.6s ease-in-out infinite",
            animationDelay: "3s",
            opacity: 0.7,
          }}
        >
          <Sms
            sx={{
              fontSize: { xs: "2.2rem", md: "2.8rem" },
              color: "#e6b800",
              filter: "drop-shadow(0 4px 8px rgba(230, 184, 0, 0.5))",
            }}
          />
        </Box>
      </Box>

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
          color: "rgba(0, 0, 0, 0.9)",
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
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: { xs: 2, sm: 2.5, md: 3 },
              animation: "slideInUp 1.2s ease-out",
            }}
          >
            {/* Spotlight Glow Behind Logo */}
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: "300px", sm: "400px", md: "500px", lg: "600px" },
                height: { xs: "300px", sm: "400px", md: "500px", lg: "600px" },
                background:
                  "radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(247, 201, 72, 0.2) 30%, transparent 70%)",
                borderRadius: "50%",
                filter: "blur(60px)",
                zIndex: 2,
                animation: "pulseGlow 3s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />

            {/* Tuvibe Typography */}
            <Typography
              variant="h1"
              sx={{
                position: "relative",
                zIndex: 3,
                fontWeight: 900,
                fontSize: {
                  xs: "3rem",
                  sm: "3.8rem",
                  md: "4.8rem",
                  lg: "5.5rem",
                  xl: "6.2rem",
                },
                textAlign: "center",
                letterSpacing: {
                  xs: "3px",
                  sm: "4px",
                  md: "5px",
                  lg: "6px",
                },
                fontFamily:
                  '"Montserrat", "Poppins", "Manrope", "Inter", sans-serif',
                // Enhanced gold → dark bronze gradient with more depth
                background: `linear-gradient(135deg, 
                  #FFD700 0%,
                  #f7c948 12%,
                  #ffd700 24%,
                  #d4af37 36%,
                  #b88900 48%,
                  #8B6914 60%,
                  #654321 72%,
                  #8B6914 84%,
                  #3d2817 96%,
                  #1a1a1a 100%)`,
                backgroundSize: "200% 200%",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow:
                  "0 6px 30px rgba(255, 215, 0, 0.4), 0 3px 15px rgba(139, 105, 20, 0.3), 0 0 40px rgba(212, 175, 55, 0.5), 0 0 60px rgba(255, 215, 0, 0.2)",
                lineHeight: { xs: 1.05, sm: 1, md: 0.95 },
                textTransform: "uppercase",
                filter: "drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))",
                WebkitTextStroke: "1px rgba(255, 215, 0, 0.4)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                animation:
                  "fadeInUp 1.2s ease-out 0.3s both, shimmerText 4s ease-in-out infinite",
                "&:hover": {
                  transform: "scale(1.03)",
                  filter: "drop-shadow(0 0 30px rgba(255, 215, 0, 0.8))",
                  animation:
                    "fadeInUp 1.2s ease-out 0.3s both, shimmerText 3s ease-in-out infinite",
                },
              }}
            >
              TUVIBE
            </Typography>

            {/* Slogan */}
            <Typography
              variant="h5"
              sx={{
                position: "relative",
                zIndex: 3,
                fontWeight: 400,
                fontSize: {
                  xs: "1rem",
                  sm: "1.2rem",
                  md: "1.4rem",
                  lg: "1.6rem",
                  xl: "1.8rem",
                },
                textAlign: "center",
                letterSpacing: {
                  xs: "3px",
                  sm: "4px",
                  md: "5px",
                  lg: "6px",
                },
                fontFamily:
                  '"Manrope", "Poppins", "Montserrat", "Inter", sans-serif',
                color: "rgba(0, 0, 0, 0.85)",
                textShadow:
                  "0 3px 15px rgba(255, 255, 255, 0.6), 0 2px 8px rgba(0, 0, 0, 0.2), 0 0 20px rgba(255, 215, 0, 0.15)",
                lineHeight: { xs: 1.8, sm: 1.9, md: 2 },
                fontStyle: "normal",
                textTransform: "uppercase",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                animation: "fadeInUp 1.2s ease-out 0.6s both",
                "&:hover": {
                  color: "rgba(0, 0, 0, 0.95)",
                  letterSpacing: {
                    xs: "3.5px",
                    sm: "4.5px",
                    md: "5.5px",
                    lg: "6.5px",
                  },
                  textShadow:
                    "0 3px 20px rgba(255, 255, 255, 0.8), 0 2px 12px rgba(0, 0, 0, 0.25), 0 0 25px rgba(255, 215, 0, 0.2)",
                  transform: "scale(1.02)",
                },
              }}
            >
              CONNECT. DISCOVER. VIBE.
            </Typography>

            {/* Buttons Stacked Vertically */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 1.5, md: 2 },
                alignItems: "center",
                width: "100%",
                maxWidth: { xs: "280px", sm: "320px", md: "380px" },
                mt: { xs: 1.5, sm: 2, md: 2.5 },
                animation: "fadeInUp 1s ease-out 0.9s both",
              }}
            >
              <Button
                variant="contained"
                startIcon={
                  <PersonAdd
                    sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}
                  />
                }
                onClick={handleRegister}
                fullWidth
                sx={{
                  position: "relative",
                  zIndex: 3,
                  color: "rgba(0, 0, 0, 0.9)",
                  fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.15rem" },
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  px: { xs: 2.5, md: 3.5 },
                  py: { xs: 1.5, md: 1.75 },
                  borderRadius: "16px",
                  textTransform: "none",
                  // Enhanced gradient with metallic finish
                  background:
                    "linear-gradient(135deg, #f7c948 0%, #e6b800 25%, #d4af37 50%, #b8941f 75%, #8b6914 100%)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: `
                    0 10px 40px rgba(212, 175, 55, 0.4),
                    0 0 0 1px rgba(255, 255, 255, 0.1) inset,
                    0 2px 0 rgba(255, 255, 255, 0.5) inset,
                    0 -2px 10px rgba(0, 0, 0, 0.3) inset
                  `,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background:
                      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)",
                    transition: "left 0.6s ease",
                  },
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #ffd700 0%, #f7c948 25%, #e6b800 50%, #d4af37 75%, #b8941f 100%)",
                    transform: "translateY(-2px) scale(1.02)",
                    boxShadow: `
                      0 0 30px rgba(255, 215, 0, 0.6),
                      0 15px 50px rgba(212, 175, 55, 0.5),
                      0 0 0 1px rgba(255, 255, 255, 0.2) inset,
                      0 3px 0 rgba(255, 255, 255, 0.6) inset,
                      0 -2px 15px rgba(0, 0, 0, 0.3) inset
                    `,
                    "&::before": {
                      left: "100%",
                    },
                  },
                  "&:active": {
                    transform: "translateY(0) scale(1)",
                    boxShadow: `
                      0 0 20px rgba(255, 215, 0, 0.5),
                      0 8px 30px rgba(212, 175, 55, 0.4),
                      0 0 0 1px rgba(255, 255, 255, 0.1) inset,
                      0 1px 0 rgba(255, 255, 255, 0.4) inset
                    `,
                  },
                  "& .MuiButton-startIcon": {
                    marginRight: { xs: "8px", md: "10px" },
                    marginLeft: 0,
                  },
                }}
              >
                Sign Up
              </Button>
              <Button
                variant="outlined"
                startIcon={
                  <Login sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }} />
                }
                onClick={handleLogin}
                fullWidth
                sx={{
                  position: "relative",
                  zIndex: 3,
                  color: "rgba(0, 0, 0, 0.9)",
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  borderWidth: "2px",
                  fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.15rem" },
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  px: { xs: 2.5, md: 3.5 },
                  py: { xs: 1.5, md: 1.75 },
                  borderRadius: "16px",
                  textTransform: "none",
                  // Enhanced glassmorphism with subtle glow
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                  boxShadow: `
                    0 10px 40px rgba(0, 0, 0, 0.15),
                    0 0 0 1px rgba(255, 255, 255, 0.3) inset,
                    0 2px 0 rgba(255, 255, 255, 0.6) inset,
                    0 -1px 8px rgba(0, 0, 0, 0.1) inset,
                    0 0 20px rgba(255, 215, 0, 0.1)
                  `,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background:
                      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)",
                    transition: "left 0.6s ease",
                  },
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.45)",
                    borderColor: "rgba(255, 255, 255, 0.8)",
                    borderWidth: "2px",
                    transform: "translateY(-2px) scale(1.02)",
                    boxShadow: `
                      0 0 30px rgba(255, 215, 0, 0.4),
                      0 15px 50px rgba(0, 0, 0, 0.2),
                      0 0 0 1px rgba(255, 255, 255, 0.4) inset,
                      0 3px 0 rgba(255, 255, 255, 0.7) inset,
                      0 -1px 12px rgba(0, 0, 0, 0.15) inset,
                      0 0 30px rgba(255, 215, 0, 0.2)
                    `,
                    "&::before": {
                      left: "100%",
                    },
                  },
                  "&:active": {
                    transform: "translateY(0) scale(1)",
                    boxShadow: `
                      0 0 20px rgba(255, 215, 0, 0.3),
                      0 8px 30px rgba(0, 0, 0, 0.15),
                      0 0 0 1px rgba(255, 255, 255, 0.3) inset,
                      0 1px 0 rgba(255, 255, 255, 0.5) inset
                    `,
                  },
                  "& .MuiButton-startIcon": {
                    marginRight: { xs: "8px", md: "10px" },
                    marginLeft: 0,
                  },
                }}
              >
                Sign In
              </Button>
            </Box>
          </Box>
        </Fade>
      </Box>

      {/* Centered Card - Same line as chatbot */}
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 999,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateX(-50%) translateY(-4px)",
          },
        }}
      >
        <Card
          sx={{
            position: "relative",
            borderRadius: "16px",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            backgroundColor: "rgba(255, 255, 255, 0.25)",
            border: "2px solid rgba(255, 255, 255, 0.5)",
            boxShadow: `
              0 10px 40px rgba(0, 0, 0, 0.15),
              0 0 0 1px rgba(255, 255, 255, 0.3) inset,
              0 2px 0 rgba(255, 255, 255, 0.6) inset,
              0 -1px 8px rgba(0, 0, 0, 0.1) inset,
              0 0 20px rgba(255, 215, 0, 0.1)
            `,
            minWidth: { xs: "240px", sm: "280px", md: "320px" },
            maxWidth: { xs: "280px", sm: "320px", md: "360px" },
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)",
              transition: "left 0.6s ease",
              zIndex: 0,
            },
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.45)",
              borderColor: "rgba(255, 255, 255, 0.8)",
              boxShadow: `
                0 0 30px rgba(255, 215, 0, 0.4),
                0 15px 50px rgba(0, 0, 0, 0.2),
                0 0 0 1px rgba(255, 255, 255, 0.4) inset,
                0 3px 0 rgba(255, 255, 255, 0.7) inset,
                0 -1px 12px rgba(0, 0, 0, 0.15) inset,
                0 0 30px rgba(255, 215, 0, 0.2)
              `,
              "&::before": {
                left: "100%",
              },
            },
          }}
        >
          <CardContent
            sx={{
              position: "relative",
              zIndex: 1,
              p: { xs: 1.5, sm: 2.5 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: { xs: 0.25, sm: 0.5 },
              "&:last-child": {
                pb: { xs: 1.5, sm: 2.5 },
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.875rem" },
                color: "rgba(0, 0, 0, 0.7)",
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              Developed by
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "0.75rem", sm: "0.95rem", md: "1.1rem" },
                color: "rgba(0, 0, 0, 0.9)",
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              Carlvyne Technologies Ltd
            </Typography>
          </CardContent>
        </Card>
      </Box>

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
          Create Account{" "}
          {registerStep === 1 ? "(Step 1 of 2)" : "(Step 2 of 2)"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent
            sx={{
              px: { xs: 3, sm: 4 },
              py: { xs: 2, sm: 2.5 },
              overflow: "auto",
              minHeight: "400px",
            }}
          >
            {registerStep === 1 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                      "&.Mui-focused": {
                        color: "#D4AF37",
                      },
                    },
                  }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  py: 2,
                }}
              >
                <TextField
                  label="Bio"
                  name="bio"
                  multiline
                  rows={4}
                  value={formData.bio}
                  onChange={handleInputChange("bio")}
                  fullWidth
                  placeholder="Tell us about yourself..."
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
                      "&.Mui-focused": {
                        color: "#D4AF37",
                      },
                    },
                  }}
                />
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="register-photo-upload"
                  type="file"
                  onChange={handlePhotoChange}
                />
                <label htmlFor="register-photo-upload">
                  <IconButton
                    color="primary"
                    component="span"
                    sx={{
                      width: 150,
                      height: 150,
                      border: "2px dashed rgba(212, 175, 55, 0.5)",
                      borderRadius: "12px",
                      "&:hover": {
                        borderColor: "#D4AF37",
                        backgroundColor: "rgba(212, 175, 55, 0.1)",
                      },
                    }}
                  >
                    {photoPreview ? (
                      <Avatar
                        src={photoPreview}
                        sx={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "12px",
                        }}
                      />
                    ) : (
                      <PhotoCamera sx={{ fontSize: 60, color: "#D4AF37" }} />
                    )}
                  </IconButton>
                </label>
                <Typography
                  variant="body1"
                  sx={{
                    color: "rgba(26, 26, 26, 0.7)",
                    textAlign: "center",
                    fontWeight: 500,
                  }}
                >
                  {photoPreview
                    ? "Click to change photo"
                    : "Upload Profile Photo (Optional)"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(26, 26, 26, 0.5)",
                    textAlign: "center",
                  }}
                >
                  You can skip photo and bio and add them later
                </Typography>
              </Box>
            )}
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
            {registerStep === 1 ? (
              <>
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
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Validate required fields
                    if (
                      !formData.name ||
                      !formData.phone ||
                      !formData.email ||
                      !formData.password
                    ) {
                      Swal.fire({
                        icon: "error",
                        title: "Missing Fields",
                        text: "Please fill in all required fields.",
                        confirmButtonColor: "#D4AF37",
                        zIndex: 2000,
                        didOpen: () => {
                          const swalContainer =
                            document.querySelector(".swal2-container");
                          const swalPopup =
                            document.querySelector(".swal2-popup");
                          if (swalContainer) {
                            swalContainer.style.zIndex = "2000";
                          }
                          if (swalPopup) {
                            swalPopup.style.zIndex = "2001";
                          }
                        },
                      });
                      return;
                    }
                    setRegisterStep(2);
                  }}
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
                  Next
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setRegisterStep(1)}
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
                  Back
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
              </>
            )}
          </DialogActions>
        </form>
      </Dialog>

      {/* Login Dialog */}
      <Dialog
        open={loginDialogOpen}
        onClose={handleLoginClose}
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "24px",
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 248, 220, 0.95) 100%)",
            backdropFilter: "blur(30px)",
            boxShadow:
              "0 25px 80px rgba(212, 175, 55, 0.25), 0 0 0 1px rgba(212, 175, 55, 0.1)",
            maxHeight: "95vh",
            width: { xs: "90%", sm: "500px" },
            margin: "auto",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #D4AF37, #B8941F, #D4AF37)",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s ease-in-out infinite",
            },
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(184, 148, 31, 0.05))",
            filter: "blur(40px)",
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(245, 230, 211, 0.3), rgba(212, 175, 55, 0.1))",
            filter: "blur(30px)",
            zIndex: 0,
          }}
        />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <DialogTitle
            sx={{
              pt: { xs: 4, sm: 5 },
              pb: 1,
              px: { xs: 3, sm: 4 },
              textAlign: "center",
              position: "relative",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                mb: 1.5,
              }}
            >
              <AutoAwesome
                sx={{
                  fontSize: { xs: 28, sm: 32 },
                  background: "linear-gradient(45deg, #D4AF37, #B8941F)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  background: "linear-gradient(45deg, #D4AF37, #B8941F)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 700,
                  fontSize: { xs: "1.75rem", sm: "2rem" },
                  letterSpacing: "0.5px",
                }}
              >
                Welcome Back
              </Typography>
              <AutoAwesome
                sx={{
                  fontSize: { xs: 28, sm: 32 },
                  background: "linear-gradient(45deg, #D4AF37, #B8941F)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "pulse 2s ease-in-out infinite",
                  animationDelay: "1s",
                }}
              />
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                fontWeight: 400,
                mt: 0.5,
              }}
            >
              Sign in to continue your TuVibe journey
            </Typography>
          </DialogTitle>

          <form onSubmit={handleLoginSubmit}>
            <DialogContent
              sx={{
                px: { xs: 3, sm: 4 },
                py: { xs: 2.5, sm: 3 },
                position: "relative",
                zIndex: 1,
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <TextField
                    required
                    label="Email Address"
                    type="email"
                    value={loginFormData.email}
                    onChange={handleLoginInputChange("email")}
                    fullWidth
                    variant="outlined"
                    placeholder="Enter your email"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email
                            sx={{
                              color: "#D4AF37",
                              fontSize: { xs: 20, sm: 22 },
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "16px",
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        transition: "all 0.3s ease",
                        "& fieldset": {
                          borderColor: "rgba(212, 175, 55, 0.25)",
                          borderWidth: "1.5px",
                        },
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          "& fieldset": {
                            borderColor: "rgba(212, 175, 55, 0.5)",
                          },
                        },
                        "&.Mui-focused": {
                          backgroundColor: "rgba(255, 255, 255, 1)",
                          "& fieldset": {
                            borderColor: "#D4AF37",
                            borderWidth: "2px",
                          },
                        },
                      },
                      "& .MuiInputBase-input": {
                        py: { xs: 1.75, sm: 2 },
                        fontSize: { xs: "0.9375rem", sm: "1rem" },
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: { xs: "0.9375rem", sm: "1rem" },
                        "&.Mui-focused": {
                          color: "#D4AF37",
                          fontWeight: 500,
                        },
                      },
                    }}
                  />
                </Box>

                <Box>
                  <TextField
                    required
                    label="Password"
                    type={showLoginPassword ? "text" : "password"}
                    value={loginFormData.password}
                    onChange={handleLoginInputChange("password")}
                    fullWidth
                    variant="outlined"
                    placeholder="Enter your password"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock
                            sx={{
                              color: "#D4AF37",
                              fontSize: { xs: 20, sm: 22 },
                            }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowLoginPassword(!showLoginPassword)
                            }
                            edge="end"
                            sx={{
                              color: "#D4AF37",
                              "&:hover": {
                                backgroundColor: "rgba(212, 175, 55, 0.1)",
                              },
                            }}
                          >
                            {showLoginPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "16px",
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        transition: "all 0.3s ease",
                        "& fieldset": {
                          borderColor: "rgba(212, 175, 55, 0.25)",
                          borderWidth: "1.5px",
                        },
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          "& fieldset": {
                            borderColor: "rgba(212, 175, 55, 0.5)",
                          },
                        },
                        "&.Mui-focused": {
                          backgroundColor: "rgba(255, 255, 255, 1)",
                          "& fieldset": {
                            borderColor: "#D4AF37",
                            borderWidth: "2px",
                          },
                        },
                      },
                      "& .MuiInputBase-input": {
                        py: { xs: 1.75, sm: 2 },
                        fontSize: { xs: "0.9375rem", sm: "1rem" },
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: { xs: "0.9375rem", sm: "1rem" },
                        "&.Mui-focused": {
                          color: "#D4AF37",
                          fontWeight: 500,
                        },
                      },
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mt: 1,
                    }}
                  >
                    <Typography
                      component="button"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        Swal.fire({
                          icon: "info",
                          title: "Forgot Password",
                          text: "Password reset feature coming soon!",
                          confirmButtonColor: "#D4AF37",
                        });
                      }}
                      sx={{
                        fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                        color: "#D4AF37",
                        fontWeight: 500,
                        cursor: "pointer",
                        background: "none",
                        border: "none",
                        textDecoration: "none",
                        "&:hover": {
                          color: "#B8941F",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Forgot Password?
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </DialogContent>

            <DialogActions
              sx={{
                px: { xs: 3, sm: 4 },
                pb: { xs: 3, sm: 4 },
                pt: 1,
                flexDirection: "column",
                gap: 2,
                position: "relative",
                zIndex: 1,
              }}
            >
              <Button
                type="submit"
                variant="contained"
                fullWidth
                endIcon={<ArrowForward />}
                sx={{
                  borderRadius: "16px",
                  py: { xs: 1.5, sm: 1.75 },
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: { xs: "1rem", sm: "1.0625rem" },
                  background: "linear-gradient(45deg, #D4AF37, #B8941F)",
                  boxShadow: "0 4px 15px rgba(212, 175, 55, 0.3)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(45deg, #B8941F, #D4AF37)",
                    boxShadow: "0 8px 25px rgba(212, 175, 55, 0.4)",
                    transform: "translateY(-2px)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                }}
              >
                Sign In
              </Button>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  width: "100%",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    color: "text.secondary",
                  }}
                >
                  Don't have an account?
                </Typography>
                <Typography
                  component="button"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLoginClose();
                    setTimeout(() => {
                      handleRegister();
                    }, 300);
                  }}
                  sx={{
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    color: "#D4AF37",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    "&:hover": {
                      color: "#B8941F",
                      textDecoration: "underline",
                    },
                  }}
                >
                  Register Now
                  <PersonAdd sx={{ fontSize: 18 }} />
                </Typography>
              </Box>

              <Button
                onClick={handleLoginClose}
                variant="text"
                sx={{
                  textTransform: "none",
                  color: "text.secondary",
                  fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                  "&:hover": {
                    backgroundColor: "rgba(212, 175, 55, 0.05)",
                  },
                }}
              >
                Cancel
              </Button>
            </DialogActions>
          </form>

          <style>
            {`
              @keyframes shimmer {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              
              @keyframes pulse {
                0%, 100% { 
                  opacity: 1;
                  transform: scale(1);
                }
                50% { 
                  opacity: 0.7;
                  transform: scale(1.1);
                }
              }
            `}
          </style>
        </Box>
      </Dialog>

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
          
          @keyframes particleMove {
            0% {
              background-position: 0% 0%, 0% 0%;
            }
            100% {
              background-position: 100% 100%, 100% 100%;
            }
          }
          
          @keyframes bokehFloat {
            0%, 100% {
              background-position: 0% 0%;
            }
            50% {
              background-position: 100% 100%;
            }
          }
          
          @keyframes pulseGlow {
            0%, 100% {
              opacity: 0.6;
              transform: translate(-50%, -50%) scale(1);
            }
            50% {
              opacity: 0.8;
              transform: translate(-50%, -50%) scale(1.1);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes shimmerText {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          
          @keyframes floatUpDown {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
              opacity: 0.7;
            }
            25% {
              transform: translateY(-20px) rotate(5deg);
              opacity: 0.8;
            }
            50% {
              transform: translateY(-40px) rotate(0deg);
              opacity: 0.9;
            }
            75% {
              transform: translateY(-20px) rotate(-5deg);
              opacity: 0.8;
            }
          }
        `}
      </style>
    </Box>
  );
}
