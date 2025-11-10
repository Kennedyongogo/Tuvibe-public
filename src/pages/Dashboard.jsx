import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { keyframes } from "@mui/system";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
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
  Insights,
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
import { getDisplayInitial, getDisplayName } from "../utils/userDisplay";

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

const getRemainingTimeForDate = (dateValue) => {
  if (!dateValue) return null;
  try {
    const now = new Date();
    const until = new Date(dateValue);
    const diff = until.getTime() - now.getTime();
    if (Number.isNaN(diff) || diff <= 0) {
      return null;
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes, diff };
  } catch (error) {
    console.error("Failed to calculate remaining time:", error);
    return null;
  }
};

const BOOST_CATEGORIES = [
  "Regular",
  "Sugar Mummy",
  "Sponsor",
  "Ben 10",
  "Urban Chics",
];
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

const formatDateTime = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    console.error("Failed to format date for statistics dialog:", error);
    return value;
  }
};

export default function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
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
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [activeBoosts, setActiveBoosts] = useState([]);
  const [selectedBoostId, setSelectedBoostId] = useState(null);
  const [loadingBoostStatus, setLoadingBoostStatus] = useState(false);
  const [boostStatusError, setBoostStatusError] = useState("");
  const [boostTargetEdited, setBoostTargetEdited] = useState(false);
  const normalizedTargetCounty = useMemo(
    () => normalizeCountyName(boostArea),
    [boostArea]
  );
  const selectedBoost = useMemo(() => {
    if (!Array.isArray(activeBoosts) || activeBoosts.length === 0) return null;

    if (selectedBoostId) {
      const byId = activeBoosts.find((boost) => boost.id === selectedBoostId);
      if (byId) return byId;
    }

    const normalizedCategory = boostCategory || user?.category || "Regular";

    const categoryMatches = activeBoosts.filter((boost) => {
      const boostCategoryValue =
        boost?.target_category || user?.category || "Regular";
      return boostCategoryValue === normalizedCategory;
    });

    const pool = categoryMatches.length > 0 ? categoryMatches : activeBoosts;

    if (normalizedTargetCounty) {
      const byCounty = pool.find((boost) => {
        const boostCounty = normalizeCountyName(boost?.target_area);
        return boostCounty && boostCounty === normalizedTargetCounty;
      });
      if (byCounty) return byCounty;
    }

    return pool[0] || null;
  }, [
    activeBoosts,
    normalizedTargetCounty,
    boostCategory,
    user?.category,
    selectedBoostId,
  ]);
  const selectedBoostRemaining = useMemo(() => {
    if (!selectedBoost) return null;
    const remaining = getRemainingTimeForDate(selectedBoost.ends_at);
    if (!remaining) return null;
    return `${remaining.hours}h ${remaining.minutes}m`;
  }, [selectedBoost]);
  const selectedBoostExpiresAt = useMemo(() => {
    if (!selectedBoost?.ends_at) return null;
    try {
      return new Date(selectedBoost.ends_at).toLocaleString();
    } catch {
      return null;
    }
  }, [selectedBoost]);
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

  const applyBoostContext = useCallback(
    (boost) => {
      if (!boost) return;
      setSelectedBoostId(boost.id);
      setBoostCategory(boost.target_category || user?.category || "Regular");
      const normalizedArea =
        normalizeCountyName(boost.target_area) || boost.target_area || "";
      setBoostArea(normalizedArea);
      const latValue = parseNumericValue(boost.target_lat);
      const lngValue = parseNumericValue(boost.target_lng);
      if (latValue !== null && lngValue !== null) {
        setBoostLatitude(latValue);
        setBoostLongitude(lngValue);
      }
      const radiusValue = parseNumericValue(boost.radius_km);
      if (Number.isFinite(radiusValue)) {
        setBoostRadiusKm(radiusValue);
      }
    },
    [user?.category]
  );

  const handleSelectActiveBoost = useCallback(
    (boost) => {
      if (!boost) return;
      applyBoostContext(boost);
      setBoostTargetEdited(false);
    },
    [applyBoostContext]
  );

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
    setBoostLatitude(parseNumericValue(user?.latitude) ?? null);
    setBoostLongitude(parseNumericValue(user?.longitude) ?? null);
    setBoostTargetEdited(false);
    setLocationError("");
  }, [user?.category, user?.county, user?.latitude, user?.longitude]);

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

  const showBoostDialogAlert = useCallback(
    async (options) => {
      const wasOpen = boostDialogOpen;
      if (wasOpen) {
        programmaticBoostCloseRef.current = true;
        setBoostDialogOpen(false);
        await new Promise((resolve) => setTimeout(resolve, 0));
        programmaticBoostCloseRef.current = false;
      }

      await Swal.fire({
        confirmButtonColor: "#D4AF37",
        ...options,
      });

      if (wasOpen) {
        openBoostDialog(false);
      }
    },
    [boostDialogOpen, openBoostDialog]
  );

  const fetchActiveBoosts = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setActiveBoosts([]);
      setBoostStatusError("");
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
      console.log("[Boost] status payload", data);

      if (response.ok && data.success) {
        const boostsSource = Array.isArray(data.data?.boosts)
          ? data.data.boosts
          : data.data?.boost
            ? [data.data.boost]
            : [];
        const boosts = boostsSource.filter(Boolean);
        setActiveBoosts(boosts);
        setSelectedBoostId((prev) => {
          if (boosts.length === 0) {
            return null;
          }
          if (prev && boosts.some((boost) => boost.id === prev)) {
            return prev;
          }
          return boosts[0].id;
        });
        console.log("[Boost] Active boosts fetched", boosts);
        setBoostStatusError("");
      } else {
        setActiveBoosts([]);
        setBoostStatusError(
          data.message || "Unable to load your current boosts."
        );
      }
    } catch (error) {
      console.error("Fetch boost status error:", error);
      setActiveBoosts([]);
      setBoostStatusError("Unable to load your current boosts.");
    } finally {
      setLoadingBoostStatus(false);
    }
  }, []);

  useEffect(() => {
    if (!locationRequestedRef.current) {
      locationRequestedRef.current = true;
      requestCurrentLocation({ applyToBoost: false });
    }
  }, [requestCurrentLocation]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const styleId = "boost-extend-compact-styles";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .boost-extend-compact {
        padding: 18px 20px !important;
        border-radius: 16px !important;
      }
      .boost-extend-compact-title {
        font-size: 1.1rem !important;
        margin-bottom: 6px !important;
      }
      .boost-extend-compact-body {
        font-size: 0.82rem !important;
      }
      .boost-extend-compact-body .swal2-input {
        height: 36px !important;
        font-size: 0.82rem !important;
      }
      .boost-extend-compact-summary {
        font-size: 0.78rem;
        color: rgba(26,26,26,0.65);
      }
      .boost-extend-compact-confirm,
      .boost-extend-compact-cancel {
        font-size: 0.8rem !important;
        padding: 8px 18px !important;
        border-radius: 10px !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    if (boostDialogOpen) {
      fetchActiveBoosts();
    }
  }, [boostDialogOpen, fetchActiveBoosts]);

  useEffect(() => {
    if (boostDialogOpen) {
      console.log("[Boost] Selected boost", selectedBoost);
    }
  }, [boostDialogOpen, selectedBoost]);

  useEffect(() => {
    if (!boostDialogOpen) return;
    if (!selectedBoost) return;

    if (!boostTargetEdited) {
      applyBoostContext(selectedBoost);
    }
  }, [boostDialogOpen, selectedBoost, boostTargetEdited, applyBoostContext]);

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
    const resolveEndsAt = () => {
      if (Array.isArray(activeBoosts) && activeBoosts.length > 0) {
        const sorted = [...activeBoosts].sort(
          (a, b) => new Date(a.ends_at) - new Date(b.ends_at)
        );
        return sorted[0]?.ends_at || null;
      }
      return user?.active_boost_until || user?.is_featured_until || null;
    };

    const calculateTimeRemaining = () => {
      const endsAtValue = resolveEndsAt();
      if (!endsAtValue) {
        setBoostTimeRemaining(null);
        return;
      }

      const now = new Date();
      const until = new Date(endsAtValue);
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
  }, [activeBoosts, user?.active_boost_until, user?.is_featured_until]);

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

  const handleBoostProfile = async () => {
    if (!boostCategory) {
      await showBoostDialogAlert({
        icon: "warning",
        title: "Select Category",
        text: "Choose the audience category you want to reach before boosting.",
      });
      return;
    }

    if (!normalizedTargetCounty) {
      await showBoostDialogAlert({
        icon: "warning",
        title: "Select a County",
        text: "Choose one of the 47 Kenyan counties to target before boosting.",
      });
      return;
    }

    if (boostLatitude === null || boostLongitude === null) {
      await showBoostDialogAlert({
        icon: "warning",
        title: "Set Target Location",
        text: "Allow location access or choose a location on the map before boosting.",
      });
      return;
    }

    if (!Number.isFinite(sanitizedBoostRadiusKm)) {
      await showBoostDialogAlert({
        icon: "warning",
        title: "Invalid Radius",
        text: "Provide a radius between 1 km and 200 km for your boost.",
      });
      return;
    }

    const hours = sanitizedBoostHours;
    const totalTokens = hours * BOOST_PRICE_TOKENS;

    const token = localStorage.getItem("token");
    if (!token) {
      await showBoostDialogAlert({
        icon: "error",
        title: "Authentication Required",
        text: "Please login to boost your profile.",
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
        programmaticBoostCloseRef.current = true;
        setBoostDialogOpen(false);

        await new Promise((resolve) => setTimeout(resolve, 0));

        const result = await Swal.fire({
          icon: "warning",
          title: "Insufficient Tokens",
          html: `<p>You need ${totalTokens} tokens (${formatKshFromTokens(totalTokens)}) to boost for ${hours} hour${
            hours > 1 ? "s" : ""
          }.</p><p>Your balance: ${currentBalance.toFixed(2)} tokens</p>`,
          confirmButtonText: "Buy Tokens",
          cancelButtonText: "Cancel",
          showCancelButton: true,
          confirmButtonColor: "#D4AF37",
        });

        programmaticBoostCloseRef.current = false;

        if (result.isConfirmed) {
          navigate("/wallet");
        }
        return;
      }

      programmaticBoostCloseRef.current = true;
      setBoostDialogOpen(false);

      const confirmation = await Swal.fire({
        icon: "question",
        title: "Confirm New Boost",
        html: `
          <div style="font-size: 0.9rem; line-height: 1.35; text-align: left;">
            <p style="margin: 0 0 6px 0;"><strong>Targeting:</strong> ${boostCategory} audience in <strong>${normalizedTargetCounty}</strong>.</p>
            <p style="margin: 0 0 6px 0;"><strong>Duration:</strong> ${hours} hour${hours > 1 ? "s" : ""}</p>
            <p style="margin: 0 0 6px 0;"><strong>Radius:</strong> ${sanitizedBoostRadiusKm.toFixed(1)} km</p>
            <p style="margin: 0 0 10px 0;"><strong>Cost:</strong> ${totalTokens} tokens (${formatKshFromTokens(totalTokens)})</p>
            <p style="font-size: 0.82rem; color: #555; margin: 0;">Use Extend Boost if you want to add time to an existing boost in the same area.</p>
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
        programmaticBoostCloseRef.current = false;
        openBoostDialog(false);
        return;
      }

      setBoosting(true);

      console.log("[Boost] Creating new boost", {
        category: boostCategory,
        county: normalizedTargetCounty,
        radiusKm: sanitizedBoostRadiusKm,
        hours,
      });

      const response = await fetch("/api/tokens/boost", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetCategory: boostCategory,
          targetArea: normalizedTargetCounty,
          targetLatitude: boostLatitude,
          targetLongitude: boostLongitude,
          targetRadiusKm: sanitizedBoostRadiusKm,
          durationHours: hours,
        }),
      });

      const data = await response.json();

      if (response.status === 402) {
        Swal.fire({
          icon: "warning",
          title: "Insufficient Tokens",
          text: data.message || "You do not have enough tokens for this boost.",
          confirmButtonColor: "#D4AF37",
        });
        programmaticBoostCloseRef.current = false;
        openBoostDialog(false);
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to boost profile");
      }

      const createdBoost = data.data?.boost || null;

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
                  createdBoost?.ends_at || prev.active_boost_until,
              }
            : prev
        );
      }

      const remainingInfo = getRemainingTimeForDate(createdBoost?.ends_at);
      if (remainingInfo) {
        setBoostTimeRemaining({
          hours: remainingInfo.hours,
          minutes: remainingInfo.minutes,
        });
      } else {
        setBoostTimeRemaining(null);
      }

      await fetchActiveBoosts();
      fetchFeaturedUsers();
      fetchFeaturedItems();
      fetchTargetedBoosts();

      Swal.fire({
        icon: "success",
        title: "Profile Boosted!",
        html: `
          <p>Your profile will be boosted for <strong>${hours} hour${hours > 1 ? "s" : ""}</strong>.</p>
          <p style="font-size: 0.9rem; color: rgba(26, 26, 26, 0.7);">
            Boost expires: ${
              createdBoost?.ends_at
                ? new Date(createdBoost.ends_at).toLocaleString()
                : "Soon"
            }
          </p>
        `,
        confirmButtonColor: "#D4AF37",
      });

      resetBoostForm();
      programmaticBoostCloseRef.current = false;
    } catch (err) {
      console.error("[Boost] create error:", err);
      programmaticBoostCloseRef.current = false;
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

  const handleExtendBoost = async (boostOverride = null) => {
    const boostToUse = boostOverride || selectedBoost;
    if (!boostToUse) {
      Swal.fire({
        icon: "info",
        title: "No Boost To Extend",
        text: "Create a boost in this area first, then you can extend it.",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    if (boostOverride) {
      applyBoostContext(boostToUse);
      setBoostTargetEdited(false);
    }

    let dialogWasOpen = false;
    if (boostDialogOpen) {
      dialogWasOpen = true;
      programmaticBoostCloseRef.current = true;
      setBoostDialogOpen(false);
      await new Promise((resolve) => setTimeout(resolve, 0));
      programmaticBoostCloseRef.current = false;
    }

    const currentRadius =
      parseNumericValue(boostToUse.radius_km) ?? sanitizedBoostRadiusKm;
    const defaultHours = sanitizedBoostHours;
    const defaultRadius = Number.isFinite(currentRadius)
      ? Number(currentRadius)
      : sanitizedBoostRadiusKm;
    const currentEndsDate = boostToUse.ends_at
      ? new Date(boostToUse.ends_at)
      : null;
    const currentEndsLabel = currentEndsDate
      ? currentEndsDate.toLocaleString()
      : "Soon";
    const currentRemaining = getRemainingTimeForDate(boostToUse.ends_at);
    const currentRemainingLabel = currentRemaining
      ? `${currentRemaining.hours}h ${currentRemaining.minutes}m`
      : null;

    const adjustResult = await Swal.fire({
      icon: undefined,
      title: "Adjust Extension",
      html: `
        <div style="text-align: left; display: flex; flex-direction: column; gap: 10px; font-size: 0.82rem;">
          <div class="boost-extend-compact-summary"><strong>Current time left:</strong> ${
            currentRemainingLabel || "Calculating…"
          }</div>
          <div class="boost-extend-compact-summary"><strong>Current end time:</strong> ${currentEndsLabel}</div>
          <div class="boost-extend-compact-summary"><strong>Current radius:</strong> ${Number.isFinite(currentRadius) ? Number(currentRadius).toFixed(1) + " km" : "N/A"}</div>
          <div>
            <label for="extend-hours-input" style="font-weight: 600; font-size: 0.85rem;">Hours to add</label>
            <input id="extend-hours-input" type="number" class="swal2-input" style="margin-top: 4px; height: 36px; font-size: 0.82rem;" min="${MIN_BOOST_HOURS}" max="${MAX_BOOST_HOURS}" step="1" value="${defaultHours}" />
            <small style="display:block; margin-top:4px; color: rgba(26,26,26,0.6); font-size: 0.72rem;">
              Choose between ${MIN_BOOST_HOURS} and ${MAX_BOOST_HOURS} hours to add.
            </small>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div>
              <label style="font-weight: 600; font-size: 0.85rem;">Current radius (km)</label>
              <input type="number" class="swal2-input" style="margin-top: 4px; height: 36px; font-size: 0.82rem;" value="${
                Number.isFinite(currentRadius)
                  ? Number(currentRadius).toFixed(1)
                  : ""
              }" disabled />
            </div>
            <div>
              <label for="extend-radius-input" style="font-weight: 600; font-size: 0.85rem;">New radius (km)</label>
              <input id="extend-radius-input" type="number" class="swal2-input" style="margin-top: 4px; height: 36px; font-size: 0.82rem;" min="${MIN_BOOST_RADIUS_KM}" max="${MAX_BOOST_RADIUS_KM}" step="0.5" value="${defaultRadius.toFixed(
                1
              )}" />
            </div>
          </div>
          <small style="display:block; margin-top:4px; color: rgba(26,26,26,0.6); font-size: 0.72rem;">
            Allowed range: ${MIN_BOOST_RADIUS_KM} – ${MAX_BOOST_RADIUS_KM} km.
          </small>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Review Extension",
      cancelButtonText: "Cancel",
      focusConfirm: false,
      width: 380,
      customClass: {
        popup: "boost-extend-compact",
        title: "boost-extend-compact-title",
        htmlContainer: "boost-extend-compact-body",
        confirmButton: "boost-extend-compact-confirm",
        cancelButton: "boost-extend-compact-cancel",
      },
      didOpen: () => {
        const hoursInput = document.getElementById("extend-hours-input");
        const radiusInput = document.getElementById("extend-radius-input");
        if (hoursInput) {
          hoursInput.value = defaultHours.toString();
        }
        if (radiusInput) {
          radiusInput.value = defaultRadius.toFixed(1);
        }
      },
      preConfirm: () => {
        const hoursValue = Number(
          document.getElementById("extend-hours-input")?.value
        );
        const radiusValue = Number(
          document.getElementById("extend-radius-input")?.value
        );

        if (
          !Number.isFinite(hoursValue) ||
          hoursValue < MIN_BOOST_HOURS ||
          hoursValue > MAX_BOOST_HOURS
        ) {
          Swal.showValidationMessage(
            `Hours must be between ${MIN_BOOST_HOURS} and ${MAX_BOOST_HOURS}.`
          );
          return false;
        }

        if (
          !Number.isFinite(radiusValue) ||
          radiusValue < MIN_BOOST_RADIUS_KM ||
          radiusValue > MAX_BOOST_RADIUS_KM
        ) {
          Swal.showValidationMessage(
            `Radius must be between ${MIN_BOOST_RADIUS_KM} and ${MAX_BOOST_RADIUS_KM} km.`
          );
          return false;
        }

        return {
          hours: Math.floor(hoursValue),
          radius: Number(radiusValue.toFixed(1)),
        };
      },
    });

    if (!adjustResult.isConfirmed || !adjustResult.value) {
      if (dialogWasOpen) {
        openBoostDialog(false);
      }
      return;
    }

    const adjustedHours = Math.min(
      MAX_BOOST_HOURS,
      Math.max(MIN_BOOST_HOURS, adjustResult.value.hours)
    );
    const adjustedRadius = Math.min(
      MAX_BOOST_RADIUS_KM,
      Math.max(MIN_BOOST_RADIUS_KM, adjustResult.value.radius)
    );

    setBoostHours(String(adjustedHours));
    setBoostRadiusKm(adjustedRadius);
    setBoostTargetEdited(true);

    const hours = adjustedHours;
    const totalTokens = hours * BOOST_PRICE_TOKENS;
    const extensionRadiusKm = adjustedRadius;
    const previousRadiusLabel = Number.isFinite(currentRadius)
      ? `${Number(currentRadius).toFixed(1)} km`
      : "N/A";
    const newRadiusLabel = `${extensionRadiusKm.toFixed(1)} km`;

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Authentication Required",
        text: "Please login to manage your boosts.",
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
        programmaticBoostCloseRef.current = true;
        setBoostDialogOpen(false);

        await new Promise((resolve) => setTimeout(resolve, 0));

        const result = await Swal.fire({
          icon: "warning",
          title: "Insufficient Tokens",
          html: `<p>You need ${totalTokens} tokens (${formatKshFromTokens(totalTokens)}) to extend by ${hours} hour${
            hours > 1 ? "s" : ""
          }.</p><p>Your balance: ${currentBalance.toFixed(2)} tokens</p>`,
          confirmButtonText: "Buy Tokens",
          cancelButtonText: "Cancel",
          showCancelButton: true,
          confirmButtonColor: "#D4AF37",
        });

        programmaticBoostCloseRef.current = false;

        if (result.isConfirmed) {
          navigate("/wallet");
        }
        return;
      }

      programmaticBoostCloseRef.current = true;
      setBoostDialogOpen(false);

      const now = new Date();
      const baselineForPreview =
        currentEndsDate && currentEndsDate > now ? currentEndsDate : now;
      const previewEndsAt = new Date(
        baselineForPreview.getTime() + hours * 60 * 60 * 1000
      );
      const previewEndsText = previewEndsAt.toLocaleString();
      const previewRemaining = getRemainingTimeForDate(previewEndsAt);
      const previewRemainingLabel = previewRemaining
        ? `${previewRemaining.hours}h ${previewRemaining.minutes}m`
        : null;
      const currentEndsText = currentEndsLabel;
      const confirmation = await Swal.fire({
        icon: undefined,
        title: "Extend Existing Boost",
        html: `
          <div style="font-size: 0.9rem; line-height: 1.35; text-align: left;">
            <p style="margin: 0 0 6px 0;"><strong>Area:</strong> ${
              boostToUse.target_area || "Custom location"
            }</p>
            <p style="margin: 0 0 6px 0;"><strong>Current radius:</strong> ${
              boostToUse.radius_km
                ? Number.parseFloat(boostToUse.radius_km).toFixed(1)
                : "N/A"
            } km → <strong>${newRadiusLabel}</strong></p>
            <p style="margin: 0 0 6px 0;"><strong>Current end time:</strong> ${currentEndsText}</p>
            <p style="margin: 0 0 6px 0;"><strong>New end time:</strong> ${previewEndsText}${
              previewRemainingLabel
                ? ` (${previewRemainingLabel} from now)`
                : ""
            }</p>
            <p style="margin: 0 0 10px 0;"><strong>Extension:</strong> Add ${hours} hour${
              hours > 1 ? "s" : ""
            } to this boost for ${totalTokens} tokens (${formatKshFromTokens(
              totalTokens
            )}).</p>
            <p style="font-size: 0.82rem; color: #555; margin: 0;">Extending keeps the same target area and audience.</p>
          </div>
        `,
        width: 420,
        showCancelButton: true,
        confirmButtonText: "Extend Boost",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#D4AF37",
        cancelButtonColor: "#9E9E9E",
      });

      if (!confirmation.isConfirmed) {
        programmaticBoostCloseRef.current = false;
        openBoostDialog(false);
        return;
      }

      setBoosting(true);

      console.log("[Boost] Extending existing boost", {
        boostId: boostToUse.id,
        hours,
        radiusKm: extensionRadiusKm,
      });

      const response = await fetch(
        `/api/tokens/boost/${boostToUse.id}/extend`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            additionalHours: hours,
            targetRadiusKm: extensionRadiusKm,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 402) {
        Swal.fire({
          icon: "warning",
          title: "Insufficient Tokens",
          text:
            data.message ||
            "You do not have enough tokens to extend this boost.",
          confirmButtonColor: "#D4AF37",
        });
        programmaticBoostCloseRef.current = false;
        openBoostDialog(false);
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to extend boost");
      }

      const updatedBoost = data.data?.boost || null;

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
                  updatedBoost?.ends_at || prev.active_boost_until,
              }
            : prev
        );
      }

      const remainingInfo = getRemainingTimeForDate(updatedBoost?.ends_at);
      if (remainingInfo) {
        setBoostTimeRemaining({
          hours: remainingInfo.hours,
          minutes: remainingInfo.minutes,
        });
      } else {
        setBoostTimeRemaining(null);
      }

      await fetchActiveBoosts();
      fetchFeaturedUsers();
      fetchFeaturedItems();
      fetchTargetedBoosts();

      Swal.fire({
        icon: "success",
        title: "Boost Extended",
        html: `
          <p>You added <strong>${hours} hour${
            hours > 1 ? "s" : ""
          }</strong> to your boost.</p>
          <p style="font-size: 0.9rem; color: rgba(26, 26, 26, 0.7); margin-bottom: 4px;">
            Previous expiry: ${currentEndsText}
          </p>
          <p style="font-size: 0.9rem; color: rgba(26, 26, 26, 0.7); margin-bottom: 4px;">
            New expiry: ${
              updatedBoost?.ends_at
                ? new Date(updatedBoost.ends_at).toLocaleString()
                : previewEndsText
            }
          </p>
          ${
            previewRemainingLabel
              ? `<p style="font-size: 0.82rem; color: rgba(26,26,26,0.6); margin-bottom: 6px;">Time remaining now: ${previewRemainingLabel}.</p>`
              : ""
          }
          <p style="font-size: 0.82rem; color: rgba(26,26,26,0.6);">
            Radius: <strong>${previousRadiusLabel}</strong> → <strong>${newRadiusLabel}</strong>.
          </p>
        `,
        confirmButtonColor: "#D4AF37",
      });

      resetBoostForm();
      programmaticBoostCloseRef.current = false;
    } catch (err) {
      console.error("[Boost] extend error:", err);
      programmaticBoostCloseRef.current = false;
      openBoostDialog(false);
      Swal.fire({
        icon: "error",
        title: "Extension Failed",
        text:
          err.message || "Failed to extend your boost. Please try again later.",
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
      setTargetedBoostsError("Set your category to see boosts targeting you.");
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
  }, [
    user?.category,
    user?.latitude,
    user?.longitude,
    viewerLatitude,
    viewerLongitude,
  ]);

  const fetchPremiumStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setStatsError("Please sign in again to view your statistics.");
      setStatsData(null);
      setStatsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/premium/stats/overview", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setStatsData(data.data || null);
      } else {
        setStatsError(
          data.message || "Unable to load your premium statistics right now."
        );
        setStatsData(null);
      }
    } catch (error) {
      console.error("Error fetching premium stats:", error);
      setStatsError("We couldn't load your statistics. Please try again.");
      setStatsData(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

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

  useEffect(() => {
    if (statsDialogOpen) {
      fetchPremiumStats();
    }
  }, [statsDialogOpen, fetchPremiumStats]);

  const handleOpenStatsDialog = () => {
    setStatsDialogOpen(true);
  };

  const handleCloseStatsDialog = () => {
    setStatsDialogOpen(false);
  };

  const handleRefreshStats = () => {
    fetchPremiumStats();
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
              fontSize: {
                xs: "1.6rem",
                sm: "2rem",
                md: "2.2rem",
                lg: "2.4rem",
              },
              whiteSpace: { xs: "normal", md: "nowrap" },
              overflow: "hidden",
              textOverflow: "ellipsis",
              background: "linear-gradient(45deg, #D4AF37, #B8941F)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Welcome back,{" "}
            {getDisplayName(user, {
              fallback: "User",
              currentUserId: user?.id,
            })}
            !
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
            justifyContent: {
              xs: "space-between",
              sm: "flex-end",
            },
            flexWrap: { xs: "wrap", sm: "nowrap" },
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flex: { xs: "0 0 auto", sm: "initial" },
            }}
          >
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
            <Tooltip title="View profile insights" arrow>
              <IconButton
                onClick={handleOpenStatsDialog}
                sx={{
                  backgroundColor: "rgba(212, 175, 55, 0.12)",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  "&:hover": {
                    backgroundColor: "rgba(212, 175, 55, 0.22)",
                  },
                  flexShrink: 0,
                }}
              >
                <Insights sx={{ color: "#D4AF37" }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
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
                fontSize: {
                  xs: "0.75rem",
                  sm: "0.9rem",
                  md: "1.05rem",
                  lg: "1.2rem",
                },
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
                fontSize: {
                  xs: "0.75rem",
                  sm: "0.9rem",
                  md: "1.05rem",
                  lg: "1.2rem",
                },
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
                          alt={getDisplayName(featuredUser, {
                            fallback: "Member",
                          })}
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
                        {getDisplayName(featuredUser, { fallback: "Member" })}
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
        open={statsDialogOpen}
        onClose={handleCloseStatsDialog}
        maxWidth="md"
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
          <Insights />
          Profile Insights
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            pt: 3,
            pb: 2,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {statsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress sx={{ color: "#D4AF37" }} />
            </Box>
          ) : statsError ? (
            <Alert
              severity="warning"
              sx={{
                borderRadius: "12px",
                backgroundColor: "rgba(212, 175, 55, 0.1)",
                border: "1px solid rgba(212, 175, 55, 0.2)",
              }}
            >
              {statsError}
            </Alert>
          ) : statsData ? (
            <>
              <Box
                sx={{
                  backgroundColor: "rgba(212, 175, 55, 0.08)",
                  border: "1px solid rgba(212, 175, 55, 0.25)",
                  borderRadius: "16px",
                  p: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Profile Views
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 3,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 800, color: "#1a1a1a" }}
                    >
                      {statsData.profileViews?.total ?? 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#5c5c5c" }}>
                      Total views
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 800, color: "#1a1a1a" }}
                    >
                      {statsData.profileViews?.uniqueViewers ?? 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#5c5c5c" }}>
                      Unique viewers
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Recent viewers
                </Typography>
                {statsData.profileViews?.recent?.length ? (
                  <List dense disablePadding>
                    {statsData.profileViews.recent.map((viewer, index) => (
                      <ListItem
                        key={`${viewer?.id || "viewer"}-${viewer?.viewedAt || index}`}
                        sx={{ px: 0, py: 0.75 }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={viewer?.photo || undefined}
                            alt={getDisplayName(viewer, { fallback: "Viewer" })}
                          >
                            {getDisplayInitial(viewer, { fallback: "V" })}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={getDisplayName(viewer, {
                            fallback: "Someone viewed your profile",
                          })}
                          secondary={formatDateTime(viewer?.viewedAt)}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" sx={{ color: "#5c5c5c" }}>
                    No views recorded yet. Boost your profile to increase
                    visibility!
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  backgroundColor: "rgba(212, 175, 55, 0.06)",
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                  borderRadius: "16px",
                  p: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Contact Unlocks
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: "#1a1a1a" }}
                >
                  {statsData.contactUnlocks?.total ?? 0}
                </Typography>
                <Typography variant="body2" sx={{ color: "#5c5c5c", mb: 2 }}>
                  Total members who unlocked your contact
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Recent unlocks
                </Typography>
                {statsData.contactUnlocks?.recent?.length ? (
                  <List dense disablePadding>
                    {statsData.contactUnlocks.recent.map((unlock, index) => (
                      <ListItem
                        key={`${unlock?.id || "unlock"}-${unlock?.unlockedAt || index}`}
                        sx={{ px: 0, py: 0.75 }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={unlock?.photo || undefined}
                            alt={getDisplayName(unlock, { fallback: "Member" })}
                          >
                            {getDisplayInitial(unlock, { fallback: "M" })}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={getDisplayName(unlock, {
                            fallback: "Someone unlocked your contact details",
                          })}
                          secondary={formatDateTime(unlock?.unlockedAt)}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ color: "#B8941F", fontWeight: 600 }}
                        >
                          {unlock?.tokenCost != null
                            ? `${unlock.tokenCost} tokens`
                            : ""}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" sx={{ color: "#5c5c5c" }}>
                    No unlocks yet. Keep engaging to encourage connections.
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  backgroundColor: "rgba(212, 175, 55, 0.05)",
                  border: "1px solid rgba(212, 175, 55, 0.18)",
                  borderRadius: "16px",
                  p: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Boost Activity
                </Typography>
                <Typography variant="body2" sx={{ color: "#5c5c5c", mb: 2 }}>
                  Total boosts purchased:{" "}
                  <strong>{statsData.boostStatus?.totalBoosts ?? 0}</strong>
                </Typography>
                {statsData.boostStatus?.active ? (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Active boost ends
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#5c5c5c" }}>
                        {formatDateTime(statsData.boostStatus.active.endsAt)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Views during this boost
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#1a1a1a" }}>
                        {statsData.boostStatus.active.viewsDuringActiveWindow ??
                          0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Target audience
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#5c5c5c" }}>
                        {statsData.boostStatus.active.targetCategory ||
                          "All categories"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Target area
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#5c5c5c" }}>
                        {statsData.boostStatus.active.targetArea ||
                          "Nationwide"}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: "#5c5c5c" }}>
                    No active boost running right now. Start a boost to push
                    your profile to the top.
                  </Typography>
                )}
              </Box>
            </>
          ) : (
            <Typography variant="body2" sx={{ color: "#5c5c5c" }}>
              No statistics to display yet.
            </Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={handleRefreshStats}
            disabled={statsLoading}
            sx={{
              color: "#B8941F",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Refresh
          </Button>
          <Button
            onClick={handleCloseStatsDialog}
            sx={{
              background: "linear-gradient(135deg, #D4AF37, #B8941F)",
              color: "#1a1a1a",
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "999px",
              px: 3,
              "&:hover": {
                background: "linear-gradient(135deg, #B8941F, #D4AF37)",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

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
            py: isSmallScreen ? 1.5 : 2,
            fontSize: {
              xs: "0.95rem",
              sm: "1.05rem",
              md: "1.15rem",
            },
          }}
        >
          <TrendingUp />
          {selectedBoost ? "Extend Profile Boost" : "Boost Your Profile"}
        </DialogTitle>
        <DialogContent
          sx={{
            pt: 3,
            pb: 0,
            display: "flex",
            flexDirection: "column",
            maxHeight: { xs: "calc(100vh - 160px)", sm: "calc(100vh - 200px)" },
            "& .MuiTypography-root": {
              fontSize: {
                xs: "0.68rem",
                sm: "0.78rem",
                md: "0.9rem",
              },
              lineHeight: {
                xs: 1.35,
                sm: 1.45,
                md: 1.6,
              },
            },
            "& .MuiButtonBase-root": {
              fontSize: {
                xs: "0.75rem",
                sm: "0.85rem",
                md: "0.95rem",
              },
              "& .MuiTypography-root": {
                fontSize: {
                  xs: "0.68rem",
                  sm: "0.78rem",
                  md: "0.9rem",
                },
              },
            },
            "& .MuiChip-root": {
              fontSize: {
                xs: "0.64rem",
                sm: "0.74rem",
                md: "0.86rem",
              },
            },
            "& .MuiFormHelperText-root": {
              fontSize: {
                xs: "0.64rem",
                sm: "0.74rem",
                md: "0.86rem",
              },
            },
            "& .MuiTextField-root": {
              "& input, & textarea": {
                fontSize: {
                  xs: "0.68rem",
                  sm: "0.78rem",
                  md: "0.9rem",
                },
              },
              "& label": {
                fontSize: {
                  xs: "0.68rem",
                  sm: "0.78rem",
                  md: "0.9rem",
                },
              },
            },
            "& .MuiSelect-select": {
              fontSize: {
                xs: "0.68rem",
                sm: "0.78rem",
                md: "0.9rem",
              },
            },
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
            {activeBoosts.length === 0 && (
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
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    color: "#1a1a1a",
                    fontSize: { xs: "0.75rem", sm: "0.85rem", md: "0.95rem" },
                  }}
                >
                  Why Boost Your Profile?
                </Typography>
                <Box
                  component="ul"
                  sx={{
                    m: 0,
                    pl: 2.5,
                    "& li": {
                      mb: 1,
                      fontSize: {
                        xs: "0.7rem",
                        sm: "0.8rem",
                        md: "0.9rem",
                      },
                      lineHeight: {
                        xs: 1.35,
                        sm: 1.45,
                        md: 1.6,
                      },
                      "& strong": {
                        fontSize: {
                          xs: "0.72rem",
                          sm: "0.82rem",
                          md: "0.92rem",
                        },
                      },
                    },
                  }}
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
                    <strong>Affordable:</strong> Each hour costs{" "}
                    {BOOST_PRICE_TOKENS} tokens (
                    {formatKshFromTokens(BOOST_PRICE_TOKENS)}) —{" "}
                    {describeExchangeRate()}.
                  </li>
                </Box>
              </Alert>
            )}

            {activeBoosts.length > 0 && (
              <Box
                sx={{
                  borderRadius: "12px",
                  border: "1px solid rgba(26, 26, 26, 0.08)",
                  bgcolor: "rgba(26, 26, 26, 0.01)",
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: "rgba(26, 26, 26, 0.85)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  Your Active Boosts
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{ color: "rgba(26, 26, 26, 0.55)" }}
                  >
                    Extend individually to keep them running.
                  </Typography>
                </Typography>
                <Stack spacing={1.5}>
                  {activeBoosts.map((boost) => {
                    const isSelected =
                      selectedBoost && selectedBoost.id === boost.id;
                    const radiusValue = parseNumericValue(boost.radius_km);
                    const radiusLabel = Number.isFinite(radiusValue)
                      ? `${Number(radiusValue).toFixed(1)} km`
                      : "N/A";
                    const remaining = getRemainingTimeForDate(boost.ends_at);
                    const endsAt = boost.ends_at
                      ? new Date(boost.ends_at).toLocaleString()
                      : null;
                    const targetArea = boost.target_area || "Custom location";

                    return (
                      <Card
                        key={boost.id}
                        variant="outlined"
                        onClick={() => handleSelectActiveBoost(boost)}
                        sx={{
                          borderColor: isSelected
                            ? "rgba(33, 150, 243, 0.6)"
                            : "rgba(26, 26, 26, 0.08)",
                          borderWidth: isSelected ? 2 : 1,
                          cursor: "pointer",
                          transition:
                            "border-color 0.2s ease, box-shadow 0.2s ease",
                          "&:hover": {
                            borderColor: "rgba(33, 150, 243, 0.6)",
                            boxShadow: "0 6px 20px rgba(33, 150, 243, 0.12)",
                          },
                        }}
                      >
                        <CardContent sx={{ pb: 1.5 }}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                color: "rgba(26, 26, 26, 0.85)",
                                maxWidth: "65%",
                              }}
                            >
                              {targetArea}
                            </Typography>
                            <Chip
                              label={boost.target_category || "Regular"}
                              size="small"
                              sx={{
                                backgroundColor: "rgba(33, 150, 243, 0.12)",
                                color: "rgba(33, 150, 243, 0.85)",
                                fontWeight: 600,
                              }}
                            />
                          </Stack>
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 1,
                              color: "rgba(26, 26, 26, 0.75)",
                            }}
                          >
                            Radius: {radiusLabel}
                          </Typography>
                          {remaining && (
                            <Typography
                              variant="body2"
                              sx={{ color: "rgba(26, 26, 26, 0.7)" }}
                            >
                              Time left: {remaining.hours}h {remaining.minutes}m
                            </Typography>
                          )}
                          {endsAt && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "rgba(26, 26, 26, 0.55)",
                                display: "block",
                                mt: 0.5,
                              }}
                            >
                              Ends at: {endsAt}
                            </Typography>
                          )}
                        </CardContent>
                        <CardActions
                          sx={{
                            justifyContent: "flex-end",
                            pt: 0,
                            pb: 1.5,
                            px: 2,
                            gap: 1,
                          }}
                        >
                          <Button
                            size="small"
                            variant="contained"
                            disabled={boosting}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleExtendBoost(boost);
                            }}
                            sx={{
                              background:
                                "linear-gradient(135deg, #2196F3, #64B5F6)",
                              color: "#0D1C2C",
                              fontWeight: 600,
                              "&:hover": {
                                background:
                                  "linear-gradient(135deg, #1976D2, #42A5F5)",
                              },
                            }}
                          >
                            Extend
                          </Button>
                        </CardActions>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>
            )}

            <Stack spacing={2.5}>
              {!loadingBoostStatus && boostStatusError && (
                <Alert
                  severity="warning"
                  sx={{
                    borderRadius: "12px",
                    bgcolor: "rgba(255, 193, 7, 0.12)",
                    color: "rgba(26, 26, 26, 0.8)",
                  }}
                >
                  {boostStatusError}
                </Alert>
              )}

              {activeBoosts.length === 0 && selectedBoost && (
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: "12px",
                    bgcolor: "rgba(33, 150, 243, 0.12)",
                    border: "1px solid rgba(33, 150, 243, 0.25)",
                    color: "rgba(26, 26, 26, 0.85)",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    You already have a boost targeting{" "}
                    <strong>{selectedBoost.target_area || "this area"}</strong>{" "}
                    for {boostCategory}.
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    {selectedBoostRemaining
                      ? `Time remaining: ${selectedBoostRemaining}.`
                      : "This boost is active for a little longer."}{" "}
                    {selectedBoostExpiresAt
                      ? `Ends at ${selectedBoostExpiresAt}.`
                      : ""}
                    Extend to add hours or widen the radius without creating a
                    new boost.
                  </Typography>
                </Alert>
              )}

              <FormControl fullWidth>
                <InputLabel id="boost-category-label">
                  Target category
                </InputLabel>
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
                onChange={(event) => {
                  setBoostTargetEdited(true);
                  setBoostRadiusKm(event.target.value);
                }}
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
                  setBoostTargetEdited(true);
                  setLocationError("");
                }}
                onRequestCurrentLocation={() =>
                  requestCurrentLocation({
                    applyToBoost: true,
                    onComplete: (success) => {
                      if (success) {
                        setBoostTargetEdited(true);
                      }
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
                    setBoostTargetEdited(true);
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
                  {totalBoostTokens.toLocaleString()} tokens (
                  {formatKshFromTokens(totalBoostTokens)}) for{" "}
                  {sanitizedBoostHours} hour
                  {sanitizedBoostHours > 1 ? "s" : ""} covering roughly{" "}
                  {sanitizedBoostRadiusKm.toFixed(1)} km.
                </Typography>
              </Alert>

              {boostTimeRemaining && !selectedBoost && (
                <Alert
                  severity="warning"
                  sx={{
                    borderRadius: "12px",
                    bgcolor: "rgba(255, 152, 0, 0.12)",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Active boost remaining: {boostTimeRemaining.hours}h{" "}
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
                sx={{
                  borderRadius: "12px",
                  bgcolor: "rgba(255, 193, 7, 0.12)",
                }}
              >
                <Typography variant="body2">
                  <strong>Current Balance:</strong>{" "}
                  {user?.token_balance || "0.00"} tokens
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
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Button
            onClick={handleCloseBoostDialog}
            disabled={boosting}
            sx={{
              color: "rgba(26, 26, 26, 0.7)",
              fontWeight: 600,
              fontSize: {
                xs: "0.75rem",
                sm: "0.85rem",
                md: "0.95rem",
              },
            }}
          >
            Cancel
          </Button>
          {activeBoosts.length === 0 && selectedBoost && (
            <Button
              onClick={handleExtendBoost}
              variant="contained"
              disabled={boosting || loadingBoostStatus}
              sx={{
                background: "linear-gradient(135deg, #2196F3, #64B5F6)",
                color: "#0D1C2C",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "12px",
                px: 3,
                py: 1,
                fontSize: {
                  xs: "0.74rem",
                  sm: "0.84rem",
                  md: "0.94rem",
                },
                "&:hover": {
                  background: "linear-gradient(135deg, #1976D2, #42A5F5)",
                },
                "&:disabled": {
                  background: "rgba(33, 150, 243, 0.35)",
                  color: "rgba(13, 28, 44, 0.6)",
                },
              }}
            >
              {boosting
                ? "Saving..."
                : `Extend (+${sanitizedBoostHours}h / ${totalBoostTokens.toLocaleString()} tokens)`}
            </Button>
          )}
          <Button
            onClick={handleBoostProfile}
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
              fontSize: {
                xs: "0.78rem",
                sm: "0.88rem",
                md: "1rem",
              },
              "&:hover": {
                background: "linear-gradient(135deg, #B8941F, #D4AF37)",
              },
            }}
          >
            {boosting
              ? "Boosting..."
              : `Boost New Area (${sanitizedBoostHours}h / ${totalBoostTokens.toLocaleString()} tokens)`}
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
                          alt={getDisplayName(owner, {
                            fallback: "Boosted user",
                          })}
                          sx={{
                            bgcolor: profileImage ? "transparent" : "#D4AF37",
                            color: profileImage ? "inherit" : "#1a1a1a",
                          }}
                        >
                          {profileImage
                            ? null
                            : getDisplayInitial(owner, { fallback: "B" })}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primaryTypographyProps={{
                          fontWeight: 700,
                          color: "#1a1a1a",
                        }}
                        primary={getDisplayName(owner, {
                          fallback: "Boosted profile",
                        })}
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
