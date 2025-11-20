import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Tabs,
  Tab,
  ClickAwayListener,
  Button,
} from "@mui/material";
import { EmojiEmotions } from "@mui/icons-material";

// Popular emoji categories
const EMOJI_CATEGORIES = {
  recent: {
    name: "Recent",
    emojis: [], // Will be populated from localStorage
  },
  smileys: {
    name: "Smileys",
    emojis: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "🤣",
      "😂",
      "🙂",
      "🙃",
      "😉",
      "😊",
      "😇",
      "🥰",
      "😍",
      "🤩",
      "😘",
      "😗",
      "😚",
      "😙",
      "😋",
      "😛",
      "😜",
      "🤪",
      "😝",
      "🤑",
      "🤗",
      "🤭",
      "🤫",
      "🤔",
      "🤐",
      "🤨",
      "😐",
      "😑",
      "😶",
      "😏",
      "😒",
      "🙄",
      "😬",
      "🤥",
      "😌",
      "😔",
      "😪",
      "🤤",
      "😴",
      "😷",
      "🤒",
      "🤕",
      "🤢",
      "🤮",
      "🤧",
      "🥵",
      "🥶",
      "😵",
      "🤯",
      "🤠",
      "🥳",
      "😎",
      "🤓",
      "🧐",
    ],
  },
  hearts: {
    name: "Hearts",
    emojis: [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💔",
      "❣️",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
      "💘",
      "💝",
      "💟",
      "☮️",
      "✝️",
      "☪️",
      "🕉️",
      "☸️",
      "✡️",
      "🔯",
      "🕎",
      "☯️",
      "☦️",
      "🛐",
    ],
  },
  gestures: {
    name: "Gestures",
    emojis: [
      "👋",
      "🤚",
      "🖐️",
      "✋",
      "🖖",
      "👌",
      "🤏",
      "✌️",
      "🤞",
      "🤟",
      "🤘",
      "🤙",
      "👈",
      "👉",
      "👆",
      "🖕",
      "👇",
      "☝️",
      "👍",
      "👎",
      "✊",
      "👊",
      "🤛",
      "🤜",
      "👏",
      "🙌",
      "👐",
      "🤲",
      "🤝",
      "🙏",
      "✍️",
      "💪",
      "🦾",
      "🦿",
      "🦵",
      "🦶",
      "👂",
      "🦻",
      "👃",
      "🧠",
    ],
  },
  objects: {
    name: "Objects",
    emojis: [
      "🔥",
      "💯",
      "⭐",
      "🌟",
      "✨",
      "💫",
      "💥",
      "💢",
      "💨",
      "💦",
      "🎉",
      "🎊",
      "🎈",
      "🎁",
      "🏆",
      "🥇",
      "🥈",
      "🥉",
      "🏅",
      "🎖️",
      "🎗️",
      "🎫",
      "🎟️",
      "🎪",
      "🤹",
      "🎭",
      "🩰",
      "🎨",
      "🎬",
      "🎤",
      "🎧",
      "🎼",
      "🎹",
      "🥁",
      "🎷",
      "🎺",
      "🎸",
      "🪕",
      "🎻",
      "🎲",
    ],
  },
  symbols: {
    name: "Symbols",
    emojis: [
      "✅",
      "❌",
      "❓",
      "❔",
      "❕",
      "❗",
      "➕",
      "➖",
      "➗",
      "✖️",
      "💱",
      "💲",
      "⚕️",
      "♻️",
      "🔱",
      "📛",
      "🔰",
      "⭕",
      "✅",
      "☑️",
      "✔️",
      "❌",
      "❎",
      "➰",
      "➿",
      "〽️",
      "✳️",
      "✴️",
      "❇️",
      "©️",
      "®️",
      "™️",
      "#️⃣",
      "*️⃣",
      "0️⃣",
      "1️⃣",
      "2️⃣",
      "3️⃣",
      "4️⃣",
      "5️⃣",
    ],
  },
};

const EmojiPicker = ({
  onEmojiSelect,
  anchorEl,
  open,
  onClose,
  position = "bottom",
  keepOpenOnSelect = false,
}) => {
  const [activeTab, setActiveTab] = useState("smileys");
  const [recentEmojis, setRecentEmojis] = useState([]);
  const pickerRef = useRef(null);

  useEffect(() => {
    // Load recent emojis from localStorage
    const saved = localStorage.getItem("recentEmojis");
    if (saved) {
      try {
        setRecentEmojis(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent emojis:", e);
      }
    }
  }, []);

  useEffect(() => {
    // Update recent category with loaded emojis
    if (recentEmojis.length > 0) {
      EMOJI_CATEGORIES.recent.emojis = recentEmojis.slice(0, 30);
    }
  }, [recentEmojis]);

  const handleEmojiClick = (emoji, event) => {
    // Save to recent emojis
    const updated = [emoji, ...recentEmojis.filter((e) => e !== emoji)].slice(
      0,
      30
    );
    setRecentEmojis(updated);
    localStorage.setItem("recentEmojis", JSON.stringify(updated));

    // Get click position for animation
    const clickPosition = event ? { x: event.clientX, y: event.clientY } : null;

    // Call callback with emoji and click position
    if (onEmojiSelect) {
      onEmojiSelect(emoji, clickPosition);
    }

    // Close picker unless keepOpenOnSelect is true
    if (!keepOpenOnSelect && onClose) {
      onClose();
    }
  };

  const getPosition = () => {
    if (!anchorEl) return {};
    const rect = anchorEl.getBoundingClientRect();
    const isMobile = window.innerWidth < 600;
    const pickerHeight = isMobile
      ? Math.min(300, window.innerHeight - 64)
      : 400;
    const pickerWidth = isMobile ? Math.min(350, window.innerWidth - 32) : 350;
    const padding = 16;

    let top, left, right, bottom;

    switch (position) {
      case "top":
        top = rect.top - pickerHeight - padding;
        left = rect.left + rect.width / 2 - pickerWidth / 2;
        // Ensure it doesn't go off the left edge
        if (left < padding) left = padding;
        // Ensure it doesn't go off the right edge
        if (left + pickerWidth > window.innerWidth - padding) {
          left = window.innerWidth - pickerWidth - padding;
        }
        // If not enough space above, show below instead
        if (top < padding) {
          top = rect.bottom + padding;
        }
        return { top, left };
      case "left":
        left = rect.left - pickerWidth - padding;
        top = rect.top;
        // If not enough space on left, show on right instead
        if (left < padding) {
          left = rect.right + padding;
        }
        // Ensure it doesn't go off the bottom
        if (top + pickerHeight > window.innerHeight - padding) {
          top = window.innerHeight - pickerHeight - padding;
        }
        // Ensure it doesn't go off the top
        if (top < padding) top = padding;
        return { top, left };
      case "right":
        left = rect.right + padding;
        top = rect.top;
        // If not enough space on right, show on left instead
        if (left + pickerWidth > window.innerWidth - padding) {
          left = rect.left - pickerWidth - padding;
        }
        // Ensure it doesn't go off the right edge
        if (left + pickerWidth > window.innerWidth - padding) {
          left = window.innerWidth - pickerWidth - padding;
        }
        // Ensure it doesn't go off the left edge
        if (left < padding) left = padding;
        // Ensure it doesn't go off the bottom
        if (top + pickerHeight > window.innerHeight - padding) {
          top = window.innerHeight - pickerHeight - padding;
        }
        // Ensure it doesn't go off the top
        if (top < padding) top = padding;
        return { top, left };
      default: // bottom
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2 - pickerWidth / 2;
        // Ensure it doesn't go off the left edge
        if (left < padding) left = padding;
        // Ensure it doesn't go off the right edge
        if (left + pickerWidth > window.innerWidth - padding) {
          left = window.innerWidth - pickerWidth - padding;
        }
        // If not enough space below, show above instead
        if (top + pickerHeight > window.innerHeight - padding) {
          top = rect.top - pickerHeight - padding;
        }
        // If still not enough space, align to bottom of screen
        if (top < padding) {
          top = window.innerHeight - pickerHeight - padding;
        }
        return { top, left };
    }
  };

  if (!open) return null;

  const categories = Object.keys(EMOJI_CATEGORIES).filter(
    (key) => key !== "recent" || recentEmojis.length > 0
  );

  return (
    <ClickAwayListener onClickAway={onClose}>
      <Paper
        ref={pickerRef}
        elevation={8}
        sx={{
          position: "fixed",
          width: { xs: "calc(100vw - 32px)", sm: 350 },
          maxWidth: 350,
          height: { xs: 300, sm: 400 },
          maxHeight: { xs: "calc(100vh - 64px)", sm: 400 },
          display: "flex",
          flexDirection: "column",
          zIndex: 1300,
          borderRadius: 2,
          overflow: "hidden",
          ...getPosition(),
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              flex: 1,
              minHeight: { xs: 40, sm: 48 },
              "& .MuiTab-root": {
                minHeight: { xs: 40, sm: 48 },
                fontSize: { xs: "0.75rem", sm: "1.2rem" },
                px: { xs: 1, sm: 2 },
              },
            }}
          >
            {categories.map((key) => (
              <Tab
                key={key}
                label={EMOJI_CATEGORIES[key].name}
                value={key}
                sx={{ textTransform: "none" }}
              />
            ))}
          </Tabs>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: { xs: 1, sm: 2 },
            display: "grid",
            gridTemplateColumns: { xs: "repeat(6, 1fr)", sm: "repeat(8, 1fr)" },
            gap: { xs: 0.5, sm: 1 },
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "rgba(0,0,0,0.05)",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(0,0,0,0.2)",
              borderRadius: "3px",
            },
          }}
        >
          {EMOJI_CATEGORIES[activeTab]?.emojis.map((emoji, index) => (
            <IconButton
              key={`${activeTab}-${index}`}
              onClick={(e) => handleEmojiClick(emoji, e)}
              sx={{
                fontSize: { xs: "1.2rem", sm: "1.5rem" },
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                minWidth: { xs: 32, sm: 36 },
                "&:hover": {
                  bgcolor: "rgba(212, 175, 55, 0.1)",
                  transform: "scale(1.2)",
                },
                transition: "all 0.2s ease",
              }}
            >
              {emoji}
            </IconButton>
          ))}
        </Box>

        {/* Close Button at Bottom */}
        <Box
          sx={{
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            p: 1,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            onClick={onClose}
            size="small"
            sx={{
              minWidth: "auto",
              px: 2,
              py: 0.75,
              color: "text.secondary",
              textTransform: "none",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.05)",
                color: "text.primary",
              },
              transition: "all 0.2s ease",
            }}
          >
            Close
          </Button>
        </Box>
      </Paper>
    </ClickAwayListener>
  );
};

export default EmojiPicker;
