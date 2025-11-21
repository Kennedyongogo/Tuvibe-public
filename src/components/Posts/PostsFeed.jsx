import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Avatar,
  Skeleton,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import PostCard from "./PostCard";
import PostCreator from "./PostCreator";
import Swal from "sweetalert2";

const PostsFeed = ({ user, onRefresh }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchPosts = useCallback(async () => {
    if (!isMountedRef.current) return;

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

      const response = await fetch("/api/posts/feed?limit=20&offset=0", {
        method: "GET",
        headers,
      });

      const data = await response.json();

      if (!isMountedRef.current) return;

      if (data.success) {
        setPosts(data.data.posts || []);
      } else {
        setError(data.message || "Failed to load posts");
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError("Failed to load posts. Please try again.");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (onRefresh !== undefined && onRefresh !== null) {
      fetchPosts();
    }
  }, [onRefresh, fetchPosts]);

  const handlePostCreated = () => {
    setCreatorOpen(false);
    fetchPosts();
  };

  const handleReaction = async (postId, reactionType, emoji) => {
    // PostCard already made the API call and updated its local state
    // No need to refetch the entire feed - PostCard handles its own state updates
    // This prevents unnecessary component reloads
  };

  const handleRemoveReaction = async (postId, reactionId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const url = reactionId
        ? `/api/posts/${postId}/reactions/${reactionId}`
        : `/api/posts/${postId}/reactions`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchPosts();
      }
    } catch (err) {
      // Error removing reaction
    }
  };

  const handleComment = (post) => {
    // Comment handling is done in PostCard
    fetchPosts();
  };

  const handleDeletePost = async (postId) => {
    const result = await Swal.fire({
      title: "Delete Post?",
      text: "Are you sure you want to delete this post? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Your post has been deleted.",
          confirmButtonColor: "#D4AF37",
        });
        fetchPosts();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to delete post",
          confirmButtonColor: "#D4AF37",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete post. Please try again.",
        confirmButtonColor: "#D4AF37",
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        {[1, 2, 3].map((i) => (
          <Card key={i} sx={{ mb: 2 }}>
            <CardContent>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Create Post Button */}
      <Card
        sx={{
          mb: 2,
          borderRadius: "16px",
          border: "1px solid rgba(212, 175, 55, 0.2)",
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={
                user?.photo
                  ? `/uploads/${user.photo}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user?.name || "User"
                    )}&background=D4AF37&color=fff`
              }
              sx={{ width: 40, height: 40 }}
            />
            <Box
              sx={{
                flex: 1,
                bgcolor: "rgba(0,0,0,0.05)",
                borderRadius: "20px",
                px: 2,
                py: 1,
                cursor: "pointer",
                "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
              }}
              onClick={() => setCreatorOpen(true)}
            >
              <Typography variant="body2" color="text.secondary">
                What's on your mind?
              </Typography>
            </Box>
            <IconButton
              color="primary"
              onClick={() => setCreatorOpen(true)}
              sx={{
                bgcolor: "#D4AF37",
                color: "white",
                "&:hover": { bgcolor: "#B8941F" },
              }}
            >
              <Add />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Posts List */}
      {posts.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            No posts yet. Be the first to share something!
          </Typography>
        </Card>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={user}
            onReaction={handleReaction}
            onRemoveReaction={handleRemoveReaction}
            onComment={handleComment}
            onDelete={handleDeletePost}
          />
        ))
      )}

      {/* Post Creator Dialog */}
      <PostCreator
        open={creatorOpen}
        onClose={() => setCreatorOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </Box>
  );
};

export default PostsFeed;
