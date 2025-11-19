import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import {
  Box,
  Avatar,
  Typography,
  CircularProgress,
  IconButton,
  Badge,
  Tooltip,
} from "@mui/material";
import {
  Add,
} from "@mui/icons-material";

// Component to handle story preview images with error fallback
const StoryPreviewImage = ({ src, alt, hasUnviewed, userInitial }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          bgcolor: hasUnviewed ? "#D4AF37" : "rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Avatar
          sx={{
            width: 50,
            height: 50,
            bgcolor: hasUnviewed ? "#1a1a1a" : "rgba(0,0,0,0.3)",
            color: "white",
            fontWeight: 700,
            fontSize: "1.5rem",
          }}
        >
          {userInitial}
        </Avatar>
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      onError={() => setImageError(true)}
      sx={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      }}
    />
  );
};

const StoriesFeed = ({ user, onStoryClick, onCreateStory, onStoriesLoaded, refreshTrigger, onRefresh }) => {
  const [storiesFeed, setStoriesFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userImageError, setUserImageError] = useState(false);

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchStoriesFeed = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    console.log("🔄 [StoriesFeed] Fetching stories feed...");
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Get user location if available
      const userLat = user?.latitude;
      const userLng = user?.longitude;
      let url = "/api/stories/feed";
      if (userLat && userLng) {
        url += `?latitude=${userLat}&longitude=${userLng}&radius=50`;
      }

      console.log("📡 [StoriesFeed] Fetching from URL:", url);
      const response = await fetch(url, { headers });
      console.log("📥 [StoriesFeed] Response status:", response.status);
      
      const data = await response.json();
      console.log("📦 [StoriesFeed] Response data:", data);

      if (!isMountedRef.current) return;

      if (data.success) {
        const stories = data.data?.stories || [];
        console.log("✅ [StoriesFeed] Stories fetched successfully:", {
          count: stories.length,
          stories: stories.map(s => ({
            id: s.id,
            userId: s.public_user_id,
            mediaUrl: s.media_url,
            caption: s.caption,
          })),
        });
        setStoriesFeed(stories);
        if (onStoriesLoaded && isMountedRef.current) {
          onStoriesLoaded(stories);
        }
      } else {
        setError(data.message || "Failed to load stories");
        console.error("❌ [StoriesFeed] Error:", data.message);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error("💥 [StoriesFeed] Error fetching stories feed:", err);
      setError("Failed to load stories");
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        console.log("🏁 [StoriesFeed] Fetch completed");
      }
    }
  }, [user?.latitude, user?.longitude, onStoriesLoaded]);

  // Store the latest fetchStoriesFeed in a ref to avoid dependency issues
  const fetchStoriesFeedRef = useRef(fetchStoriesFeed);
  useEffect(() => {
    fetchStoriesFeedRef.current = fetchStoriesFeed;
  }, [fetchStoriesFeed]);

  // Expose refresh function to parent via callback
  useEffect(() => {
    if (onRefresh) {
      onRefresh(() => {
        fetchStoriesFeedRef.current();
      });
    }
  }, [onRefresh]);

  // Initial fetch - only run once on mount
  useEffect(() => {
    if (isMountedRef.current) {
      fetchStoriesFeed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Track previous refreshTrigger value to detect when creator closes
  const prevRefreshTriggerRef = useRef(refreshTrigger);
  
  // Refresh feed when story creator closes (after creating a story)
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    console.log("🔄 [StoriesFeed] refreshTrigger changed:", {
      previous: prevRefreshTriggerRef.current,
      current: refreshTrigger,
    });
    
    // If creator was open (true) and now closed (false), refresh the feed
    if (prevRefreshTriggerRef.current === true && refreshTrigger === false) {
      console.log("🔄 [StoriesFeed] Creator closed, refreshing feed in 500ms...");
      // Small delay to ensure backend has processed the new story
      const timer = setTimeout(() => {
        if (!isMountedRef.current) return;
        setUserImageError(false); // Reset image error state
        console.log("🔄 [StoriesFeed] Executing feed refresh...");
        // Use ref to get latest function without causing re-renders
        fetchStoriesFeedRef.current();
      }, 500);
      
      prevRefreshTriggerRef.current = refreshTrigger;
      return () => {
        clearTimeout(timer);
      };
    }
    
    prevRefreshTriggerRef.current = refreshTrigger;
  }, [refreshTrigger]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return imagePath;
    // Handle stories path format: "stories/filename.jpg" -> "/uploads/stories/filename.jpg"
    if (imagePath.startsWith("stories/")) return `/uploads/${imagePath}`;
    if (imagePath.startsWith("uploads/")) return `/${imagePath}`;
    if (imagePath.startsWith("profiles/")) return `/uploads/${imagePath}`;
    return `/uploads/${imagePath}`;
  };

  const getStoryPreview = (stories) => {
    if (!stories || stories.length === 0) return null;
    const firstStory = stories[0];
    if (!firstStory || !firstStory.media_url) return null;
    return getImageUrl(firstStory.media_url);
  };

  const hasUnviewedStories = (stories) => {
    return stories?.some((story) => !story.has_viewed) || false;
  };

  // Always show the section with "Your Story" button, even during loading
  // Use useMemo to prevent unnecessary re-renders of the JSX
  return (
    <Box
      sx={{
        mb: 0,
        px: { xs: 0, sm: 0 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          overflowY: "visible",
          pb: 1,
          pt: 0,
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": {
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(0,0,0,0.05)",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(212, 175, 55, 0.5)",
            borderRadius: "3px",
            "&:hover": {
              background: "rgba(212, 175, 55, 0.7)",
            },
          },
        }}
      >
        {/* Create Story Button - Always visible */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              minWidth: 100,
              height: 120,
            }}
          >
            <CircularProgress sx={{ color: "#D4AF37" }} size={40} />
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              minWidth: 100,
              maxWidth: 100,
              cursor: "pointer",
              transition: "all 0.2s ease",
              position: "relative",
              "&:hover": {
                opacity: 0.9,
                "& .story-preview": {
                  transform: "scale(1.02)",
                },
              },
              "&:active": {
                transform: "scale(0.98)",
              },
            }}
            onClick={() => {
              if (onCreateStory) {
                onCreateStory();
              }
            }}
          >
            <Box
              className="story-preview"
              sx={{
                position: "relative",
                width: 100,
                height: 140,
                borderRadius: "12px",
                overflow: "hidden",
                border: "2px solid #D4AF37",
                bgcolor: "#D4AF37",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(212, 175, 55, 0.3)",
              }}
            >
              {user?.photo && !userImageError ? (
                <Box
                  component="img"
                  src={getImageUrl(user.photo)}
                  alt="Your story"
                  onError={() => {
                    setUserImageError(true);
                  }}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <Typography
                  sx={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "#1a1a1a",
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || "U"}
                </Typography>
              )}
              {/* Plus icon overlay */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: "#D4AF37",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                <Add sx={{ fontSize: 18, color: "#1a1a1a", fontWeight: 700 }} />
              </Box>
            </Box>
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.7rem",
                color: "rgba(26, 26, 26, 0.8)",
                textAlign: "center",
                width: "100%",
                fontWeight: 600,
                mt: 0.5,
              }}
            >
              Your Story
            </Typography>
          </Box>
        )}

        {/* Story Items */}
        {storiesFeed && Array.isArray(storiesFeed) && storiesFeed.length > 0 && storiesFeed
          .filter((storyGroup) => {
            return storyGroup && 
                   storyGroup.user && 
                   storyGroup.user.id &&
                   storyGroup.stories && 
                   Array.isArray(storyGroup.stories) &&
                   storyGroup.stories.length > 0;
          })
          .map((storyGroup) => {
          const preview = getStoryPreview(storyGroup.stories);
          const hasUnviewed = hasUnviewedStories(storyGroup.stories);
          const storyCount = storyGroup.stories?.length || 0;
          const userId = storyGroup.user?.id;

          return (
            <Box
              key={`story-group-${userId}`}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                minWidth: 100,
                maxWidth: 100,
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  opacity: 0.9,
                  "& .story-item-preview": {
                    transform: "scale(1.02)",
                  },
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
              onClick={() => onStoryClick(storyGroup)}
            >
              <Box
                className="story-item-preview"
                sx={{
                  position: "relative",
                  width: 100,
                  height: 140,
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: hasUnviewed
                    ? "2px solid #D4AF37"
                    : "2px solid rgba(0,0,0,0.2)",
                  transition: "all 0.2s ease",
                  boxShadow: hasUnviewed
                    ? "0 2px 8px rgba(212, 175, 55, 0.3)"
                    : "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {preview ? (
                  <StoryPreviewImage
                    src={preview}
                    alt={storyGroup.user?.name || "Story"}
                    hasUnviewed={hasUnviewed}
                    userInitial={storyGroup.user?.name?.charAt(0)?.toUpperCase() || "U"}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      bgcolor: hasUnviewed ? "#D4AF37" : "rgba(0,0,0,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Avatar
                      src={getImageUrl(storyGroup.user?.photo)}
                      sx={{
                        width: 50,
                        height: 50,
                        bgcolor: "transparent",
                      }}
                    >
                      {storyGroup.user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </Avatar>
                  </Box>
                )}
                {/* Story count badge */}
                {storyCount > 1 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      bgcolor: "#D4AF37",
                      color: "#1a1a1a",
                      borderRadius: "12px",
                      px: 1,
                      py: 0.25,
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      border: "1px solid white",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    {storyCount}
                  </Box>
                )}
                {/* Unviewed indicator */}
                {hasUnviewed && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: "#D4AF37",
                      border: "2px solid white",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                  />
                )}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.7rem",
                  color: "rgba(26, 26, 26, 0.8)",
                  textAlign: "center",
                  width: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontWeight: hasUnviewed ? 600 : 400,
                  mt: 0.5,
                }}
              >
                {storyGroup.user?.name || storyGroup.user?.username || "User"}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(StoriesFeed);

