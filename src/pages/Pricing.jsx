import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Button,
  Chip,
} from "@mui/material";
import {
  AttachMoney,
  FormatQuote,
  ArrowBack,
  CheckCircle,
} from "@mui/icons-material";
import { Avatar, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";

const categories = [
  "Regular",
  "Sugar Mummy",
  "Sponsor",
  "Ben 10",
  "Urban Chics",
];

export default function Pricing() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleGoBack = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(Boolean(token));

    // Auto-select tab based on user's category for better UX
    if (token) {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const user = JSON.parse(savedUser);
          if (user && user.category) {
            // Find the index of the user's category in the categories array
            const categoryIndex = categories.findIndex(
              (cat) => cat === user.category
            );
            // If category found, set the tab to that index
            if (categoryIndex !== -1) {
              setSelectedTab(categoryIndex);
            }
          }
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        px: { xs: 2, sm: 3, md: 4 },
        py: 3,
        backgroundColor: "#ffffff",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: { xs: 1, sm: 2 },
          mb: 3,
        }}
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <IconButton
            onClick={handleGoBack}
            sx={{
              color: "#D4AF37",
              backgroundColor: "rgba(212, 175, 55, 0.1)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              "&:hover": {
                backgroundColor: "rgba(212, 175, 55, 0.2)",
                borderColor: "rgba(212, 175, 55, 0.5)",
              },
              flexShrink: 0,
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.5rem", sm: "2.125rem" },
              background: "linear-gradient(45deg, #D4AF37, #B8941F)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <AttachMoney sx={{ color: "#D4AF37" }} />
            Pricing Plans
          </Typography>
        </Box>
      </Box>

      <Card
        sx={{
          borderRadius: "16px",
          background: "#ffffff",
          border: "1px solid rgba(212, 175, 55, 0.2)",
          boxShadow: "0 2px 8px rgba(212, 175, 55, 0.08)",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          {/* Mobile: Dropdown Select */}
          <Box
            sx={{
              display: { xs: "block", sm: "none" },
              mb: 3,
            }}
          >
            <FormControl fullWidth>
              <InputLabel
                sx={{
                  "&.Mui-focused": {
                    color: "#D4AF37",
                  },
                }}
              >
                Select Plan
              </InputLabel>
              <Select
                value={selectedTab}
                onChange={(e) => setSelectedTab(e.target.value)}
                label="Select Plan"
                sx={{
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(212, 175, 55, 0.3)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(212, 175, 55, 0.5)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#D4AF37",
                    borderWidth: "2px",
                  },
                  "& .MuiSelect-select": {
                    py: 1.5,
                  },
                }}
              >
                {categories.map((category, index) => (
                  <MenuItem key={index} value={index}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Desktop: Tabs */}
          <Box
            sx={{
              display: { xs: "none", sm: "block" },
              borderBottom: 1,
              borderColor: "divider",
              mb: 3,
            }}
          >
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                "& .MuiTabs-indicator": {
                  backgroundColor: "#D4AF37",
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: { sm: "0.9375rem", md: "1rem" },
                  color: "rgba(0, 0, 0, 0.6)",
                  minHeight: 56,
                  px: { sm: 2, md: 3 },
                  "&:hover": {
                    color: "#D4AF37",
                    backgroundColor: "rgba(212, 175, 55, 0.08)",
                  },
                  "&.Mui-selected": {
                    color: "#D4AF37",
                    fontWeight: 700,
                  },
                },
              }}
            >
              {categories.map((category, index) => (
                <Tab key={index} label={category} />
              ))}
            </Tabs>
          </Box>

          {/* Package Cards */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 3,
            }}
          >
            {/* Silver Package */}
            <Box
              sx={{
                flex: { xs: "1 1 100%", sm: "1 1 50%" },
                display: "flex",
                minWidth: 0,
              }}
            >
              <Card
                sx={{
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)",
                  border: "2px solid rgba(192, 192, 192, 0.4)",
                  boxShadow: "0 4px 20px rgba(192, 192, 192, 0.2)",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 30px rgba(192, 192, 192, 0.3)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Chip
                      label="Silver Package"
                      sx={{
                        bgcolor: "rgba(192, 192, 192, 0.2)",
                        color: "#4a4a4a",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        mb: 2,
                        px: 2,
                        py: 0.5,
                      }}
                    />
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: "#4a4a4a",
                        fontSize: { xs: "1.75rem", sm: "2rem" },
                        mb: 0.5,
                      }}
                    >
                      {selectedTab === 0 ? "KES 149" : "KES 199"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(0, 0, 0, 0.6)",
                        fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                      }}
                    >
                      /Month
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2.5,
                      flex: 1,
                    }}
                  >
                    <Box
                      component="ul"
                      sx={{
                        flex: 1,
                        pl: 0,
                        m: 0,
                        listStyle: "none",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      {selectedTab === 0 ? (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Unlock 25 WhatsApp contacts daily
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              3 free "who viewed your profile" daily
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              5 free premium profiles unlock daily
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Access to 40 favorite profiles
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Access to 50 unlocked profiles
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Unlock 35 WhatsApp contacts daily
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Two free 1hr – profile boost daily targeting one
                              category
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              6 free "who viewed your profile" daily
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              10 free premium profiles unlock daily
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Access to 60 favorite profiles
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Access to 60 unlocked profiles
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Private profile mode (hide some details from
                              non-premium users)
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Premium lounge silver badge
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                    {isLoggedIn && (
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{
                          mt: "auto",
                          borderRadius: "999px",
                          textTransform: "none",
                          fontWeight: 700,
                          py: 1.25,
                          background:
                            "linear-gradient(90deg, #D4AF37 0%, #B8941F 100%)",
                          boxShadow: "0 4px 10px rgba(212, 175, 55, 0.4)",
                          "&:hover": {
                            background:
                              "linear-gradient(90deg, #B8941F 0%, #D4AF37 100%)",
                            boxShadow: "0 6px 16px rgba(212, 175, 55, 0.5)",
                          },
                        }}
                      >
                        Subscribe
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Gold Package */}
            <Box
              sx={{
                flex: { xs: "1 1 100%", sm: "1 1 50%" },
                display: "flex",
                minWidth: 0,
              }}
            >
              <Card
                sx={{
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(255, 255, 255, 0.9) 100%)",
                  border: "2px solid rgba(212, 175, 55, 0.5)",
                  boxShadow: "0 4px 20px rgba(212, 175, 55, 0.25)",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 30px rgba(212, 175, 55, 0.35)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Chip
                      label="Gold Package"
                      sx={{
                        bgcolor: "rgba(212, 175, 55, 0.2)",
                        color: "#B8941F",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        mb: 2,
                        px: 2,
                        py: 0.5,
                      }}
                    />
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        background: "linear-gradient(45deg, #D4AF37, #B8941F)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontSize: { xs: "1.75rem", sm: "2rem" },
                        mb: 0.5,
                      }}
                    >
                      {selectedTab === 0 ? "KES 249" : "KES 349"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(0, 0, 0, 0.6)",
                        fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                      }}
                    >
                      /Month
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2.5,
                      flex: 1,
                    }}
                  >
                    <Box
                      component="ul"
                      sx={{
                        flex: 1,
                        pl: 0,
                        m: 0,
                        listStyle: "none",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      {selectedTab === 0 ? (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Unlimited WhatsApp contacts daily
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Three free 2hr – profile boost daily targeting
                              three categories
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Unlimited premium profiles unlock daily
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Access to unlimited saved profiles
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Gold Verification badge
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Free 4-hour access to incognito mode daily (View
                              profiles without appearing on others viewer list)
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              5 daily suggested Matches list
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Unlimited "who viewed your profile" daily
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Unlimited WhatsApp contacts daily
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Four free 3hr – profile boost daily targeting all
                              categories
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Unlimited premium profiles unlock daily
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Access to unlimited saved profiles
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Gold Verification badge
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Free 8-hour access to incognito mode daily (View
                              profiles without appearing on others viewer list)
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              10 daily suggested Matches list
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: "#D4AF37",
                                fontSize: "1.25rem",
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "rgba(0, 0, 0, 0.75)",
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                lineHeight: 1.6,
                              }}
                            >
                              Unlimited "who viewed your profile" daily
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                    {isLoggedIn && (
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{
                          mt: "auto",
                          borderRadius: "999px",
                          textTransform: "none",
                          fontWeight: 700,
                          py: 1.25,
                          background:
                            "linear-gradient(90deg, #D4AF37 0%, #B8941F 100%)",
                          boxShadow: "0 4px 10px rgba(212, 175, 55, 0.4)",
                          "&:hover": {
                            background:
                              "linear-gradient(90deg, #B8941F 0%, #D4AF37 100%)",
                            boxShadow: "0 6px 16px rgba(212, 175, 55, 0.5)",
                          },
                        }}
                      >
                        Subscribe
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Testimonials Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: { xs: 1, sm: 2 },
          mb: 3,
          mt: 5,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.5rem", sm: "2.125rem" },
              background: "linear-gradient(45deg, #D4AF37, #B8941F)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <FormatQuote sx={{ color: "#D4AF37" }} />
            Testimonials
          </Typography>
        </Box>
      </Box>

      <Card
        sx={{
          borderRadius: "16px",
          background: "#ffffff",
          border: "1px solid rgba(212, 175, 55, 0.2)",
          boxShadow: "0 2px 8px rgba(212, 175, 55, 0.08)",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {/* Testimonial 1 */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Avatar
                  sx={{
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    bgcolor: "#D4AF37",
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    fontWeight: 700,
                  }}
                >
                  JD
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "rgba(0, 0, 0, 0.9)",
                      fontSize: { xs: "1rem", sm: "1.125rem" },
                      mb: 0.5,
                    }}
                  >
                    John Doe
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(0, 0, 0, 0.6)",
                      fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    }}
                  >
                    Regular Member • Nairobi
                  </Typography>
                </Box>
              </Box>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "12px",
                  backgroundColor: "rgba(212, 175, 55, 0.05)",
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                  p: { xs: 2, sm: 2.5 },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: "rgba(0, 0, 0, 0.75)",
                    fontSize: { xs: "0.9375rem", sm: "1rem" },
                    lineHeight: 1.7,
                    fontStyle: "italic",
                  }}
                >
                  "TuVibe has been an amazing platform for connecting with
                  genuine people. The Regular plan gave me everything I needed
                  to start my journey, and I've made some great connections!"
                </Typography>
              </Paper>
            </Box>

            <Divider sx={{ borderColor: "rgba(212, 175, 55, 0.2)" }} />

            {/* Testimonial 2 */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Avatar
                  sx={{
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    bgcolor: "#D4AF37",
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    fontWeight: 700,
                  }}
                >
                  SM
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "rgba(0, 0, 0, 0.9)",
                      fontSize: { xs: "1rem", sm: "1.125rem" },
                      mb: 0.5,
                    }}
                  >
                    Sarah M.
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(0, 0, 0, 0.6)",
                      fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    }}
                  >
                    Sugar Mummy • Verified Member
                  </Typography>
                </Box>
              </Box>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "12px",
                  backgroundColor: "rgba(212, 175, 55, 0.05)",
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                  p: { xs: 2, sm: 2.5 },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: "rgba(0, 0, 0, 0.75)",
                    fontSize: { xs: "0.9375rem", sm: "1rem" },
                    lineHeight: 1.7,
                    fontStyle: "italic",
                  }}
                >
                  "Upgrading to the Sugar Mummy plan was the best decision I
                  made. The enhanced visibility and priority support have made
                  my experience so much better. Highly recommended!"
                </Typography>
              </Paper>
            </Box>

            <Divider sx={{ borderColor: "rgba(212, 175, 55, 0.2)" }} />

            {/* Testimonial 3 */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Avatar
                  sx={{
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    bgcolor: "#D4AF37",
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    fontWeight: 700,
                  }}
                >
                  MK
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "rgba(0, 0, 0, 0.9)",
                      fontSize: { xs: "1rem", sm: "1.125rem" },
                      mb: 0.5,
                    }}
                  >
                    Michael K.
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(0, 0, 0, 0.6)",
                      fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    }}
                  >
                    Sponsor • Verified Member
                  </Typography>
                </Box>
              </Box>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "12px",
                  backgroundColor: "rgba(212, 175, 55, 0.05)",
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                  p: { xs: 2, sm: 2.5 },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: "rgba(0, 0, 0, 0.75)",
                    fontSize: { xs: "0.9375rem", sm: "1rem" },
                    lineHeight: 1.7,
                    fontStyle: "italic",
                  }}
                >
                  "As a Sponsor, I appreciate the premium features and verified
                  profiles. The platform makes it easy to connect with
                  like-minded individuals. Great value for money!"
                </Typography>
              </Paper>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
