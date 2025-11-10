import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
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
  Alert,
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
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getDisplayInitial, getDisplayName } from "../utils/userDisplay";

export default function Profile({ user, setUser }) {
  const navigate = useNavigate();

  const resolveBirthYearFromUser = (userObj) => {
    if (!userObj) return "";
    if (userObj.birth_year !== undefined && userObj.birth_year !== null) {
      return String(userObj.birth_year);
    }
    if (userObj.age !== undefined && userObj.age !== null) {
      const numericAge = parseInt(userObj.age, 10);
      if (!Number.isNaN(numericAge) && numericAge > 0) {
        const currentYear = new Date().getFullYear();
        const derivedYear = currentYear - numericAge;
        if (derivedYear > 1900 && derivedYear <= currentYear) {
          return String(derivedYear);
        }
      }
    }
    return "";
  };

  const computeAgeFromBirthYear = (birthYearValue) => {
    if (
      birthYearValue === undefined ||
      birthYearValue === null ||
      birthYearValue === ""
    ) {
      return "";
    }

    const numericYear = parseInt(birthYearValue, 10);
    const currentYear = new Date().getFullYear();

    if (
      Number.isNaN(numericYear) ||
      numericYear < 1900 ||
      numericYear > currentYear
    ) {
      return "";
    }

    const resolvedAge = currentYear - numericYear;
    return resolvedAge > 0 && resolvedAge <= 120 ? resolvedAge : "";
  };

  const resolveAgeFromUser = (userObj) => {
    if (!userObj) return "";

    if (userObj.birth_year !== undefined && userObj.birth_year !== null) {
      const ageFromBirthYear = computeAgeFromBirthYear(userObj.birth_year);
      if (ageFromBirthYear !== "") {
        return ageFromBirthYear;
      }
    }

    if (userObj.age !== undefined && userObj.age !== null) {
      const numericAge = parseInt(userObj.age, 10);
      if (!Number.isNaN(numericAge) && numericAge > 0 && numericAge <= 120) {
        return numericAge;
      }
    }

    return "";
  };

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const galleryInputRef = useRef(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const galleryScrollRef = useRef(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const locationWatchIdRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);
  const lastSavedCoordsRef = useRef({
    lat:
      user?.latitude !== undefined && user?.latitude !== null
        ? String(user.latitude)
        : "",
    lng:
      user?.longitude !== undefined && user?.longitude !== null
        ? String(user.longitude)
        : "",
  });
  const [isLocationTracking, setIsLocationTracking] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [requestingVerification, setRequestingVerification] = useState(false);
  const [lookingForPosts, setLookingForPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [postContent, setPostContent] = useState("");
  const [showPostForm, setShowPostForm] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    gender: user?.gender || "",
    birthYear: resolveBirthYearFromUser(user),
    county: user?.county || "",
    phone: user?.phone || "",
    email: user?.email || "",
    bio: user?.bio || "",
    photo: user?.photo || "",
    latitude: user?.latitude?.toString() || "",
    longitude: user?.longitude?.toString() || "",
  });
  const [boostStatus, setBoostStatus] = useState({
    status: "unknown",
    boost: null,
  });
  const [loadingBoostStatus, setLoadingBoostStatus] = useState(false);

  const userAge = useMemo(() => resolveAgeFromUser(user), [user]);
  const birthYearAgePreview = useMemo(
    () => computeAgeFromBirthYear(formData.birthYear),
    [formData.birthYear]
  );

  // Update formData when user changes, but only if not editing
  useEffect(() => {
    if (!isEditing && user) {
      setFormData({
        name: user?.name || "",
        username: user?.username || "",
        gender: user?.gender || "",
        birthYear: resolveBirthYearFromUser(user),
        county: user?.county || "",
        phone: user?.phone || "",
        email: user?.email || "",
        bio: user?.bio || "",
        photo: user?.photo || "",
        latitude: user?.latitude?.toString() || "",
        longitude: user?.longitude?.toString() || "",
      });
      // Reset gallery photos - only store new File objects, not existing photos
      setGalleryPhotos([]);
      // Reset photo index when photos change
      setCurrentPhotoIndex(0);
    }
  }, [user, isEditing]);

  useEffect(
    () => () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    },
    []
  );

  useEffect(() => {
    lastSavedCoordsRef.current = {
      lat:
        user?.latitude !== undefined && user?.latitude !== null
          ? String(user.latitude)
          : "",
      lng:
        user?.longitude !== undefined && user?.longitude !== null
          ? String(user.longitude)
          : "",
    };
  }, [user?.latitude, user?.longitude]);

  // Sync scroll position and validate photo index when photos change
  useEffect(() => {
    // Calculate total photos
    const existingCount =
      user?.photos && Array.isArray(user.photos) ? user.photos.length : 0;
    const totalPhotos = existingCount + galleryPhotos.length;

    // Validate and reset currentPhotoIndex if out of bounds
    if (totalPhotos === 0) {
      setCurrentPhotoIndex(0);
    } else if (currentPhotoIndex >= totalPhotos) {
      setCurrentPhotoIndex(Math.max(0, totalPhotos - 1));
    }

    // Sync scroll position
    if (!galleryScrollRef.current || isScrollingRef.current) return;

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const container = galleryScrollRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      if (containerWidth === 0) return;

      // Reset to first photo (index 0) when photos load
      // Only do this if we're significantly off (meaning it's a fresh load)
      const currentPosition = container.scrollLeft;
      if (currentPosition > 50 && totalPhotos > 0) {
        // Only reset if we're not already at the start
        container.scrollLeft = 0;
        setCurrentPhotoIndex(0);
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [user?.photos?.length, galleryPhotos.length, galleryPreviews.length]); // Watch for photo changes

  // Fetch verification status (only for premium categories that might have pending requests)
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (!user) return;

      // Only check verification status for premium categories
      const isPremiumCategory =
        user?.category &&
        ["Sugar Mummy", "Sponsor", "Ben 10", "Urban Chics"].includes(
          user.category
        );

      // If user is already verified or not premium, no need to check
      if (!isPremiumCategory || user?.isVerified) {
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("/api/verification/my-status", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // If endpoint doesn't exist (404), silently fail
        if (response.status === 404) {
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.data) {
          setVerificationStatus(data.data.status);
        }
      } catch (err) {
        // Silently handle 404 errors (endpoint doesn't exist)
        // Only log other errors
        if (
          !err.message ||
          (!err.message.includes("404") && !err.message.includes("Not Found"))
        ) {
          console.error("Failed to fetch verification status:", err);
        }
      }
    };

    fetchVerificationStatus();
  }, [user]);

  // Check if user is verified premium
  const isPremiumCategory =
    user?.category &&
    ["Sugar Mummy", "Sponsor", "Ben 10", "Urban Chics"].includes(user.category);
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
        text:
          err.message ||
          "Failed to create post. Only verified premium users can post.",
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
          text:
            data.message ||
            "Failed to submit verification request. Please try again.",
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

  const scheduleLocationAutoSave = useCallback(
    (lat, lng) => {
      if (lat === "" || lng === "") return;

      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }

      const { lat: lastLat, lng: lastLng } = lastSavedCoordsRef.current;
      if (lastLat === lat && lastLng === lng) {
        return;
      }

      autoSaveTimeoutRef.current = setTimeout(async () => {
        autoSaveTimeoutRef.current = null;

        const numericLat = parseFloat(lat);
        const numericLng = parseFloat(lng);

        if (Number.isNaN(numericLat) || Number.isNaN(numericLng)) {
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          return;
        }

        try {
          const response = await fetch("/api/public/me", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              latitude: numericLat,
              longitude: numericLng,
            }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            console.error("Auto-save location failed:", data);
            return;
          }

          lastSavedCoordsRef.current = { lat, lng };

          if (data.data) {
            localStorage.setItem("user", JSON.stringify(data.data));
            setUser(data.data);
          }
        } catch (err) {
          console.error("Auto-save location error:", err);
        }
      }, 3000);
    },
    [setUser]
  );

  const updateCoordinatesFromCoords = (coords) => {
    const lat = coords.latitude.toFixed(8);
    const lng = coords.longitude.toFixed(8);
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
    scheduleLocationAutoSave(lat, lng);
    return { lat, lng };
  };

  const stopLocationWatch = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setIsLocationTracking(false);
      return;
    }

    if (locationWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatchIdRef.current);
      locationWatchIdRef.current = null;
    }
    setIsLocationTracking(false);
  };

  const startLocationWatch = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setIsLocationTracking(false);
      return;
    }

    if (locationWatchIdRef.current !== null) {
      setIsLocationTracking(true);
      return;
    }

    try {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { lat, lng } = updateCoordinatesFromCoords(position.coords);
          setIsLocationTracking(true);
        },
        (error) => {
          console.error("Location watch error:", error);
          setIsLocationTracking(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000,
        }
      );

      locationWatchIdRef.current = watchId;
      setIsLocationTracking(true);
    } catch (err) {
      console.error("Failed to start location watch:", err);
      setIsLocationTracking(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeTracking = async () => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        setIsLocationTracking(false);
        return;
      }

      try {
        await getCurrentLocation(false);
      } catch (error) {
        setIsLocationTracking(false);
      } finally {
        if (isMounted) {
          startLocationWatch();
        }
      }
    };

    initializeTracking();

    return () => {
      isMounted = false;
      stopLocationWatch();
    };
  }, []);

  const getCurrentLocation = (showSuccess = true) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setIsLocationTracking(false);
        reject(new Error("Geolocation is not supported by your browser."));
        return;
      }

      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { lat, lng } = updateCoordinatesFromCoords(position.coords);
          setLocationLoading(false);
          if (showSuccess) {
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
          }
          resolve({ latitude: lat, longitude: lng });
        },
        (error) => {
          setLocationLoading(false);
          setIsLocationTracking(false);
          const errorMessage =
            error.code === 1
              ? "Location access denied. Please enable location permissions or enter manually."
              : "Failed to get your location. Please try again or enter manually.";
          if (showSuccess) {
            Swal.fire({
              icon: "error",
              title: "Location Error",
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
              },
            });
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  const handleEdit = async () => {
    setIsEditing(true);
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      try {
        await getCurrentLocation(false);
      } catch (error) {
        setIsLocationTracking(false);
      }
      startLocationWatch();
    } else {
      setIsLocationTracking(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      username: user?.username || "",
      gender: user?.gender || "",
      birthYear: resolveBirthYearFromUser(user),
      county: user?.county || "",
      phone: user?.phone || "",
      email: user?.email || "",
      bio: user?.bio || "",
      photo: user?.photo || "",
      latitude: user?.latitude?.toString() || "",
      longitude: user?.longitude?.toString() || "",
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setGalleryPhotos([]);
    setGalleryPreviews([]);
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

  const handleGalleryPhotosChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate all files
    const validFiles = [];
    const invalidFiles = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        invalidFiles.push(`${file.name} - not an image`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        invalidFiles.push(`${file.name} - larger than 10MB`);
        return;
      }
      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Invalid Files",
        html: `The following files were rejected:<br/>${invalidFiles.join("<br/>")}`,
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
    }

    if (validFiles.length > 0) {
      // Limit to 10 photos total (existing + new)
      const existingPhotosCount =
        user?.photos && Array.isArray(user.photos) ? user.photos.length : 0;
      const totalPhotos =
        existingPhotosCount + galleryPhotos.length + validFiles.length;
      if (totalPhotos > 10) {
        const allowed = 10 - existingPhotosCount - galleryPhotos.length;
        Swal.fire({
          icon: "warning",
          title: "Too Many Photos",
          text: `You can only add ${allowed} more photo(s). Maximum 10 photos allowed.`,
          confirmButtonColor: "#D4AF37",
        });
        validFiles.splice(allowed);
      }

      // Create previews
      const newPreviews = [];
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === validFiles.length) {
            setGalleryPreviews((prev) => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });

      setGalleryPhotos((prev) => [...prev, ...validFiles]);
      // Reset to first photo when new photos are added
      setCurrentPhotoIndex(0);
    }
  };

  const handleRemoveGalleryPhoto = async (index) => {
    const existingCount =
      user?.photos && Array.isArray(user.photos) ? user.photos.length : 0;
    const newPhotoIndex = index - existingCount;
    // If it's an existing photo (index < existingCount), delete from server
    if (index < existingCount) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Delete Photo?",
        text: "Are you sure you want to delete this photo?",
        showCancelButton: true,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#D4AF37",
      });

      if (!result.isConfirmed) {
        return;
      }

      const token = localStorage.getItem("token");
      try {
        setLoadingPosts(true); // Reuse loading state

        const response = await fetch(`/api/public/me/photos/${index}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.success) {
          // Use the updated user data from the delete response if available
          let updatedUserData = data.data?.user;

          if (!updatedUserData) {
            // Fallback: Refresh user data if not included in response
            const userResponse = await fetch("/api/public/me", {
              headers: { Authorization: `Bearer ${token}` },
            });

            const userData = await userResponse.json();

            if (userData.success) {
              updatedUserData = userData.data;
            } else {
              console.error("Failed to refresh user data:", userData);
              throw new Error("Failed to get updated user data");
            }
          }

          // Update localStorage
          localStorage.setItem("user", JSON.stringify(updatedUserData));
          setUser(updatedUserData);

          // Calculate new total photos count
          const newExistingCount =
            updatedUserData?.photos && Array.isArray(updatedUserData.photos)
              ? updatedUserData.photos.length
              : 0;
          const newTotalPhotos = newExistingCount + galleryPhotos.length;

          // Reset current photo index to ensure it's valid
          if (newTotalPhotos === 0) {
            setCurrentPhotoIndex(0);
          } else if (currentPhotoIndex >= newTotalPhotos) {
            // If current index is out of bounds, set to last photo
            setCurrentPhotoIndex(newTotalPhotos - 1);
          } else if (currentPhotoIndex >= index) {
            // If we deleted a photo before or at current position, adjust index
            setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1));
          }

          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Photo has been deleted",
            timer: 1500,
            showConfirmButton: false,
            confirmButtonColor: "#D4AF37",
          });
        } else {
          console.error("Delete API failed:", data);
          throw new Error(data.message || "Failed to delete photo");
        }
      } catch (err) {
        console.error("Delete photo error:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to delete photo",
          confirmButtonColor: "#D4AF37",
        });
      } finally {
        setLoadingPosts(false);
      }
    } else {
      // It's a new photo (File object), remove from local state
      if (newPhotoIndex >= 0) {
        setGalleryPhotos((prev) => prev.filter((_, i) => i !== newPhotoIndex));
        setGalleryPreviews((prev) =>
          prev.filter((_, i) => i !== newPhotoIndex)
        );
        // Adjust photo index if needed
        if (currentPhotoIndex >= index) {
          setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1));
        }
      }
    }
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const handleGetCurrentLocation = () => {
    getCurrentLocation(true);
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const normalizedUsername = formData.username.trim();
      if (!normalizedUsername) {
        Swal.fire({
          icon: "error",
          title: "Username Required",
          text: "Please choose a username so members can find you.",
          confirmButtonColor: "#D4AF37",
        });
        setLoading(false);
        return;
      }
      let response;

      // Check if there are any new File objects to upload
      const hasNewGalleryFiles = galleryPhotos.some(
        (file) => file instanceof File
      );

      // If photo file or new gallery photos are selected, use FormData for multipart upload
      if (photoFile || hasNewGalleryFiles) {
        const formDataToSend = new FormData();

        // Add all form fields
        formDataToSend.append("name", formData.name);
        formDataToSend.append("username", normalizedUsername);
        if (formData.gender) formDataToSend.append("gender", formData.gender);
        if (formData.birthYear) {
          formDataToSend.append("birth_year", parseInt(formData.birthYear, 10));
        }
        if (formData.county) formDataToSend.append("county", formData.county);
        if (formData.bio) formDataToSend.append("bio", formData.bio);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("phone", formData.phone);
        if (formData.latitude)
          formDataToSend.append("latitude", parseFloat(formData.latitude));
        if (formData.longitude)
          formDataToSend.append("longitude", parseFloat(formData.longitude));

        // Add main photo file if selected
        if (photoFile) {
          formDataToSend.append("profile_image", photoFile);
        }

        // Add gallery photos (multiple files)
        galleryPhotos.forEach((file) => {
          if (file instanceof File) {
            formDataToSend.append("profile_images", file);
          }
        });

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
        const fieldConfigs = [
          {
            key: "name",
          },
          {
            key: "username",
            transform: (value) => value.trim(),
          },
          {
            key: "gender",
          },
          {
            key: "birthYear",
            payloadKey: "birth_year",
            transform: (value) => parseInt(value, 10),
          },
          {
            key: "county",
          },
          {
            key: "bio",
          },
          {
            key: "email",
          },
          {
            key: "phone",
          },
          {
            key: "latitude",
            transform: (value) => parseFloat(value),
          },
          {
            key: "longitude",
            transform: (value) => parseFloat(value),
          },
        ];
        const updateData = {};

        fieldConfigs.forEach(({ key, payloadKey, transform }) => {
          const value = formData[key];
          if (value !== undefined && value !== null && value !== "") {
            const targetKey = payloadKey || key;
            if (transform) {
              const transformed = transform(value);
              if (!Number.isNaN(transformed)) {
                updateData[targetKey] = transformed;
              }
            } else {
              updateData[targetKey] = value;
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
          lastSavedCoordsRef.current = {
            lat:
              data.data.latitude !== undefined && data.data.latitude !== null
                ? String(data.data.latitude)
                : "",
            lng:
              data.data.longitude !== undefined && data.data.longitude !== null
                ? String(data.data.longitude)
                : "",
          };
          setIsEditing(false);
          setPhotoFile(null);
          setPhotoPreview(null);
          setGalleryPhotos([]);
          setGalleryPreviews([]);

          // Show appropriate message based on moderation status
          const hasPhotos = photoFile || galleryPhotos.length > 0;
          const moderationMessage = needsModeration
            ? hasPhotos
              ? data.data.bio_moderation_status === "pending"
                ? galleryPhotos.length > 0
                  ? "Your profile photo, gallery photos, and bio have been saved and are pending admin approval. They will be visible to others once approved."
                  : "Your profile photo and bio have been saved and are pending admin approval. They will be visible to others once approved."
                : galleryPhotos.length > 0
                  ? "Your profile photo and gallery photos have been saved and are pending admin approval. They will be visible to others once approved."
                  : "Your profile photo has been saved and is pending admin approval. It will be visible to others once approved."
              : "Your bio has been saved and is pending admin approval. It will be visible to others once approved."
            : "Your profile has been updated successfully.";

          Swal.fire({
            icon: "success",
            title: needsModeration
              ? "Profile Updated - Awaiting Approval"
              : "Profile Updated!",
            html: `<div style="text-align: left;">
              <p style="margin-bottom: 12px;">${moderationMessage}</p>
              ${needsModeration ? '<p style="font-size: 0.875rem; color: rgba(26, 26, 26, 0.7); margin: 0;">You can see your changes, but others won\'t until admin approval.</p>' : ""}
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
                title.style.fontSize =
                  window.innerWidth < 600 ? "1.25rem" : "1.5rem";
                title.style.background =
                  "linear-gradient(45deg, #D4AF37, #B8941F)";
                title.style.webkitBackgroundClip = "text";
                title.style.webkitTextFillColor = "transparent";
                title.style.backgroundClip = "text";
              }
              const htmlContent = document.querySelector(
                ".swal2-html-container"
              );
              if (htmlContent) {
                htmlContent.style.fontSize =
                  window.innerWidth < 600 ? "0.875rem" : "1rem";
                htmlContent.style.padding =
                  window.innerWidth < 600 ? "0.5rem" : "1rem 1.2em";
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

  useEffect(() => {
    const fetchBoostStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setBoostStatus({ status: "inactive", boost: null });
        return;
      }

      setLoadingBoostStatus(true);
      try {
        const response = await fetch("/api/public/boosts/status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setBoostStatus(data.data || { status: "inactive", boost: null });
        } else {
          setBoostStatus({ status: "inactive", boost: null });
        }
      } catch (error) {
        console.error("Error fetching boost status:", error);
        setBoostStatus({ status: "inactive", boost: null });
      } finally {
        setLoadingBoostStatus(false);
      }
    };

    fetchBoostStatus();
  }, [user?.id]);

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
                    !isEditing &&
                    user?.photo &&
                    user?.photo_moderation_status !== "approved"
                      ? 0.6
                      : 1,
                }}
              >
                {!photoPreview &&
                  (!user?.photo || user.photo === "") &&
                  getDisplayInitial(user, {
                    fallback: "U",
                    currentUserId: user?.id,
                  })}
              </Avatar>
              {/* Overlay indicator for pending/rejected photos */}
              {!isEditing &&
                user?.photo &&
                user?.photo_moderation_status === "pending" && (
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
              {!isEditing &&
                user?.photo &&
                user?.photo_moderation_status === "rejected" && (
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
            {!isEditing &&
              user?.photo &&
              user?.photo_moderation_status === "pending" && (
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
                  Your photo is pending approval. It will be visible to others
                  once approved.
                </Typography>
              )}
            {!isEditing &&
              user?.photo &&
              user?.photo_moderation_status === "rejected" && (
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
              mb: 0.25,
              color: "#1a1a1a",
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            {getDisplayName(user, {
              fallback: "User",
              currentUserId: user?.id,
            })}
          </Typography>
          {user?.username && (
            <Typography
              variant="body2"
              sx={{
                color: "rgba(26, 26, 26, 0.65)",
                marginBottom: 1,
                fontWeight: 500,
              }}
            >
              @{user.username}
            </Typography>
          )}
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
                  icon={
                    <CheckCircle
                      sx={{
                        fontSize: "1rem !important",
                        color: "#4CAF50 !important",
                      }}
                    />
                  }
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
                  icon={
                    <CancelIcon
                      sx={{
                        fontSize: "1rem !important",
                        color: "#F44336 !important",
                      }}
                    />
                  }
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
            {(isEditing ? birthYearAgePreview : userAge) !== "" && (
              <Chip
                icon={<Cake sx={{ color: "#D4AF37 !important" }} />}
                label={`${isEditing ? birthYearAgePreview : userAge} yrs`}
                sx={{
                  bgcolor: "rgba(212, 175, 55, 0.1)",
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
        </Card>

        {/* Gallery Photos Section */}
        <Card
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: "16px",
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
            border: "1px solid rgba(212, 175, 55, 0.2)",
            boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
          }}
        >
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
                color: "#1a1a1a",
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              Gallery Photos
            </Typography>
            {isEditing && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleGalleryClick}
                disabled={
                  (user?.photos && Array.isArray(user.photos)
                    ? user.photos.length
                    : 0) +
                    galleryPhotos.length >=
                  10
                }
                sx={{
                  bgcolor: "#D4AF37",
                  color: "#1a1a1a",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "#B8941F",
                  },
                  "&:disabled": {
                    bgcolor: "rgba(212, 175, 55, 0.3)",
                    color: "rgba(26, 26, 26, 0.5)",
                  },
                }}
              >
                Add Photos
              </Button>
            )}
          </Box>
          <input
            accept="image/*"
            type="file"
            multiple
            ref={galleryInputRef}
            onChange={handleGalleryPhotosChange}
            style={{ display: "none" }}
          />
          {(user?.photos && user.photos.length > 0) ||
          galleryPhotos.length > 0 ? (
            <Box>
              {/* Collect all photos for carousel */}
              {(() => {
                const allPhotos = [];
                // Add existing photos
                if (user?.photos && Array.isArray(user.photos)) {
                  user.photos.forEach((photo, index) => {
                    if (typeof photo === "object" && photo.path) {
                      allPhotos.push({
                        type: "existing",
                        photo,
                        index,
                      });
                    }
                  });
                }
                // Add new photo previews
                galleryPreviews.forEach((preview, index) => {
                  allPhotos.push({
                    type: "preview",
                    preview,
                    index,
                  });
                });

                const totalPhotos = allPhotos.length;

                // Different scroll methods for edit vs view mode
                const scrollToPhoto = (targetIndex) => {
                  // Prevent rapid clicking and ensure valid index
                  if (
                    isScrollingRef.current ||
                    targetIndex < 0 ||
                    targetIndex >= totalPhotos
                  ) {
                    return;
                  }

                  const container = galleryScrollRef.current;
                  if (!container) return;

                  // Set scrolling flag
                  isScrollingRef.current = true;

                  if (isEditing) {
                    // EDIT MODE: Use scrollIntoView with element reference (works well with previews)
                    requestAnimationFrame(() => {
                      const photoElement = container.children[targetIndex];
                      if (!photoElement) {
                        isScrollingRef.current = false;
                        return;
                      }

                      // Update index immediately
                      setCurrentPhotoIndex(targetIndex);

                      // Use scrollIntoView for edit mode
                      photoElement.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "center",
                      });

                      // Reset flag after animation
                      setTimeout(() => {
                        isScrollingRef.current = false;
                      }, 300);
                    });
                  } else {
                    // VIEW MODE: Use direct scroll position calculation (more reliable for existing photos)
                    requestAnimationFrame(() => {
                      const containerWidth =
                        container.clientWidth || container.offsetWidth;

                      if (containerWidth === 0) {
                        // Container not ready, try again
                        isScrollingRef.current = false;
                        setTimeout(() => scrollToPhoto(targetIndex), 50);
                        return;
                      }

                      // Calculate scroll position - each photo is exactly containerWidth wide
                      const scrollPosition = targetIndex * containerWidth;

                      // Update index immediately
                      setCurrentPhotoIndex(targetIndex);

                      // Scroll directly - use scrollTo only (no immediate scrollLeft to avoid conflicts)
                      container.scrollTo({
                        left: scrollPosition,
                        behavior: "smooth",
                      });

                      // Reset flag and verify position after animation
                      setTimeout(() => {
                        isScrollingRef.current = false;
                        // Ensure final position is correct
                        const finalPosition = container.scrollLeft;
                        const expectedPosition = targetIndex * containerWidth;
                        const difference = Math.abs(
                          finalPosition - expectedPosition
                        );

                        // If position is significantly off, correct it
                        if (difference > 10) {
                          container.scrollLeft = expectedPosition;
                        }

                        // Verify and update index to ensure dots are aligned
                        const finalIndex = Math.round(
                          finalPosition / containerWidth
                        );
                        const clampedIndex = Math.max(
                          0,
                          Math.min(finalIndex, totalPhotos - 1)
                        );
                        if (clampedIndex !== currentPhotoIndex) {
                          setCurrentPhotoIndex(clampedIndex);
                        }
                      }, 400);
                    });
                  }
                };

                // Debounce scroll handler to prevent excessive updates
                const handleScroll = (e) => {
                  // Don't update index during programmatic scrolling
                  if (isScrollingRef.current) return;

                  // Clear previous timeout
                  if (scrollTimeoutRef.current) {
                    clearTimeout(scrollTimeoutRef.current);
                  }

                  // Debounce scroll updates
                  scrollTimeoutRef.current = setTimeout(() => {
                    // Double-check scrolling flag
                    if (isScrollingRef.current) return;

                    const container = e.target;
                    const containerWidth = container.clientWidth;
                    if (containerWidth === 0) return;

                    const scrollLeft = container.scrollLeft;

                    // Find which photo is most visible/centered
                    let closestIndex = 0;
                    let closestDistance = Infinity;

                    if (galleryScrollRef.current) {
                      Array.from(galleryScrollRef.current.children).forEach(
                        (child, idx) => {
                          const rect = child.getBoundingClientRect();
                          const containerRect =
                            container.getBoundingClientRect();
                          const photoCenter = rect.left + rect.width / 2;
                          const containerCenter =
                            containerRect.left + containerWidth / 2;
                          const distance = Math.abs(
                            photoCenter - containerCenter
                          );

                          if (distance < closestDistance) {
                            closestDistance = distance;
                            closestIndex = idx;
                          }
                        }
                      );
                    }

                    // Fallback to calculation if no children found
                    if (closestIndex === 0 && closestDistance === Infinity) {
                      closestIndex = Math.round(scrollLeft / containerWidth);
                    }

                    // Clamp index to valid range
                    closestIndex = Math.max(
                      0,
                      Math.min(closestIndex, totalPhotos - 1)
                    );

                    // Update index if it changed - but only if it's a significant change
                    // This prevents micro-adjustments that cause flickering
                    if (
                      closestIndex !== currentPhotoIndex &&
                      closestIndex >= 0 &&
                      closestIndex < totalPhotos &&
                      Math.abs(closestIndex - currentPhotoIndex) >= 1 // Only update if moving to a different photo
                    ) {
                      setCurrentPhotoIndex(closestIndex);
                    }
                  }, 150); // Slightly longer debounce to allow scroll to settle
                };

                // Arrow navigation handlers
                const handlePreviousPhoto = () => {
                  if (currentPhotoIndex > 0) {
                    scrollToPhoto(currentPhotoIndex - 1);
                  }
                };

                const handleNextPhoto = () => {
                  if (currentPhotoIndex < totalPhotos - 1) {
                    scrollToPhoto(currentPhotoIndex + 1);
                  }
                };

                return (
                  <>
                    {/* Single Photo Carousel */}
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        borderRadius: "12px",
                        overflow: "hidden",
                        aspectRatio: "1",
                        maxHeight: { xs: "300px", sm: "400px", md: "500px" },
                        bgcolor: "rgba(212, 175, 55, 0.1)",
                      }}
                    >
                      {/* Scrollable Container - All photos rendered horizontally with scrollbar */}
                      <Box
                        ref={galleryScrollRef}
                        onScroll={handleScroll}
                        sx={{
                          display: "flex",
                          gap: 1,
                          overflowX: "auto",
                          overflowY: "hidden",
                          width: "100%",
                          height: "100%",
                          position: "relative",
                          scrollBehavior: "smooth",
                          // Show scrollbar in both edit and view modes
                          "&::-webkit-scrollbar": {
                            display: "block",
                            height: "8px",
                          },
                          "&::-webkit-scrollbar-track": {
                            background: "rgba(212, 175, 55, 0.1)",
                            borderRadius: "4px",
                          },
                          "&::-webkit-scrollbar-thumb": {
                            background: "rgba(212, 175, 55, 0.5)",
                            borderRadius: "4px",
                            "&:hover": {
                              background: "rgba(212, 175, 55, 0.7)",
                            },
                          },
                          scrollbarWidth: "thin",
                          scrollbarColor:
                            "rgba(212, 175, 55, 0.5) rgba(212, 175, 55, 0.1)",
                          msOverflowStyle: "auto",
                        }}
                      >
                        {allPhotos.map((item, idx) => {
                          // Render all photos
                          const existingCount =
                            user?.photos && Array.isArray(user.photos)
                              ? user.photos.length
                              : 0;
                          const displayIndex =
                            item.type === "existing"
                              ? item.index
                              : existingCount + item.index;

                          return (
                            <Box
                              key={
                                item.type === "existing"
                                  ? `photo-existing-${item.photo.path}-${item.index}`
                                  : `photo-preview-${item.index}`
                              }
                              sx={{
                                position: "relative",
                                flexShrink: 0,
                                // Square photos matching container height, arranged horizontally
                                width: "auto",
                                height: "100%",
                                minWidth: "auto",
                                maxWidth: "none",
                                aspectRatio: "1",
                                overflow: "hidden",
                                borderRadius: "8px",
                              }}
                            >
                              {item.type === "existing" ? (
                                <>
                                  <Box
                                    component="img"
                                    src={
                                      item.photo.path.startsWith("/uploads/")
                                        ? item.photo.path
                                        : `/uploads/${item.photo.path}`
                                    }
                                    alt={`Gallery photo ${item.index + 1}`}
                                    sx={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      opacity:
                                        item.photo.moderation_status !==
                                        "approved"
                                          ? 0.6
                                          : 1,
                                    }}
                                  />
                                  {isEditing && (
                                    <IconButton
                                      onClick={() =>
                                        handleRemoveGalleryPhoto(item.index)
                                      }
                                      sx={{
                                        position: "absolute",
                                        top: 8,
                                        left: 8,
                                        bgcolor: "rgba(244, 67, 54, 0.9)",
                                        color: "#fff",
                                        zIndex: 2,
                                        "&:hover": {
                                          bgcolor: "rgba(198, 40, 40, 0.9)",
                                        },
                                        width: 32,
                                        height: 32,
                                      }}
                                      size="small"
                                    >
                                      <Delete sx={{ fontSize: "1rem" }} />
                                    </IconButton>
                                  )}
                                  {item.photo.moderation_status ===
                                    "pending" && (
                                    <Box
                                      sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        bgcolor: "rgba(255, 193, 7, 0.9)",
                                        borderRadius: "50%",
                                        width: 24,
                                        height: 24,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        zIndex: 2,
                                      }}
                                    >
                                      <Pending sx={{ fontSize: "0.875rem" }} />
                                    </Box>
                                  )}
                                  {item.photo.moderation_status ===
                                    "rejected" && (
                                    <Box
                                      sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        bgcolor: "rgba(244, 67, 54, 0.9)",
                                        borderRadius: "50%",
                                        width: 24,
                                        height: 24,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        zIndex: 2,
                                      }}
                                    >
                                      <CancelIcon
                                        sx={{ fontSize: "0.875rem" }}
                                      />
                                    </Box>
                                  )}
                                </>
                              ) : (
                                <>
                                  <Box
                                    component="img"
                                    src={item.preview}
                                    alt={`New photo ${item.index + 1}`}
                                    sx={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                  {isEditing && (
                                    <IconButton
                                      onClick={() =>
                                        handleRemoveGalleryPhoto(displayIndex)
                                      }
                                      sx={{
                                        position: "absolute",
                                        top: 8,
                                        left: 8,
                                        bgcolor: "rgba(244, 67, 54, 0.9)",
                                        color: "#fff",
                                        zIndex: 2,
                                        "&:hover": {
                                          bgcolor: "rgba(198, 40, 40, 0.9)",
                                        },
                                        width: 32,
                                        height: 32,
                                      }}
                                      size="small"
                                    >
                                      <Delete sx={{ fontSize: "1rem" }} />
                                    </IconButton>
                                  )}
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      top: 8,
                                      left: isEditing ? 48 : 8, // Position next to delete button if editing
                                      bgcolor: "rgba(255, 193, 7, 0.9)",
                                      borderRadius: "4px",
                                      px: 1,
                                      py: 0.5,
                                      zIndex: 2,
                                    }}
                                  >
                                    <Chip
                                      icon={
                                        <Pending sx={{ fontSize: "0.75rem" }} />
                                      }
                                      label="Pending"
                                      size="small"
                                      sx={{
                                        height: 20,
                                        fontSize: "0.65rem",
                                        bgcolor: "transparent",
                                        color: "#1a1a1a",
                                      }}
                                    />
                                  </Box>
                                </>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  </>
                );
              })()}
            </Box>
          ) : (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                color: "rgba(26, 26, 26, 0.5)",
                minHeight: { xs: "300px", sm: "400px", md: "500px" },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                aspectRatio: "1",
                maxHeight: { xs: "300px", sm: "400px", md: "500px" },
                borderRadius: "12px",
                bgcolor: "rgba(212, 175, 55, 0.05)",
              }}
            >
              <PhotoCamera sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
              <Typography variant="body2">
                {isEditing
                  ? "No gallery photos yet. Click 'Add Photos' to get started."
                  : "No gallery photos yet."}
              </Typography>
            </Box>
          )}
          {galleryPhotos.length > 0 && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 2,
                color: "rgba(26, 26, 26, 0.6)",
                fontStyle: "italic",
                textAlign: "center",
              }}
            >
              {galleryPhotos.length} photo(s) will be uploaded and pending
              approval
            </Typography>
          )}
        </Card>

        {/* Verification Request Button - Only for Premium Categories */}
        {isPremiumCategory && !user?.isVerified && (
          <Box sx={{ mb: 2, textAlign: "center" }}>
            {verificationStatus === "pending" ? (
              <Chip
                icon={
                  <Pending
                    sx={{
                      fontSize: "1rem !important",
                      color: "#FF9800 !important",
                    }}
                  />
                }
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
                  icon={
                    <CancelIcon
                      sx={{
                        fontSize: "1rem !important",
                        color: "#F44336 !important",
                      }}
                    />
                  }
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
                  startIcon={
                    requestingVerification ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <HowToReg />
                    )
                  }
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
                startIcon={
                  requestingVerification ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <HowToReg />
                  )
                }
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
                {requestingVerification
                  ? "Requesting..."
                  : "Request Verification"}
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
                  sx={{
                    fontSize: 48,
                    color: "rgba(212, 175, 55, 0.5)",
                    mb: 1,
                  }}
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

        {/* Profile Views & Boost Section */}
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
                Profile Views
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#D4AF37",
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
              >
                {user?.profile_views || "0"}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(26, 26, 26, 0.6)",
                  fontWeight: 600,
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                }}
              >
                Boost Status
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#1a1a1a",
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
              >
                {loadingBoostStatus
                  ? "Checking boost status..."
                  : boostStatus?.status === "active" &&
                      boostStatus?.boost?.ends_at
                    ? `Active until ${new Date(
                        boostStatus.boost.ends_at
                      ).toLocaleString()}`
                    : "No active boost"}
              </Typography>
            </Box>
            <Alert
              severity="info"
              sx={{
                mt: 1,
                borderRadius: "10px",
                bgcolor: "rgba(212, 175, 55, 0.08)",
                border: "1px solid rgba(212, 175, 55, 0.2)",
                color: "rgba(26, 26, 26, 0.7)",
              }}
            >
              Manage your profile boosts directly from the dashboard.
            </Alert>
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
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={!isEditing}
              helperText={
                isEditing
                  ? "This is what members will see. Stick to letters, numbers, or underscores."
                  : ""
              }
              InputProps={{
                startAdornment: (
                  <Typography
                    component="span"
                    sx={{ mr: 1, color: "#D4AF37", fontWeight: 600 }}
                  >
                    @
                  </Typography>
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
              label="Year of Birth"
              name="birthYear"
              type="number"
              value={formData.birthYear}
              onChange={handleChange}
              disabled={!isEditing}
              inputProps={{
                min: 1900,
                max: new Date().getFullYear(),
              }}
              InputProps={{
                startAdornment: <Cake sx={{ mr: 1, color: "#D4AF37" }} />,
              }}
              helperText={
                formData.birthYear
                  ? birthYearAgePreview !== ""
                    ? `Calculated age: ${birthYearAgePreview}`
                    : "Enter a valid year between 1900 and the current year"
                  : ""
              }
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
              <InputLabel>County</InputLabel>
              <Select
                name="county"
                value={formData.county}
                onChange={handleChange}
                label="County"
                disabled={!isEditing}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.23)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(212, 175, 55, 0.5)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#D4AF37",
                  },
                }}
              >
                <MenuItem value="">Select County</MenuItem>
                <MenuItem value="Baringo">Baringo</MenuItem>
                <MenuItem value="Bomet">Bomet</MenuItem>
                <MenuItem value="Bungoma">Bungoma</MenuItem>
                <MenuItem value="Busia">Busia</MenuItem>
                <MenuItem value="Elgeyo-Marakwet">Elgeyo-Marakwet</MenuItem>
                <MenuItem value="Embu">Embu</MenuItem>
                <MenuItem value="Garissa">Garissa</MenuItem>
                <MenuItem value="Homa Bay">Homa Bay</MenuItem>
                <MenuItem value="Isiolo">Isiolo</MenuItem>
                <MenuItem value="Kajiado">Kajiado</MenuItem>
                <MenuItem value="Kakamega">Kakamega</MenuItem>
                <MenuItem value="Kericho">Kericho</MenuItem>
                <MenuItem value="Kiambu">Kiambu</MenuItem>
                <MenuItem value="Kilifi">Kilifi</MenuItem>
                <MenuItem value="Kirinyaga">Kirinyaga</MenuItem>
                <MenuItem value="Kisii">Kisii</MenuItem>
                <MenuItem value="Kisumu">Kisumu</MenuItem>
                <MenuItem value="Kitui">Kitui</MenuItem>
                <MenuItem value="Kwale">Kwale</MenuItem>
                <MenuItem value="Laikipia">Laikipia</MenuItem>
                <MenuItem value="Lamu">Lamu</MenuItem>
                <MenuItem value="Machakos">Machakos</MenuItem>
                <MenuItem value="Makueni">Makueni</MenuItem>
                <MenuItem value="Mandera">Mandera</MenuItem>
                <MenuItem value="Marsabit">Marsabit</MenuItem>
                <MenuItem value="Meru">Meru</MenuItem>
                <MenuItem value="Migori">Migori</MenuItem>
                <MenuItem value="Mombasa">Mombasa</MenuItem>
                <MenuItem value="Murang'a">Murang'a</MenuItem>
                <MenuItem value="Nairobi">Nairobi</MenuItem>
                <MenuItem value="Nakuru">Nakuru</MenuItem>
                <MenuItem value="Nandi">Nandi</MenuItem>
                <MenuItem value="Narok">Narok</MenuItem>
                <MenuItem value="Nyamira">Nyamira</MenuItem>
                <MenuItem value="Nyandarua">Nyandarua</MenuItem>
                <MenuItem value="Nyeri">Nyeri</MenuItem>
                <MenuItem value="Samburu">Samburu</MenuItem>
                <MenuItem value="Siaya">Siaya</MenuItem>
                <MenuItem value="Taita-Taveta">Taita-Taveta</MenuItem>
                <MenuItem value="Tana River">Tana River</MenuItem>
                <MenuItem value="Tharaka-Nithi">Tharaka-Nithi</MenuItem>
                <MenuItem value="Trans Nzoia">Trans Nzoia</MenuItem>
                <MenuItem value="Turkana">Turkana</MenuItem>
                <MenuItem value="Uasin Gishu">Uasin Gishu</MenuItem>
                <MenuItem value="Vihiga">Vihiga</MenuItem>
                <MenuItem value="Wajir">Wajir</MenuItem>
                <MenuItem value="West Pokot">West Pokot</MenuItem>
              </Select>
            </FormControl>
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
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "stretch", sm: "center" }}
                  sx={{ width: "100%" }}
                >
                  <Chip
                    size="small"
                    icon={
                      locationLoading ? (
                        <Pending sx={{ color: "#D4AF37 !important" }} />
                      ) : isLocationTracking ? (
                        <CheckCircle sx={{ color: "#2e7d32 !important" }} />
                      ) : (
                        <CancelIcon sx={{ color: "#b71c1c !important" }} />
                      )
                    }
                    label={
                      locationLoading
                        ? "Starting live tracking..."
                        : isLocationTracking
                          ? "Live tracking on"
                          : "Live tracking off"
                    }
                    sx={{
                      fontWeight: 600,
                      color: isLocationTracking ? "#2e7d32" : "#1a1a1a",
                      backgroundColor: isLocationTracking
                        ? "rgba(46, 125, 50, 0.15)"
                        : "rgba(212, 175, 55, 0.15)",
                      "& .MuiChip-icon": {
                        color: "inherit",
                      },
                    }}
                  />
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
                        width: { xs: "100%", sm: "auto" },
                        "&:hover": {
                          borderColor: "#D4AF37",
                          backgroundColor: "rgba(212, 175, 55, 0.1)",
                        },
                      }}
                    >
                      Refresh Location
                    </Button>
                  )}
                </Stack>
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
                <Box
                  sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}
                >
                  {user?.bio_moderation_status === "pending" && (
                    <Chip
                      icon={
                        <Pending sx={{ fontSize: "0.875rem !important" }} />
                      }
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
                      icon={
                        <CheckCircle
                          sx={{
                            fontSize: "0.875rem !important",
                            color: "#4CAF50 !important",
                          }}
                        />
                      }
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
                      icon={
                        <CancelIcon
                          sx={{
                            fontSize: "0.875rem !important",
                            color: "#F44336 !important",
                          }}
                        />
                      }
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
              {!isEditing &&
                user?.bio &&
                user?.bio_moderation_status === "pending" && (
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
                    Your bio is pending approval. It will be visible to others
                    once approved.
                  </Typography>
                )}
              {!isEditing &&
                user?.bio &&
                user?.bio_moderation_status === "rejected" && (
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
