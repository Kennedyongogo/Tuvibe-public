import React, { useState } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { Timeline as TimelineIcon } from "@mui/icons-material";
import PostsFeed from "../components/Posts/PostsFeed";

export default function Timeline({ user }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Box>
      <Card
        sx={{
          p: 4,
          mb: 2,
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
            alignItems: "center",
            gap: 2,
            mb: 0,
          }}
        >
          <TimelineIcon sx={{ fontSize: 32, color: "#D4AF37" }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(45deg, #D4AF37, #B8941F)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Timeline
          </Typography>
        </Box>
      </Card>

      <PostsFeed user={user} onRefresh={refreshTrigger} />
    </Box>
  );
}
