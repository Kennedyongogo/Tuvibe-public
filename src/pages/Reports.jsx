import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import {
  Report,
  Add,
  Visibility,
  CheckCircle,
  Schedule,
  Cancel,
  Close,
  Message,
  Person,
  Category as CategoryIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";

export default function Reports({ user }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    description: "",
    reported_user_id: null,
    priority: "medium",
  });

  const categories = [
    { value: "inappropriate_content", label: "Inappropriate Content" },
    { value: "harassment", label: "Harassment" },
    { value: "scam", label: "Scam/Fraud" },
    { value: "fake_profile", label: "Fake Profile" },
    { value: "spam", label: "Spam" },
    { value: "payment_issue", label: "Payment Issue" },
    { value: "technical_issue", label: "Technical Issue" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/reports/my-reports", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setReports(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    if (!formData.category || !formData.subject || !formData.description) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in all required fields",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: formData.category,
          subject: formData.subject,
          description: formData.description,
          reported_user_id: formData.reported_user_id || null,
          priority: formData.priority,
        }),
      });

      const data = await response.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Report Submitted",
          text: "Your report has been submitted successfully. We'll review it soon.",
          confirmButtonColor: "#D4AF37",
        });
        setCreateDialogOpen(false);
        setFormData({
          category: "",
          subject: "",
          description: "",
          reported_user_id: null,
          priority: "medium",
        });
        fetchReports();
      } else {
        throw new Error(data.message || "Failed to submit report");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to submit report. Please try again.",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "in_review":
        return "info";
      case "resolved":
        return "success";
      case "rejected":
        return "error";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Schedule />;
      case "in_review":
        return <Message />;
      case "resolved":
        return <CheckCircle />;
      case "rejected":
      case "closed":
        return <Close />;
      default:
        return <Schedule />;
    }
  };

  const getStatusLabel = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getCategoryLabel = (category) => {
    const found = categories.find((c) => c.value === category);
    return found ? found.label : category;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", py: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#1a1a1a",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Report sx={{ color: "#D4AF37" }} />
          My Reports
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            bgcolor: "#D4AF37",
            color: "#fff",
            "&:hover": { bgcolor: "#B8941F" },
            textTransform: "none",
            px: 3,
            py: 1,
          }}
        >
          New Report
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#D4AF37" }} />
        </Box>
      ) : reports.length === 0 ? (
        <Card
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: "16px",
            border: "1px solid rgba(212, 175, 55, 0.2)",
          }}
        >
          <Report
            sx={{ fontSize: 64, color: "#D4AF37", mb: 2, opacity: 0.5 }}
          />
          <Typography variant="h6" sx={{ mb: 1, color: "#1a1a1a" }}>
            No Reports Yet
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "rgba(26, 26, 26, 0.6)", mb: 3 }}
          >
            You haven't submitted any reports. Click "New Report" to report an
            issue.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {reports.map((report) => (
            <Card
              key={report.id}
              sx={{
                borderRadius: "16px",
                background: "#ffffff",
                border: "1px solid rgba(212, 175, 55, 0.2)",
                boxShadow: "0 2px 8px rgba(212, 175, 55, 0.08)",
                transition: "all 0.3s ease",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(212, 175, 55, 0.15)",
                  borderColor: "rgba(212, 175, 55, 0.4)",
                },
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                {/* Header Section */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2.5,
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#1a1a1a",
                        mb: 1.5,
                        fontSize: { xs: "1rem", sm: "1.125rem" },
                        lineHeight: 1.3,
                      }}
                    >
                      {report.subject}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap", gap: 1 }}
                    >
                      <Chip
                        icon={getStatusIcon(report.status)}
                        label={getStatusLabel(report.status)}
                        color={getStatusColor(report.status)}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.8125rem",
                          height: "28px",
                          "& .MuiChip-icon": {
                            fontSize: "1rem",
                          },
                        }}
                      />
                      <Chip
                        icon={<CategoryIcon />}
                        label={getCategoryLabel(report.category)}
                        size="small"
                        sx={{
                          bgcolor: "rgba(212, 175, 55, 0.12)",
                          color: "#D4AF37",
                          fontWeight: 600,
                          fontSize: "0.8125rem",
                          height: "28px",
                          border: "1px solid rgba(212, 175, 55, 0.3)",
                          "& .MuiChip-icon": {
                            color: "#D4AF37",
                            fontSize: "1rem",
                          },
                        }}
                      />
                    </Stack>
                  </Box>
                </Box>

                {/* Description Section */}
                <Box
                  sx={{
                    mb: 2.5,
                    p: 2,
                    borderRadius: "8px",
                    background: "rgba(212, 175, 55, 0.03)",
                    border: "1px solid rgba(212, 175, 55, 0.1)",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(26, 26, 26, 0.75)",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                      lineHeight: 1.6,
                    }}
                  >
                    {report.description}
                  </Typography>
                </Box>

                <Divider
                  sx={{
                    my: 2,
                    borderColor: "rgba(212, 175, 55, 0.15)",
                    borderWidth: "1px",
                  }}
                />

                {/* Footer Section */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(26, 26, 26, 0.6)",
                        fontWeight: 500,
                        fontSize: "0.8125rem",
                      }}
                    >
                      Submitted:
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#1a1a1a",
                        fontWeight: 600,
                        fontSize: "0.8125rem",
                      }}
                    >
                      {formatDate(report.createdAt)}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => {
                      setSelectedReport(report);
                      setViewDialogOpen(true);
                    }}
                    sx={{
                      color: "#D4AF37",
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      borderRadius: "8px",
                      px: 2,
                      py: 0.75,
                      border: "1px solid rgba(212, 175, 55, 0.3)",
                      background: "rgba(212, 175, 55, 0.05)",
                      "&:hover": {
                        bgcolor: "rgba(212, 175, 55, 0.12)",
                        borderColor: "rgba(212, 175, 55, 0.5)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 2px 8px rgba(212, 175, 55, 0.2)",
                      },
                      transition: "all 0.2s ease",
                      "& .MuiButton-startIcon": {
                        marginRight: "6px",
                      },
                    }}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Create Report Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => !submitting && setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: "#D4AF37",
            color: "#fff",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Report />
          Submit a Report
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                label="Category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Subject"
              required
              fullWidth
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              placeholder="Brief summary of your report"
            />

            <TextField
              label="Description"
              required
              fullWidth
              multiline
              rows={6}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Provide detailed information about the issue..."
            />

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setCreateDialogOpen(false)}
            disabled={submitting}
            sx={{ color: "#666" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateReport}
            variant="contained"
            disabled={submitting}
            sx={{
              bgcolor: "#D4AF37",
              "&:hover": { bgcolor: "#B8941F" },
            }}
          >
            {submitting ? <CircularProgress size={20} /> : "Submit Report"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "16px",
            background: "#ffffff",
            border: "1px solid rgba(212, 175, 55, 0.3)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)",
            color: "#fff",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: { xs: "1.125rem", sm: "1.25rem" },
            py: { xs: 2, sm: 2.5 },
            px: { xs: 2.5, sm: 3 },
          }}
        >
          <Report sx={{ fontSize: { xs: 24, sm: 28 } }} />
          Report Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3, px: { xs: 2.5, sm: 3 } }}>
          {selectedReport && (
            <Stack spacing={3}>
              {/* Subject Section */}
              <Card
                sx={{
                  p: 2.5,
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.1) 100%)",
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                  boxShadow: "0 2px 8px rgba(212, 175, 55, 0.1)",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(26, 26, 26, 0.6)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontSize: "0.75rem",
                    mb: 1,
                  }}
                >
                  Subject
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#1a1a1a",
                    fontSize: { xs: "1rem", sm: "1.125rem" },
                    lineHeight: 1.4,
                  }}
                >
                  {selectedReport.subject}
                </Typography>
              </Card>

              {/* Status and Category Section */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                }}
              >
                <Card
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.1) 100%)",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(26, 26, 26, 0.6)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontSize: "0.75rem",
                      mb: 1.5,
                      display: "block",
                    }}
                  >
                    Status
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedReport.status)}
                    label={getStatusLabel(selectedReport.status)}
                    color={getStatusColor(selectedReport.status)}
                    size="medium"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      py: 2.5,
                      "& .MuiChip-icon": {
                        fontSize: "1.25rem",
                      },
                    }}
                  />
                </Card>

                <Card
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.1) 100%)",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(26, 26, 26, 0.6)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontSize: "0.75rem",
                      mb: 1.5,
                      display: "block",
                    }}
                  >
                    Category
                  </Typography>
                  <Chip
                    icon={<CategoryIcon />}
                    label={getCategoryLabel(selectedReport.category)}
                    size="medium"
                    sx={{
                      bgcolor: "rgba(212, 175, 55, 0.15)",
                      color: "#D4AF37",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      py: 2.5,
                      border: "1px solid rgba(212, 175, 55, 0.3)",
                      "& .MuiChip-icon": {
                        color: "#D4AF37",
                        fontSize: "1.25rem",
                      },
                    }}
                  />
                </Card>
              </Box>

              {/* Description Section */}
              <Card
                sx={{
                  p: 2.5,
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.1) 100%)",
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                  boxShadow: "0 2px 8px rgba(212, 175, 55, 0.1)",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(26, 26, 26, 0.6)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontSize: "0.75rem",
                    mb: 1.5,
                    display: "block",
                  }}
                >
                  Description
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#1a1a1a",
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                    fontSize: { xs: "0.9375rem", sm: "1rem" },
                  }}
                >
                  {selectedReport.description}
                </Typography>
              </Card>

              {/* Admin Response Section */}
              {selectedReport.admin_notes && (
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)",
                    border: "1px solid rgba(33, 150, 243, 0.3)",
                    "& .MuiAlert-icon": {
                      color: "#2196F3",
                    },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      color: "#1a1a1a",
                      fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                    }}
                  >
                    Admin Response:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#1a1a1a",
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selectedReport.admin_notes}
                  </Typography>
                </Alert>
              )}

              {/* Date Information */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  background: "rgba(212, 175, 55, 0.05)",
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                }}
              >
                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(26, 26, 26, 0.6)",
                        fontWeight: 600,
                        fontSize: "0.8125rem",
                      }}
                    >
                      Submitted:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#1a1a1a",
                        fontWeight: 500,
                        fontSize: "0.875rem",
                      }}
                    >
                      {formatDate(selectedReport.createdAt)}
                    </Typography>
                  </Box>
                  {selectedReport.resolution_date && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(26, 26, 26, 0.6)",
                          fontWeight: 600,
                          fontSize: "0.8125rem",
                        }}
                      >
                        Resolved:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#1a1a1a",
                          fontWeight: 500,
                          fontSize: "0.875rem",
                        }}
                      >
                        {formatDate(selectedReport.resolution_date)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: { xs: 2, sm: 2.5 },
            px: { xs: 2.5, sm: 3 },
            borderTop: "1px solid rgba(212, 175, 55, 0.2)",
            backgroundColor: "rgba(212, 175, 55, 0.05)",
          }}
        >
          <Button
            onClick={() => setViewDialogOpen(false)}
            variant="contained"
            fullWidth
            sx={{
              bgcolor: "#D4AF37",
              color: "#fff",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "8px",
              py: 1.25,
              fontSize: { xs: "0.9375rem", sm: "1rem" },
              "&:hover": {
                bgcolor: "#B8941F",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(212, 175, 55, 0.3)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
