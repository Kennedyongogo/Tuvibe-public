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
  DialogContentText,
  Divider,
  Slide,
  CircularProgress,
  Stack,
  Checkbox,
  FormControlLabel,
  Alert,
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
  Security,
  Explore,
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  evaluateBirthYearInput,
  MIN_PUBLIC_USER_AGE,
} from "../../utils/ageValidation";
import { evaluatePhoneInput } from "../../utils/phoneValidation";
import coupleImage from "../../assets/images/public/couple-5338310_1280.jpg";

const SlideUpTransition = React.forwardRef(
  function SlideUpTransition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  }
);

export default function HeroSection() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [registerStep, setRegisterStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phone: "",
    email: "",
    password: "",
    gender: "",
    birthYear: "",
    bio: "",
    category: "Regular",
  });
  const [phoneError, setPhoneError] = useState("");
  const [birthYearError, setBirthYearError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [loginFormData, setLoginFormData] = useState({
    email: "",
    password: "",
  });
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame for better performance
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Check for register query parameter and open registration dialog
  useEffect(() => {
    const registerParam = searchParams.get("register");
    if (registerParam === "true") {
      // Remove the query parameter from URL
      setSearchParams({});
      // Open registration dialog
      setTermsChecked(false);
      setTermsDialogOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleLogin = () => {
    setResetDialogOpen(false);
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
    setTermsChecked(false);
    setTermsDialogOpen(true);
  };

  const handleRegisterClose = () => {
    setRegisterDialogOpen(false);
    setFormData({
      name: "",
      username: "",
      phone: "",
      email: "",
      password: "",
      gender: "",
      birthYear: "",
      bio: "",
      category: "Regular",
    });
    setPhoneError("");
    setBirthYearError("");
    setPhotoError("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setRegisterStep(1);
  };

  const handleTermsAgree = () => {
    setTermsDialogOpen(false);
    setRegisterDialogOpen(true);
    setTermsChecked(false);
  };

  const handleTermsDecline = () => {
    setTermsDialogOpen(false);
    setTermsChecked(false);
    handleRegisterClose();
    navigate("/");
  };

  const handleExplore = () => {
    navigate("/explore-pricing");
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
      setPhotoError("");
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    if (field === "birthYear") {
      const { error } = evaluateBirthYearInput(value);
      setBirthYearError(error);
    }
    if (field === "phone") {
      const { error } = evaluatePhoneInput(value);
      setPhoneError(error);
    }
    setFormData({ ...formData, [field]: value });
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
          const errorMessage =
            data.message ||
            (response.status === 403
              ? "We could not confirm your age. Please contact support to update your profile."
              : "Invalid email or password. Please try again.");
          Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: errorMessage,
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

    const { normalized: normalizedPhone, error: phoneValidationError } =
      evaluatePhoneInput(formData.phone);

    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      Swal.fire({
        icon: "error",
        title: "Invalid Phone Number",
        text: phoneValidationError,
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    const { normalized: normalizedBirthYear, error: birthYearValidationError } =
      evaluateBirthYearInput(formData.birthYear);

    if (birthYearValidationError) {
      setBirthYearError(birthYearValidationError);
      handleRegisterClose();
      setTimeout(() => {
        Swal.fire({
          icon: "error",
          title: "Age Verification Required",
          text: birthYearValidationError,
          confirmButtonColor: "#D4AF37",
        });
      }, 0);
      return;
    }

    const normalizedUsername = formData.username.trim();
    if (!normalizedUsername) {
      Swal.fire({
        icon: "error",
        title: "Username Required",
        text: "Please provide a username so other members can recognise you.",
        confirmButtonColor: "#D4AF37",
      });
      setRegisterStep(1);
      return;
    }

    const photoToUpload = photoFile;

    if (!photoToUpload) {
      setPhotoError("Profile photo is required to complete registration.");
      Swal.fire({
        icon: "info",
        title: "Profile Photo Needed",
        text: "Please upload a clear profile photo to complete your registration.",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    setPhotoError("");

    const submitData = {
      name: formData.name,
      username: normalizedUsername,
      phone: normalizedPhone,
      email: formData.email,
      password: formData.password,
    };
    if (formData.gender) submitData.gender = formData.gender;
    if (formData.category) submitData.category = formData.category;
    if (normalizedBirthYear !== null) {
      submitData.birth_year = normalizedBirthYear;
    }

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
        if (photoToUpload) {
          const formDataToSend = new FormData();
          // Add all form fields
          formDataToSend.append("name", formData.name);
          formDataToSend.append("username", normalizedUsername);
          formDataToSend.append("phone", normalizedPhone);
          formDataToSend.append("email", formData.email);
          formDataToSend.append("password", formData.password);
          if (formData.gender) formDataToSend.append("gender", formData.gender);
          if (formData.category)
            formDataToSend.append("category", formData.category);
          if (normalizedBirthYear !== null) {
            formDataToSend.append("birth_year", normalizedBirthYear);
          }
          if (formData.bio) formDataToSend.append("bio", formData.bio);
          // Add photo file
          formDataToSend.append("profile_image", photoToUpload);

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

  const closeResetDialog = () => {
    setResetDialogOpen(false);
    setResetEmail("");
    setResetLoading(false);
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();

    const emailValue = resetEmail.trim();
    if (!emailValue) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter the email you registered with.",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    setResetLoading(true);

    try {
      const response = await fetch("/api/public/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Email: emailValue }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error || data?.message || "Failed to send reset email."
        );
      }

      closeResetDialog();

      Swal.fire({
        icon: "success",
        title: "Email Sent",
        text: "We've sent a new password to your email. Please check your inbox.",
        confirmButtonColor: "#D4AF37",
      }).then(() => {
        setLoginDialogOpen(true);
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Reset Failed",
        text:
          error.message ||
          "We couldn't process your request. Please try again later.",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setResetLoading(false);
    }
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
        backgroundColor: "transparent",
      }}
    >
      {/* White Floating Card - Left Side */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: { xs: 0, md: "50%" },
          bottom: { xs: "50%", md: 0 },
          borderRadius: 0,
          backgroundImage: `url(${coupleImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: `
            0 20px 60px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.5) inset,
            0 8px 32px rgba(212, 175, 55, 0.3)
          `,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          color: "rgba(0, 0, 0, 0.9)",
          zIndex: 3,
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 4, sm: 5, md: 6 },
          pb: { xs: 3, sm: 4, md: 5 },
          boxSizing: "border-box",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: `
              0 25px 70px rgba(0, 0, 0, 0.25),
              0 0 0 1px rgba(255, 255, 255, 0.6) inset,
              0 10px 40px rgba(212, 175, 55, 0.4)
            `,
          },
        }}
      >
        <Fade in={isVisible} timeout={300}>
          <Box
            sx={{
              width: "100%",
              maxWidth: { xs: "100%", sm: "90%", md: "80%" },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: { xs: 2, sm: 2.5, md: 3 },
              animation: "slideInUp 0.6s ease-out",
              willChange: "transform, opacity",
            }}
          >
            {/* Spotlight Glow Behind Logo */}
            <Box
              sx={{
                position: "absolute",
                top: { xs: "15%", sm: "18%", md: "20%" },
                left: "50%",
                transform: "translateX(-50%)",
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
                fontWeight: 700,
                fontSize: {
                  xs: "0.75rem",
                  sm: "0.9rem",
                  md: "1.1rem",
                  lg: "1.3rem",
                  xl: "1.5rem",
                },
                textAlign: "center",
                whiteSpace: "nowrap",
                letterSpacing: {
                  xs: "2px",
                  sm: "3px",
                  md: "4px",
                  lg: "5px",
                },
                fontFamily:
                  '"Manrope", "Poppins", "Montserrat", "Inter", sans-serif',
                color: "#000000",
                textShadow:
                  "0 3px 15px rgba(255, 255, 255, 0.6), 0 2px 8px rgba(0, 0, 0, 0.2), 0 0 20px rgba(255, 215, 0, 0.15)",
                lineHeight: 1.2,
                fontStyle: "normal",
                textTransform: "uppercase",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                animation: "fadeInUp 1.2s ease-out 0.6s both",
                overflow: "hidden",
                textOverflow: "ellipsis",
                "&:hover": {
                  color: "#000000",
                  letterSpacing: {
                    xs: "2.5px",
                    sm: "3.5px",
                    md: "4.5px",
                    lg: "5.5px",
                  },
                  textShadow:
                    "0 3px 20px rgba(255, 255, 255, 0.8), 0 2px 12px rgba(0, 0, 0, 0.25), 0 0 25px rgba(255, 215, 0, 0.2)",
                  transform: "scale(1.02)",
                },
              }}
            >
              CONNECT. DISCOVER. VIBE.
            </Typography>
          </Box>
        </Fade>
      </Box>

      {/* Gold Floating Card - Right Side */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: "50%", md: 0 },
          left: { xs: 0, md: "50%" },
          right: 0,
          bottom: 0,
          borderRadius: 0,
          background:
            "linear-gradient(135deg, #f7c948 0%, #e6b800 25%, #d4af37 50%, #b8941f 75%, #8b6914 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: `
            0 20px 60px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.2) inset,
            0 8px 32px rgba(212, 175, 55, 0.5),
            0 0 40px rgba(255, 215, 0, 0.2)
          `,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "rgba(0, 0, 0, 0.9)",
          zIndex: 4,
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 3, sm: 4, md: 5 },
          boxSizing: "border-box",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: `
              0 25px 70px rgba(0, 0, 0, 0.35),
              0 0 0 1px rgba(255, 255, 255, 0.3) inset,
              0 10px 40px rgba(212, 175, 55, 0.6),
              0 0 50px rgba(255, 215, 0, 0.3)
            `,
          },
        }}
      >
        <Fade in={isVisible} timeout={300}>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: { xs: 2, sm: 2.5, md: 3 },
              animation: "fadeInUp 0.5s ease-out 0.2s both",
              willChange: "transform, opacity",
            }}
          >
            {/* Buttons Stacked Vertically */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 1, md: 1.25 },
                alignItems: "center",
                width: "100%",
                maxWidth: { xs: "220px", sm: "240px", md: "280px" },
                mt: { xs: 1.5, sm: 2, md: 2.5 },
                animation: "fadeInUp 1s ease-out 0.9s both",
              }}
            >
              <Button
                variant="contained"
                startIcon={
                  <PersonAdd
                    sx={{
                      fontSize: { xs: "0.9rem", md: "1rem" },
                      transition: "transform 0.3s ease",
                    }}
                  />
                }
                onClick={handleRegister}
                fullWidth
                sx={{
                  position: "relative",
                  zIndex: 3,
                  color: "rgba(0, 0, 0, 0.9)",
                  fontSize: { xs: "0.8rem", sm: "0.875rem", md: "0.95rem" },
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  px: { xs: 2, md: 2.5 },
                  py: { xs: 1.1, md: 1.25 },
                  borderRadius: "12px",
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
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 0,
                    height: 0,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
                    transform: "translate(-50%, -50%)",
                    transition: "width 0.6s ease, height 0.6s ease",
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
                    "&::after": {
                      width: "300px",
                      height: "300px",
                    },
                    "& .MuiButton-startIcon": {
                      transform: "rotate(360deg) scale(1.2)",
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
                    marginRight: { xs: "6px", md: "8px" },
                    marginLeft: 0,
                    transition: "transform 0.4s ease",
                  },
                }}
              >
                Sign Up
              </Button>
              <Button
                variant="contained"
                startIcon={
                  <Login
                    sx={{
                      fontSize: { xs: "0.9rem", md: "1rem" },
                      transition: "transform 0.3s ease",
                    }}
                  />
                }
                onClick={handleLogin}
                fullWidth
                sx={{
                  position: "relative",
                  zIndex: 3,
                  color: "rgba(0, 0, 0, 0.9)",
                  fontSize: { xs: "0.8rem", sm: "0.875rem", md: "0.95rem" },
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  px: { xs: 2, md: 2.5 },
                  py: { xs: 1.1, md: 1.25 },
                  borderRadius: "12px",
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
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 0,
                    height: 0,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
                    transform: "translate(-50%, -50%)",
                    transition: "width 0.6s ease, height 0.6s ease",
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
                    "&::after": {
                      width: "300px",
                      height: "300px",
                    },
                    "& .MuiButton-startIcon": {
                      transform: "rotate(360deg) scale(1.2)",
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
                    marginRight: { xs: "6px", md: "8px" },
                    marginLeft: 0,
                    transition: "transform 0.4s ease",
                  },
                }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                startIcon={
                  <Explore
                    sx={{
                      fontSize: { xs: "0.9rem", md: "1rem" },
                      transition: "transform 0.3s ease",
                    }}
                  />
                }
                onClick={handleExplore}
                fullWidth
                sx={{
                  position: "relative",
                  zIndex: 3,
                  color: "rgba(0, 0, 0, 0.9)",
                  fontSize: { xs: "0.8rem", sm: "0.875rem", md: "0.95rem" },
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  px: { xs: 2, md: 2.5 },
                  py: { xs: 1.1, md: 1.25 },
                  borderRadius: "12px",
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
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 0,
                    height: 0,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
                    transform: "translate(-50%, -50%)",
                    transition: "width 0.6s ease, height 0.6s ease",
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
                    "&::after": {
                      width: "300px",
                      height: "300px",
                    },
                    "& .MuiButton-startIcon": {
                      transform: "rotate(360deg) scale(1.2)",
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
                    marginRight: { xs: "6px", md: "8px" },
                    marginLeft: 0,
                    transition: "transform 0.4s ease",
                  },
                }}
              >
                Explore
              </Button>
            </Box>
          </Box>
        </Fade>
      </Box>

      {/* Centered Card - Halfway between white and gold on large screens, bottom of gold section on small screens */}
      <Box
        sx={{
          position: { xs: "absolute", md: "fixed" },
          bottom: { xs: 16, md: 24 },
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 999,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "block",
          "&:hover": {
            transform: "translateX(-50%) translateY(-4px)",
          },
        }}
      >
        <Card
          sx={{
            position: "relative",
            borderRadius: "12px",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            background:
              "linear-gradient(135deg, #f7c948 0%, #e6b800 25%, #d4af37 50%, #b8941f 75%, #8b6914 100%)",
            border: "2px solid rgba(212, 175, 55, 0.8)",
            boxShadow: `
              0 10px 40px rgba(212, 175, 55, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.2) inset,
              0 2px 0 rgba(255, 255, 255, 0.4) inset,
              0 -2px 10px rgba(0, 0, 0, 0.2) inset,
              0 0 20px rgba(255, 215, 0, 0.3)
            `,
            minWidth: { xs: "180px", sm: "200px", md: "220px" },
            maxWidth: { xs: "200px", sm: "220px", md: "240px" },
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
                "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
              transition: "left 0.6s ease",
              zIndex: 0,
            },
            "&:hover": {
              background:
                "linear-gradient(135deg, #ffd700 0%, #f7c948 25%, #e6b800 50%, #d4af37 75%, #b8941f 100%)",
              borderColor: "rgba(212, 175, 55, 1)",
              boxShadow: `
                0 0 30px rgba(255, 215, 0, 0.6),
                0 15px 50px rgba(212, 175, 55, 0.5),
                0 0 0 1px rgba(255, 255, 255, 0.3) inset,
                0 3px 0 rgba(255, 255, 255, 0.5) inset,
                0 -2px 15px rgba(0, 0, 0, 0.3) inset,
                0 0 30px rgba(255, 215, 0, 0.4)
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
              p: { xs: 1, sm: 1.25, md: 1.5 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: { xs: 0.2, sm: 0.3 },
              "&:last-child": {
                pb: { xs: 1, sm: 1.25, md: 1.5 },
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontSize: { xs: "0.6rem", sm: "0.65rem", md: "0.7rem" },
                color: "rgba(0, 0, 0, 0.85)",
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
                fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.85rem" },
                color: "rgba(0, 0, 0, 0.95)",
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
        open={termsDialogOpen}
        onClose={(_, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return;
          }
          handleTermsDecline();
        }}
        disableEscapeKeyDown
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            boxShadow: "0 30px 80px rgba(212, 175, 55, 0.25)",
            maxHeight: "95vh",
            margin: "auto",
            width: { xs: "92%", sm: "86%", md: "760px" },
            maxWidth: "760px",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: { xs: "1.3rem", sm: "1.6rem", md: "1.8rem" },
            textAlign: "center",
            background: "linear-gradient(45deg, #D4AF37, #B8941F)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            pt: { xs: 3, sm: 3.5 },
            pb: { xs: 1.5, sm: 2 },
          }}
        >
          TuVibe Terms & Conditions
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            px: { xs: 3, sm: 4 },
            py: { xs: 2, sm: 2.5 },
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          <Box
            sx={{
              maxHeight: { xs: "45vh", md: "50vh" },
              overflowY: "auto",
              pr: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              "& h6": {
                fontWeight: 700,
                mb: 1,
                fontSize: { xs: "1.05rem", sm: "1.15rem", md: "1.25rem" },
              },
              "& p": {
                color: "rgba(0,0,0,0.75)",
                fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
                lineHeight: 1.6,
                fontWeight: 600,
              },
              "& ul": {
                color: "rgba(0,0,0,0.75)",
                fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
                lineHeight: 1.7,
                paddingLeft: { xs: "1.25rem", sm: "1.5rem" },
                margin: 0,
                fontWeight: 600,
              },
              "& li": {
                marginBottom: 0.5,
                fontWeight: 600,
              },
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                1. Introduction
              </Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.75)" }}>
                Welcome to TuVibe ("the Platform") accessible at
                https://www.tuvibe.online. By creating an account, subscribing
                to a plan, or browsing our website, you confirm that you have
                read and agree to these Terms & Conditions ("Terms"). These
                Terms clarify our role, outline user responsibilities, and
                ensure safe and respectful interactions. If you do not agree,
                please discontinue using the Platform immediately.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                2. Eligibility
              </Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.75)", mb: 1 }}>
                TuVibe is intended strictly for adults aged 18 years and above.
                By signing up or accessing any feature, you represent that:
              </Typography>
              <Typography
                component="ul"
                sx={{ pl: 3, color: "rgba(0,0,0,0.75)" }}
              >
                <li>You are at least 18 years old.</li>
                <li>
                  You have the legal capacity to enter a binding agreement.
                </li>
                <li>All details you provide are truthful and current.</li>
              </Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.75)", mt: 1 }}>
                TuVibe does not knowingly allow minors to register. Any
                individual found to have misrepresented their age or identity
                assumes full responsibility for their actions. TuVibe shall not
                be held liable for any misrepresentation by users.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                3. Account Registration
              </Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.75)", mb: 1 }}>
                To use most TuVibe features, you must register an account. You
                agree to:
              </Typography>
              <Typography
                component="ul"
                sx={{ pl: 3, color: "rgba(0,0,0,0.75)" }}
              >
                <li>Provide accurate and verifiable details.</li>
                <li>Maintain one account per person.</li>
                <li>Keep your login credentials confidential.</li>
              </Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.75)", mt: 1 }}>
                You remain responsible for all actions carried out through your
                account. TuVibe may suspend, restrict, or close an account to
                protect the integrity of the Platform or to comply with legal
                obligations.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                4. Subscriptions &amp; Payments
              </Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.75)", mb: 1 }}>
                TuVibe operates a subscription-based model with Silver and Gold
                plans that provide access to features such as viewing profiles,
                contacting members, and unlocking premium content.
              </Typography>
              <Typography
                component="ul"
                sx={{ pl: 3, color: "rgba(0,0,0,0.75)" }}
              >
                <li>
                  Subscriptions can be purchased using supported payment
                  channels (e.g., M-PESA, debit/credit cards via Paystack).
                </li>
                <li>
                  Subscriptions are billed monthly and automatically renew
                  unless cancelled. You may cancel your subscription at any
                  time, and it will remain active until the end of the current
                  billing period.
                </li>
                <li>
                  Subscription fees are non-refundable except where required by
                  law or at TuVibe's discretion.
                </li>
                <li>
                  Pricing and subscription features may be updated at any time.
                  Existing subscribers will be notified of significant changes.
                </li>
                <li>
                  You may upgrade or downgrade your subscription plan at any
                  time. Upgrades take effect immediately with prorated billing.
                  Downgrades take effect at the end of your current billing
                  period.
                </li>
              </Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.75)", mt: 1 }}>
                Purchasing a subscription does not create a financial or
                investment relationship. Users are responsible for ensuring
                payments originate from their own accounts and for maintaining
                active subscriptions to access premium features.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                5. Communication via WhatsApp and External Platforms
              </Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.75)", mb: 1 }}>
                a) WhatsApp as the Sole Messaging Channel
              </Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.75)", mb: 1 }}>
                TuVibe does not host an internal messaging system. All
                user-to-user communication occurs externally through WhatsApp.
                By signing up or using TuVibe, you consent to being contacted by
                other registered users via WhatsApp, in accordance with your
                visibility and profile settings.
              </Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.75)", mb: 1 }}>
                b) User Responsibility for External Chats
              </Typography>
              <Typography
                component="ul"
                sx={{ pl: 3, color: "rgba(0,0,0,0.75)" }}
              >
                <li>
                  TuVibe has no control over communication or content shared
                  between users.
                </li>
                <li>
                  TuVibe does not monitor, store, or mediate WhatsApp exchanges.
                </li>
                <li>
                  TuVibe is not responsible or liable for any loss, harm, fraud,
                  harassment, or other outcome resulting from off-platform
                  communication.
                </li>
              </Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.75)", mb: 1 }}>
                c) Safety and Verification Expectations
              </Typography>
              <Typography
                component="ul"
                sx={{ pl: 3, color: "rgba(0,0,0,0.75)" }}
              >
                <li>
                  Verify the identity and intentions of anyone you interact
                  with.
                </li>
                <li>Avoid sharing financial or personal information.</li>
                <li>
                  Report harassment, fraud, or misconduct to
                  support@tuvibe.online.
                </li>
              </Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.75)", mb: 1 }}>
                d) Access to Contacted Profiles for Safety Purposes
              </Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.75)" }}>
                TuVibe maintains a record of profiles you have contacted for
                security and reporting reasons. You can view past connections
                and report any user who later harasses, threatens, or violates
                TuVibe’s safety standards. This feature is available on your
                dashboard and includes profiles you have previously unlocked.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                6. User Conduct
              </Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.75)", mb: 1 }}>
                By using TuVibe, you agree not to:
              </Typography>
              <Typography
                component="ul"
                sx={{ pl: 3, color: "rgba(0,0,0,0.75)" }}
              >
                <li>
                  Post unlawful, obscene, defamatory, or hateful material.
                </li>
                <li>
                  Impersonate another individual or create fake or misleading
                  profiles.
                </li>
                <li>Solicit minors or engage in any form of exploitation.</li>
                <li>Use TuVibe for spam, scams, or illegal activities.</li>
                <li>
                  Interfere with the platform’s technical operations or attempt
                  unauthorized access.
                </li>
              </Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.75)", mt: 1 }}>
                Violation of these terms may lead to permanent suspension,
                without refund or recourse.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                7. Verification &amp; Disclaimer
              </Typography>
              <Typography
                component="ul"
                sx={{ pl: 3, color: "rgba(0,0,0,0.75)" }}
              >
                <li>
                  TuVibe conducts basic verification only (e.g., email or phone
                  confirmation).
                </li>
                <li>
                  TuVibe cannot guarantee that profiles are genuine or accurate.
                </li>
                <li>
                  Users interact at their own discretion and must verify
                  authenticity.
                </li>
              </Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.75)", mt: 1 }}>
                TuVibe disclaims liability for outcomes arising from user
                interactions, including deception, misrepresentation, or
                personal loss.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                8. Reporting, Moderation &amp; Safety
              </Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.75)" }}>
                Users may report profiles that appear underage, suspicious, or
                abusive by emailing support@tuvibe.online or using the reporting
                options on the website. TuVibe reviews reports on a best-effort
                basis but cannot guarantee action or response timelines. The
                Platform relies on user feedback to maintain safety.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                9. Intellectual Property
              </Typography>
              <Typography
                component="ul"
                sx={{ pl: 3, color: "rgba(0,0,0,0.75)" }}
              >
                <li>
                  All text, graphics, software, and branding belong to TuVibe or
                  its licensors.
                </li>
                <li>
                  You may view and use materials for personal, non-commercial
                  purposes only.
                </li>
                <li>
                  You may not reproduce, distribute, or modify Platform content
                  without consent.
                </li>
                <li>
                  By uploading content, you grant TuVibe a limited right to
                  display it for functionality.
                </li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                10. Disclaimers
              </Typography>
              <Typography
                component="ul"
                sx={{ pl: 3, color: "rgba(0,0,0,0.75)" }}
              >
                <li>
                  The Platform is provided on an “as is” and “as available”
                  basis.
                </li>
                <li>
                  TuVibe makes no warranties regarding availability,
                  performance, or reliability.
                </li>
                <li>
                  TuVibe does not guarantee compatibility with all devices or
                  browsers.
                </li>
                <li>
                  TuVibe provides a digital meeting space only and is not
                  responsible for user actions.
                </li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                11. Limitation of Liability
              </Typography>
              <Typography
                component="ul"
                sx={{ pl: 3, color: "rgba(0,0,0,0.75)" }}
              >
                <li>
                  TuVibe is not liable for indirect, incidental, or
                  consequential loss.
                </li>
                <li>
                  TuVibe is not liable for damages from user-to-user
                  communication.
                </li>
                <li>
                  TuVibe is not liable for harm, emotional distress, or loss of
                  data.
                </li>
              </Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.75)", mt: 1 }}>
                Total liability shall not exceed the total amount you paid to
                TuVibe within the preceding twelve (12) months.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                12. Termination
              </Typography>
              <Typography
                component="ul"
                sx={{ pl: 3, color: "rgba(0,0,0,0.75)" }}
              >
                <li>
                  You may deactivate your account at any time via
                  support@tuvibe.online or the Delete Account option.
                </li>
                <li>
                  TuVibe may suspend or terminate your account for violations of
                  these Terms or applicable law.
                </li>
                <li>
                  Upon termination, active subscriptions will be cancelled and
                  access will end at the conclusion of the current billing
                  period. No refunds will be issued for the remaining
                  subscription period, except where required by law.
                </li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                13. Modifications
              </Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.75)" }}>
                TuVibe may revise these Terms from time to time. Updated Terms
                will be posted on the website with the effective date indicated.
                Continued use of the Platform constitutes acceptance of the
                updated Terms.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                14. Governing Law
              </Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.75)" }}>
                These Terms and all related matters are governed by the laws of
                Kenya, including the Companies Act (2015) and the Computer
                Misuse and Cybercrimes Act (2018).
              </Typography>
            </Box>
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={termsChecked}
                onChange={(event) => setTermsChecked(event.target.checked)}
                sx={{
                  color: "#D4AF37",
                  "&.Mui-checked": { color: "#D4AF37" },
                }}
              />
            }
            label={
              <Typography
                sx={{
                  color: "rgba(0,0,0,0.8)",
                  fontWeight: 500,
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  lineHeight: 1.5,
                }}
              >
                I have read and agree to the TuVibe Terms &amp; Conditions.
              </Typography>
            }
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 3, sm: 4 },
            py: { xs: 2.5, sm: 3 },
            gap: 2,
            justifyContent: "center",
          }}
        >
          <Button
            onClick={handleTermsDecline}
            variant="outlined"
            sx={{
              borderRadius: "14px",
              px: { xs: 3, sm: 4 },
              py: 1,
              fontWeight: 600,
              textTransform: "none",
              borderColor: "rgba(0,0,0,0.4)",
              color: "rgba(0,0,0,0.75)",
              "&:hover": {
                borderColor: "rgba(0,0,0,0.6)",
                backgroundColor: "rgba(0,0,0,0.05)",
              },
            }}
          >
            Decline
          </Button>
          <Button
            onClick={handleTermsAgree}
            variant="contained"
            disabled={!termsChecked}
            sx={{
              borderRadius: "14px",
              px: { xs: 3, sm: 4 },
              py: 1,
              fontWeight: 600,
              textTransform: "none",
              background: "linear-gradient(45deg, #D4AF37, #B8941F)",
              color: "rgba(0, 0, 0, 0.9)",
              boxShadow: "0 10px 30px rgba(212, 175, 55, 0.3)",
              "&:hover": {
                background: "linear-gradient(45deg, #B8941F, #D4AF37)",
                boxShadow: "0 12px 35px rgba(212, 175, 55, 0.35)",
                transform: "translateY(-1px)",
              },
              "&:disabled": {
                background: "rgba(0,0,0,0.1)",
                color: "rgba(0,0,0,0.4)",
                boxShadow: "none",
              },
            }}
          >
            Agree &amp; Continue
          </Button>
        </DialogActions>
      </Dialog>

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
            fontSize: { xs: "1.1rem", sm: "1.75rem" },
            letterSpacing: { xs: "0.2px", sm: "normal" },
            textAlign: "center",
            pb: 1,
            pt: { xs: 2, sm: 2.5 },
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            px: { xs: 1, sm: 0 },
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
                  label="Username"
                  value={formData.username}
                  onChange={handleInputChange("username")}
                  fullWidth
                  variant="outlined"
                  placeholder="Visible to other members"
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
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange("phone")}
                  fullWidth
                  variant="outlined"
                  placeholder="+254798123456"
                  error={Boolean(phoneError)}
                  helperText={
                    phoneError ||
                    "Use the full country code, e.g., +254798123456."
                  }
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
                  label="Year of Birth"
                  type="number"
                  value={formData.birthYear}
                  onChange={handleInputChange("birthYear")}
                  required
                  error={Boolean(birthYearError)}
                  helperText={birthYearError || " "}
                  fullWidth
                  variant="outlined"
                  inputProps={{
                    min: 1900,
                    max: new Date().getFullYear(),
                  }}
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
                  width: "100%",
                }}
              >
                <Alert
                  severity="info"
                  sx={{
                    width: "100%",
                    borderRadius: "12px",
                    background: "rgba(212, 175, 55, 0.12)",
                    color: "rgba(26, 26, 26, 0.9)",
                    border: "1px solid rgba(212, 175, 55, 0.35)",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  Step 2 of 2: Choose your category and upload your profile
                  photo to complete registration.
                </Alert>
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
                    <MenuItem value="Urban Chics">Urban Chics</MenuItem>
                  </Select>
                </FormControl>
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
                      border: `2px dashed ${
                        photoError ? "#d32f2f" : "rgba(212, 175, 55, 0.5)"
                      }`,
                      borderRadius: "12px",
                      backgroundColor: photoError
                        ? "rgba(211, 47, 47, 0.05)"
                        : "transparent",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: photoError ? "#d32f2f" : "#D4AF37",
                        backgroundColor: photoError
                          ? "rgba(211, 47, 47, 0.08)"
                          : "rgba(212, 175, 55, 0.1)",
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
                    : "Upload Profile Photo (Required)"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(26, 26, 26, 0.65)",
                    textAlign: "center",
                  }}
                >
                  A clear, recent photo helps real members connect faster.
                </Typography>
                {photoError && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#d32f2f",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    {photoError}
                  </Typography>
                )}
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
                      !formData.username.trim() ||
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
                    const { error: stepPhoneError } = evaluatePhoneInput(
                      formData.phone
                    );
                    if (stepPhoneError) {
                      setPhoneError(stepPhoneError);
                      Swal.fire({
                        icon: "error",
                        title: "Invalid Phone Number",
                        text: stepPhoneError,
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
                        handleLoginClose();
                        setResetDialogOpen(true);
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
          
        `}
      </style>

      <Dialog
        open={resetDialogOpen}
        onClose={closeResetDialog}
        fullWidth
        maxWidth="sm"
        TransitionComponent={SlideUpTransition}
        transitionDuration={400}
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(212, 175, 55, 0.2)",
            boxShadow: "0 20px 40px rgba(212, 175, 55, 0.15)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)",
            color: "#1a1a1a",
            fontWeight: 700,
            fontSize: { xs: "1.1rem", sm: "1.3rem" },
            letterSpacing: "0.5px",
            textAlign: "center",
            py: { xs: 2.5, sm: 3 },
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            justifyContent="center"
          >
            <Security sx={{ fontSize: { xs: 24, sm: 28 } }} />
            <Box component="span">Reset Password</Box>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent
          sx={{
            pt: { xs: 3, sm: 4 },
            pb: { xs: 2, sm: 3 },
            px: { xs: 3, sm: 4 },
          }}
        >
          <DialogContentText
            sx={{
              mb: { xs: 2.5, sm: 3 },
              fontSize: { xs: "0.95rem", sm: "1rem" },
              color: "rgba(0,0,0,0.7)",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            Enter the email you used to sign up. We'll send you a fresh password
            so you can get back in.
          </DialogContentText>
          <Box
            component="form"
            onSubmit={handleResetSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            <TextField
              value={resetEmail}
              onChange={(event) => setResetEmail(event.target.value)}
              type="email"
              label="Email Address"
              fullWidth
              placeholder="you@example.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "rgba(0,0,0,0.6)" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(212, 175, 55, 0.5)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#D4AF37",
                    borderWidth: 2,
                  },
                },
                "& .MuiInputLabel-root": {
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  "&.Mui-focused": {
                    color: "#D4AF37",
                  },
                },
                "& .MuiInputBase-input": {
                  py: { xs: 1.5, sm: 1.75 },
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                },
              }}
            />
            <DialogActions
              sx={{
                mt: 1,
                gap: 2,
                px: 0,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Button
                onClick={closeResetDialog}
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: "rgba(0,0,0,0.3)",
                  color: "rgba(0,0,0,0.7)",
                  borderRadius: 3,
                  px: { xs: 2.5, sm: 3 },
                  py: 1,
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "rgba(0,0,0,0.5)",
                    backgroundColor: "rgba(0,0,0,0.05)",
                  },
                }}
                disabled={resetLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                startIcon={
                  resetLoading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <Security />
                  )
                }
                sx={{
                  background:
                    "linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)",
                  borderRadius: 3,
                  px: { xs: 2.5, sm: 3 },
                  py: 1,
                  fontWeight: 600,
                  textTransform: "none",
                  color: "#1a1a1a",
                  boxShadow: "0 4px 12px rgba(212, 175, 55, 0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #b8941f 0%, #d4af37 100%)",
                    boxShadow: "0 6px 16px rgba(212, 175, 55, 0.4)",
                    transform: "translateY(-1px)",
                  },
                }}
                disabled={resetLoading}
              >
                {resetLoading ? "Sending..." : "Send Reset Password"}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
