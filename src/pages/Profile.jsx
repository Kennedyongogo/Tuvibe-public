import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  Avatar,
  TextField,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Edit,
  Save,
  Cancel,
  Email,
  Phone,
  LocationOn,
  Person,
  Cake,
  Description,
  Verified,
  Star,
  PhotoCamera,
  MyLocation,
} from "@mui/icons-material";
import Swal from "sweetalert2";

export default function Profile({ user, setUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    gender: user?.gender || "",
    age: user?.age?.toString() || "",
    city: user?.city || "",
    category: user?.category || "Regular",
    phone: user?.phone || "",
    email: user?.email || "",
    bio: user?.bio || "",
    photo: user?.photo || "",
    latitude: user?.latitude?.toString() || "",
    longitude: user?.longitude?.toString() || "",
  });

  // Update formData when user changes
  useEffect(() => {
    setFormData({
      name: user?.name || "",
      gender: user?.gender || "",
      age: user?.age?.toString() || "",
      city: user?.city || "",
      category: user?.category || "Regular",
      phone: user?.phone || "",
      email: user?.email || "",
      bio: user?.bio || "",
      photo: user?.photo || "",
      latitude: user?.latitude?.toString() || "",
      longitude: user?.longitude?.toString() || "",
    });
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      gender: user?.gender || "",
      age: user?.age?.toString() || "",
      city: user?.city || "",
      category: user?.category || "Regular",
      phone: user?.phone || "",
      email: user?.email || "",
      bio: user?.bio || "",
      photo: user?.photo || "",
      latitude: user?.latitude?.toString() || "",
      longitude: user?.longitude?.toString() || "",
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "Please select an image smaller than 10MB.",
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

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: "error",
        title: "Location Not Supported",
        text: "Geolocation is not supported by your browser.",
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
        },
      });
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(8),
          longitude: position.coords.longitude.toFixed(8),
        }));
        setLocationLoading(false);
        Swal.fire({
          icon: "success",
          title: "Location Retrieved!",
          text: "Your current location has been set.",
          timer: 2000,
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
          },
        });
      },
      (error) => {
        setLocationLoading(false);
        Swal.fire({
          icon: "error",
          title: "Location Error",
          text:
            error.code === 1
              ? "Location access denied. Please enable location permissions or enter manually."
              : "Failed to get your location. Please try again or enter manually.",
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
          },
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      let response;

      // If photo file is selected, use FormData for multipart upload
      if (photoFile) {
        const formDataToSend = new FormData();

        // Add all form fields
        formDataToSend.append("name", formData.name);
        if (formData.gender) formDataToSend.append("gender", formData.gender);
        if (formData.age) formDataToSend.append("age", parseInt(formData.age));
        if (formData.city) formDataToSend.append("city", formData.city);
        formDataToSend.append("category", formData.category);
        if (formData.bio) formDataToSend.append("bio", formData.bio);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("phone", formData.phone);
        if (formData.latitude)
          formDataToSend.append("latitude", parseFloat(formData.latitude));
        if (formData.longitude)
          formDataToSend.append("longitude", parseFloat(formData.longitude));

        // Add photo file
        formDataToSend.append("profile_image", photoFile);

        response = await fetch("/api/public/me", {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type - browser will set it with boundary
          },
          body: formDataToSend,
        });
      } else {
        // Prepare update data (only include allowed fields from backend)
        const allowedFields = [
          "name",
          "gender",
          "age",
          "city",
          "category",
          "bio",
          "email",
          "phone",
          "latitude",
          "longitude",
        ];
        const updateData = {};
        allowedFields.forEach((field) => {
          if (
            formData[field] !== undefined &&
            formData[field] !== null &&
            formData[field] !== ""
          ) {
            if (field === "age" && formData[field]) {
              updateData[field] = parseInt(formData[field]);
            } else if (
              (field === "latitude" || field === "longitude") &&
              formData[field]
            ) {
              updateData[field] = parseFloat(formData[field]);
            } else {
              updateData[field] = formData[field];
            }
          }
        });

        response = await fetch("/api/public/me", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: data.message || "Failed to update profile. Please try again.",
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
        if (data.success && data.data) {
          // Update localStorage
          localStorage.setItem("user", JSON.stringify(data.data));
          setUser(data.data);
          setIsEditing(false);
          setPhotoFile(null);
          setPhotoPreview(null);

          Swal.fire({
            icon: "success",
            title: "Profile Updated!",
            text: "Your profile has been updated successfully.",
            timer: 2000,
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
            },
          });
        }
      }
    } catch (error) {
      console.error("Profile update error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update profile. Please try again.",
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
            title.style.background = "linear-gradient(45deg, #D4AF37, #B8941F)";
            title.style.webkitBackgroundClip = "text";
            title.style.webkitTextFillColor = "transparent";
            title.style.backgroundClip = "text";
          }
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(45deg, #D4AF37, #B8941F)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            My Profile
          </Typography>
          {!isEditing ? (
            <Button
              startIcon={<Edit />}
              onClick={handleEdit}
              variant="contained"
              sx={{
                background: "linear-gradient(135deg, #D4AF37, #B8941F)",
                color: "#1a1a1a",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "12px",
                px: 3,
                "&:hover": {
                  background: "linear-gradient(135deg, #B8941F, #D4AF37)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 24px rgba(212, 175, 55, 0.3)",
                },
              }}
            >
              Edit Profile
            </Button>
          ) : (
            <Stack direction="row" spacing={2}>
              <Button
                startIcon={<Cancel />}
                onClick={handleCancel}
                variant="outlined"
                sx={{
                  borderColor: "rgba(26, 26, 26, 0.3)",
                  color: "rgba(26, 26, 26, 0.7)",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "12px",
                  px: 3,
                  "&:hover": {
                    borderColor: "rgba(26, 26, 26, 0.5)",
                    backgroundColor: "rgba(26, 26, 26, 0.05)",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSave}
                variant="contained"
                disabled={loading}
                sx={{
                  background: "linear-gradient(135deg, #D4AF37, #B8941F)",
                  color: "#1a1a1a",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "12px",
                  px: 3,
                  "&:hover": {
                    background: "linear-gradient(135deg, #B8941F, #D4AF37)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(212, 175, 55, 0.3)",
                  },
                  "&:disabled": {
                    background: "rgba(212, 175, 55, 0.3)",
                  },
                }}
              >
                Save Changes
              </Button>
            </Stack>
          )}
        </Box>
        <Typography variant="body1" sx={{ color: "rgba(26, 26, 26, 0.7)" }}>
          Manage your profile information and preferences
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Profile Photo & Status Card */}
        <Card
          sx={{
            p: 3,
            borderRadius: "16px",
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
            border: "1px solid rgba(212, 175, 55, 0.2)",
            boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
            textAlign: "center",
            width: "100%",
          }}
        >
          <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
            <input
              accept="image/*"
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />
            <Avatar
              src={
                photoPreview ||
                (user?.photo
                  ? user.photo.startsWith("/uploads/")
                    ? user.photo
                    : `/uploads/${user.photo}`
                  : "")
              }
              sx={{
                width: 120,
                height: 120,
                bgcolor: "#D4AF37",
                fontSize: "3rem",
                fontWeight: 700,
                border: "4px solid rgba(212, 175, 55, 0.3)",
                boxShadow: "0 8px 24px rgba(212, 175, 55, 0.2)",
              }}
            >
              {!photoPreview &&
                (!user?.photo || user.photo === "") &&
                (user?.name?.charAt(0)?.toUpperCase() || "U")}
            </Avatar>
            {isEditing && (
              <IconButton
                onClick={handlePhotoClick}
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  bgcolor: "#D4AF37",
                  color: "#1a1a1a",
                  "&:hover": {
                    bgcolor: "#B8941F",
                  },
                }}
              >
                <PhotoCamera />
              </IconButton>
            )}
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 1, color: "#1a1a1a" }}
          >
            {user?.name || "User"}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}
          >
            {user?.isVerified && (
              <Chip
                icon={<Verified sx={{ color: "#D4AF37 !important" }} />}
                label="Verified"
                sx={{
                  bgcolor: "rgba(212, 175, 55, 0.15)",
                  color: "#1a1a1a",
                  fontWeight: 600,
                }}
              />
            )}
            <Chip
              label={user?.category || "Regular"}
              sx={{
                bgcolor: "rgba(212, 175, 55, 0.15)",
                color: "#1a1a1a",
                fontWeight: 600,
              }}
            />
            {user?.is_online ? (
              <Chip
                label="Online"
                sx={{
                  bgcolor: "rgba(199, 233, 208, 0.3)",
                  color: "#1a1a1a",
                  fontWeight: 600,
                }}
              />
            ) : (
              <Chip
                label="Offline"
                sx={{
                  bgcolor: "rgba(26, 26, 26, 0.1)",
                  color: "rgba(26, 26, 26, 0.7)",
                  fontWeight: 600,
                }}
              />
            )}
          </Stack>
          <Divider sx={{ my: 2, borderColor: "rgba(212, 175, 55, 0.2)" }} />
          <Box sx={{ textAlign: "left" }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                sx={{ color: "rgba(26, 26, 26, 0.6)", fontWeight: 600 }}
              >
                Token Balance
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#D4AF37" }}
              >
                {user?.token_balance || "0.00"}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                sx={{ color: "rgba(26, 26, 26, 0.6)", fontWeight: 600 }}
              >
                Boost Score
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#1a1a1a" }}
              >
                {user?.boost_score || 0}
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* Personal Information */}
        <Card
          sx={{
            p: 3,
            borderRadius: "16px",
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
            border: "1px solid rgba(212, 175, 55, 0.2)",
            boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
            width: "100%",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: "#1a1a1a",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Person /> Personal Information
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              InputProps={{
                startAdornment: <Person sx={{ mr: 1, color: "#D4AF37" }} />,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "rgba(212, 175, 55, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#D4AF37",
                  },
                },
              }}
            />
            <FormControl fullWidth disabled={!isEditing}>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                label="Gender"
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              disabled={!isEditing}
              InputProps={{
                startAdornment: <Cake sx={{ mr: 1, color: "#D4AF37" }} />,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "rgba(212, 175, 55, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#D4AF37",
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={!isEditing}
              InputProps={{
                startAdornment: <LocationOn sx={{ mr: 1, color: "#D4AF37" }} />,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "rgba(212, 175, 55, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#D4AF37",
                  },
                },
              }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                p: 2,
                borderRadius: "12px",
                bgcolor: "rgba(212, 175, 55, 0.05)",
                border: "1px dashed rgba(212, 175, 55, 0.3)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "#1a1a1a" }}
                >
                  Location Coordinates
                </Typography>
                {isEditing && (
                  <Button
                    startIcon={
                      locationLoading ? (
                        <CircularProgress size={16} />
                      ) : (
                        <MyLocation />
                      )
                    }
                    onClick={handleGetCurrentLocation}
                    disabled={locationLoading}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: "rgba(212, 175, 55, 0.5)",
                      color: "#D4AF37",
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: "8px",
                      "&:hover": {
                        borderColor: "#D4AF37",
                        backgroundColor: "rgba(212, 175, 55, 0.1)",
                      },
                    }}
                  >
                    Use Current Location
                  </Button>
                )}
              </Box>
              <TextField
                fullWidth
                label="Latitude"
                name="latitude"
                type="number"
                value={formData.latitude}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="e.g., 40.7128"
                helperText="Enter latitude coordinate (-90 to 90)"
                InputProps={{
                  startAdornment: (
                    <LocationOn sx={{ mr: 1, color: "#D4AF37" }} />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "rgba(212, 175, 55, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#D4AF37",
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Longitude"
                name="longitude"
                type="number"
                value={formData.longitude}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="e.g., -74.0060"
                helperText="Enter longitude coordinate (-180 to 180)"
                InputProps={{
                  startAdornment: (
                    <LocationOn sx={{ mr: 1, color: "#D4AF37" }} />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "rgba(212, 175, 55, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#D4AF37",
                    },
                  },
                }}
              />
              {!isEditing && (formData.latitude || formData.longitude) && (
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(26, 26, 26, 0.6)" }}
                >
                  Current: {formData.latitude}, {formData.longitude}
                </Typography>
              )}
            </Box>
            <FormControl fullWidth disabled={!isEditing}>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Category"
              >
                <MenuItem value="Regular">Regular</MenuItem>
                <MenuItem value="Sugar Mummy">Sugar Mummy</MenuItem>
                <MenuItem value="Sponsor">Sponsor</MenuItem>
                <MenuItem value="Ben 10">Ben 10</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Bio"
              name="bio"
              multiline
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Tell us about yourself..."
              InputProps={{
                startAdornment: (
                  <Description sx={{ mr: 1, color: "#D4AF37", mt: 2 }} />
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "rgba(212, 175, 55, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#D4AF37",
                  },
                },
              }}
            />
          </Box>
        </Card>

        {/* Account Information */}
        <Card
          sx={{
            p: 3,
            borderRadius: "16px",
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
            border: "1px solid rgba(212, 175, 55, 0.2)",
            boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
            width: "100%",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: "#1a1a1a",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Email /> Account Information
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              InputProps={{
                startAdornment: (
                  <Email
                    sx={{
                      mr: 1,
                      color: isEditing ? "#D4AF37" : "rgba(26, 26, 26, 0.4)",
                    }}
                  />
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "rgba(212, 175, 55, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#D4AF37",
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              InputProps={{
                startAdornment: (
                  <Phone
                    sx={{
                      mr: 1,
                      color: isEditing ? "#D4AF37" : "rgba(26, 26, 26, 0.4)",
                    }}
                  />
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "rgba(212, 175, 55, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#D4AF37",
                  },
                },
              }}
            />
          </Box>
        </Card>

        {/* Account Stats */}
        <Card
          sx={{
            p: 3,
            borderRadius: "16px",
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
            border: "1px solid rgba(212, 175, 55, 0.2)",
            boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
            width: "100%",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: "#1a1a1a",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Star /> Account Statistics
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                bgcolor: "rgba(212, 175, 55, 0.1)",
                width: "100%",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "rgba(26, 26, 26, 0.6)", fontWeight: 600 }}
              >
                Member Since
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: "#1a1a1a" }}
              >
                {formatDate(user?.createdAt)}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                bgcolor: "rgba(212, 175, 55, 0.1)",
                width: "100%",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "rgba(26, 26, 26, 0.6)", fontWeight: 600 }}
              >
                Last Updated
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: "#1a1a1a" }}
              >
                {formatDate(user?.updatedAt)}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                bgcolor: "rgba(212, 175, 55, 0.1)",
                width: "100%",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "rgba(26, 26, 26, 0.6)", fontWeight: 600 }}
              >
                Last Seen
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: "#1a1a1a" }}
              >
                {formatDate(user?.last_seen_at)}
              </Typography>
            </Box>
            {user?.is_featured_until && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  bgcolor: "rgba(212, 175, 55, 0.1)",
                  width: "100%",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(26, 26, 26, 0.6)", fontWeight: 600 }}
                >
                  Featured Until
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, color: "#1a1a1a" }}
                >
                  {formatDate(user?.is_featured_until)}
                </Typography>
              </Box>
            )}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
