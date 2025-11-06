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
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
            background: "linear-gradient(45deg, #D4AF37, #B8941F)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Token Wallet
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "rgba(26, 26, 26, 0.7)",
            fontSize: { xs: "0.875rem", sm: "1rem" },
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
          mb: 3,
          borderRadius: "12px",
          bgcolor: "rgba(212, 175, 55, 0.1)",
          border: "1px solid rgba(212, 175, 55, 0.3)",
          maxWidth: { xs: "90%", sm: "100%" },
          mx: { xs: "auto", sm: 0 },
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
          p: { xs: 2, sm: 3, md: 4 },
          mb: 3,
          borderRadius: "16px",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
          border: "2px solid rgba(212, 175, 55, 0.3)",
          boxShadow: "0 8px 32px rgba(212, 175, 55, 0.15)",
          maxWidth: { xs: "90%", sm: "100%" },
          mx: { xs: "auto", sm: 0 },
        }}
      >
        <Stack direction="row" spacing={{ xs: 2, sm: 3 }} alignItems="center">
          <Box
            sx={{
              width: { xs: 60, sm: 70, md: 80 },
              height: { xs: 60, sm: 70, md: 80 },
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
              sx={{ fontSize: { xs: 30, sm: 35, md: 40 }, color: "#1a1a1a" }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(26, 26, 26, 0.7)",
                mb: 1,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
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
                  fontSize: { xs: "1.5rem", sm: "2rem", md: "3rem" },
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
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
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
          p: { xs: 2, sm: 3, md: 4 },
          mb: 3,
          borderRadius: "16px",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
          border: "1px solid rgba(212, 175, 55, 0.2)",
          boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
          maxWidth: { xs: "90%", sm: "100%" },
          mx: { xs: "auto", sm: 0 },
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
          <Add
            sx={{ fontSize: { xs: "1.2rem", md: "1.5rem" }, color: "#D4AF37" }}
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
                p: { xs: 1.5, sm: 2, md: 2.5 },
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
                    fontSize: { xs: "0.875rem", sm: "1rem", md: "1.25rem" },
                  }}
                >
                  {option.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(26, 26, 26, 0.7)",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
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
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: "16px",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 230, 211, 0.2) 100%)",
          border: "1px solid rgba(212, 175, 55, 0.2)",
          boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
          maxWidth: { xs: "90%", sm: "100%" },
          mx: { xs: "auto", sm: 0 },
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
            <Table size="small" sx={{ minWidth: 400 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#1a1a1a",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    Date
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#1a1a1a",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    Amount
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#1a1a1a",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
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
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
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
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        }}
                      >
                        {Number(transaction.amount) > 0 ? "+" : ""}
                        {Number(transaction.amount).toFixed(2)} Tokens
                      </Typography>
                    </TableCell>
                    <TableCell>
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
