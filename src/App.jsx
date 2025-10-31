import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  CircularProgress,
} from "@mui/material";
import { theme } from "./theme";
import "./App.css";
import React, { useState, useEffect, Suspense, lazy } from "react";
import PublicHeader from "./components/Header/PublicHeader";
import Chatbot from "./components/Chatbot/Chatbot";
import PageRoutes from "./components/PageRoutes";

// Lazy load components
const Home = lazy(() => import("./pages/Home"));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [user, setUser] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(true); // Drawer open by default

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ScrollToTop />
        <Suspense
          fallback={
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                backgroundColor: "white",
              }}
            >
              <CircularProgress />
            </Box>
          }
        >
          <Routes>
            {/* Public landing page */}
            <Route
              path="/"
              element={
                <>
                  <PublicHeader />
                  <Home />
                </>
              }
            />
            {/* Authenticated routes */}
            <Route path="/*" element={<PageRoutes />} />
          </Routes>
        </Suspense>
        <Chatbot />
      </Router>
    </ThemeProvider>
  );
}

export default App;
