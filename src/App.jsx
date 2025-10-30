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
import Footer from "./components/Footer/Footer";
import Chatbot from "./components/Chatbot/Chatbot";

// Lazy load components
const Home = lazy(() => import("./pages/Home"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const TeamMemberDetail = lazy(() => import("./pages/TeamMemberDetail"));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function PrivateRoute({ user, children }) {
  // if (!user) {
  //   return <Navigate to="/login" replace />;
  // }
  return children;
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
            {/* Public routes */}
            <Route
              path="/"
              element={
                <>
                  <PublicHeader />
                  <Home />
                </>
              }
            />
            <Route
              path="/project/:id"
              element={
                <>
                  <PublicHeader />
                  <ProjectDetails />
                  <Footer />
                </>
              }
            />
            <Route
              path="/team/:id"
              element={
                <>
                  <PublicHeader />
                  <TeamMemberDetail />
                  <Footer />
                </>
              }
            />
          </Routes>
        </Suspense>
        <Chatbot />
      </Router>
    </ThemeProvider>
  );
}

export default App;
