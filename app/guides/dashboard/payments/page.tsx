"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  Box,
  Typography,
  Chip,
  Paper,
  Collapse,
  Skeleton,
  Button,
} from "@mui/material";
import {
  Calendar,
  User,
  Mail,
  MapPin,
  IndianRupee,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  Info,
  Wallet,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { bookingService } from "./payments.service";
import { Booking } from "./paymentsTypes";

const GuideBookings = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const guideId = user?.id;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBookings, setExpandedBookings] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchGuideBookings = async () => {
      if (!guideId) return;

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          return;
        }

        const bookingsData = await bookingService.getGuideBookings(guideId, token);
        setBookings(bookingsData);

        // Initialize all bookings as collapsed by default
        const initialExpandedState = bookingsData.reduce((acc: Record<string, boolean>, booking: Booking) => {
          acc[booking.bookingId] = false;
          return acc;
        }, {});
        setExpandedBookings(initialExpandedState);
      } catch (err) {
        setError((err instanceof Error ? err.message : "An unknown error occurred") || "Failed to fetch bookings or payments");
      } finally {
        setLoading(false);
      }
    };

    fetchGuideBookings();
  }, [guideId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusChip = (status: string) => {
    const statusLower = status.toLowerCase();
    let color: "success" | "warning" | "error" | "default" = "default";
    let icon = <Info fontSize="small" />;

    if (statusLower.includes("complete") || statusLower.includes("paid")) {
      color = "success";
      icon = <CheckCircle fontSize="small" />;
    } else if (statusLower.includes("pending")) {
      color = "warning";
      icon = <Clock fontSize="small" />;
    } else if (statusLower.includes("fail") || statusLower.includes("cancel")) {
      color = "error";
      icon = <XCircle fontSize="small" />;
    }

    return (
      <Chip
        icon={icon}
        label={status}
        color={color}
        size="small"
        variant="outlined"
        sx={{ ml: 1, textTransform: "capitalize" }}
      />
    );
  };

  const toggleBookingDetails = (bookingId: string) => {
    setExpandedBookings((prev) => ({
      ...prev,
      [bookingId]: !prev[bookingId],
    }));
  };

  const expandAllBookings = () => {
    const newState: Record<string, boolean> = {};
    bookings.forEach((booking) => {
      newState[booking.bookingId] = true;
    });
    setExpandedBookings(newState);
  };

  const collapseAllBookings = () => {
    const newState: Record<string, boolean> = {};
    bookings.forEach((booking) => {
      newState[booking.bookingId] = false;
    });
    setExpandedBookings(newState);
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} key={item}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box ml={2}>
                        <Skeleton width={150} height={24} />
                        <Skeleton width={200} height={20} />
                      </Box>
                    </Box>
                    <Skeleton width="100%" height={60} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Skeleton width="100%" height={120} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Card sx={{ maxWidth: 600, mx: "auto", mt: 4, textAlign: "center", p: 4 }}>
        <XCircle
          color={theme.palette.error.main}
          size={48}
          style={{ margin: "0 auto" }}
        />
        <Typography variant="h6" color="error" sx={{ mt: 2 }}>
          Error Loading Bookings
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
          {error}
        </Typography>
      </Card>
    );
  }

  if (!bookings.length) {
    return (
      <Card sx={{ maxWidth: 500, mx: "auto", mt: 4, textAlign: "center", p: 4 }}>
        <Calendar
          color={theme.palette.text.disabled}
          size={48}
          style={{ margin: "0 auto" }}
        />
        <Typography variant="h6" sx={{ mt: 2 }}>
          No Bookings Found
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          You don&apos;t have any bookings yet.
        </Typography>
      </Card>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.dark,
              mb: 1,
            }}
          >
            Tour Bookings
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your upcoming and past tour bookings
          </Typography>
        </Box>
        <Box>
          <Button size="small" onClick={expandAllBookings} sx={{ mr: 1 }}>
            Expand All
          </Button>
          <Button size="small" onClick={collapseAllBookings}>
            Collapse All
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {bookings.map((booking, index) => (
          <Grid item xs={12} key={booking.bookingId}>
            <Paper
              elevation={2}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                border: `1px solid ${theme.palette.divider}`,
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <Box
                sx={{
                  p: 3,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  backgroundColor: expandedBookings[booking.bookingId]
                    ? theme.palette.action.hover
                    : "transparent",
                }}
                onClick={() => toggleBookingDetails(booking.bookingId)}
              >
                <Box display="flex" alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      mr: 2,
                    }}
                  >
                    {index + 1}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="div">
                      {booking.customer.name || "Unknown Client"}
                      {getStatusChip(booking.status)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(booking.tourDates.start)} -{" "}
                      {formatDate(booking.tourDates.end)}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center">
                  <Chip
                    label={`₹${booking.totalPaid.toLocaleString("en-IN")} paid`}
                    color="success"
                    size="small"
                    variant="outlined"
                    sx={{ mr: 2 }}
                  />
                  <IconButton size="small">
                    {expandedBookings[booking.bookingId] ? (
                      <ChevronUp />
                    ) : (
                      <ChevronDown />
                    )}
                  </IconButton>
                </Box>
              </Box>

              <Collapse in={expandedBookings[booking.bookingId]}>
                <Divider />
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    {/* Client Details */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            color="primary"
                            gutterBottom
                            sx={{ display: "flex", alignItems: "center", gap: 1 }}
                          >
                            <User size={20} color={theme.palette.primary.main} />
                            Client Information
                          </Typography>
                          <List disablePadding>
                            <ListItem disableGutters>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <User
                                  size={18}
                                  color={theme.palette.text.secondary}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={booking.customer.name || "Not specified"}
                                secondary="Full name"
                              />
                            </ListItem>
                            <ListItem disableGutters>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Mail
                                  size={18}
                                  color={theme.palette.text.secondary}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={booking.customer.email || "Not specified"}
                                secondary="Email address"
                              />
                            </ListItem>
                            <ListItem disableGutters>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Phone
                                  size={18}
                                  color={theme.palette.text.secondary}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={booking.customer.phone || "Not specified"}
                                secondary="Phone number"
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Tour Details */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            color="primary"
                            gutterBottom
                            sx={{ display: "flex", alignItems: "center", gap: 1 }}
                          >
                            <Calendar size={20} color={theme.palette.primary.main} />
                            Tour Details
                          </Typography>
                          <List disablePadding>
                            <ListItem disableGutters>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Calendar
                                  size={18}
                                  color={theme.palette.text.secondary}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={`${formatDate(
                                  booking.tourDates.start
                                )} - ${formatDate(booking.tourDates.end)}`}
                                secondary="Tour dates"
                              />
                            </ListItem>
                            <ListItem disableGutters>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <MapPin
                                  size={18}
                                  color={theme.palette.text.secondary}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={booking.pickupLocation || "Not specified"}
                                secondary="Pickup location"
                              />
                            </ListItem>
                            <ListItem disableGutters>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <MapPin
                                  size={18}
                                  color={theme.palette.text.secondary}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={booking.dropoffLocation || "Not specified"}
                                secondary="Dropoff location"
                              />
                            </ListItem>
                            <ListItem disableGutters>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Wallet
                                  size={18}
                                  color={theme.palette.text.secondary}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={`₹${
                                  booking.budget?.toLocaleString("en-IN") || "0"
                                }`}
                                secondary="Total budget"
                              />
                              <ListItemText
                                primary={`₹${
                                  booking.remainingBalance?.toLocaleString(
                                    "en-IN"
                                  ) || "0"
                                }`}
                                secondary="Remaining balance"
                                sx={{ textAlign: "right" }}
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Payment History */}
                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              mb: 2,
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              fontWeight={600}
                              color="primary"
                              sx={{ display: "flex", alignItems: "center", gap: 1 }}
                            >
                              <CreditCard size={20} color={theme.palette.primary.main} />
                              Payment History
                            </Typography>
                            <Chip
                              label={`${booking.payments.length} transactions`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          {booking.payments.length > 0 ? (
                            <List disablePadding>
                              {booking.payments.map((payment) => (
                                <ListItem
                                  key={payment.paymentId}
                                  divider
                                  disableGutters
                                  secondaryAction={
                                    <Chip
                                      label={payment.status}
                                      size="small"
                                      color={
                                        payment.status === "completed"
                                          ? "success"
                                          : payment.status === "pending"
                                          ? "warning"
                                          : "error"
                                      }
                                      variant="outlined"
                                    />
                                  }
                                >
                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                    <Avatar
                                      sx={{
                                        bgcolor: theme.palette.grey[100],
                                        width: 32,
                                        height: 32,
                                      }}
                                    >
                                      <IndianRupee
                                        size={16}
                                        color={theme.palette.text.secondary}
                                      />
                                    </Avatar>
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={`₹${payment.amount.toLocaleString(
                                      "en-IN"
                                    )}`}
                                    secondary={
                                      <>
                                        {formatDateTime(payment.date)}
                                        {payment.method &&
                                          ` • ${payment.method}`}
                                        {payment.transactionId &&
                                          ` • ${payment.transactionId}`}
                                      </>
                                    }
                                  />
                                  {payment.transactionDetails?.screenshotUrl && (
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        window.open(
                                          payment.transactionDetails?.screenshotUrl,
                                          "_blank"
                                        )
                                      }
                                      sx={{ ml: 1 }}
                                    >
                                      <Tooltip title="View payment proof">
                                        <Info size={18} />
                                      </Tooltip>
                                    </IconButton>
                                  )}
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                py: 4,
                              }}
                            >
                              <CreditCard
                                size={48}
                                color={theme.palette.text.disabled}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 2 }}
                              >
                                No payment records found for this booking
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default GuideBookings;