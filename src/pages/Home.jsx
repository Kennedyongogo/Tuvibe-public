import React, { useEffect } from "react";
import { Box } from "@mui/material";
import HeroSection from "../components/Home/HeroSection";
import Chatbot from "../components/Chatbot/Chatbot";

export default function Home() {
  useEffect(() => {
    // Prevent body scroll on home page
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      // Restore scrolling when leaving home page
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
      }}
    >
      <HeroSection />
      <Chatbot />
    </Box>
  );
}
