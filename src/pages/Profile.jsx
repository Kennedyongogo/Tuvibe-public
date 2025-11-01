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
  CheckCircle,
  Pending,
  Cancel as CancelIcon,
  HowToReg,
  Add,
  Delete,
  Visibility,
} from "@mui/icons-material";
import Swal from "sweetalert2";

export default function Profile({ user, setUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [requestingVerification, setRequestingVerification] = useState(false);
  const [lookingForPosts, setLookingForPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [postContent, setPostContent] = useState("");
  const [showPostForm, setShowPostForm] = useState(false);
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

  // Update formData when user changes, but only if not editing
  useEffect(() => {
    if (!isEditing && user) {
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
    }
  }, [user, isEditing]);

  // Fetch verification status
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (!user) return;
      
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("/api/verification/my-status", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (data.success && data.data) {
          setVerificationStatus(data.data.status);
        }
      } catch (err) {
        console.error("Failed to fetch verification status:", err);
      }
    };

    fetchVerificationStatus();
  }, [user]);

  // Check if user is verified premium
  const isPremiumCategory = user?.category && ["Sugar Mummy", "Sponsor", "Ben 10"].includes(user.category);
  const isVerifiedPremium = isPremiumCategory && user?.isVerified;

  // Fetch "Looking For" posts (only for verified premium users)
  useEffect(() => {
    const fetchLookingForPosts = async () => {
      if (!isVerifiedPremium) return;

      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        setLoadingPosts(true);
        const response = await fetch("/api/posts/mine", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (data.success) {
          setLookingForPosts(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch Looking For posts:", err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchLookingForPosts();
  }, [isVerifiedPremium]);

  // Handle create "Looking For" post
  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Content Required",
        text: "Please enter what you're looking for",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    const token = localStorage.getItem("token");
    try {
      setLoadingPosts(true);
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: postContent.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setLookingForPosts((prev) => [data.data, ...prev]);
        setPostContent("");
        setShowPostForm(false);
        Swal.fire({
          icon: "success",
          title: "Posted!",
          text: "Your 'Looking For' post has been created",
          timer: 1500,
          showConfirmButton: false,
          confirmButtonColor: "#D4AF37",
        });
      } else {
        throw new Error(data.message || "Failed to create post");
      }
    } catch (err) {
      console.error("Create post error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to create post. Only verified premium users can post.",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setLoadingPosts(false);
    }
  };

  // Handle update post
  const handleUpdatePost = async (postId) => {
    if (!postContent.trim()) return;

    const token = localStorage.getItem("token");
    try {
      setLoadingPosts(true);
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: postContent.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setLookingForPosts((prev) =>
          prev.map((post) => (post.id === postId ? data.data : post))
        );
        setPostContent("");
        setEditingPostId(null);
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Your post has been updated",
          timer: 1500,
          showConfirmButton: false,
          confirmButtonColor: "#D4AF37",
        });
      } else {
        throw new Error(data.message || "Failed to update post");
      }
    } catch (err) {
      console.error("Update post error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to update post",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setLoadingPosts(false);
    }
  };

  // Handle delete post
  const handleDeletePost = async (postId) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete Post?",
      text: "Are you sure you want to delete this post?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#D4AF37",
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem("token");
    try {
      setLoadingPosts(true);
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setLookingForPosts((prev) => prev.filter((post) => post.id !== postId));
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Post has been deleted",
          timer: 1500,
          showConfirmButton: false,
          confirmButtonColor: "#D4AF37",
        });
      } else {
        throw new Error(data.message || "Failed to delete post");
      }
    } catch (err) {
      console.error("Delete post error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to delete post",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setLoadingPosts(false);
    }
  };

  // Handle verification request
  const handleRequestVerification = async () => {
    setRequestingVerification(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/verification/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setVerificationStatus("pending");
        Swal.fire({
          icon: "success",
          title: "Verification Requested!",
          text: "Your verification request has been submitted. Admin will review it soon.",
          confirmButtonColor: "#D4AF37",
          didOpen: () => {
            const swal = document.querySelector(".swal2-popup");
            if (swal) {
              swal.style.borderRadius = "20px";
              swal.style.border = "1px solid rgba(212, 175, 55, 0.3)";
              swal.style.boxShadow = "0 20px 60px rgba(212, 175, 55, 0.25)";
            }
          },
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Request Failed",
          text: data.message || "Failed to submit verification request. Please try again.",
          confirmButtonColor: "#D4AF37",
        });
      }
    } catch (err) {
      console.error("Verification request error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to submit verification request. Please try again later.",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setRequestingVerification(false);
    }
  };

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
          // Check if photo or bio needs moderation
          const needsModeration = 
            data.data.photo_moderation_status === "pending" ||
            data.data.bio_moderation_status === "pending";

          // Update localStorage
          localStorage.setItem("user", JSON.stringify(data.data));
          setUser(data.data);
          setIsEditing(false);
          setPhotoFile(null);
          setPhotoPreview(null);

          // Show appropriate message based on moderation status
          const moderationMessage = needsModeration
            ? photoFile
              ? data.data.bio_moderation_status === "pending"
                ? "Your profile photo and bio have been saved and are pending admin approval. They will be visible to others once approved."
                : "Your profile photo has been saved and is pending admin approval. It will be visible to others once approved."
              : "Your bio has been saved and is pending admin approval. It will be visible to others once approved."
            : "Your profile has been updated successfully.";

          Swal.fire({
            icon: "success",
            title: needsModeration ? "Profile Updated - Awaiting Approval" : "Profile Updated!",
            html: `<div style="text-align: left;">
              <p style="margin-bottom: 12px;">${moderationMessage}</p>
              ${needsModeration ? '<p style="font-size: 0.875rem; color: rgba(26, 26, 26, 0.7); margin: 0;">You can see your changes, but others won\'t until admin approval.</p>' : ''}
            </div>`,
            timer: needsModeration ? 5000 : 2000,
            showConfirmButton: true,
            confirmButtonText: "Okay",
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
                // Responsive styling
                const isMobile = window.innerWidth < 600;
                if (isMobile) {
                  swal.style.width = "90%";
                  swal.style.maxWidth = "90%";
                  swal.style.padding = "1rem";
                }
              }
              const title = document.querySelector(".swal2-title");
              if (title) {
                title.style.color = "#1a1a1a";
                title.style.fontWeight = "700";
                title.style.fontSize = window.innerWidth < 600 ? "1.25rem" : "1.5rem";
                title.style.background =
                  "linear-gradient(45deg, #D4AF37, #B8941F)";
                title.style.webkitBackgroundClip = "text";
                title.style.webkitTextFillColor = "transparent";
                title.style.backgroundClip = "text";
              }
              const htmlContent = document.querySelector(".swal2-html-container");
              if (htmlContent) {
                htmlContent.style.fontSize = window.innerWidth < 600 ? "0.875rem" : "1rem";
                htmlContent.style.padding = window.innerWidth < 600 ? "0.5rem" : "1rem 1.2em";
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
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 2, sm: 0 },
            mb: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.75rem", sm: "2.125rem" },
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
              fullWidth={false}
              sx={{
                background: "linear-gradient(135deg, #D4AF37, #B8941F)",
                color: "#1a1a1a",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "12px",
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.25 },
                width: { xs: "100%", sm: "auto" },
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
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              <Button
                startIcon={<Cancel />}
                onClick={handleCancel}
                variant="outlined"
                fullWidth={false}
                sx={{
                  borderColor: "rgba(26, 26, 26, 0.3)",
                  color: "rgba(26, 26, 26, 0.7)",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "12px",
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1, sm: 1.25 },
                  width: { xs: "100%", sm: "auto" },
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
                fullWidth={false}
                sx={{
                  background: "linear-gradient(135deg, #D4AF37, #B8941F)",
                  color: "#1a1a1a",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "12px",
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1, sm: 1.25 },
                  width: { xs: "100%", sm: "auto" },
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
        <Typography
          variant="body1"
          sx={{
            color: "rgba(26, 26, 26, 0.7)",
            fontSize: { xs: "0.875rem", sm: "1rem" },
          }}
        >
          Manage your profile information and preferences
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Profile Photo & Status Card */}
        <Card
          sx={{
            p: { xs: 2, sm: 3 },
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
            <Box sx={{ position: "relative", display: "inline-block" }}>
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
                  opacity:
                    !isEditing && user?.photo && user?.photo_moderation_status !== "approved"
                      ? 0.6
                      : 1,
                }}
              >
                {!photoPreview &&
                  (!user?.photo || user.photo === "") &&
                  (user?.name?.charAt(0)?.toUpperCase() || "U")}
              </Avatar>
              {/* Overlay indicator for pending/rejected photos */}
              {!isEditing && user?.photo && user?.photo_moderation_status === "pending" && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "rgba(255, 193, 7, 0.9)",
                    color: "#1a1a1a",
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid rgba(184, 134, 11, 0.5)",
                  }}
                >
                  <Pending sx={{ fontSize: "1.5rem" }} />
                </Box>
              )}
              {!isEditing && user?.photo && user?.photo_moderation_status === "rejected" && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "rgba(244, 67, 54, 0.9)",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid rgba(198, 40, 40, 0.5)",
                  }}
                >
                  <CancelIcon sx={{ fontSize: "1.5rem" }} />
                </Box>
              )}
            </Box>
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
            {/* Help text for pending/rejected photo */}
            {!isEditing && user?.photo && user?.photo_moderation_status === "pending" && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 1,
                  color: "rgba(184, 134, 11, 0.8)",
                  fontSize: "0.7rem",
                  fontStyle: "italic",
                  textAlign: "center",
                }}
              >
                Your photo is pending approval. It will be visible to others once approved.
              </Typography>
            )}
            {!isEditing && user?.photo && user?.photo_moderation_status === "rejected" && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 1,
                  color: "rgba(198, 40, 40, 0.8)",
                  fontSize: "0.7rem",
                  fontStyle: "italic",
                  textAlign: "center",
                }}
              >
                Your photo was rejected. Please upload a new one.
              </Typography>
            )}
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: "#1a1a1a",
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            {user?.name || "User"}
          </Typography>
          {/* Photo Moderation Status */}
          {user?.photo && (
            <Box sx={{ mb: 1 }}>
              {user?.photo_moderation_status === "pending" && (
                <Chip
                  icon={<Pending sx={{ fontSize: "1rem !important" }} />}
                  label="Photo Pending Approval"
                  size="small"
                  sx={{
                    bgcolor: "rgba(255, 193, 7, 0.2)",
                    color: "#B8860B",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    border: "1px solid rgba(255, 193, 7, 0.3)",
                  }}
                />
              )}
              {user?.photo_moderation_status === "approved" && (
                <Chip
                  icon={<CheckCircle sx={{ fontSize: "1rem !important", color: "#4CAF50 !important" }} />}
                  label="Photo Approved"
                  size="small"
                  sx={{
                    bgcolor: "rgba(76, 175, 80, 0.15)",
                    color: "#2E7D32",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    border: "1px solid rgba(76, 175, 80, 0.3)",
                  }}
                />
              )}
              {user?.photo_moderation_status === "rejected" && (
                <Chip
                  icon={<CancelIcon sx={{ fontSize: "1rem !important", color: "#F44336 !important" }} />}
                  label="Photo Rejected"
                  size="small"
                  sx={{
                    bgcolor: "rgba(244, 67, 54, 0.15)",
                    color: "#C62828",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    border: "1px solid rgba(244, 67, 54, 0.3)",
                  }}
                />
              )}
            </Box>
          )}
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
          
          {/* Verification Request Button - Only for Premium Categories */}
          {isPremiumCategory && !user?.isVerified && (
            <Box sx={{ mb: 2, textAlign: "center" }}>
              {verificationStatus === "pending" ? (
                <Chip
                  icon={<Pending sx={{ fontSize: "1rem !important", color: "#FF9800 !important" }} />}
                  label="Verification Request Pending"
                  sx={{
                    bgcolor: "rgba(255, 152, 0, 0.15)",
                    color: "#E65100",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    px: 2,
                    py: 1.5,
                  }}
                />
              ) : verificationStatus === "rejected" ? (
                <Box>
                  <Chip
                    icon={<CancelIcon sx={{ fontSize: "1rem !important", color: "#F44336 !important" }} />}
                    label="Verification Rejected"
                    sx={{
                      bgcolor: "rgba(244, 67, 54, 0.15)",
                      color: "#C62828",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      mb: 1,
                    }}
                  />
                  <Button
                    variant="contained"
                    startIcon={requestingVerification ? <CircularProgress size={16} color="inherit" /> : <HowToReg />}
                    onClick={handleRequestVerification}
                    disabled={requestingVerification}
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
                    Request Verification Again
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  startIcon={requestingVerification ? <CircularProgress size={16} color="inherit" /> : <HowToReg />}
                  onClick={handleRequestVerification}
                  disabled={requestingVerification}
                  fullWidth
                  sx={{
                    background: "linear-gradient(135deg, #D4AF37, #B8941F)",
                    color: "#1a1a1a",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: "12px",
                    py: 1.5,
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
                  {requestingVerification ? "Requesting..." : "Request Verification"}
                </Button>
              )}
            </Box>
          )}

          {/* "Looking For" Posts Section - Only for Verified Premium Users */}
          {isVerifiedPremium && (
            <Box sx={{ mb: 3 }}>
              <Divider sx={{ my: 2, borderColor: "rgba(212, 175, 55, 0.2)" }} />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#1a1a1a",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    fontSize: { xs: "1rem", sm: "1.125rem" },
                  }}
                >
                  <Visibility sx={{ color: "#D4AF37" }} />
                  Looking For
                </Typography>
                {!showPostForm && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => {
                      setShowPostForm(true);
                      setPostContent("");
                      setEditingPostId(null);
                    }}
                    sx={{
                      background: "linear-gradient(135deg, #D4AF37, #B8941F)",
                      color: "#1a1a1a",
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: "8px",
                      "&:hover": {
                        background: "linear-gradient(135deg, #B8941F, #D4AF37)",
                      },
                    }}
                  >
                    New Post
                  </Button>
                )}
              </Box>

              {/* Create/Edit Post Form */}
              {(showPostForm || editingPostId) && (
                <Card
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: "12px",
                    background: "rgba(212, 175, 55, 0.05)",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                  }}
                >
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="What are you looking for? (e.g., 'Looking for someone mature and fun to connect with...')"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setShowPostForm(false);
                        setEditingPostId(null);
                        setPostContent("");
                      }}
                      sx={{
                        borderColor: "rgba(212, 175, 55, 0.5)",
                        color: "#1a1a1a",
                        textTransform: "none",
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        if (editingPostId) {
                          handleUpdatePost(editingPostId);
                        } else {
                          handleCreatePost();
                        }
                      }}
                      disabled={loadingPosts || !postContent.trim()}
                      sx={{
                        background: "linear-gradient(135deg, #D4AF37, #B8941F)",
                        color: "#1a1a1a",
                        textTransform: "none",
                        "&:disabled": {
                          background: "rgba(212, 175, 55, 0.3)",
                        },
                      }}
                    >
                      {loadingPosts ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : editingPostId ? (
                        "Update"
                      ) : (
                        "Post"
                      )}
                    </Button>
                  </Stack>
                </Card>
              )}

              {/* Posts List */}
              {loadingPosts ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={24} sx={{ color: "#D4AF37" }} />
                </Box>
              ) : lookingForPosts.length === 0 ? (
                <Card
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: "12px",
                    background: "rgba(212, 175, 55, 0.05)",
                    border: "1px dashed rgba(212, 175, 55, 0.3)",
                  }}
                >
                  <Visibility
                    sx={{ fontSize: 48, color: "rgba(212, 175, 55, 0.5)", mb: 1 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(26, 26, 26, 0.6)" }}
                  >
                    No posts yet. Create your first "Looking For" post!
                  </Typography>
                </Card>
              ) : (
                <Stack spacing={2}>
                  {lookingForPosts.map((post) => (
                    <Card
                      key={post.id}
                      sx={{
                        p: 2,
                        borderRadius: "12px",
                        background:
                          "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
                        border: "1px solid rgba(212, 175, 55, 0.2)",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#1a1a1a",
                          mb: 1,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {post.content}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(26, 26, 26, 0.5)" }}
                        >
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingPostId(post.id);
                              setPostContent(post.content);
                              setShowPostForm(false);
                            }}
                            sx={{ color: "#D4AF37" }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeletePost(post.id)}
                            sx={{ color: "#F44336" }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Box>
                    </Card>
                  ))}
                </Stack>
              )}
            </Box>
          )}
          
          <Divider sx={{ my: 2, borderColor: "rgba(212, 175, 55, 0.2)" }} />
          <Box sx={{ textAlign: "left" }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(26, 26, 26, 0.6)",
                  fontWeight: 600,
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                }}
              >
                Token Balance
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#D4AF37",
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
              >
                {user?.token_balance || "0.00"}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(26, 26, 26, 0.6)",
                  fontWeight: 600,
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                }}
              >
                Boost Score
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#1a1a1a",
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
              >
                {user?.boost_score || 0}
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* Personal Information */}
        <Card
          sx={{
            p: { xs: 2, sm: 3 },
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
              mb: { xs: 2, sm: 3 },
              color: "#1a1a1a",
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontSize: { xs: "1rem", sm: "1.25rem" },
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
                disabled={!isEditing}
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
                  sx={{
                    fontWeight: 600,
                    color: "#1a1a1a",
                    fontSize: { xs: "0.875rem", sm: "0.875rem" },
                  }}
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
                  sx={{
                    color: "rgba(26, 26, 26, 0.6)",
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  }}
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
                disabled={!isEditing}
              >
                <MenuItem value="Regular">Regular</MenuItem>
                <MenuItem value="Sugar Mummy">Sugar Mummy</MenuItem>
                <MenuItem value="Sponsor">Sponsor</MenuItem>
                <MenuItem value="Ben 10">Ben 10</MenuItem>
              </Select>
            </FormControl>
            <Box>
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
              {/* Bio Moderation Status */}
              {user?.bio && user?.bio.trim() !== "" && (
                <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  {user?.bio_moderation_status === "pending" && (
                    <Chip
                      icon={<Pending sx={{ fontSize: "0.875rem !important" }} />}
                      label="Bio Pending Approval"
                      size="small"
                      sx={{
                        bgcolor: "rgba(255, 193, 7, 0.2)",
                        color: "#B8860B",
                        fontWeight: 600,
                        fontSize: "0.65rem",
                        border: "1px solid rgba(255, 193, 7, 0.3)",
                        height: "24px",
                      }}
                    />
                  )}
                  {user?.bio_moderation_status === "approved" && (
                    <Chip
                      icon={<CheckCircle sx={{ fontSize: "0.875rem !important", color: "#4CAF50 !important" }} />}
                      label="Bio Approved"
                      size="small"
                      sx={{
                        bgcolor: "rgba(76, 175, 80, 0.15)",
                        color: "#2E7D32",
                        fontWeight: 600,
                        fontSize: "0.65rem",
                        border: "1px solid rgba(76, 175, 80, 0.3)",
                        height: "24px",
                      }}
                    />
                  )}
                  {user?.bio_moderation_status === "rejected" && (
                    <Chip
                      icon={<CancelIcon sx={{ fontSize: "0.875rem !important", color: "#F44336 !important" }} />}
                      label="Bio Rejected"
                      size="small"
                      sx={{
                        bgcolor: "rgba(244, 67, 54, 0.15)",
                        color: "#C62828",
                        fontWeight: 600,
                        fontSize: "0.65rem",
                        border: "1px solid rgba(244, 67, 54, 0.3)",
                        height: "24px",
                      }}
                    />
                  )}
                </Box>
              )}
              {/* Help text for pending status */}
              {!isEditing && user?.bio && user?.bio_moderation_status === "pending" && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 0.5,
                    color: "rgba(184, 134, 11, 0.8)",
                    fontSize: "0.7rem",
                    fontStyle: "italic",
                  }}
                >
                  Your bio is pending approval. It will be visible to others once approved.
                </Typography>
              )}
              {!isEditing && user?.bio && user?.bio_moderation_status === "rejected" && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 0.5,
                    color: "rgba(198, 40, 40, 0.8)",
                    fontSize: "0.7rem",
                    fontStyle: "italic",
                  }}
                >
                  Your bio was rejected. Please update it and try again.
                </Typography>
              )}
            </Box>
          </Box>
        </Card>

        {/* Account Information */}
        <Card
          sx={{
            p: { xs: 2, sm: 3 },
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
              mb: { xs: 2, sm: 3 },
              color: "#1a1a1a",
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontSize: { xs: "1rem", sm: "1.25rem" },
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
            p: { xs: 2, sm: 3 },
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
              mb: { xs: 2, sm: 3 },
              color: "#1a1a1a",
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontSize: { xs: "1rem", sm: "1.25rem" },
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
                sx={{
                  color: "rgba(26, 26, 26, 0.6)",
                  fontWeight: 600,
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                }}
              >
                Member Since
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: "#1a1a1a",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
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
                sx={{
                  color: "rgba(26, 26, 26, 0.6)",
                  fontWeight: 600,
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                }}
              >
                Last Updated
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: "#1a1a1a",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
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
                sx={{
                  color: "rgba(26, 26, 26, 0.6)",
                  fontWeight: 600,
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                }}
              >
                Last Seen
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: "#1a1a1a",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
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
                  sx={{
                    color: "rgba(26, 26, 26, 0.6)",
                    fontWeight: 600,
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  }}
                >
                  Featured Until
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: "#1a1a1a",
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  }}
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
