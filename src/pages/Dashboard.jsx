import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
} from "@mui/material";
import { keyframes } from "@mui/system";
import Autocomplete, {
  createFilterOptions,
} from "@mui/material/Autocomplete";
import {
  Explore,
  Store,
  Store as StoreIcon,
  Star as StarIcon,
  WhatsApp as WhatsAppIcon,
  LocalOffer as TagIcon,
  Person,
  LocationOn,
  Cake,
  Verified,
  TrendingUp,
  AccessTime,
  Favorite,
  LockOpen,
  NotificationsActive,
  MyLocation,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import UserLists from "../components/UserLists/UserLists";
import {
  BOOST_PRICE_TOKENS,
  formatKshFromTokens,
  describeExchangeRate,
} from "../utils/pricing";
import { KENYA_COUNTIES, normalizeCountyName } from "../data/kenyaCounties";
import GeoTargetPicker from "../components/Boost/GeoTargetPicker";

const goldShine = keyframes`
  0% {
    opacity: 0.35;
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.45), 0 0 22px rgba(212, 175, 55, 0.35);
  }
  50% {
    opacity: 0.9;
    box-shadow: 0 0 26px rgba(255, 215, 0, 0.9), 0 0 46px rgba(212, 175, 55, 0.65);
  }
  100% {
    opacity: 0.35;
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.45), 0 0 22px rgba(212, 175, 55, 0.35);
  }
`;

const BOOST_CATEGORIES = ["Regular", "Sugar Mummy", "Sponsor", "Ben 10"];
const MIN_BOOST_HOURS = 1;
const MAX_BOOST_HOURS = 6;
const DEFAULT_BOOST_RADIUS_KM = 10;
const MIN_BOOST_RADIUS_KM = 1;
const MAX_BOOST_RADIUS_KM = 200;

const normalizeSearchText = (value) =>
  (value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const parseNumericValue = (value) => {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

export default function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(false);
  const [featuredUsers, setFeaturedUsers] = useState([]);
  const [loadingFeaturedUsers, setLoadingFeaturedUsers] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState({}); // Track current image index for each user
  const [currentItemImageIndex, setCurrentItemImageIndex] = useState({}); // Track current image index for each featured item
  const [userListsTab, setUserListsTab] = useState("favorites");
  const [boostDialogOpen, setBoostDialogOpen] = useState(false);
  const [boosting, setBoosting] = useState(false);
  const [boostTimeRemaining, setBoostTimeRemaining] = useState(null);
  const [boostCategory, setBoostCategory] = useState(
    user?.category || "Regular"
  );
  const [boostArea, setBoostArea] = useState(
    normalizeCountyName(user?.county) || ""
  );
  const [boostHours, setBoostHours] = useState(MIN_BOOST_HOURS);
  const sanitizedBoostHours = Math.min(
    MAX_BOOST_HOURS,
    Math.max(MIN_BOOST_HOURS, Math.floor(Number(boostHours) || MIN_BOOST_HOURS))
  );
  const totalBoostTokens = sanitizedBoostHours * BOOST_PRICE_TOKENS;
  const [targetedBoosts, setTargetedBoosts] = useState([]);
  const [loadingTargetedBoosts, setLoadingTargetedBoosts] = useState(false);
  const [targetedDialogOpen, setTargetedDialogOpen] = useState(false);
  const targetedCount = targetedBoosts.length;
  const [boostLatitude, setBoostLatitude] = useState(null);
  const [boostLongitude, setBoostLongitude] = useState(null);
  const [viewerLatitude, setViewerLatitude] = useState(
    parseNumericValue(user?.latitude)
  );
  const [viewerLongitude, setViewerLongitude] = useState(
    parseNumericValue(user?.longitude)
  );
  const [boostRadiusKm, setBoostRadiusKm] = useState(DEFAULT_BOOST_RADIUS_KM);
  const [locatingBoost, setLocatingBoost] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [targetedBoostsError, setTargetedBoostsError] = useState(null);
  const locationRequestedRef = React.useRef(false);
  const sanitizedBoostRadiusKm = Math.min(
    MAX_BOOST_RADIUS_KM,
    Math.max(
      MIN_BOOST_RADIUS_KM,
      Number.parseFloat(boostRadiusKm) || DEFAULT_BOOST_RADIUS_KM
    )
  );
  const targetedTooltip = loadingTargetedBoosts
    ? "Checking for matching boosts..."
    : targetedBoostsError
      ? targetedBoostsError
      : targetedCount > 0
        ? `${targetedCount} boost match${targetedCount > 1 ? "es" : ""}`
        : "No targeted boosts yet";

  const handleOpenTargetedDialog = () => setTargetedDialogOpen(true);
  const handleCloseTargetedDialog = () => setTargetedDialogOpen(false);

  const programmaticBoostCloseRef = React.useRef(false);

  const requestCurrentLocation = useCallback(
    ({ applyToBoost = false, onComplete } = {}) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        setLocationError(
          "Geolocation is not supported by this device or browser."
        );
        if (onComplete) onComplete(false);
        return;
      }

      setLocatingBoost(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocatingBoost(false);
          setLocationError("");
          setViewerLatitude(latitude);
          setViewerLongitude(longitude);
          if (applyToBoost) {
            setBoostLatitude(latitude);
            setBoostLongitude(longitude);
          }
          if (onComplete) onComplete(true);
        },
        (error) => {
          setLocatingBoost(false);
          setLocationError(
            error?.message || "Unable to fetch your current location."
          );
          if (onComplete) onComplete(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    },
    []
  );

  const resetBoostForm = useCallback(() => {
    setBoostCategory(user?.category || "Regular");
    setBoostArea(normalizeCountyName(user?.county) || "");
    setBoostHours(MIN_BOOST_HOURS);
    setBoostRadiusKm(DEFAULT_BOOST_RADIUS_KM);
    setLocationError("");
  }, [
    user?.category,
    user?.county,
    user?.latitude,
    user?.longitude,
  ]);

  const openBoostDialog = useCallback(
    (shouldReset = true) => {
      if (shouldReset) {
        resetBoostForm();
      }
      programmaticBoostCloseRef.current = false;
      setBoostDialogOpen(true);
    },
    [resetBoostForm]
  );

  useEffect(() => {
    if (!locationRequestedRef.current) {
      locationRequestedRef.current = true;
      requestCurrentLocation({ applyToBoost: false });
    }
  }, [requestCurrentLocation]);

  useEffect(() => {
    const latFromProfile = parseNumericValue(user?.latitude);
    const lngFromProfile = parseNumericValue(user?.longitude);
    if (latFromProfile !== null && lngFromProfile !== null) {
      setViewerLatitude(latFromProfile);
      setViewerLongitude(lngFromProfile);
    }
  }, [user?.latitude, user?.longitude]);

  const handleCloseBoostDialog = useCallback(() => {
    programmaticBoostCloseRef.current = false;
    setBoostDialogOpen(false);
    resetBoostForm();
  }, [resetBoostForm]);

  const favoritesSectionRef = React.useRef(null);

  // Fetch featured market items and users
  useEffect(() => {
    fetchFeaturedItems();
    fetchFeaturedUsers();
  }, []);

  // Auto-transition images for each featured user
  useEffect(() => {
    if (featuredUsers.length === 0) return;

    const intervals = {};
    // Reset all image indices when users change
    const newIndices = {};

    featuredUsers.forEach((userData) => {
      const images = getAllImages(userData);
      const userId = userData.id;

      // Preload all images for smooth transitions
      images.forEach((imageSrc) => {
        const img = new Image();
        img.src = imageSrc;
      });

      // Always reset to 0 for new users
      newIndices[userId] = 0;

      if (images.length > 1) {
        const imageCount = images.length;

        // Set up interval for this user
        intervals[userId] = setInterval(() => {
          setCurrentImageIndex((prev) => {
            const currentIdx = prev[userId] || 0;
            const nextIdx = (currentIdx + 1) % imageCount;
            return { ...prev, [userId]: nextIdx };
          });
        }, 3000); // Change image every 3 seconds
      }
    });

    // Set all indices to 0
    setCurrentImageIndex(newIndices);

    // Cleanup intervals on unmount or when users change
    return () => {
      Object.values(intervals).forEach((interval) => clearInterval(interval));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featuredUsers]);

  // Auto-transition images for each featured market item
  useEffect(() => {
    if (featuredItems.length === 0) return;

    const intervals = {};
    const newIndices = {};

    featuredItems.forEach((item) => {
      const images = item.images || [];
      const itemId = item.id;

      // Preload all images for smooth transitions
      images.forEach((imagePath) => {
        const img = new Image();
        img.src = getImageUrl(imagePath);
      });

      // Always reset to 0 for new items
      newIndices[itemId] = 0;

      if (images.length > 1) {
        const imageCount = images.length;

        // Set up interval for this item
        intervals[itemId] = setInterval(() => {
          setCurrentItemImageIndex((prev) => {
            const currentIdx = prev[itemId] || 0;
            const nextIdx = (currentIdx + 1) % imageCount;
            return { ...prev, [itemId]: nextIdx };
          });
        }, 3000); // Change image every 3 seconds
      }
    });

    // Set all indices to 0
    setCurrentItemImageIndex(newIndices);

    // Cleanup intervals on unmount or when items change
    return () => {
      Object.values(intervals).forEach((interval) => clearInterval(interval));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featuredItems]);

  useEffect(() => {
    const boostUntilValue =
      user?.active_boost_until || user?.is_featured_until || null;

    if (!boostUntilValue) {
      setBoostTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date();
      const until = new Date(boostUntilValue);
      const diff = until.getTime() - now.getTime();

      if (Number.isNaN(diff) || diff <= 0) {
        setBoostTimeRemaining(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setBoostTimeRemaining({ hours, minutes });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [user?.active_boost_until, user?.is_featured_until]);

  useEffect(() => {
    resetBoostForm();
  }, [resetBoostForm]);

  const fetchFeaturedItems = async () => {
    try {
      setLoadingFeatured(true);
      const response = await fetch("/api/market");
      const data = await response.json();

      if (data.success) {
        // Filter and get only featured items, limit to 6
        const featured = (data.data || [])
          .filter((item) => item.is_featured)
          .slice(0, 6);
        setFeaturedItems(featured);
      }
    } catch (err) {
      console.error("Error fetching featured items:", err);
    } finally {
      setLoadingFeatured(false);
    }
  };

  const fetchFeaturedUsers = async () => {
    try {
      setLoadingFeaturedUsers(true);
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/public/featured/boosts?limit=12", {
        headers,
      });
      const data = await response.json();

      if (data.success) {
        setFeaturedUsers(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching featured users:", err);
    } finally {
      setLoadingFeaturedUsers(false);
    }
  };

  const handleConfirmBoost = async () => {
    if (!boostCategory) {
      Swal.fire({
        icon: "warning",
        title: "Select Category",
        text: "Choose the audience category you want to reach before boosting.",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    const targetCounty = normalizeCountyName(boostArea);
    if (!targetCounty) {
      Swal.fire({
        icon: "warning",
        title: "Select a County",
        text: "Choose one of the 47 Kenyan counties to target before boosting.",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    if (boostLatitude === null || boostLongitude === null) {
      Swal.fire({
        icon: "warning",
        title: "Set Target Location",
        text: "Allow location access or choose a location on the map before boosting.",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    if (!Number.isFinite(sanitizedBoostRadiusKm)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Radius",
        text: "Provide a radius between 1 km and 200 km for your boost.",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    const hours = Math.min(
      MAX_BOOST_HOURS,
      Math.max(
        MIN_BOOST_HOURS,
        Math.floor(Number(boostHours) || MIN_BOOST_HOURS)
      )
    );
    const totalTokens = hours * BOOST_PRICE_TOKENS;

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Authentication Required",
        text: "Please login to boost your profile.",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    try {
      const balanceRes = await fetch("/api/tokens/balance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const balanceData = await balanceRes.json();
      const currentBalance = Number(balanceData.data?.balance || 0);

      if (!balanceData.success) {
        throw new Error(balanceData.message || "Failed to fetch balance");
      }

      if (currentBalance < totalTokens) {
        Swal.fire({
          icon: "warning",
          title: "Insufficient Tokens",
          html: `<p>You need ${totalTokens} tokens (${formatKshFromTokens(totalTokens)}) to boost for ${hours} hour${
            hours > 1 ? "s" : ""
          }.</p><p>Your balance: ${currentBalance.toFixed(2)} tokens</p>`,
          confirmButtonText: "Buy Tokens",
          cancelButtonText: "Cancel",
          showCancelButton: true,
          confirmButtonColor: "#D4AF37",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/wallet");
          }
        });
        return;
      }

      programmaticBoostCloseRef.current = true;
      setBoostDialogOpen(false);

      const confirmation = await Swal.fire({
        icon: "question",
        title: "Confirm Profile Boost",
        html: `
          <div style="font-size: 0.9rem; line-height: 1.35; text-align: left;">
            <p style="margin: 0 0 6px 0;"><strong>Targeting:</strong> ${boostCategory} audience in <strong>${targetCounty}</strong>.</p>
            <p style="margin: 0 0 6px 0;"><strong>Duration:</strong> ${hours} hour${hours > 1 ? "s" : ""}</p>
            <p style="margin: 0 0 6px 0;"><strong>Radius:</strong> ${sanitizedBoostRadiusKm.toFixed(1)} km</p>
            <p style="margin: 0 0 10px 0;"><strong>Cost:</strong> ${totalTokens} tokens (${formatKshFromTokens(totalTokens)})</p>
            <p style="font-size: 0.82rem; color: #555; margin: 0;">Each hour costs ${BOOST_PRICE_TOKENS} tokens (${formatKshFromTokens(BOOST_PRICE_TOKENS)}).</p>
          </div>
        `,
        width: 420,
        showCancelButton: true,
        confirmButtonText: "Boost Now",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#D4AF37",
        cancelButtonColor: "#9E9E9E",
      });

      if (!confirmation.isConfirmed) {
        openBoostDialog(false);
        return;
      }

      setBoosting(true);

      let lastBoost = null;
      for (let i = 0; i < hours; i += 1) {
        const response = await fetch("/api/tokens/boost", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            targetCategory: boostCategory,
            targetArea: targetCounty,
            targetLatitude: boostLatitude,
            targetLongitude: boostLongitude,
            targetRadiusKm: sanitizedBoostRadiusKm,
          }),
        });

        const data = await response.json();

        if (response.status === 402) {
          Swal.fire({
            icon: "warning",
            title: "Insufficient Tokens",
            text:
              data.message || "You do not have enough tokens for this boost.",
            confirmButtonColor: "#D4AF37",
          });
          return;
        }

        if (!data.success) {
          throw new Error(data.message || "Failed to boost profile");
        }

        lastBoost = data.data;
      }

      if (!lastBoost) {
        throw new Error("Boost failed. Please try again.");
      }

      const meResponse = await fetch("/api/public/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const meData = await meResponse.json();
      if (meData.success && typeof setUser === "function") {
        setUser(meData.data);
      } else if (typeof setUser === "function") {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                active_boost_until:
                  lastBoost.boost?.ends_at || prev.active_boost_until,
              }
            : prev
        );
      }

      if (lastBoost.boost?.ends_at) {
        const until = new Date(lastBoost.boost.ends_at);
        const now = new Date();
        const diff = until.getTime() - now.getTime();
        if (!Number.isNaN(diff) && diff > 0) {
          const hoursRemaining = Math.floor(diff / (1000 * 60 * 60));
          const minutesRemaining = Math.floor(
            (diff % (1000 * 60 * 60)) / (1000 * 60)
          );
          setBoostTimeRemaining({
            hours: hoursRemaining,
            minutes: minutesRemaining,
          });
        } else {
          setBoostTimeRemaining(null);
        }
      } else {
        setBoostTimeRemaining(null);
      }

      Swal.fire({
        icon: "success",
        title: "Profile Boosted!",
        html: `
          <p>Your profile will be boosted for <strong>${hours} hour${hours > 1 ? "s" : ""}</strong>.</p>
          <p style="font-size: 0.9rem; color: rgba(26, 26, 26, 0.7);">Boost expires: ${
            lastBoost.boost?.ends_at
              ? new Date(lastBoost.boost.ends_at).toLocaleString()
              : "Soon"
          }</p>
        `,
        confirmButtonColor: "#D4AF37",
      });

      programmaticBoostCloseRef.current = false;
      setBoostDialogOpen(false);
      resetBoostForm();
      fetchFeaturedUsers();
      fetchFeaturedItems();
      fetchTargetedBoosts();
    } catch (err) {
      console.error("Boost profile error:", err);
      openBoostDialog(false);
      Swal.fire({
        icon: "error",
        title: "Boost Failed",
        text: err.message || "Failed to boost profile. Please try again later.",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setBoosting(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return imagePath;
    return `/uploads/${imagePath}`;
  };

  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
    if (imageUrl.startsWith("/uploads/")) return imageUrl;
    if (imageUrl.startsWith("profiles/")) return `/uploads/${imageUrl}`;
    return imageUrl;
  };

  // Get all images for a user (main photo + photos array)
  const getAllImages = (userData) => {
    const images = [];
    // Add main photo if it exists (only approved)
    if (userData.photo && userData.photo_moderation_status === "approved") {
      images.push(buildImageUrl(userData.photo));
    }
    // Add photos from array if they exist (only approved photos)
    if (userData.photos && Array.isArray(userData.photos)) {
      userData.photos.forEach((photo) => {
        if (photo.path && photo.moderation_status === "approved") {
          images.push(buildImageUrl(photo.path));
        }
      });
    }
    return images;
  };

  const handleWhatsAppClick = (item) => {
    const phoneNumber = item.whatsapp_number || "";
    const cleanedNumber = phoneNumber.replace(/[^0-9+]/g, "");
    const message = encodeURIComponent(
      `Hi! I'm interested in ${item.title} (KES ${parseFloat(item.price).toLocaleString()}). Can you provide more details?`
    );

    if (cleanedNumber) {
      const whatsappUrl = `https://wa.me/${cleanedNumber}?text=${message}`;
      window.open(whatsappUrl, "_blank");
    } else {
      Swal.fire({
        icon: "warning",
        title: "No WhatsApp Number",
        text: "This item doesn't have a WhatsApp contact. Please contact support.",
        confirmButtonColor: "#D4AF37",
      });
    }
  };

  const handleViewMarket = () => {
    navigate("/market");
  };

  const handleScrollToUserLists = (tab) => {
    setUserListsTab(tab);
    if (favoritesSectionRef.current) {
      favoritesSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const fetchTargetedBoosts = useCallback(async () => {
    if (!user?.category) {
      setTargetedBoosts([]);
      setTargetedBoostsError(
        "Set your category to see boosts targeting you."
      );
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setTargetedBoosts([]);
      setTargetedBoostsError("Login to view boosts targeting you.");
      return;
    }

    const latForQuery =
      viewerLatitude ?? parseNumericValue(user?.latitude) ?? null;
    const lngForQuery =
      viewerLongitude ?? parseNumericValue(user?.longitude) ?? null;

    if (latForQuery === null || lngForQuery === null) {
      setTargetedBoosts([]);
      setTargetedBoostsError(
        "Enable location services to see boosts targeting your current area."
      );
      return;
    }

    setLoadingTargetedBoosts(true);
    setTargetedBoostsError(null);
    try {
      const params = new URLSearchParams();
      params.set("category", user.category);
      params.set("lat", latForQuery);
      params.set("lng", lngForQuery);

      const response = await fetch(
        `/api/public/boosts/targeted?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setTargetedBoosts(data.data?.matches || []);
        setTargetedBoostsError(null);
      } else {
        setTargetedBoosts([]);
        setTargetedBoostsError(
          data.message || "Unable to load boosts targeting you right now."
        );
      }
    } catch (err) {
      console.error("Error fetching targeted boosts:", err);
      setTargetedBoosts([]);
      setTargetedBoostsError(
        "We couldn't refresh boosts for your location. Please try again."
      );
    } finally {
      setLoadingTargetedBoosts(false);
    }
  }, [user?.category, user?.latitude, user?.longitude, viewerLatitude, viewerLongitude]);

  useEffect(() => {
    fetchTargetedBoosts();
  }, [fetchTargetedBoosts]);

  const handleRefreshTargetedBoosts = () => {
    requestCurrentLocation({
      applyToBoost: false,
      onComplete: () => {
        fetchTargetedBoosts();
      },
    });
  };

  return (
    <Box>
      {/* Welcome Section */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: { xs: 1, sm: 0.5 },
              fontSize: { xs: "1.6rem", sm: "2rem", md: "2.2rem", lg: "2.4rem" },
              whiteSpace: { xs: "normal", md: "nowrap" },
              overflow: "hidden",
              textOverflow: "ellipsis",
              background: "linear-gradient(45deg, #D4AF37, #B8941F)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Welcome back, {user?.name || "User"}!
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(26, 26, 26, 0.7)",
              fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" },
              whiteSpace: { xs: "normal", lg: "nowrap" },
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Discover, connect, and explore the TuVibe community
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: "100%",
            justifyContent: { xs: "space-between", sm: "flex-end" },
          }}
        >
          <Button
            sx={{
              position: "relative",
              borderRadius: "999px",
              padding: { xs: "10px 20px", sm: "12px 36px" },
              background:
                "linear-gradient(135deg, rgba(255, 220, 128, 1), rgba(212, 175, 55, 1))",
              color: "#1a1a1a",
              fontWeight: 700,
              textTransform: "none",
              letterSpacing: "0.5px",
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              transition: "all 0.3s ease",
              boxShadow: `
                0 18px 28px rgba(212, 175, 55, 0.45),
                0 12px 20px rgba(0, 0, 0, 0.12)
                `,
              border: "1px solid rgba(212, 175, 55, 0.4)",
              minWidth: { xs: "auto", sm: "unset" },
              flexShrink: 0,
              "&::before": {
                content: '""',
                position: "absolute",
                inset: { xs: "-6px", sm: "-8px", md: "-10px" },
                borderRadius: "999px",
                border: "1px solid rgba(212, 175, 55, 0.35)",
                boxShadow: `
                  0 0 16px rgba(212, 175, 55, 0.4),
                  0 0 40px rgba(255, 215, 0, 0.35)
                `,
                opacity: 0,
                transition: "opacity 0.4s ease",
              },
              "&:hover": {
                background:
                  "linear-gradient(135deg, rgba(255, 230, 80, 1), rgba(212, 175, 55, 1))",
                boxShadow: `
                  0 18px 32px rgba(212, 175, 55, 0.45),
                  0 0 18px rgba(255, 215, 0, 0.75)
                `,
                transform: "translateY(-2px)",
                "&::before": {
                  opacity: 0.8,
                },
              },
              "&:active": {
                transform: "translateY(0)",
                boxShadow: `
                  0 10px 20px rgba(212, 175, 55, 0.35),
                  0 0 12px rgba(255, 215, 0, 0.6)
                `,
              },
              "&::after": {
                content: '""',
                position: "absolute",
                inset: { xs: "-12px", sm: "-10px", md: "-12px" },
                borderRadius: "999px",
                border: "2px solid rgba(255, 215, 0, 0.6)",
                boxShadow: "0 0 18px rgba(255, 215, 0, 0.55)",
                opacity: 0.5,
                animation: `${goldShine} 3.2s ease-in-out infinite`,
                pointerEvents: "none",
                zIndex: -1,
              },
            }}
            onClick={() => openBoostDialog(true)}
            disabled={boosting}
          >
            Boost Profile
          </Button>
          <Tooltip title={targetedTooltip} arrow>
            <span>
              <IconButton
                onClick={handleOpenTargetedDialog}
                disabled={loadingTargetedBoosts || targetedCount === 0}
                sx={{
                  backgroundColor: "rgba(212, 175, 55, 0.12)",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  "&:hover": {
                    backgroundColor: "rgba(212, 175, 55, 0.22)",
                  },
                  flexShrink: 0,
                }}
              >
                <Badge
                  badgeContent={targetedCount}
                  color="error"
                  overlap="circular"
                >
                  <NotificationsActive sx={{ color: "#D4AF37" }} />
                </Badge>
              </IconButton>
            </span>
          </Tooltip>
        </Box>
        {boostTimeRemaining ? (
          <Typography
            variant="caption"
            sx={{
              color: "rgba(26, 26, 26, 0.7)",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <AccessTime sx={{ fontSize: 16, color: "#D4AF37" }} />
            Active boost: {boostTimeRemaining.hours}h{" "}
            {boostTimeRemaining.minutes}m remaining
          </Typography>
        ) : null}
      </Box>

      {/* Quick Access Cards */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 4,
          flexWrap: "nowrap",
          justifyContent: "space-between",
          alignItems: "stretch",
          width: "100%",
        }}
      >
        <Card
          onClick={() => handleScrollToUserLists("favorites")}
          sx={{
            flex: "1 1 0%",
            minWidth: { xs: 160, sm: 220, md: 260 },
            p: { xs: 1.5, sm: 2 },
            borderRadius: "16px",
            textTransform: "none",
            cursor: "pointer",
            position: "relative",
            color: "rgba(0, 0, 0, 0.9)",
            border: "2px solid rgba(255, 255, 255, 0.5)",
            fontWeight: 700,
            letterSpacing: "0.5px",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            backgroundColor: "rgba(255, 255, 255, 0.3)",
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
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: { xs: 1.25, sm: 1.5, md: 2 },
            }}
          >
            <Favorite
              sx={{
                fontSize: { xs: "1.35rem", sm: "1.55rem", md: "1.75rem" },
                color: "#ff6b9d",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "0.85rem", sm: "0.98rem", md: "1.1rem" },
                textAlign: "center",
              }}
            >
              Meet Your Favorites
            </Typography>
          </Box>
        </Card>

        <Card
          onClick={() => handleScrollToUserLists("unlocked")}
          sx={{
            flex: "1 1 0%",
            minWidth: { xs: 160, sm: 220, md: 260 },
            p: { xs: 1.5, sm: 2 },
            borderRadius: "16px",
            textTransform: "none",
            cursor: "pointer",
            position: "relative",
            color: "rgba(0, 0, 0, 0.9)",
            border: "2px solid rgba(255, 255, 255, 0.5)",
            fontWeight: 700,
            letterSpacing: "0.5px",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            backgroundColor: "rgba(255, 255, 255, 0.3)",
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
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: { xs: 1.25, sm: 1.5, md: 2 },
            }}
          >
            <LockOpen
              sx={{
                fontSize: { xs: "1.35rem", sm: "1.55rem", md: "1.75rem" },
                color: "#D4AF37",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "0.85rem", sm: "0.98rem", md: "1.1rem" },
                textAlign: "center",
              }}
            >
              View Unlocked Chats
            </Typography>
          </Box>
        </Card>
      </Box>

      {/* Featured Users Carousel */}
      <Card
        sx={{
          p: 4,
          mb: 4,
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
            mb: 3,
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
            }}
          >
            <TrendingUp sx={{ color: "#D4AF37" }} />
            Featured Profiles
          </Typography>
          <Button
            variant="text"
            onClick={() => navigate("/explore")}
            sx={{
              color: "#D4AF37",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(212, 175, 55, 0.1)",
              },
            }}
          >
            View All
          </Button>
        </Box>
        {loadingFeaturedUsers ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: "#D4AF37" }} />
          </Box>
        ) : featuredUsers.length > 0 ? (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
              flexWrap: "wrap",
            }}
          >
            {featuredUsers.slice(0, 10).map((featuredUser) => {
              const images = getAllImages(featuredUser);
              const currentIdx = currentImageIndex[featuredUser.id] || 0;
              const featuredBoostUntil =
                featuredUser.active_boost_until ??
                featuredUser.is_featured_until;

              return (
                <Card
                  key={featuredUser.id}
                  sx={{
                    flex: {
                      xs: "0 0 100%",
                      sm: "0 0 calc(50% - 8px)",
                      md: "0 0 calc(20% - 16px)",
                    },
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "12px",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(212, 175, 55, 0.3)",
                    },
                  }}
                  onClick={() => navigate(`/explore`)}
                >
                  {images.length > 0 ? (
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: 200,
                        overflow: "hidden",
                        bgcolor: "rgba(212, 175, 55, 0.1)",
                      }}
                    >
                      {images.map((image, index) => (
                        <Box
                          key={`featured-${featuredUser.id}-img-${index}`}
                          component="img"
                          src={image}
                          alt={featuredUser.name}
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            opacity: currentIdx === index ? 1 : 0,
                            transition: "opacity 1.5s ease-in-out",
                            zIndex: currentIdx === index ? 1 : 0,
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "rgba(212, 175, 55, 0.1)",
                      }}
                    >
                      <Person
                        sx={{ fontSize: 64, color: "#D4AF37", opacity: 0.3 }}
                      />
                    </Box>
                  )}
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: "#1a1a1a",
                          fontSize: "0.9rem",
                        }}
                      >
                        {featuredUser.name}
                      </Typography>
                      {featuredUser.isVerified && (
                        <Verified sx={{ fontSize: 16, color: "#D4AF37" }} />
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 0.5,
                      }}
                    >
                      <LocationOn
                        sx={{ fontSize: 12, color: "rgba(26, 26, 26, 0.6)" }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(26, 26, 26, 0.7)" }}
                      >
                        {featuredUser.county}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Cake
                        sx={{ fontSize: 12, color: "rgba(26, 26, 26, 0.6)" }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(26, 26, 26, 0.7)" }}
                      >
                        {featuredUser.age} years
                      </Typography>
                    </Box>
                    {featuredBoostUntil &&
                      new Date(featuredBoostUntil) > new Date() && (
                        <Chip
                          label="Boosted"
                          size="small"
                          sx={{
                            mt: 1,
                            bgcolor: "#D4AF37",
                            color: "#1a1a1a",
                            fontWeight: 600,
                            fontSize: "0.65rem",
                            height: 20,
                          }}
                          icon={
                            <TrendingUp
                              sx={{ fontSize: 12, color: "#1a1a1a" }}
                            />
                          }
                        />
                      )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              px: 2,
            }}
          >
            <Person
              sx={{ fontSize: 64, color: "#D4AF37", opacity: 0.3, mb: 2 }}
            />
            <Typography variant="h6" sx={{ color: "#666", mb: 1 }}>
              No featured profiles yet
            </Typography>
            <Typography variant="body2" sx={{ color: "#999" }}>
              Boost your profile to appear here!
            </Typography>
          </Box>
        )}
      </Card>

      {/* Featured Items Carousel */}
      <Card
        sx={{
          p: 4,
          mb: 4,
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
            mb: 3,
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
            }}
          >
            <StarIcon sx={{ color: "#FFD700" }} />
            Featured Items
          </Typography>
          <Button
            variant="text"
            onClick={handleViewMarket}
            sx={{
              color: "#D4AF37",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(212, 175, 55, 0.1)",
              },
            }}
          >
            View All
          </Button>
        </Box>
        {loadingFeatured ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: "#D4AF37" }} />
          </Box>
        ) : featuredItems.length > 0 ? (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
              flexWrap: "wrap",
            }}
          >
            {featuredItems.map((item) => (
              <Card
                key={item.id}
                sx={{
                  flex: {
                    xs: "0 0 100%",
                    sm: "0 0 calc(50% - 8px)",
                    md: "0 0 calc(33.333% - 14px)",
                  },
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "12px",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(212, 175, 55, 0.3)",
                  },
                }}
              >
                {item.images && item.images.length > 0 ? (
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: 180,
                      overflow: "hidden",
                    }}
                  >
                    {item.images.map((imagePath, index) => {
                      const currentIdx = currentItemImageIndex[item.id] || 0;
                      return (
                        <Box
                          key={`${item.id}-img-${index}`}
                          component="img"
                          src={getImageUrl(imagePath)}
                          alt={item.title}
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            opacity: currentIdx === index ? 1 : 0,
                            transition: "opacity 1.5s ease-in-out",
                            zIndex: currentIdx === index ? 1 : 0,
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      );
                    })}
                    {item.images.length > 1 && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                          color: "white",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          zIndex: 2,
                        }}
                      >
                        +{item.images.length - 1} more
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: 180,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "rgba(212, 175, 55, 0.1)",
                    }}
                  >
                    <StoreIcon
                      sx={{ fontSize: 48, color: "#D4AF37", opacity: 0.3 }}
                    />
                  </Box>
                )}
                {item.tag !== "none" && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      zIndex: 3,
                    }}
                  >
                    <Chip
                      label={item.tag === "hot_deals" ? "🔥 Hot" : "⭐ Weekend"}
                      size="small"
                      sx={{
                        bgcolor:
                          item.tag === "hot_deals"
                            ? "rgba(255, 107, 107, 0.95)"
                            : "rgba(78, 205, 196, 0.95)",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "0.65rem",
                      }}
                    />
                  </Box>
                )}
                <CardContent
                  sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: "#1a1a1a",
                      mb: 1,
                      fontSize: "0.95rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#D4AF37",
                      mb: 2,
                    }}
                  >
                    KES {parseFloat(item.price).toLocaleString()}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<WhatsAppIcon />}
                    onClick={() => handleWhatsAppClick(item)}
                    sx={{
                      background: "linear-gradient(135deg, #25D366, #128C7E)",
                      color: "white",
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: "8px",
                      "&:hover": {
                        background: "linear-gradient(135deg, #128C7E, #25D366)",
                      },
                    }}
                  >
                    Contact
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              px: 2,
            }}
          >
            <StoreIcon
              sx={{ fontSize: 64, color: "#D4AF37", opacity: 0.3, mb: 2 }}
            />
            <Typography variant="h6" sx={{ color: "#666", mb: 1 }}>
              No featured items yet
            </Typography>
            <Typography variant="body2" sx={{ color: "#999", mb: 3 }}>
              Check back soon for exciting featured marketplace items!
            </Typography>
            <Button
              variant="contained"
              onClick={handleViewMarket}
              sx={{
                background: "linear-gradient(135deg, #D4AF37, #B8941F)",
                color: "#1a1a1a",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "12px",
                px: 3,
                "&:hover": {
                  background: "linear-gradient(135deg, #B8941F, #D4AF37)",
                },
              }}
            >
              Browse All Items
            </Button>
          </Box>
        )}
      </Card>

      {/* Favorites and Unlocked Chats */}
      <Box ref={favoritesSectionRef}>
        <UserLists
          key={userListsTab}
          user={user}
          showTabs={true}
          defaultTab={userListsTab}
        />
      </Box>

      <Dialog
        open={boostDialogOpen}
        onClose={(_, _reason) => {
          if (!boosting) {
            if (programmaticBoostCloseRef.current) {
              programmaticBoostCloseRef.current = false;
              setBoostDialogOpen(false);
              return;
            }
            handleCloseBoostDialog();
          }
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            boxShadow: "0 20px 60px rgba(212, 175, 55, 0.25)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(45deg, #D4AF37, #B8941F)",
            color: "#1a1a1a",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1,
            py: 2,
          }}
        >
          <TrendingUp />
          {boostTimeRemaining ? "Extend Profile Boost" : "Boost Your Profile"}
        </DialogTitle>
        <DialogContent
          sx={{
            pt: 3,
            pb: 0,
            display: "flex",
            flexDirection: "column",
            maxHeight: { xs: "calc(100vh - 160px)", sm: "calc(100vh - 200px)" },
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              pr: 0.5,
              pb: 3,
            }}
          >
            <Alert
              severity="info"
              sx={{
                mb: 3,
                borderRadius: "12px",
                bgcolor: "rgba(212, 175, 55, 0.1)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 1, color: "#1a1a1a" }}
              >
                Why Boost Your Profile?
              </Typography>
              <Box
                component="ul"
                sx={{ m: 0, pl: 2.5, "& li": { mb: 1, fontSize: "0.875rem" } }}
              >
                <li>
                  <strong>Higher Visibility:</strong> Boosted profiles appear
                  first in Explore and featured sections.
                </li>
                <li>
                  <strong>Targeted Audience:</strong> Pick who should see you
                  and where they are logging in from.
                </li>
                <li>
                  <strong>Affordable:</strong> Each hour costs {BOOST_PRICE_TOKENS} tokens (
                  {formatKshFromTokens(BOOST_PRICE_TOKENS)}) — {describeExchangeRate()}.
                </li>
              </Box>
            </Alert>

            <Stack spacing={2.5}>
              <FormControl fullWidth>
                <InputLabel id="boost-category-label">Target category</InputLabel>
                <Select
                  labelId="boost-category-label"
                  value={boostCategory}
                  label="Target category"
                  onChange={(event) => setBoostCategory(event.target.value)}
                  disabled={boosting}
                >
                  {BOOST_CATEGORIES.map((categoryOption) => (
                    <MenuItem key={categoryOption} value={categoryOption}>
                      {categoryOption}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Hours to boost"
                type="number"
                value={boostHours}
                onChange={(event) => setBoostHours(event.target.value)}
                inputProps={{
                  min: MIN_BOOST_HOURS,
                  max: MAX_BOOST_HOURS,
                }}
                helperText={`Choose between ${MIN_BOOST_HOURS} and ${MAX_BOOST_HOURS} hours per boost.`}
                fullWidth
                disabled={boosting}
              />

              <TextField
                label="Target radius (km)"
                type="number"
                value={boostRadiusKm}
                onChange={(event) => setBoostRadiusKm(event.target.value)}
                inputProps={{
                  min: MIN_BOOST_RADIUS_KM,
                  max: MAX_BOOST_RADIUS_KM,
                  step: 0.5,
                }}
                helperText={`Boost reaches users within ${sanitizedBoostRadiusKm.toFixed(1)} km of your target point.`}
                fullWidth
                disabled={boosting}
              />

              <GeoTargetPicker
                latitude={boostLatitude}
                longitude={boostLongitude}
                radiusKm={sanitizedBoostRadiusKm}
                onLocationChange={(lat, lon) => {
                  setBoostLatitude(lat);
                  setBoostLongitude(lon);
                  setLocationError("");
                }}
                onRequestCurrentLocation={() =>
                  requestCurrentLocation({
                    applyToBoost: true,
                    onComplete: (success) => {
                      if (!success) {
                        setBoostLatitude(null);
                        setBoostLongitude(null);
                      }
                    },
                  })
                }
                locating={boosting ? false : locatingBoost}
                locationError={locationError}
                onCountySuggested={(county) => {
                  if (county) {
                    setBoostArea(county);
                  }
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "rgba(26, 26, 26, 0.75)" }}
                >
                  Selected county:
                </Typography>
                <Chip
                  label={boostArea || "None"}
                  size="small"
                  sx={{
                    bgcolor: boostArea
                      ? "rgba(212, 175, 55, 0.15)"
                      : "rgba(0, 0, 0, 0.05)",
                    color: "rgba(26, 26, 26, 0.8)",
                    fontWeight: 600,
                  }}
                />
                {!boostArea && (
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(26, 26, 26, 0.55)" }}
                  >
                    Use the map search above to choose a county.
                  </Typography>
                )}
              </Box>

              <Alert
                severity="success"
                sx={{
                  borderRadius: "12px",
                  bgcolor: "rgba(76, 175, 80, 0.08)",
                  border: "1px solid rgba(76, 175, 80, 0.2)",
                  color: "rgba(26, 26, 26, 0.8)",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Cost preview
                </Typography>
                <Typography variant="body2">
                  {totalBoostTokens.toLocaleString()} tokens ({
                    formatKshFromTokens(totalBoostTokens)
                  }) for {sanitizedBoostHours} hour
                  {sanitizedBoostHours > 1 ? "s" : ""} covering roughly {" "}
                  {sanitizedBoostRadiusKm.toFixed(1)} km.
                </Typography>
              </Alert>

              {boostTimeRemaining && (
                <Alert
                  severity="warning"
                  sx={{
                    borderRadius: "12px",
                    bgcolor: "rgba(255, 152, 0, 0.12)",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Active boost remaining: {boostTimeRemaining.hours}h {" "}
                    {boostTimeRemaining.minutes}m
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(26, 26, 26, 0.7)",
                      display: "block",
                      mt: 0.5,
                    }}
                  >
                    Extending now will add time to your existing boost window.
                  </Typography>
                </Alert>
              )}

              <Alert
                severity="warning"
                sx={{ borderRadius: "12px", bgcolor: "rgba(255, 193, 7, 0.12)" }}
              >
                <Typography variant="body2">
                  <strong>Current Balance:</strong> {user?.token_balance || "0.00"} tokens
                </Typography>
              </Alert>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            pt: 2,
            borderTop: "1px solid rgba(0,0,0,0.08)",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          }}
        >
          <Button
            onClick={handleCloseBoostDialog}
            disabled={boosting}
            sx={{
              color: "rgba(26, 26, 26, 0.7)",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmBoost}
            variant="contained"
            disabled={boosting}
            sx={{
              background: "linear-gradient(135deg, #D4AF37, #B8941F)",
              color: "#1a1a1a",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "12px",
              px: 3,
              py: 1,
              "&:hover": {
                background: "linear-gradient(135deg, #B8941F, #D4AF37)",
              },
            }}
          >
            {boosting
              ? "Boosting..."
              : `Boost for ${sanitizedBoostHours} hour${
                  sanitizedBoostHours > 1 ? "s" : ""
                } (${totalBoostTokens.toLocaleString()} tokens)`}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={targetedDialogOpen}
        onClose={handleCloseTargetedDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "18px",
            border: "1px solid rgba(212, 175, 55, 0.25)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #D4AF37, #B8941F)",
            color: "#1a1a1a",
            fontWeight: 700,
          }}
        >
          Boosts Targeting You
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {loadingTargetedBoosts ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress sx={{ color: "#D4AF37" }} />
            </Box>
          ) : targetedBoostsError ? (
            <Alert
              severity="warning"
              sx={{
                borderRadius: "12px",
                bgcolor: "rgba(255, 193, 7, 0.12)",
                color: "rgba(26, 26, 26, 0.8)",
              }}
            >
              {targetedBoostsError}
            </Alert>
          ) : targetedCount === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography
                variant="body1"
                sx={{ color: "rgba(26, 26, 26, 0.7)", fontWeight: 600 }}
              >
                No matching boosts right now.
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(26, 26, 26, 0.6)", mt: 1 }}
              >
                Once someone targets {user?.category || "your category"} in{" "}
                {user?.county || "your area"}, they'll pop up here.
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {targetedBoosts.map((boost, index) => {
                const owner = boost.owner;
                const profileImage = buildImageUrl(owner?.photo);
                const expiresAt = boost.ends_at
                  ? new Date(boost.ends_at).toLocaleString()
                  : null;
                const areaLabel = boost.target_area;

                return (
                  <React.Fragment key={boost.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar
                          src={profileImage || undefined}
                          alt={owner?.name || "Boosted user"}
                          sx={{
                            bgcolor: profileImage ? "transparent" : "#D4AF37",
                            color: profileImage ? "inherit" : "#1a1a1a",
                          }}
                        >
                          {profileImage ? null : owner?.name?.charAt(0) || "?"}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primaryTypographyProps={{
                          fontWeight: 700,
                          color: "#1a1a1a",
                        }}
                        primary={owner?.name || "Boosted profile"}
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            {owner?.category && (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  color: "rgba(26, 26, 26, 0.65)",
                                  mr: 1,
                                }}
                              >
                                <StarIcon
                                  sx={{ fontSize: 12, color: "#D4AF37" }}
                                />
                                {owner.category}
                              </Typography>
                            )}
                            {areaLabel && (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  color: "rgba(26, 26, 26, 0.65)",
                                }}
                              >
                                <LocationOn
                                  sx={{ fontSize: 12, color: "#D4AF37" }}
                                />
                                {areaLabel}
                              </Typography>
                            )}
                            {typeof boost.distance_km === "number" && (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  color: "rgba(26, 26, 26, 0.65)",
                                  ml: areaLabel ? 1 : 0,
                                }}
                              >
                                <MyLocation
                                  sx={{ fontSize: 12, color: "#D4AF37" }}
                                />
                                {boost.distance_km.toFixed(1)} km away
                              </Typography>
                            )}
                            {expiresAt && (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  mt: 0.75,
                                  color: "rgba(26, 26, 26, 0.6)",
                                }}
                              >
                                Boost ends: {expiresAt}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < targetedBoosts.length - 1 && (
                      <Divider component="li" />
                    )}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleRefreshTargetedBoosts}
            disabled={loadingTargetedBoosts}
            sx={{
              color: "#D4AF37",
              fontWeight: 600,
            }}
          >
            Refresh
          </Button>
          <Button onClick={handleCloseTargetedDialog} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
