"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Badge,
  IconButton,
  Tooltip,
  LinearProgress,
  useTheme,
  Box,
  Typography
} from '@mui/material';
import {
  Today as TodayIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';

const GuideBookings = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const guideId = user?.id;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBooking, setExpandedBooking] = useState(null);

  useEffect(() => {
    const fetchGuideBookings = async () => {
      if (!guideId) return;
      
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/guide/${guideId}`);
        setBookings(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchGuideBookings();
  }, [guideId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return <CheckIcon color="success" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'failed':
      case 'cancelled':
        return <CancelIcon color="error" />;
      default:
        return <PendingIcon color="info" />;
    }
  };

  const toggleBookingExpand = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', p: 4 }}>
        <LinearProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4, textAlign: 'center', p: 3 }}>
        <Typography color="error" variant="h6">
          Error Loading Bookings
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          {error}
        </Typography>
      </Card>
    );
  }

  if (!bookings.length) {
    return (
      <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4, textAlign: 'center', p: 3 }}>
        <Typography variant="h6">
          No Bookings Found
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          You don't have any bookings yet.
        </Typography>
      </Card>
    );
  }

  return (
    <Grid container spacing={3} sx={{ p: 3 }}>
      <Grid item xs={12}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 700,
          color: theme.palette.primary.dark,
          mb: 2
        }}>
          Your Tour Bookings
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage and view all your assigned tours and payments
        </Typography>
      </Grid>

      {bookings.map((bookingData, index) => (
        <Grid item xs={12} key={bookingData.booking._id}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: theme.shadows[2],
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: theme.shadows[6]
            }
          }}>
            <CardHeader
              avatar={
                <Avatar sx={{ 
                  bgcolor: theme.palette.primary.main,
                  width: 48, 
                  height: 48,
                  fontSize: '1.25rem'
                }}>
                  {index + 1}
                </Avatar>
              }
              action={
                <IconButton onClick={() => toggleBookingExpand(bookingData.booking._id)}>
                  {expandedBooking === bookingData.booking._id ? (
                    <ExpandMoreIcon />
                  ) : (
                    <ChevronRightIcon />
                  )}
                </IconButton>
              }
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6" component="span" sx={{ mr: 2 }}>
                    {formatDate(bookingData.booking.startDate)} - {formatDate(bookingData.booking.endDate)}
                  </Typography>
                  <Tooltip title={bookingData.booking.status}>
                    {getStatusIcon(bookingData.booking.status)}
                  </Tooltip>
                </Box>
              }
              subheader={
                <Typography variant="body2" color="text.secondary">
                  Booked on: {formatDateTime(bookingData.booking.createdAt)}
                </Typography>
              }
              sx={{
                '& .MuiCardHeader-content': {
                  overflow: 'hidden'
                }
              }}
            />

            {expandedBooking === bookingData.booking._id && (
              <CardContent sx={{ pt: 0 }}>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardHeader
                        title="Client Details"
                        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                        avatar={<PersonIcon color="primary" />}
                      />
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <PersonIcon color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={bookingData.booking.userId?.name || 'Unknown'} 
                            secondary="Client Name"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <EmailIcon color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={bookingData.booking.userId?.email || 'No email'} 
                            secondary="Email"
                          />
                        </ListItem>
                      </List>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardHeader
                        title="Tour Details"
                        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                        avatar={<TodayIcon color="primary" />}
                      />
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <EventIcon color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={`${formatDate(bookingData.booking.startDate)} - ${formatDate(bookingData.booking.endDate)}`} 
                            secondary="Duration"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <LocationIcon color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={bookingData.booking.pickupLocation || 'Not specified'} 
                            secondary="Pickup Location"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <LocationIcon color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={bookingData.booking.dropoffLocation || 'Not specified'} 
                            secondary="Dropoff Location"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <MoneyIcon color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={`₹${bookingData.booking.budget.toLocaleString('en-IN')}`} 
                            secondary="Budget"
                          />
                        </ListItem>
                      </List>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardHeader
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PaymentIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="subtitle1" fontWeight={600}>
                              Payment History ({bookingData.payments.length})
                            </Typography>
                          </Box>
                        }
                      />
                      {bookingData.payments.length > 0 ? (
                        <List dense>
                          {bookingData.payments.map((payment) => (
                            <ListItem key={payment._id} divider>
                              <ListItemIcon>
                                <Badge
                                  badgeContent={payment.paymentStatus === 'completed' ? (
                                    <CheckIcon color="success" fontSize="small" />
                                  ) : (
                                    <PendingIcon color="warning" fontSize="small" />
                                  )}
                                >
                                  <Avatar sx={{ bgcolor: theme.palette.grey[200] }}>
                                    <PaymentIcon color="action" />
                                  </Avatar>
                                </Badge>
                              </ListItemIcon>
                              <ListItemText
                                primary={`₹${payment.amount.toLocaleString('en-IN')}`}
                                secondary={
                                  <>
                                    <Typography component="span" variant="body2" color="text.primary">
                                      {payment.modeOfPayment} • {payment.payId}
                                    </Typography>
                                    <br />
                                    {formatDateTime(payment.completedAt || payment.createdAt)}
                                  </>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            No payment records found for this booking
                          </Typography>
                        </Box>
                      )}
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            )}
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default GuideBookings;