import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  AccountBalanceWallet,
  Add,
  CheckCircle,
  Cancel,
  TrendingUp,
  Payment,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function Wallet({ user, setUser }) {
  const [balance, setBalance] = useState(user?.token_balance || 0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const paystackPublicKey =
    import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ||
    "pk_live_b0619e438241d7c4756dd17e043788337919578c";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const navigate = useNavigate();

  const quickBuyOptions = [
    { amount: 10, label: "10 Tokens", price: "KES 10" },
    { amount: 50, label: "50 Tokens", price: "KES 50" },
    { amount: 100, label: "100 Tokens", price: "KES 100" },
    { amount: 500, label: "500 Tokens", price: "KES 500" },
  ];

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [balanceRes, transactionsRes] = await Promise.all([
        fetch("/api/tokens/balance", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/tokens/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const balanceData = await balanceRes.json();
      const transactionsData = await transactionsRes.json();

      if (balanceData.success) {
        setBalance(balanceData.data.balance);
        const updatedUser = {
          ...user,
          token_balance: balanceData.data.balance,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        if (setUser) setUser(updatedUser);
      }

      if (transactionsData.success) {
        setTransactions(transactionsData.data || []);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const updateStatusMessage = (message) => {
    const statusEl = document.querySelector(".swal-paystack-status");
    if (statusEl) {
      statusEl.textContent = message;
    }
  };

  const pollPaymentStatus = async (reference, attempt = 1) => {
    const MAX_ATTEMPTS = 12; // ~1 min if interval is 5s
    const STATUS_INTERVAL = 5000;

    if (attempt === 1) {
      updateStatusMessage("Waiting for Paystack confirmation...");
    }

    if (attempt > MAX_ATTEMPTS) {
      return { status: "timeout" };
    }

    await wait(STATUS_INTERVAL);
    updateStatusMessage(
      `Checking payment status (${attempt}/${MAX_ATTEMPTS})...`
    );

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/paystack/verify?reference=${reference}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (response.ok && data.success) {
        updateStatusMessage("Payment confirmed! Updating wallet...");
        return { status: "success", data };
      }

      if (response.status === 400) {
        const message = (data.message || "").toLowerCase();
        if (message.includes("not successful")) {
          return pollPaymentStatus(reference, attempt + 1);
        }
        return { status: "failed", data };
      }

      throw new Error(data.message || "Verification failed");
    } catch (error) {
      console.error("verifyPayment error:", error);
      if (attempt >= MAX_ATTEMPTS) {
        return { status: "error", message: error.message };
      }
      return pollPaymentStatus(reference, attempt + 1);
    }
  };

  const handlePurchase = async (amount) => {
    if (purchasing) return;

    if (!paystackPublicKey) {
      Swal.fire({
        icon: "error",
        title: "Missing Paystack Key",
        text: "Set VITE_PAYSTACK_PUBLIC_KEY in your frontend environment to enable payments.",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    const currentUser =
      user || JSON.parse(localStorage.getItem("user") || "{}");
    if (!currentUser?.email) {
      Swal.fire({
        icon: "error",
        title: "Missing Email",
        text: "We could not determine your account email. Please re-login and try again.",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    setPurchasing(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: currentUser.email,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to initialize payment");
      }

      const { authorization_url, reference } = data;

      window.open(authorization_url, "_blank", "noopener");

      Swal.fire({
        icon: "info",
        title: "Complete Paystack Payment",
        html: `
          <p style="margin-bottom: 8px;">We opened a secure Paystack window in a new tab.</p>
          <p style="margin-bottom: 8px;">Pay with the provided test card and OTP:</p>
          <ul style="text-align: left; font-size: 0.85rem; margin: 0 0 10px 15px;">
            <li>Card: <code>4084 0840 8408 4081</code></li>
            <li>Expiry: Any future date</li>
            <li>CVV: <code>123</code></li>
            <li>OTP: <code>123456</code></li>
          </ul>
          <p class="swal-paystack-status" style="margin: 12px 0; font-weight: 600; color: #555;">Waiting for Paystack confirmation...</p>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          const swal = document.querySelector(".swal2-popup");
          if (swal) {
            swal.style.borderRadius = "20px";
          }
          Swal.showLoading();
        },
      });

      const result = await pollPaymentStatus(reference);

      Swal.close();

      setPurchasing(false);

      if (result.status === "success") {
        await fetchWallet();
        Swal.fire({
          icon: "success",
          title: "Payment Confirmed",
          html: `
            <p><strong>${amount} tokens</strong> added to your wallet.</p>
            <p style="font-size: 0.9em; color: #666; margin-top: 10px;">
              Reference: <code>${reference}</code>
            </p>
          `,
          timer: 2600,
          showConfirmButton: false,
          confirmButtonColor: "#D4AF37",
        });
      } else if (result.status === "timeout") {
        Swal.fire({
          icon: "info",
          title: "Awaiting Confirmation",
          html: `
            <p>We did not receive Paystack confirmation yet.</p>
            <p style="margin-top: 10px;">If you completed payment, your tokens will arrive shortly once Paystack notifies us.</p>
            <p style="margin-top: 10px;">You can refresh the wallet later to confirm.</p>
          `,
          confirmButtonColor: "#D4AF37",
        });
      } else if (result.status === "failed") {
        Swal.fire({
          icon: "warning",
          title: "Payment Not Completed",
          text:
            result.data?.message ||
            "Paystack reported that the payment was not completed.",
          confirmButtonColor: "#D4AF37",
        });
      } else if (result.status === "error") {
        throw new Error(result.message || "Failed to verify payment");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      setPurchasing(false);
      Swal.fire({
        icon: "error",
        title: "Purchase Failed",
        text:
          error.message ||
          "Failed to start Paystack payment. Please try again.",
        confirmButtonColor: "#D4AF37",
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRowClick = async (transactionId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/tokens/transactions/${transactionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setSelectedTransaction(data.data);
        setDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching transaction:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load transaction details",
        confirmButtonColor: "#D4AF37",
      });
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: { xs: 1.5, sm: 2, md: 3 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: { xs: 0.5, sm: 1 },
            fontSize: { xs: "1.25rem", sm: "1.75rem", md: "2.125rem" },
            background: "linear-gradient(45deg, #D4AF37, #B8941F)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            wordBreak: "break-word",
          }}
        >
          Token Wallet
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "rgba(26, 26, 26, 0.7)",
            fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
            wordBreak: "break-word",
          }}
        >
          Manage your tokens and view transaction history
        </Typography>
      </Box>

      {/* Test Mode Alert */}
      <Alert
        severity="info"
        icon={<Payment />}
        sx={{
          mb: { xs: 1.5, sm: 2, md: 3 },
          borderRadius: "12px",
          bgcolor: "rgba(212, 175, 55, 0.1)",
          border: "1px solid rgba(212, 175, 55, 0.3)",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          "& .MuiAlert-icon": {
            color: "#D4AF37",
          },
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            mb: 0.5,
            fontSize: { xs: "0.7rem", sm: "0.875rem" },
          }}
        >
          🧪 Paystack Test Mode
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontSize: { xs: "0.65rem", sm: "0.875rem" } }}
        >
          Payments run through Paystack's sandbox. Use the provided test card
          details during checkout. Tokens post automatically once Paystack
          confirms the transaction.
        </Typography>
      </Alert>

      {/* Balance Card */}
      <Card
        sx={{
          p: { xs: 1, sm: 2, md: 3 },
          mb: { xs: 1.5, sm: 2, md: 3 },
          borderRadius: "16px",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
          border: "2px solid rgba(212, 175, 55, 0.3)",
          boxShadow: "0 8px 32px rgba(212, 175, 55, 0.15)",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <Stack
          direction="row"
          spacing={{ xs: 1.5, sm: 2, md: 3 }}
          alignItems="center"
        >
          <Box
            sx={{
              width: { xs: 50, sm: 60, md: 80 },
              height: { xs: 50, sm: 60, md: 80 },
              borderRadius: "50%",
              background: "linear-gradient(135deg, #D4AF37, #B8941F)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(212, 175, 55, 0.3)",
              flexShrink: 0,
            }}
          >
            <AccountBalanceWallet
              sx={{ fontSize: { xs: 24, sm: 30, md: 40 }, color: "#1a1a1a" }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(26, 26, 26, 0.7)",
                mb: 1,
                fontSize: { xs: "0.65rem", sm: "0.875rem" },
              }}
            >
              Current Balance
            </Typography>
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#D4AF37" }} />
            ) : (
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.2rem", sm: "2rem", md: "3rem" },
                  background: "linear-gradient(45deg, #D4AF37, #B8941F)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  wordBreak: "break-word",
                }}
              >
                {Number(balance || 0).toFixed(2)} Tokens
              </Typography>
            )}
            <Typography
              variant="body2"
              sx={{
                color: "rgba(26, 26, 26, 0.6)",
                mt: 0.5,
                fontSize: { xs: "0.65rem", sm: "0.875rem" },
              }}
            >
              1 Token = KES 1
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Quick Buy Section */}
      <Card
        sx={{
          p: { xs: 1, sm: 2, md: 3 },
          mb: { xs: 1.5, sm: 2, md: 3 },
          borderRadius: "16px",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
          border: "1px solid rgba(212, 175, 55, 0.2)",
          boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 3,
            color: "#1a1a1a",
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: { xs: "0.85rem", sm: "1.125rem", md: "1.25rem" },
          }}
        >
          <Add
            sx={{ fontSize: { xs: "1rem", md: "1.5rem" }, color: "#D4AF37" }}
          />
          Quick Buy Tokens
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: { xs: 1, sm: 1.5, md: 2 },
          }}
        >
          {quickBuyOptions.map((option) => (
            <Button
              key={option.amount}
              variant="outlined"
              onClick={() => handlePurchase(option.amount)}
              disabled={purchasing || !paystackPublicKey}
              sx={{
                p: { xs: 1, sm: 1.5, md: 2 },
                borderRadius: "12px",
                borderColor: "rgba(212, 175, 55, 0.5)",
                color: "#1a1a1a",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  borderColor: "#D4AF37",
                  bgcolor: "rgba(212, 175, 55, 0.1)",
                  transform: "translateY(-2px)",
                },
                "&:disabled": {
                  opacity: 0.6,
                },
              }}
            >
              <Box sx={{ textAlign: "center", width: "100%" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    fontSize: { xs: "0.75rem", sm: "1rem", md: "1.25rem" },
                  }}
                >
                  {option.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(26, 26, 26, 0.7)",
                    fontSize: { xs: "0.65rem", sm: "0.875rem" },
                  }}
                >
                  {option.price}
                </Typography>
              </Box>
            </Button>
          ))}
        </Box>
        {purchasing && (
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <CircularProgress size={24} sx={{ color: "#D4AF37" }} />
            <Typography
              variant="body2"
              sx={{ mt: 1, color: "rgba(26, 26, 26, 0.7)" }}
            >
              Processing purchase...
            </Typography>
          </Box>
        )}
      </Card>

      {/* Transaction History */}
      <Card
        sx={{
          p: { xs: 1, sm: 2, md: 3 },
          borderRadius: "16px",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
          border: "1px solid rgba(212, 175, 55, 0.2)",
          boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 3,
            color: "#1a1a1a",
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
          }}
        >
          <TrendingUp
            sx={{ fontSize: { xs: "1.2rem", md: "1.5rem" }, color: "#D4AF37" }}
          />
          Transaction History
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: "#D4AF37" }} />
          </Box>
        ) : transactions.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" sx={{ color: "rgba(26, 26, 26, 0.6)" }}>
              No transactions yet
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(26, 26, 26, 0.5)", mt: 1 }}
            >
              Purchase tokens to see your transaction history here
            </Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              boxShadow: "none",
              bgcolor: "transparent",
              overflowX: "auto",
            }}
          >
            <Table
              size="small"
              sx={{
                minWidth: { xs: 280, sm: 400 },
                width: "100%",
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#1a1a1a",
                      fontSize: { xs: "0.65rem", sm: "0.875rem" },
                    }}
                  >
                    Date
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#1a1a1a",
                      fontSize: { xs: "0.65rem", sm: "0.875rem" },
                    }}
                  >
                    Amount
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#1a1a1a",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      display: { xs: "none", sm: "table-cell" },
                    }}
                  >
                    Method
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    hover
                    onClick={() => handleRowClick(transaction.id)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell
                      sx={{
                        color: "rgba(26, 26, 26, 0.7)",
                        fontSize: { xs: "0.65rem", sm: "0.875rem" },
                      }}
                    >
                      {formatDate(transaction.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color:
                            Number(transaction.amount) > 0
                              ? "#4caf50"
                              : "#f44336",
                          fontSize: { xs: "0.65rem", sm: "0.875rem" },
                        }}
                      >
                        {Number(transaction.amount) > 0 ? "+" : ""}
                        {Number(transaction.amount).toFixed(2)} Tokens
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        display: { xs: "none", sm: "table-cell" },
                      }}
                    >
                      <Chip
                        label={transaction.payment_method || "system"}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: "rgba(212, 175, 55, 0.3)",
                          color: "rgba(26, 26, 26, 0.7)",
                          fontSize: { xs: "0.7rem", sm: "0.75rem" },
                          height: { xs: 24, sm: 28 },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedTransaction(null);
        }}
        maxWidth="sm"
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
            background: "linear-gradient(135deg, #D4AF37, #B8941F)",
            color: "#1a1a1a",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1,
            pb: 2,
          }}
        >
          <AccountBalanceWallet sx={{ color: "#1a1a1a" }} />
          Transaction Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedTransaction && (
            <Box>
              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(26, 26, 26, 0.6)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      fontSize: "0.7rem",
                    }}
                  >
                    Type
                  </Typography>
                  <Chip
                    label={
                      selectedTransaction.transaction_type === "purchase"
                        ? "Purchase"
                        : selectedTransaction.transaction_type === "deduction"
                          ? "Deduction"
                          : "Bonus"
                    }
                    size="small"
                    sx={{
                      mt: 0.5,
                      bgcolor:
                        selectedTransaction.transaction_type === "purchase"
                          ? "rgba(76, 175, 80, 0.15)"
                          : selectedTransaction.transaction_type === "deduction"
                            ? "rgba(244, 67, 54, 0.15)"
                            : "rgba(212, 175, 55, 0.15)",
                      color:
                        selectedTransaction.transaction_type === "purchase"
                          ? "#4caf50"
                          : selectedTransaction.transaction_type === "deduction"
                            ? "#f44336"
                            : "#D4AF37",
                      fontWeight: 600,
                    }}
                  />
                </Box>

                <Divider />

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(26, 26, 26, 0.6)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      fontSize: "0.7rem",
                    }}
                  >
                    Amount
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color:
                        Number(selectedTransaction.amount) > 0
                          ? "#4caf50"
                          : "#f44336",
                      mt: 0.5,
                    }}
                  >
                    {Number(selectedTransaction.amount) > 0 ? "+" : ""}
                    {Number(selectedTransaction.amount).toFixed(2)} Tokens
                  </Typography>
                </Box>

                <Divider />

                {selectedTransaction.description && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(26, 26, 26, 0.6)",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        fontSize: "0.7rem",
                      }}
                    >
                      Description
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#1a1a1a",
                        mt: 0.5,
                      }}
                    >
                      {selectedTransaction.description}
                    </Typography>
                  </Box>
                )}

                <Divider />

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(26, 26, 26, 0.6)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      fontSize: "0.7rem",
                    }}
                  >
                    Payment Method
                  </Typography>
                  <Chip
                    label={selectedTransaction.payment_method || "system"}
                    variant="outlined"
                    sx={{
                      mt: 0.5,
                      borderColor: "rgba(212, 175, 55, 0.3)",
                      color: "rgba(26, 26, 26, 0.7)",
                      fontWeight: 600,
                    }}
                  />
                </Box>

                {selectedTransaction.reference && (
                  <>
                    <Divider />
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(26, 26, 26, 0.6)",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          fontSize: "0.7rem",
                        }}
                      >
                        Reference
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "rgba(26, 26, 26, 0.7)",
                          mt: 0.5,
                          fontFamily: "monospace",
                        }}
                      >
                        {selectedTransaction.reference}
                      </Typography>
                    </Box>
                  </>
                )}

                <Divider />

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(26, 26, 26, 0.6)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      fontSize: "0.7rem",
                    }}
                  >
                    Date
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#1a1a1a",
                      mt: 0.5,
                    }}
                  >
                    {formatDate(selectedTransaction.createdAt)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            borderTop: "1px solid rgba(212, 175, 55, 0.2)",
            backgroundColor: "rgba(212, 175, 55, 0.05)",
          }}
        >
          <Button
            onClick={() => {
              setDialogOpen(false);
              setSelectedTransaction(null);
            }}
            sx={{
              color: "#1a1a1a",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(212, 175, 55, 0.1)",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
