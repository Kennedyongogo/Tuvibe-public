import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import {
  Box,
  Avatar,
  Typography,
  CircularProgress,
  IconButton,
  Badge,
  Tooltip,
  Skeleton,
} from "@mui/material";
import { Add, TextFields } from "@mui/icons-material";

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

const StoriesFeed = ({
  user,
  onStoryClick,
  onCreateStory,
  onStoriesLoaded,
  refreshTrigger,
  onRefresh,
}) => {
  const [storiesFeed, setStoriesFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userImageError, setUserImageError] = useState(false);

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  // Track if we're currently fetching to avoid overlapping requests during polling
  const isFetchingRef = useRef(false);
  // Track component instance ID for debugging
  const instanceIdRef = useRef(Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    console.log(`🔵 [StoriesFeed] Component mounted (instance: ${instanceIdRef.current})`);
    isMountedRef.current = true;
    return () => {
      console.log(`🔴 [StoriesFeed] Component unmounting (instance: ${instanceIdRef.current})`);
      isMountedRef.current = false;
      // Reset fetching flag on unmount
      isFetchingRef.current = false;
    };
  }, []);

  // Store onStoriesLoaded in a ref to prevent unnecessary re-renders
  const onStoriesLoadedRef = useRef(onStoriesLoaded);
  useEffect(() => {
    onStoriesLoadedRef.current = onStoriesLoaded;
  }, [onStoriesLoaded]);

  const fetchStoriesFeed = useCallback(
    async (isBackgroundRefresh = false) => {
      if (!isMountedRef.current) return;

      // Prevent overlapping requests
      if (isFetchingRef.current) {
        console.log("⏸️ [StoriesFeed] Already fetching, skipping duplicate request...");
        return;
      }

      isFetchingRef.current = true;
      console.log("🔄 [StoriesFeed] Fetching stories feed...", {
        isBackgroundRefresh,
      });

      // Only show loading state if it's not a background refresh
      if (!isBackgroundRefresh) {
        setLoading(true);
        setError(null);
      }
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
            stories: stories.map((s) => ({
              id: s.id,
              userId: s.public_user_id,
              mediaUrl: s.media_url,
              caption: s.caption,
            })),
          });

          // Sort stories so current user's story appears first
          const sortedStories = [...stories].sort((a, b) => {
            const aIsCurrentUser = a?.user?.id === user?.id;
            const bIsCurrentUser = b?.user?.id === user?.id;

            // If one is current user and the other isn't, current user comes first
            if (aIsCurrentUser && !bIsCurrentUser) return -1;
            if (!aIsCurrentUser && bIsCurrentUser) return 1;

            // Otherwise maintain original order
            return 0;
          });

          setStoriesFeed(sortedStories);
          if (onStoriesLoadedRef.current && isMountedRef.current) {
            onStoriesLoadedRef.current(stories);
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
          // Only update loading state if it's not a background refresh
          if (!isBackgroundRefresh) {
            setLoading(false);
          }
          isFetchingRef.current = false;
          console.log("🏁 [StoriesFeed] Fetch completed");
        } else {
          isFetchingRef.current = false;
        }
      }
    },
    [user?.latitude, user?.longitude, user?.id]
  );

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

  // Initial fetch - only run once per component instance
  // Note: In development with StrictMode, React intentionally mounts components twice
  // This will cause 2 requests, which is expected and normal behavior
  const hasInitialFetchedRef = useRef(false);
  useEffect(() => {
    console.log(`🔍 [StoriesFeed] Initial fetch effect running (instance: ${instanceIdRef.current})`, {
      isMounted: isMountedRef.current,
      hasFetched: hasInitialFetchedRef.current,
      isFetching: isFetchingRef.current
    });
    
    if (isMountedRef.current && !hasInitialFetchedRef.current && !isFetchingRef.current) {
      hasInitialFetchedRef.current = true;
      console.log(`🚀 [StoriesFeed] Initial mount - fetching stories feed (instance: ${instanceIdRef.current})`);
      fetchStoriesFeed();
    } else {
      console.log(`⏭️ [StoriesFeed] Skipping initial fetch (instance: ${instanceIdRef.current})`, {
        isMounted: isMountedRef.current,
        hasFetched: hasInitialFetchedRef.current,
        isFetching: isFetchingRef.current
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Use SSE for real-time updates with backup polling (scalable for 10k+ users)
  // Polling runs alongside SSE as backup to ensure approved stories are visible
  useEffect(() => {
    if (!isMountedRef.current || !user?.id) return;

    let pollInterval = null;
    let sseEventSource = null;

    // Backup polling with shorter interval (30 seconds) - runs alongside SSE as backup
    const startBackupPolling = () => {
      if (pollInterval) return; // Already polling

      console.log("🔄 [StoriesFeed] Starting backup polling (30 sec interval)");
      pollInterval = setInterval(() => {
        if (!isMountedRef.current) {
          clearInterval(pollInterval);
          return;
        }

        // Only poll if page is visible
        if (document.hidden) {
          return;
        }

        // Only refresh if not currently fetching
        if (!isFetchingRef.current) {
          console.log("🔄 [StoriesFeed] Backup polling - checking for new stories");
          fetchStoriesFeedRef.current(true);
        }
      }, 30000); // 30 seconds - shorter interval to catch approved stories quickly
    };

    // Try to use SSE for real-time updates (much more scalable)
    const setupSSE = () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return false;

        const isDev = import.meta.env.DEV;
        const protocol = window.location.protocol;
        const host = window.location.hostname;
        const apiPort = isDev ? "4000" : window.location.port || "";
        const sseUrl = isDev
          ? `${protocol}//${host}:${apiPort}/api/sse/events?token=${encodeURIComponent(token)}`
          : `${protocol}//${host}${apiPort ? `:${apiPort}` : ""}/api/sse/events?token=${encodeURIComponent(token)}`;

        sseEventSource = new EventSource(sseUrl);

        sseEventSource.addEventListener("story:new", (event) => {
          if (!isMountedRef.current) return;
          try {
            const data = JSON.parse(event.data);
            console.log("📡 [StoriesFeed] SSE: New story event received", data);
            // Refresh feed when new story is created/approved
            if (!isFetchingRef.current) {
              fetchStoriesFeedRef.current(true);
            }
          } catch (err) {
            console.error("❌ [StoriesFeed] Error parsing SSE story event:", err);
          }
        });

        sseEventSource.addEventListener("story:approved", (event) => {
          if (!isMountedRef.current) return;
          try {
            const data = JSON.parse(event.data);
            console.log("📡 [StoriesFeed] SSE: Story approved event received", data);
            // Refresh feed when story is approved
            if (!isFetchingRef.current) {
              fetchStoriesFeedRef.current(true);
            }
          } catch (err) {
            console.error("❌ [StoriesFeed] Error parsing SSE approval event:", err);
          }
        });

        sseEventSource.onopen = () => {
          console.log("✅ [StoriesFeed] SSE connected - using real-time updates");
          // Keep polling running as backup even when SSE is connected
          // This ensures we catch approved stories even if SSE events are missed
        };

        sseEventSource.onerror = (error) => {
          console.warn("⚠️ [StoriesFeed] SSE error:", error);
          // Polling should already be running as backup
          // If it's not, start it
          if (!pollInterval) {
            startBackupPolling();
          }
        };

        return true; // SSE setup successful
      } catch (err) {
        console.warn("⚠️ [StoriesFeed] SSE not available, using polling fallback:", err);
        return false; // SSE setup failed
      }
    };

    // Try SSE first, but always start backup polling as well
    const sseSuccess = setupSSE();
    // Always start polling as backup, even if SSE is working
    // This ensures we catch approved stories even if SSE events are missed
    startBackupPolling();

    // Handle page visibility for backup polling
    const handleVisibilityChange = () => {
      if (document.hidden && pollInterval) {
        // Page hidden - polling will skip when hidden
        console.log("⏸️ [StoriesFeed] Page hidden - polling paused");
      } else if (!document.hidden && pollInterval) {
        // Page visible - polling will resume on next interval
        console.log("👁️ [StoriesFeed] Page visible - polling active");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      if (sseEventSource) {
        sseEventSource.close();
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user?.id]); // Re-setup if user changes

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
      console.log(
        "🔄 [StoriesFeed] Creator closed, refreshing feed in 500ms..."
      );
      // Small delay to ensure backend has processed the new story
      const timer = setTimeout(() => {
        if (!isMountedRef.current) return;
        setUserImageError(false); // Reset image error state
        console.log("🔄 [StoriesFeed] Executing feed refresh (background)...");
        // Use ref to get latest function without causing re-renders
        // Pass true for background refresh since user just created the story
        fetchStoriesFeedRef.current(true);
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
    if (!firstStory) return null;
    // For text stories, media_url is null, so return null to show text preview
    if (firstStory.media_type === "text") return null;
    if (!firstStory.media_url) return null;
    return getImageUrl(firstStory.media_url);
  };

  const getStoryType = (stories) => {
    if (!stories || stories.length === 0) return null;
    const firstStory = stories[0];
    return firstStory?.media_type || null;
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
        // Fixed height to prevent layout shift during loading
        minHeight: "180px", // Height of story item (140px) + gap + text + padding
        height: "180px",
        display: "flex",
        alignItems: "flex-start",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          overflowY: "hidden", // Prevent vertical overflow
          pb: 1,
          pt: 0,
          width: "100%",
          alignItems: "flex-start",
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
              justifyContent: "flex-start",
              gap: 1,
              minWidth: 100,
              maxWidth: 100,
              flexShrink: 0,
              height: "100%",
            }}
          >
            <Skeleton
              variant="rectangular"
              width={100}
              height={140}
              sx={{
                borderRadius: "12px",
                flexShrink: 0,
              }}
            />
            <Skeleton 
              width={60} 
              height={16}
              sx={{
                flexShrink: 0,
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 1,
              minWidth: 100,
              maxWidth: 100,
              flexShrink: 0,
              height: "100%",
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
                  {user?.name?.charAt(0)?.toUpperCase() ||
                    user?.username?.charAt(0)?.toUpperCase() ||
                    "U"}
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

        {/* Story Items Skeleton Loading */}
        {loading &&
          Array.from({ length: 5 }).map((_, index) => (
            <Box
              key={`skeleton-${index}`}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: 1,
                minWidth: 100,
                maxWidth: 100,
                flexShrink: 0,
                // Match exact height of actual story items
                height: "100%",
              }}
            >
              <Skeleton
                variant="rectangular"
                width={100}
                height={140}
                sx={{
                  borderRadius: "12px",
                  flexShrink: 0,
                }}
              />
              <Skeleton 
                width={60} 
                height={16}
                sx={{
                  flexShrink: 0,
                }}
              />
            </Box>
          ))}

        {/* Story Items */}
        {!loading &&
          storiesFeed &&
          Array.isArray(storiesFeed) &&
          storiesFeed.length > 0 &&
          storiesFeed
            .filter((storyGroup) => {
              return (
                storyGroup &&
                storyGroup.user &&
                storyGroup.user.id &&
                storyGroup.stories &&
                Array.isArray(storyGroup.stories) &&
                storyGroup.stories.length > 0
              );
            })
            .map((storyGroup) => {
              const preview = getStoryPreview(storyGroup.stories);
              const storyType = getStoryType(storyGroup.stories);
              const hasUnviewed = hasUnviewedStories(storyGroup.stories);
              const storyCount = storyGroup.stories?.length || 0;
              const userId = storyGroup.user?.id;
              const isTextStory = storyType === "text";

              return (
                <Box
                  key={`story-group-${userId}`}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: 1,
                    minWidth: 100,
                    maxWidth: 100,
                    flexShrink: 0,
                    height: "100%",
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
                    {isTextStory ? (
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          background:
                            (storyGroup.stories?.[0]?.metadata &&
                              typeof storyGroup.stories[0].metadata ===
                                "object" &&
                              storyGroup.stories[0].metadata
                                .background_color) ||
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          p: 1,
                          gap: 0.5,
                        }}
                      >
                        <TextFields
                          sx={{ fontSize: 32, color: "white", opacity: 0.9 }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "white",
                            fontSize: "0.6rem",
                            textAlign: "center",
                            fontWeight: 600,
                            textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            lineHeight: 1.2,
                          }}
                        >
                          {storyGroup.stories?.[0]?.caption?.substring(0, 30) ||
                            "Text Story"}
                          {storyGroup.stories?.[0]?.caption?.length > 30
                            ? "..."
                            : ""}
                        </Typography>
                      </Box>
                    ) : preview ? (
                      <StoryPreviewImage
                        src={preview}
                        alt={storyGroup.user?.name || "Story"}
                        hasUnviewed={hasUnviewed}
                        userInitial={
                          storyGroup.user?.name?.charAt(0)?.toUpperCase() || "U"
                        }
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
                          {storyGroup.user?.name?.charAt(0)?.toUpperCase() ||
                            "U"}
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
                    {storyGroup.user?.id === user?.id
                      ? storyGroup.user?.name ||
                        storyGroup.user?.username ||
                        "You"
                      : storyGroup.user?.username ||
                        storyGroup.user?.name ||
                        "User"}
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
