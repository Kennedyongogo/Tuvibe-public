import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  Box,
  IconButton,
  Typography,
  Avatar,
  LinearProgress,
  Stack,
  Chip,
  TextField,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Close,
  ArrowBackIos,
  ArrowForwardIos,
  Favorite,
  FavoriteBorder,
  Comment,
  Send,
  LocationOn,
  Verified,
  Delete,
  MoreVert,
} from "@mui/icons-material";
import Swal from "sweetalert2";

const StoryViewer = ({ open, onClose, storyGroup, onNextGroup, onPrevGroup, currentUser, onStoryDeleted }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reaction, setReaction] = useState(null);
  const [comment, setComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const progressIntervalRef = useRef(null);
  const storyTimeoutRef = useRef(null);

  const stories = storyGroup?.stories || [];
  const currentStory = stories[currentStoryIndex];
  const user = storyGroup?.user;
  const [deleteMenuAnchor, setDeleteMenuAnchor] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (open && stories.length > 0) {
      setCurrentStoryIndex(0);
      setProgress(0);
      setIsPaused(false);
      // Load user's reaction for current story
      const firstStory = stories[0];
      if (firstStory.user_reaction) {
        setReaction(firstStory.user_reaction);
      } else {
        setReaction(null);
      }
      startProgress();
    }
    return () => {
      clearProgress();
    };
  }, [open, storyGroup]);

  useEffect(() => {
    // Update reaction when story changes
    if (currentStory) {
      if (currentStory.user_reaction) {
        setReaction(currentStory.user_reaction);
      } else {
        setReaction(null);
      }
    }
  }, [currentStoryIndex, currentStory]);

  useEffect(() => {
    if (open && currentStory && !isPaused) {
      startProgress();
    } else {
      clearProgress();
    }
    return () => clearProgress();
  }, [currentStoryIndex, isPaused, open, currentStory]);

  const startProgress = () => {
    clearProgress();
    const duration = 5000; // 5 seconds per story
    const interval = 100; // Update every 100ms
    let currentProgress = 0;

    progressIntervalRef.current = setInterval(() => {
      currentProgress += (interval / duration) * 100;
      if (currentProgress >= 100) {
        handleNextStory();
      } else {
        setProgress(currentProgress);
      }
    }, interval);
  };

  const clearProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (storyTimeoutRef.current) {
      clearTimeout(storyTimeoutRef.current);
      storyTimeoutRef.current = null;
    }
  };

  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else {
      handleNextGroupClick();
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    } else {
      handlePrevGroupClick();
    }
  };

  const handleNextGroupClick = () => {
    if (onNextGroup) {
      onNextGroup();
    } else {
      onClose();
    }
  };

  const handlePrevGroupClick = () => {
    if (onPrevGroup) {
      onPrevGroup();
    } else {
      onClose();
    }
  };

  const handleReaction = async () => {
    if (!currentStory) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const reactionType = reaction ? null : "like";
      const url = `/api/stories/${currentStory.id}/reactions`;
      const method = reaction ? "DELETE" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: method === "POST" ? JSON.stringify({ reaction_type: reactionType }) : undefined,
      });

      const data = await response.json();
      if (data.success) {
        setReaction(reaction ? null : { reaction_type: reactionType });
      }
    } catch (err) {
      console.error("Error adding reaction:", err);
    }
  };

  const handleSendComment = async () => {
    if (!comment.trim() || !currentStory) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setSendingComment(true);
    try {
      const response = await fetch(`/api/stories/${currentStory.id}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: comment.trim() }),
      });

      const data = await response.json();
      if (data.success) {
        setComment("");
        // Optionally refresh story data
      }
    } catch (err) {
      console.error("Error sending comment:", err);
    } finally {
      setSendingComment(false);
    }
  };

  const handleDeleteStory = async () => {
    if (!currentStory) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Login Required",
        text: "Please login to delete stories",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    const result = await Swal.fire({
      icon: "warning",
      title: "Delete Story?",
      text: "This story will be permanently deleted. This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#D4AF37",
    });

    if (!result.isConfirmed) {
      setDeleteMenuAnchor(null);
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/stories/${currentStory.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        Swal.fire({
          icon: "success",
          title: "Story Deleted",
          text: "Your story has been deleted successfully",
          confirmButtonColor: "#D4AF37",
          timer: 2000,
        });

        // Remove deleted story from current stories array
        const remainingStories = stories.filter(s => s.id !== currentStory.id);
        
        if (remainingStories.length === 0) {
          // No more stories in this group, close viewer
          if (onStoryDeleted) {
            onStoryDeleted();
          }
          onClose();
        } else {
          // Move to next story or previous if at the end
          const newIndex = currentStoryIndex >= remainingStories.length 
            ? remainingStories.length - 1 
            : currentStoryIndex;
          setCurrentStoryIndex(newIndex);
          
          // Update the storyGroup prop by calling onStoryDeleted with updated group
          if (onStoryDeleted) {
            onStoryDeleted({
              ...storyGroup,
              stories: remainingStories,
            });
          }
        }
      } else {
        throw new Error(data.message || "Failed to delete story");
      }
    } catch (err) {
      console.error("Error deleting story:", err);
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: err.message || "Failed to delete story. Please try again.",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setDeleting(false);
      setDeleteMenuAnchor(null);
    }
  };

  // Check if current user owns the story
  const isStoryOwner = currentUser && currentStory && (
    currentUser.id === currentStory.public_user_id || 
    currentUser.id === user?.id
  );

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

  if (!open || !currentStory) return null;

  const mediaUrl = getImageUrl(currentStory.media_url);
  const isVideo = currentStory.media_type === "video";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: "#000",
          m: 0,
          borderRadius: 0,
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Progress Bars */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            display: "flex",
            gap: 0.5,
            p: 1.5,
          }}
        >
          {stories.map((_, index) => (
            <Box
              key={index}
              sx={{
                flex: 1,
                height: 3,
                bgcolor: "rgba(255,255,255,0.3)",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <LinearProgress
                variant="determinate"
                value={index < currentStoryIndex ? 100 : index === currentStoryIndex ? progress : 0}
                sx={{
                  height: "100%",
                  bgcolor: "#D4AF37",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: "#D4AF37",
                  },
                }}
              />
            </Box>
          ))}
        </Box>

        {/* Header */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            pt: 6,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              src={getImageUrl(user?.photo)}
              sx={{ width: 40, height: 40, border: "2px solid #D4AF37" }}
            >
              {user?.name?.charAt(0)}
            </Avatar>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography
                  variant="body2"
                  sx={{ color: "white", fontWeight: 600 }}
                >
                  {user?.name || user?.username}
                </Typography>
                {user?.isVerified && (
                  <Verified sx={{ fontSize: 16, color: "#D4AF37" }} />
                )}
              </Box>
              {currentStory.location && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <LocationOn sx={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }} />
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    {currentStory.location}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isStoryOwner && (
              <>
                <IconButton
                  onClick={(e) => setDeleteMenuAnchor(e.currentTarget)}
                  disabled={deleting}
                  sx={{ 
                    color: "white",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" }
                  }}
                >
                  <MoreVert />
                </IconButton>
                <Menu
                  anchorEl={deleteMenuAnchor}
                  open={Boolean(deleteMenuAnchor)}
                  onClose={() => setDeleteMenuAnchor(null)}
                  PaperProps={{
                    sx: {
                      bgcolor: "rgba(0,0,0,0.9)",
                      color: "white",
                      border: "1px solid rgba(212, 175, 55, 0.3)",
                    },
                  }}
                >
                  <MenuItem
                    onClick={handleDeleteStory}
                    disabled={deleting}
                    sx={{
                      color: "#ff4444",
                      "&:hover": { bgcolor: "rgba(255, 68, 68, 0.1)" },
                    }}
                  >
                    <Delete sx={{ mr: 1, fontSize: 18 }} />
                    {deleting ? "Deleting..." : "Delete Story"}
                  </MenuItem>
                </Menu>
              </>
            )}
            <IconButton onClick={onClose} sx={{ color: "white" }}>
              <Close />
            </IconButton>
          </Box>
        </Box>

        {/* Media */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {isVideo ? (
            <Box
              component="video"
              src={mediaUrl}
              autoPlay
              loop={false}
              muted
              playsInline
              sx={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <Box
              component="img"
              src={mediaUrl}
              alt="Story"
              sx={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          )}

          {/* Navigation Arrows */}
          <IconButton
            onClick={handlePrevStory}
            sx={{
              position: "absolute",
              left: 16,
              color: "white",
              bgcolor: "rgba(0,0,0,0.3)",
              "&:hover": { bgcolor: "rgba(0,0,0,0.5)" },
            }}
          >
            <ArrowBackIos />
          </IconButton>
          <IconButton
            onClick={handleNextStory}
            sx={{
              position: "absolute",
              right: 16,
              color: "white",
              bgcolor: "rgba(0,0,0,0.3)",
              "&:hover": { bgcolor: "rgba(0,0,0,0.5)" },
            }}
          >
            <ArrowForwardIos />
          </IconButton>
        </Box>

        {/* Caption */}
        {currentStory.caption && (
          <Box
            sx={{
              position: "absolute",
              bottom: 120,
              left: 0,
              right: 0,
              p: 2,
              background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "white", textAlign: "center" }}
            >
              {currentStory.caption}
            </Typography>
          </Box>
        )}

        {/* Actions */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton
              onClick={handleReaction}
              sx={{ color: reaction ? "#D4AF37" : "white" }}
            >
              {reaction ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <TextField
              placeholder="Send a message..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendComment();
                }
              }}
              size="small"
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(255,255,255,0.1)",
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#D4AF37",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "white",
                  "&::placeholder": {
                    color: "rgba(255,255,255,0.5)",
                  },
                },
              }}
            />
            <IconButton
              onClick={handleSendComment}
              disabled={!comment.trim() || sendingComment}
              sx={{ color: "#D4AF37" }}
            >
              <Send />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
};

export default StoryViewer;

