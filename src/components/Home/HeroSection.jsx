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
        // Main gradient overlay with 3 golden shades
        background: `
          linear-gradient(135deg, #f7c948 0%, #e6b800 30%, #d4af37 60%, #b88900 100%),
          radial-gradient(circle at 20% 50%, rgba(247, 201, 72, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(184, 137, 0, 0.4) 0%, transparent 50%),
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
                  xs: "2.7rem",
                  sm: "3.3rem",
                  md: "4.2rem",
                  lg: "4.8rem",
                  xl: "5.5rem",
                },
                textAlign: "center",
                letterSpacing: {
                  xs: "2px",
                  sm: "3px",
                  md: "4px",
                  lg: "5px",
                },
                fontFamily:
                  '"Montserrat", "Poppins", "Manrope", "Inter", sans-serif',
                // Gold → dark bronze gradient
                background: `linear-gradient(135deg, 
                  #FFD700 0%,
                  #f7c948 15%,
                  #d4af37 35%,
                  #b88900 55%,
                  #8B6914 75%,
                  #654321 90%,
                  #3d2817 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow:
                  "0 4px 20px rgba(255, 215, 0, 0.3), 0 2px 10px rgba(139, 105, 20, 0.2), 0 0 30px rgba(212, 175, 55, 0.4)",
                lineHeight: { xs: 1.1, sm: 1.05, md: 1 },
                textTransform: "uppercase",
                filter: "drop-shadow(0 0 15px rgba(255, 215, 0, 0.5))",
                WebkitTextStroke: "0.5px rgba(255, 215, 0, 0.3)",
                transition: "all 0.3s ease",
                animation: "fadeInUp 1s ease-out 0.3s both",
                "&:hover": {
                  transform: "scale(1.02)",
                  filter: "drop-shadow(0 0 20px rgba(255, 215, 0, 0.7))",
                },
              }}
            >
              Tuvibe
            </Typography>

            {/* Slogan */}
            <Typography
              variant="h5"
              sx={{
                position: "relative",
                zIndex: 3,
                fontWeight: 300,
                fontSize: {
                  xs: "0.9rem",
                  sm: "1.1rem",
                  md: "1.3rem",
                  lg: "1.5rem",
                  xl: "1.7rem",
                },
                textAlign: "center",
                letterSpacing: {
                  xs: "2px",
                  sm: "3px",
                  md: "4px",
                  lg: "5px",
                },
                fontFamily:
                  '"Manrope", "Poppins", "Montserrat", "Inter", sans-serif',
                color: "rgba(0, 0, 0, 0.75)",
                textShadow:
                  "0 2px 10px rgba(255, 255, 255, 0.5), 0 1px 5px rgba(0, 0, 0, 0.15)",
                lineHeight: { xs: 1.6, sm: 1.7, md: 1.8 },
                fontStyle: "normal",
                textTransform: "uppercase",
                transition: "all 0.3s ease",
                animation: "fadeInUp 1s ease-out 0.6s both",
                "&:hover": {
                  color: "rgba(0, 0, 0, 0.9)",
                  letterSpacing: {
                    xs: "2.5px",
                    sm: "3.5px",
                    md: "4.5px",
                    lg: "5.5px",
                  },
                  textShadow:
                    "0 2px 15px rgba(255, 255, 255, 0.7), 0 1px 8px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              Connect. Discover. Vibe.
            </Typography>

            {/* Buttons Stacked Vertically */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 1.5, md: 2 },
                alignItems: "center",
                width: "100%",
                maxWidth: { xs: "280px", sm: "320px", md: "360px" },
                mt: { xs: 1, sm: 1.5 },
                animation: "fadeInUp 1s ease-out 0.9s both",
              }}
            >
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={handleRegister}
                fullWidth
                sx={{
                  position: "relative",
                  zIndex: 3,
                  color: "white",
                  fontSize: { xs: "0.875rem", sm: "1rem", md: "1.125rem" },
                  fontWeight: 600,
                  px: { xs: 2, md: 3 },
                  py: { xs: 1.25, md: 1.5 },
                  borderRadius: "25px",
                  textTransform: "none",
                  // Glassmorphism with gradient
                  background:
                    "linear-gradient(135deg, rgba(212, 175, 55, 0.9) 0%, rgba(184, 148, 31, 0.9) 100%)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: `
                    0 8px 32px rgba(212, 175, 55, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                  `,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, rgba(247, 201, 72, 0.95) 0%, rgba(212, 175, 55, 0.95) 100%)",
                    transform: "scale(1.05)",
                    boxShadow: `
                      0 0 20px rgba(255, 215, 0, 0.5),
                      0 12px 40px rgba(212, 175, 55, 0.6),
                      inset 0 1px 0 rgba(255, 255, 255, 0.4),
                      inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                    `,
                  },
                  "&:active": {
                    transform: "scale(1.02)",
                    boxShadow: `
                      0 0 15px rgba(255, 215, 0, 0.4),
                      0 4px 20px rgba(212, 175, 55, 0.4),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2)
                    `,
                  },
                }}
              >
                Sign Up
              </Button>
              <Button
                variant="outlined"
                startIcon={<Login />}
                onClick={handleLogin}
                fullWidth
                sx={{
                  position: "relative",
                  zIndex: 3,
                  color: "rgba(0, 0, 0, 0.9)",
                  borderColor: "rgba(255, 255, 255, 0.4)",
                  borderWidth: "2px",
                  fontSize: { xs: "0.875rem", sm: "1rem", md: "1.125rem" },
                  fontWeight: 600,
                  px: { xs: 2, md: 3 },
                  py: { xs: 1.25, md: 1.5 },
                  borderRadius: "25px",
                  textTransform: "none",
                  // Glassmorphism style
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.4),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                  `,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.4)",
                    borderColor: "rgba(255, 255, 255, 0.7)",
                    borderWidth: "2px",
                    transform: "scale(1.05)",
                    boxShadow: `
                      0 0 20px rgba(255, 215, 0, 0.4),
                      0 12px 40px rgba(0, 0, 0, 0.2),
                      inset 0 1px 0 rgba(255, 255, 255, 0.6),
                      inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                    `,
                  },
                  "&:active": {
                    transform: "scale(1.02)",
                    boxShadow: `
                      0 0 15px rgba(255, 215, 0, 0.3),
                      0 4px 20px rgba(0, 0, 0, 0.15),
                      inset 0 1px 0 rgba(255, 255, 255, 0.4)
                    `,
                  },
                }}
              >
                Sign In
              </Button>
            </Box>
          </Box>
        </Fade>
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
        `}
      </style>
    </Box>
  );
}
