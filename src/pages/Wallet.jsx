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
        const updatedUser = { ...user, token_balance: balanceData.data.balance };
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

  const handlePurchase = async (amount) => {
    const confirmResult = await Swal.fire({
      icon: "question",
      title: "Mock Payment - Test Mode",
      html: `
        <p><strong>Purchase ${amount} tokens for ${amount} KES</strong></p>
        <p style="font-size: 0.9em; color: #666; margin-top: 10px;">
          ⚠️ This is a test purchase. No actual payment will be processed.
        </p>
        <p style="font-size: 0.9em; color: #666;">
          M-PESA integration is under development.
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: "Confirm Purchase",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#D4AF37",
      didOpen: () => {
        const swal = document.querySelector(".swal2-popup");
        if (swal) {
          swal.style.borderRadius = "20px";
        }
      },
    });

    if (!confirmResult.isConfirmed) return;

    setPurchasing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/tokens/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: amount,
          method: "system",
          reference: `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchWallet();
        Swal.fire({
          icon: "success",
          title: "Tokens Purchased!",
          html: `
            <p><strong>${amount} tokens</strong> added to your wallet!</p>
            <p style="font-size: 0.9em; color: #666; margin-top: 10px;">
              New Balance: <strong>${data.data.balance} tokens</strong>
            </p>
          `,
          timer: 2500,
          showConfirmButton: false,
          confirmButtonColor: "#D4AF37",
          didOpen: () => {
            const swal = document.querySelector(".swal2-popup");
            if (swal) {
              swal.style.borderRadius = "20px";
            }
          },
        });
      } else {
        throw new Error(data.message || "Purchase failed");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      Swal.fire({
        icon: "error",
        title: "Purchase Failed",
        text: error.message || "Failed to purchase tokens. Please try again.",
        confirmButtonColor: "#D4AF37",
        didOpen: () => {
          const swal = document.querySelector(".swal2-popup");
          if (swal) {
            swal.style.borderRadius = "20px";
          }
        },
      });
    } finally {
      setPurchasing(false);
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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            background: "linear-gradient(45deg, #D4AF37, #B8941F)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Token Wallet
        </Typography>
        <Typography variant="body1" sx={{ color: "rgba(26, 26, 26, 0.7)" }}>
          Manage your tokens and view transaction history
        </Typography>
      </Box>

      {/* Test Mode Alert */}
      <Alert
        severity="info"
        icon={<Payment />}
        sx={{
          mb: 3,
          borderRadius: "12px",
          bgcolor: "rgba(212, 175, 55, 0.1)",
          border: "1px solid rgba(212, 175, 55, 0.3)",
          "& .MuiAlert-icon": {
            color: "#D4AF37",
          },
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          🧪 Test Mode - Mock Payments
        </Typography>
        <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
          M-PESA integration is under development. All purchases are mock/test
          transactions for development purposes only.
        </Typography>
      </Alert>

      {/* Balance Card */}
      <Card
        sx={{
          p: 4,
          mb: 3,
          borderRadius: "16px",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
          border: "2px solid rgba(212, 175, 55, 0.3)",
          boxShadow: "0 8px 32px rgba(212, 175, 55, 0.15)",
        }}
      >
        <Stack direction="row" spacing={3} alignItems="center">
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #D4AF37, #B8941F)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(212, 175, 55, 0.3)",
            }}
          >
            <AccountBalanceWallet sx={{ fontSize: 40, color: "#1a1a1a" }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: "rgba(26, 26, 26, 0.7)", mb: 1 }}
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
                  background: "linear-gradient(45deg, #D4AF37, #B8941F)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {Number(balance || 0).toFixed(2)} Tokens
              </Typography>
            )}
            <Typography variant="body2" sx={{ color: "rgba(26, 26, 26, 0.6)", mt: 0.5 }}>
              1 Token = KES 1
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Quick Buy Section */}
      <Card
        sx={{
          p: 4,
          mb: 3,
          borderRadius: "16px",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
          border: "1px solid rgba(212, 175, 55, 0.2)",
          boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
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
          }}
        >
          <Add sx={{ color: "#D4AF37" }} />
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
            gap: 2,
          }}
        >
          {quickBuyOptions.map((option) => (
            <Button
              key={option.amount}
              variant="outlined"
              onClick={() => handlePurchase(option.amount)}
              disabled={purchasing}
              sx={{
                p: 2.5,
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
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {option.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(26, 26, 26, 0.7)" }}
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
            <Typography variant="body2" sx={{ mt: 1, color: "rgba(26, 26, 26, 0.7)" }}>
              Processing purchase...
            </Typography>
          </Box>
        )}
      </Card>

      {/* Transaction History */}
      <Card
        sx={{
          p: 4,
          borderRadius: "16px",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
          border: "1px solid rgba(212, 175, 55, 0.2)",
          boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
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
          }}
        >
          <TrendingUp sx={{ color: "#D4AF37" }} />
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
            <Typography variant="body2" sx={{ color: "rgba(26, 26, 26, 0.5)", mt: 1 }}>
              Purchase tokens to see your transaction history here
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: "none", bgcolor: "transparent" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: "#1a1a1a" }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1a1a1a" }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1a1a1a" }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1a1a1a" }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1a1a1a" }}>Method</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell sx={{ color: "rgba(26, 26, 26, 0.7)" }}>
                      {formatDate(transaction.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          transaction.transaction_type === "purchase"
                            ? "Purchase"
                            : transaction.transaction_type === "deduction"
                            ? "Deduction"
                            : "Bonus"
                        }
                        size="small"
                        sx={{
                          bgcolor:
                            transaction.transaction_type === "purchase"
                              ? "rgba(76, 175, 80, 0.15)"
                              : transaction.transaction_type === "deduction"
                              ? "rgba(244, 67, 54, 0.15)"
                              : "rgba(212, 175, 55, 0.15)",
                          color:
                            transaction.transaction_type === "purchase"
                              ? "#4caf50"
                              : transaction.transaction_type === "deduction"
                              ? "#f44336"
                              : "#D4AF37",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color:
                            Number(transaction.amount) > 0 ? "#4caf50" : "#f44336",
                        }}
                      >
                        {Number(transaction.amount) > 0 ? "+" : ""}
                        {Number(transaction.amount).toFixed(2)} Tokens
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "rgba(26, 26, 26, 0.7)" }}>
                      {transaction.description || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.payment_method || "system"}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: "rgba(212, 175, 55, 0.3)",
                          color: "rgba(26, 26, 26, 0.7)",
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
    </Box>
  );
}

