import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  IconButton,
  Box,
  Chip,
  Button,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  ThumbUp,
  Comment,
  Share,
  Favorite,
  MoreVert,
  Delete,
  Verified,
  LocationOn,
  EmojiEmotions,
  Send,
  Close,
} from "@mui/icons-material";
import EmojiPicker from "../EmojiPicker/EmojiPicker";
import Swal from "sweetalert2";

const PostCard = ({
  post,
  currentUser,
  onReaction,
  onRemoveReaction,
  onComment,
  onDelete,
}) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [emojiAnchor, setEmojiAnchor] = useState(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [likesOpen, setLikesOpen] = useState(false);
  const [emojiReactionsOpen, setEmojiReactionsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState({});
  const [postDetails, setPostDetails] = useState({
    ...post,
    user_reaction: post.user_reaction || null,
    reaction_count: Number(post.reaction_count || 0),
    like_count: Number(post.like_count || 0),
    emoji_reaction_count: Number(post.emoji_reaction_count || 0),
    comment_count: Number(post.comment_count || 0),
    recent_emoji_reactions: post.recent_emoji_reactions || [],
  });
  const [lastUpdateTime, setLastUpdateTime] = useState(0);

  const isOwner = currentUser && post.user?.id === currentUser.id;

  // Update postDetails when post prop changes
  // But don't overwrite if we just updated locally (within last 2 seconds)
  useEffect(() => {
    const now = Date.now();
    // Only update from prop if we haven't recently updated locally
    if (now - lastUpdateTime < 2000) {
      return;
    }

    const updatedDetails = {
      ...post,
      user_reaction: post.user_reaction || null,
      reaction_count: Number(post.reaction_count || 0),
      like_count: Number(post.like_count || 0),
      emoji_reaction_count: Number(post.emoji_reaction_count || 0),
      comment_count: Number(post.comment_count || 0),
      recent_emoji_reactions: post.recent_emoji_reactions || [],
    };
    setPostDetails(updatedDetails);
  }, [post, lastUpdateTime]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const handleReaction = async (reactionType, emoji) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Login Required",
          text: "Please login to react to posts",
          confirmButtonColor: "#D4AF37",
        });
        return;
      }

      const response = await fetch(`/api/posts/${post.id}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reaction_type: reactionType,
          emoji: emoji || null,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Update counts immediately from response if available
        if (data.data) {
          setPostDetails((prev) => {
            const updates = { ...prev };

            // Update like_count if provided (ensure it's never negative)
            if (
              data.data.like_count !== undefined &&
              data.data.like_count !== null
            ) {
              updates.like_count = Math.max(0, Number(data.data.like_count));
            }

            // Update emoji_reaction_count if provided
            if (
              data.data.emoji_reaction_count !== undefined &&
              data.data.emoji_reaction_count !== null
            ) {
              updates.emoji_reaction_count = Number(
                data.data.emoji_reaction_count
              );
            }

            // Update reaction_count if provided
            if (
              data.data.reaction_count !== undefined &&
              data.data.reaction_count !== null
            ) {
              updates.reaction_count = Number(data.data.reaction_count);
            }

            // If like was removed, clear user_reaction
            if (data.data.removed && reactionType === "like") {
              updates.user_reaction = null;
            } else if (data.data.user_reaction && reactionType === "like") {
              // If like was added, set user_reaction
              updates.user_reaction = data.data.user_reaction;
            } else if (data.data.reaction && reactionType === "like") {
              // Fallback: use reaction if user_reaction not provided
              updates.user_reaction = data.data.reaction;
            }

            setLastUpdateTime(Date.now());
            return updates;
          });
        }
        // Notify parent to refresh feed after state update
        // Use a longer delay to ensure database transaction is committed
        if (onReaction) {
          setTimeout(() => {
            onReaction(post.id, reactionType, emoji);
          }, 200);
        }
      }
    } catch (err) {
      // Error adding reaction
    }
  };

  const handleOpenEmojiPicker = (event) => {
    setEmojiAnchor(event.currentTarget);
    setEmojiPickerOpen(true);
  };

  const handleEmojiSelect = (emoji) => {
    handleReaction("emoji", emoji);
    setEmojiPickerOpen(false);
  };

  const handleLike = () => {
    // For likes, backend handles toggle - just call handleReaction
    // Backend will check if user already liked and remove it if so
    handleReaction("like");
  };

  const fetchPostDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/posts/${post.id}`, {
        method: "GET",
        headers,
      });

      const data = await response.json();
      if (data.success && data.data.post) {
        const updatedPost = data.data.post;
        const newDetails = {
          ...updatedPost,
          user_reaction: updatedPost.user_reaction || null,
          like_count: Number(updatedPost.like_count || 0),
          emoji_reaction_count: Number(updatedPost.emoji_reaction_count || 0),
          comment_count: Number(updatedPost.comment_count || 0),
          recent_emoji_reactions: updatedPost.recent_emoji_reactions || [],
        };
        setPostDetails(newDetails);
      }
    } catch (err) {
      // Error fetching post details
    }
  };

  const handleViewComments = async () => {
    setCommentsOpen(true);
    await fetchPostDetails();
  };

  const handleSubmitComment = async (parentCommentId = null) => {
    const textToSubmit = parentCommentId ? replyText : commentText;
    if (!textToSubmit.trim() || submittingComment) return;

    try {
      if (parentCommentId) {
        setSubmittingReply((prev) => ({ ...prev, [parentCommentId]: true }));
      } else {
        setSubmittingComment(true);
      }
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Login Required",
          text: "Please login to comment",
          confirmButtonColor: "#D4AF37",
        });
        return;
      }

      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: textToSubmit.trim(),
          parent_comment_id: parentCommentId || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (parentCommentId) {
          setReplyText("");
          setReplyingTo(null);
        } else {
          setCommentText("");
        }
        await fetchPostDetails();
        if (onComment) {
          onComment(post);
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to add comment",
          confirmButtonColor: "#D4AF37",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add comment. Please try again.",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      if (parentCommentId) {
        setSubmittingReply((prev) => ({ ...prev, [parentCommentId]: false }));
      } else {
        setSubmittingComment(false);
      }
    }
  };

  const handleCommentReaction = async (
    commentId,
    reactionType = "like",
    emoji = null
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Login Required",
          text: "Please login to react",
          confirmButtonColor: "#D4AF37",
        });
        return;
      }

      const comment =
        postDetails.comments?.find((c) => c.id === commentId) ||
        postDetails.comments
          ?.flatMap((c) => c.replies || [])
          .find((r) => r.id === commentId);

      if (comment?.user_reaction) {
        // Remove reaction
        const reactionId = comment.user_reaction.id;
        const response = await fetch(
          `/api/posts/comments/${commentId}/reactions/${reactionId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          await fetchPostDetails();
        }
      } else {
        // Add reaction
        const response = await fetch(
          `/api/posts/comments/${commentId}/reactions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              reaction_type: reactionType,
              emoji: emoji,
            }),
          }
        );

        if (response.ok) {
          await fetchPostDetails();
        }
      }
    } catch (err) {
      // Error toggling comment reaction
    }
  };

  const handleViewLikes = async () => {
    setLikesOpen(true);
    await fetchPostDetails();
  };

  const handleViewEmojiReactions = async () => {
    setEmojiReactionsOpen(true);
    await fetchPostDetails();
  };

  const getMediaUrl = () => {
    if (!post.media_url) return null;
    if (post.media_url.startsWith("http")) return post.media_url;
    return `/uploads/${post.media_url}`;
  };

  const getBackgroundColor = () => {
    if (post.media_type !== "text") return null;
    return (
      post.metadata?.background_color ||
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    );
  };

  return (
    <>
      <Card
        sx={{
          mb: 2,
          borderRadius: "16px",
          border: "1px solid rgba(212, 175, 55, 0.2)",
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar
              src={
                post.user?.photo
                  ? `/uploads/${post.user.photo}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      post.user?.name || "User"
                    )}&background=D4AF37&color=fff`
              }
              sx={{ width: 40, height: 40, mr: 1.5 }}
            />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {post.user?.name || "Anonymous"}
                </Typography>
                {post.user?.isVerified && (
                  <Verified sx={{ fontSize: 16, color: "#D4AF37" }} />
                )}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(post.createdAt)}
                </Typography>
                {post.location && (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      •
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <LocationOn sx={{ fontSize: 14 }} />
                      <Typography variant="caption" color="text.secondary">
                        {post.location}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
            {isOwner && (
              <IconButton
                size="small"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
              >
                <MoreVert />
              </IconButton>
            )}
          </Box>

          {/* Caption */}
          {post.caption && (
            <Typography variant="body1" sx={{ mb: 2 }}>
              {post.caption}
            </Typography>
          )}

          {/* Media */}
          {post.media_type === "photo" && getMediaUrl() && (
            <Box
              component="img"
              src={getMediaUrl()}
              alt="Post"
              sx={{
                width: "100%",
                maxHeight: 500,
                objectFit: "contain",
                borderRadius: "12px",
                mb: 2,
              }}
            />
          )}

          {post.media_type === "video" && getMediaUrl() && (
            <Box
              component="video"
              src={getMediaUrl()}
              controls
              sx={{
                width: "100%",
                maxHeight: 500,
                borderRadius: "12px",
                mb: 2,
              }}
            />
          )}

          {post.media_type === "text" && getBackgroundColor() && (
            <Box
              sx={{
                width: "100%",
                minHeight: 200,
                borderRadius: "12px",
                mb: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
                background: getBackgroundColor(),
                border: "2px solid rgba(212, 175, 55, 0.3)",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: 600,
                  wordWrap: "break-word",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                {post.caption || "Text Post"}
              </Typography>
            </Box>
          )}
        </CardContent>

        {/* Actions */}
        <CardActions
          sx={{
            px: 2,
            pb: 2,
            pt: 0,
            flexDirection: "column",
            alignItems: "stretch",
          }}
        >
          {/* Reaction/Comment counts above buttons */}
          {(postDetails.like_count > 0 ||
            postDetails.emoji_reaction_count > 0 ||
            postDetails.comment_count > 0) && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                {postDetails.like_count > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      cursor: "pointer",
                    }}
                    onClick={handleViewLikes}
                  >
                    <ThumbUp sx={{ fontSize: 16, color: "#D4AF37" }} />
                    <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                      {postDetails.like_count}
                    </Typography>
                  </Box>
                )}
                {postDetails.emoji_reaction_count > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      cursor: "pointer",
                    }}
                    onClick={handleViewEmojiReactions}
                  >
                    {/* Stacked emoji reactions */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        position: "relative",
                        ml: -0.5,
                      }}
                    >
                      {postDetails.recent_emoji_reactions
                        ?.slice(0, 3)
                        .map((emoji, index) => (
                          <Box
                            key={index}
                            sx={{
                              fontSize: "1rem",
                              ml: index > 0 ? "-4px" : 0,
                              zIndex: 3 - index,
                              position: "relative",
                              backgroundColor: "white",
                              borderRadius: "50%",
                              width: "20px",
                              height: "20px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "1px solid rgba(0,0,0,0.1)",
                            }}
                          >
                            {emoji}
                          </Box>
                        ))}
                    </Box>
                    {/* Show +X if there are more emojis than the 3 visible ones */}
                    {(() => {
                      const visibleCount = Math.min(
                        postDetails.recent_emoji_reactions?.length || 0,
                        3
                      );
                      const totalCount = postDetails.emoji_reaction_count || 0;
                      const remaining = totalCount - visibleCount;

                      return remaining > 0 ? (
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "0.875rem", ml: 0.5 }}
                        >
                          +{remaining}
                        </Typography>
                      ) : null;
                    })()}
                  </Box>
                )}
              </Box>
              {postDetails.comment_count > 0 && (
                <Button
                  size="small"
                  onClick={handleViewComments}
                  sx={{
                    color: "inherit",
                    textTransform: "none",
                    minWidth: "auto",
                    px: 1,
                  }}
                >
                  {postDetails.comment_count === 1
                    ? "1 comment"
                    : `${postDetails.comment_count} comments`}
                </Button>
              )}
            </Box>
          )}
          {/* Action buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              size="small"
              startIcon={<ThumbUp />}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLike();
              }}
              sx={{
                color:
                  postDetails.user_reaction &&
                  postDetails.user_reaction.reaction_type === "like" &&
                  !postDetails.user_reaction.emoji
                    ? "#D4AF37"
                    : "inherit",
                minWidth: "auto",
                px: 1,
                textTransform: "none",
              }}
            >
              Like
              {(postDetails.like_count || 0) > 0 && (
                <Typography
                  component="span"
                  sx={{ ml: 0.5, fontSize: "0.875rem", fontWeight: 500 }}
                >
                  {postDetails.like_count || 0}
                </Typography>
              )}
            </Button>
            <IconButton size="small" onClick={handleOpenEmojiPicker}>
              <EmojiEmotions />
            </IconButton>
            <Button
              size="small"
              startIcon={<Comment />}
              onClick={handleViewComments}
              sx={{
                color: "inherit",
                minWidth: "auto",
                px: 1,
                textTransform: "none",
              }}
            >
              {postDetails.comment_count > 0
                ? postDetails.comment_count
                : "Comment"}
            </Button>
            <Button
              size="small"
              startIcon={<Share />}
              sx={{
                color: "inherit",
                minWidth: "auto",
                px: 1,
                textTransform: "none",
              }}
            >
              Share
            </Button>
          </Box>
        </CardActions>
      </Card>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            if (onDelete) {
              onDelete(post.id);
            }
          }}
          sx={{ color: "error.main" }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete Post
        </MenuItem>
      </Menu>

      {/* Emoji Picker */}
      <EmojiPicker
        open={emojiPickerOpen}
        anchorEl={emojiAnchor}
        onClose={() => {
          setEmojiPickerOpen(false);
          setEmojiAnchor(null);
        }}
        onEmojiSelect={handleEmojiSelect}
        position="top"
      />

      {/* Comments Dialog */}
      <Dialog
        open={commentsOpen}
        onClose={() => {
          setCommentsOpen(false);
          setCommentText("");
          setReplyingTo(null);
          setReplyText("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Comments
            <IconButton
              size="small"
              onClick={() => {
                setCommentsOpen(false);
                setCommentText("");
                setReplyingTo(null);
                setReplyText("");
              }}
              sx={{
                color: "text.secondary",
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Comment Input */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              multiline
              rows={3}
              variant="outlined"
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || submittingComment}
                sx={{
                  bgcolor: "#D4AF37",
                  "&:hover": { bgcolor: "#B8941F" },
                }}
                startIcon={
                  submittingComment ? <CircularProgress size={16} /> : <Send />
                }
              >
                {submittingComment ? "Posting..." : "Post"}
              </Button>
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {postDetails.comments && postDetails.comments.length > 0 ? (
            <List>
              {postDetails.comments
                .filter((c) => !c.parent_comment_id)
                .map((comment, index) => (
                  <React.Fragment key={comment.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar
                          src={
                            comment.user?.photo
                              ? `/uploads/${comment.user.photo}`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  comment.user?.name || "User"
                                )}&background=D4AF37&color=fff`
                          }
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Typography variant="subtitle2">
                              {comment.user?.name || "Anonymous"}
                            </Typography>
                            {comment.user?.isVerified && (
                              <Verified
                                sx={{ fontSize: 14, color: "#D4AF37" }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2">
                              {comment.content}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDate(comment.createdAt)}
                            </Typography>
                            {/* Comment actions */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mt: 1,
                              }}
                            >
                              <Button
                                size="small"
                                startIcon={
                                  <ThumbUp
                                    sx={{
                                      fontSize: 14,
                                      color: comment.user_reaction
                                        ? "#D4AF37"
                                        : "inherit",
                                    }}
                                  />
                                }
                                onClick={() =>
                                  handleCommentReaction(comment.id, "like")
                                }
                                sx={{
                                  minWidth: "auto",
                                  px: 1,
                                  textTransform: "none",
                                  fontSize: "0.75rem",
                                }}
                              >
                                {comment.reaction_count > 0
                                  ? comment.reaction_count
                                  : "Like"}
                              </Button>
                              <Button
                                size="small"
                                onClick={() =>
                                  setReplyingTo(
                                    replyingTo === comment.id
                                      ? null
                                      : comment.id
                                  )
                                }
                                sx={{
                                  minWidth: "auto",
                                  px: 1,
                                  textTransform: "none",
                                  fontSize: "0.75rem",
                                }}
                              >
                                Reply
                              </Button>
                            </Box>
                            {/* Reply input */}
                            {replyingTo === comment.id && (
                              <Box sx={{ mt: 1 }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  placeholder="Write a reply..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  multiline
                                  rows={2}
                                  sx={{ mb: 1 }}
                                />
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() =>
                                      handleSubmitComment(comment.id)
                                    }
                                    disabled={
                                      !replyText.trim() ||
                                      submittingReply[comment.id]
                                    }
                                    sx={{
                                      bgcolor: "#D4AF37",
                                      "&:hover": { bgcolor: "#B8941F" },
                                    }}
                                  >
                                    {submittingReply[comment.id]
                                      ? "Posting..."
                                      : "Reply"}
                                  </Button>
                                  <Button
                                    size="small"
                                    onClick={() => {
                                      setReplyingTo(null);
                                      setReplyText("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </Box>
                              </Box>
                            )}
                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <Box sx={{ ml: 4, mt: 1 }}>
                                {comment.replies.map((reply) => (
                                  <Box
                                    key={reply.id}
                                    sx={{
                                      display: "flex",
                                      gap: 1,
                                      mb: 1,
                                      pb: 1,
                                      borderLeft:
                                        "2px solid rgba(212, 175, 55, 0.3)",
                                      pl: 1,
                                    }}
                                  >
                                    <Avatar
                                      src={
                                        reply.user?.photo
                                          ? `/uploads/${reply.user.photo}`
                                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                              reply.user?.name || "User"
                                            )}&background=D4AF37&color=fff`
                                      }
                                      sx={{ width: 24, height: 24 }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 0.5,
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          sx={{ fontWeight: 600 }}
                                        >
                                          {reply.user?.name || "Anonymous"}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {reply.content}
                                        </Typography>
                                      </Box>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                          mt: 0.5,
                                        }}
                                      >
                                        <Button
                                          size="small"
                                          startIcon={
                                            <ThumbUp
                                              sx={{
                                                fontSize: 12,
                                                color: reply.user_reaction
                                                  ? "#D4AF37"
                                                  : "inherit",
                                              }}
                                            />
                                          }
                                          onClick={() =>
                                            handleCommentReaction(
                                              reply.id,
                                              "like"
                                            )
                                          }
                                          sx={{
                                            minWidth: "auto",
                                            px: 0.5,
                                            textTransform: "none",
                                            fontSize: "0.7rem",
                                          }}
                                        >
                                          {reply.reaction_count > 0
                                            ? reply.reaction_count
                                            : "Like"}
                                        </Button>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {formatDate(reply.createdAt)}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>
                                ))}
                              </Box>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    {index <
                      postDetails.comments.filter((c) => !c.parent_comment_id)
                        .length -
                        1 && <Divider />}
                  </React.Fragment>
                ))}
            </List>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              No comments yet
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Likes Dialog */}
      <Dialog
        open={likesOpen}
        onClose={() => setLikesOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Likes
            <IconButton
              size="small"
              onClick={() => setLikesOpen(false)}
              sx={{
                color: "text.secondary",
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {postDetails.reactions &&
          postDetails.reactions.filter(
            (r) => r.reaction_type === "like" && !r.emoji
          ).length > 0 ? (
            <List>
              {postDetails.reactions
                .filter((r) => r.reaction_type === "like" && !r.emoji)
                .map((reaction, index, filteredReactions) => (
                  <React.Fragment key={reaction.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          src={
                            reaction.user?.photo
                              ? `/uploads/${reaction.user.photo}`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  reaction.user?.name || "User"
                                )}&background=D4AF37&color=fff`
                          }
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="subtitle2">
                              {reaction.user?.name || "Anonymous"}
                            </Typography>
                            <ThumbUp sx={{ fontSize: 16, color: "#D4AF37" }} />
                          </Box>
                        }
                        secondary={formatDate(reaction.createdAt)}
                      />
                    </ListItem>
                    {index < filteredReactions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
            </List>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              No likes yet
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Emoji Reactions Dialog */}
      <Dialog
        open={emojiReactionsOpen}
        onClose={() => setEmojiReactionsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Emoji Reactions
            <IconButton
              size="small"
              onClick={() => setEmojiReactionsOpen(false)}
              sx={{
                color: "text.secondary",
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {postDetails.reactions &&
          postDetails.reactions.filter(
            (r) => r.reaction_type === "emoji" && r.emoji
          ).length > 0 ? (
            <List>
              {postDetails.reactions
                .filter((r) => r.reaction_type === "emoji" && r.emoji)
                .map((reaction, index, filteredReactions) => (
                  <React.Fragment key={reaction.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          src={
                            reaction.user?.photo
                              ? `/uploads/${reaction.user.photo}`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  reaction.user?.name || "User"
                                )}&background=D4AF37&color=fff`
                          }
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="subtitle2">
                              {reaction.user?.name || "Anonymous"}
                            </Typography>
                            <Typography sx={{ fontSize: 20 }}>
                              {reaction.emoji}
                            </Typography>
                          </Box>
                        }
                        secondary={formatDate(reaction.createdAt)}
                      />
                    </ListItem>
                    {index < filteredReactions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
            </List>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              No emoji reactions yet
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostCard;
