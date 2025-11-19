import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  Close,
  CameraAlt,
  Image,
  VideoLibrary,
  LocationOn,
} from "@mui/icons-material";
import Swal from "sweetalert2";

const StoryCreator = ({ open, onClose, onStoryCreated }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationCoords, setLocationCoords] = useState({ latitude: null, longitude: null });
  const [gettingLocation, setGettingLocation] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Get user's current location when location toggle is enabled
  useEffect(() => {
    let isMounted = true;

    if (locationEnabled && !locationCoords.latitude && !gettingLocation) {
      setGettingLocation(true);
      console.log("📍 [StoryCreator] Requesting user location...");
      
      if (!navigator.geolocation) {
        console.log("❌ [StoryCreator] Geolocation not supported");
        if (isMounted) {
          Swal.fire({
            icon: "error",
            title: "Location Not Supported",
            text: "Your browser doesn't support location services",
            confirmButtonColor: "#D4AF37",
          });
          setLocationEnabled(false);
          setGettingLocation(false);
        }
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isMounted) return;
          const { latitude, longitude } = position.coords;
          console.log("✅ [StoryCreator] Location obtained:", { latitude, longitude });
          setLocationCoords({ latitude, longitude });
          setGettingLocation(false);
        },
        (error) => {
          if (!isMounted) return;
          console.error("❌ [StoryCreator] Location error:", error);
          let errorMessage = "Unable to get your location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location access.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          Swal.fire({
            icon: "error",
            title: "Location Error",
            text: errorMessage,
            confirmButtonColor: "#D4AF37",
          });
          setLocationEnabled(false);
          setLocationCoords({ latitude: null, longitude: null });
          setGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else if (!locationEnabled && locationCoords.latitude) {
      // Reset location when toggle is turned off
      if (isMounted) {
        setLocationCoords({ latitude: null, longitude: null });
        setGettingLocation(false);
      }
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [locationEnabled]);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const isImage = selectedFile.type.startsWith("image/");
    const isVideo = selectedFile.type.startsWith("video/");

    if (!isImage && !isVideo) {
      Swal.fire({
        icon: "error",
        title: "Invalid File Type",
        text: "Please select an image or video file",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    // Validate file size (50MB max)
    if (selectedFile.size > 50 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "File Too Large",
        text: "File size must be less than 50MB",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    setFile(selectedFile);

    // Create preview
    if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else if (isVideo) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setPreview(canvas.toDataURL());
      };
      video.src = URL.createObjectURL(selectedFile);
    }
  };

  const handleCreateStory = async () => {
    console.log("📸 [StoryCreator] Share Story button clicked");
    
    if (!file) {
      console.log("❌ [StoryCreator] No file selected");
      Swal.fire({
        icon: "warning",
        title: "No Media Selected",
        text: "Please select a photo or video",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.log("❌ [StoryCreator] No token found");
      Swal.fire({
        icon: "error",
        title: "Login Required",
        text: "Please login to create a story",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    console.log("📤 [StoryCreator] Starting story upload...", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      hasCaption: !!caption.trim(),
      locationEnabled,
      locationCoords,
    });

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("story_media", file);
      if (caption.trim()) {
        formData.append("caption", caption.trim());
      }

      // Add location coordinates if location toggle is enabled
      if (locationEnabled && locationCoords.latitude && locationCoords.longitude) {
        formData.append("latitude", locationCoords.latitude.toString());
        formData.append("longitude", locationCoords.longitude.toString());
        console.log("📍 [StoryCreator] Adding location coordinates:", {
          lat: locationCoords.latitude,
          lng: locationCoords.longitude,
        });
      }

      console.log("🚀 [StoryCreator] Sending POST request to /api/stories");
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("📥 [StoryCreator] Response received:", {
        status: response.status,
        statusText: response.statusText,
      });

      const data = await response.json();
      console.log("📦 [StoryCreator] Response data:", data);

      if (data.success) {
        console.log("✅ [StoryCreator] Story created successfully!", data.data);
        Swal.fire({
          icon: "success",
          title: "Story Created!",
          text: "Your story will be visible for 24 hours",
          confirmButtonColor: "#D4AF37",
          timer: 2000,
        });
        handleClose();
        if (onStoryCreated) {
          console.log("🔄 [StoryCreator] Calling onStoryCreated callback");
          onStoryCreated();
        }
      } else {
        console.error("❌ [StoryCreator] Story creation failed:", data.message);
        throw new Error(data.message || "Failed to create story");
      }
    } catch (err) {
      console.error("💥 [StoryCreator] Error creating story:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to Create Story",
        text: err.message || "Please try again later",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setUploading(false);
      console.log("🏁 [StoryCreator] Upload process finished");
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setCaption("");
    setLocationEnabled(false);
    setLocationCoords({ latitude: null, longitude: null });
    setGettingLocation(false);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          border: "1px solid rgba(212, 175, 55, 0.3)",
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
          justifyContent: "space-between",
        }}
      >
        Create Story
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {!preview ? (
          <Box
            sx={{
              border: "2px dashed #D4AF37",
              borderRadius: "16px",
              p: 4,
              textAlign: "center",
              cursor: "pointer",
              "&:hover": {
                bgcolor: "rgba(212, 175, 55, 0.05)",
              },
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <CameraAlt sx={{ fontSize: 64, color: "#D4AF37", mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Select Photo or Video
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(26,26,26,0.6)", mb: 2 }}>
              Choose a photo or video to share as your story
            </Typography>
            <Button
              variant="contained"
              startIcon={<Image />}
              sx={{
                bgcolor: "#D4AF37",
                color: "#1a1a1a",
                fontWeight: 600,
                mr: 1,
                "&:hover": {
                  bgcolor: "#B8941F",
                },
              }}
            >
              Choose File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
          </Box>
        ) : (
          <Box>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                borderRadius: "12px",
                overflow: "hidden",
                mb: 2,
              }}
            >
              {file?.type.startsWith("video/") ? (
                <Box
                  component="video"
                  src={preview}
                  controls
                  sx={{
                    width: "100%",
                    maxHeight: 400,
                    objectFit: "contain",
                  }}
                />
              ) : (
                <Box
                  component="img"
                  src={preview}
                  alt="Preview"
                  sx={{
                    width: "100%",
                    maxHeight: 400,
                    objectFit: "contain",
                  }}
                />
              )}
              <IconButton
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  bgcolor: "rgba(0,0,0,0.5)",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.7)",
                  },
                }}
              >
                <Close />
              </IconButton>
            </Box>

            <TextField
              fullWidth
              label="Caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 200 }}
              helperText={`${caption.length}/200 characters`}
            />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1.5,
                mb: 2,
                borderRadius: "12px",
                bgcolor: locationEnabled ? "rgba(212, 175, 55, 0.1)" : "rgba(0,0,0,0.02)",
                border: `1px solid ${locationEnabled ? "#D4AF37" : "rgba(0,0,0,0.1)"}`,
                transition: "all 0.3s ease",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOn
                  sx={{
                    color: locationEnabled ? "#D4AF37" : "rgba(0,0,0,0.5)",
                    transition: "color 0.3s ease",
                  }}
                />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Include Location
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.6)" }}>
                    {locationEnabled
                      ? locationCoords.latitude
                        ? "Location will be shared with your story"
                        : gettingLocation
                        ? "Getting your location..."
                        : "Enable to share your current location"
                      : "Your story will be discoverable by location"}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {gettingLocation && (
                  <CircularProgress size={20} sx={{ color: "#D4AF37" }} />
                )}
                <FormControlLabel
                  control={
                    <Switch
                      checked={locationEnabled}
                      onChange={(e) => setLocationEnabled(e.target.checked)}
                      disabled={gettingLocation}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#D4AF37",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: "#D4AF37",
                        },
                      }}
                    />
                  }
                  label=""
                />
              </Box>
            </Box>

            <Alert severity="info" sx={{ borderRadius: "12px" }}>
              Your story will be visible for 24 hours. Make it count!
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        {preview && (
          <Button
            onClick={handleCreateStory}
            variant="contained"
            disabled={uploading}
            sx={{
              bgcolor: "#D4AF37",
              color: "#1a1a1a",
              fontWeight: 600,
              "&:hover": {
                bgcolor: "#B8941F",
              },
            }}
          >
            {uploading ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1, color: "#1a1a1a" }} />
                Uploading...
              </>
            ) : (
              "Share Story"
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default StoryCreator;

