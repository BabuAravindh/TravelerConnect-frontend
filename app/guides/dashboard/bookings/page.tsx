"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  User,
  Clock,
  IndianRupee,
  CheckCircle,
  CreditCard,
  FileText,
  Check,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { bookingService } from "./booking.service";
import { Booking,PaymentHistoryResponse } from "./bookingTypes";

const BookingsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [paymentHistories, setPaymentHistories] = useState<
    Record<string, PaymentHistoryResponse>
  >({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>(
    {}
  );
  const [updatingPayment, setUpdatingPayment] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (authLoading || !user?.id) return;

    let isMounted = true;

    const fetchBookingsAndPayments = async () => {
      setLoading(true);
      setErrors({});
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setErrors({ global: "⚠ No token found. Please log in." });
          setLoading(false);
          return;
        }

        // Fetch bookings
        const bookingsData = await bookingService.getBookings(user.id, token);
        if (!isMounted) return;

        if (!bookingsData.length) {
          setBookings([]);
          setLoading(false);
          return;
        }

        setBookings(bookingsData);

        // Fetch payment histories
        const paymentPromises = bookingsData.map((booking: Booking) =>
          bookingService
            .getPaymentHistory(booking.id, token)
            .then((paymentHistory) => ({
              bookingId: booking.id,
              paymentHistory,
            }))
            .catch((error: Error) => {
              console.error(
                `Error fetching payment history for booking ${booking.id}:`,
                error
              );
              return { bookingId: booking.id, paymentHistory: null };
            })
        );

        const paymentResults = await Promise.all(paymentPromises);
        if (!isMounted) return;

        const paymentHistoriesObj = paymentResults.reduce(
          (acc, { bookingId, paymentHistory }) => {
            acc[bookingId] = paymentHistory || {
              success: false,
              payments: [],
              summary: {
                totalBudget: 0,
                totalPaid: 0,
                remainingBalance: 0,
                paymentStatus: "unpaid",
              },
            };
            return acc;
          },
          {} as Record<string, PaymentHistoryResponse>
        );

        ("Payment Histories:", paymentHistoriesObj);
        setPaymentHistories(paymentHistoriesObj);
      } catch (error: unknown) {
        if (!isMounted) return;
        setErrors({
          global: error instanceof Error 
            ? error.message 
            : "Error fetching bookings. Please try again.",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBookingsAndPayments();

    return () => {
      isMounted = false;
    };
  }, [authLoading, user?.id]);

  const toggleBookingExpansion = (bookingId: string) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const updateBookingStatus = async (bookingId: string) => {
    setUpdatingStatus((prev) => ({ ...prev, [bookingId]: true }));
    setErrors((prev) => ({ ...prev, [bookingId]: null }));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrors((prev) => ({
          ...prev,
          [bookingId]: "⚠ No token found. Please login.",
        }));
        return;
      }

      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking) {
        setErrors((prev) => ({ ...prev, [bookingId]: "Booking not found." }));
        return;
      }

      const today = new Date();
      const bookingEndDate = parseISO(booking.endDate);

      if (bookingEndDate > today) {
        setErrors((prev) => ({
          ...prev,
          [bookingId]: `Cannot mark booking as completed until after ${format(
            bookingEndDate,
            "PPP"
          )}.`,
        }));
        return;
      }

      await bookingService.updateBookingStatus(bookingId, token);

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "completed" } : b
        )
      );
    } catch (error: unknown) {
      setErrors((prev) => ({
        ...prev,
        [bookingId]: error instanceof Error 
          ? error.message 
          : "Error updating booking status.",
      }));
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const updatePaymentStatus = async (bookingId: string, paymentId: string) => {
    setUpdatingPayment((prev) => ({ ...prev, [paymentId]: true }));
    setErrors((prev) => ({ ...prev, [bookingId]: null }));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrors((prev) => ({
          ...prev,
          [bookingId]: "⚠ No token found. Please login.",
        }));
        return;
      }

      await bookingService.updatePaymentStatus(
        paymentId,
        token
      );

      setPaymentHistories((prev) => {
        const currentHistory = prev[bookingId];
        if (!currentHistory) return prev;

        const updatedPayments = currentHistory.payments.map((p) =>
          p.id === paymentId ? { ...p, status: "completed" } : p
        );

        const paidAmount = updatedPayments
          .filter((p) => p.status === "completed")
          .reduce((sum, p) => sum + p.amount, 0);

        return {
          ...prev,
          [bookingId]: {
            ...currentHistory,
            payments: updatedPayments,
            summary: {
              ...currentHistory.summary,
              totalPaid: paidAmount,
              remainingBalance: currentHistory.summary.totalBudget - paidAmount,
              paymentStatus:
                paidAmount >= currentHistory.summary.totalBudget
                  ? "paid"
                  : paidAmount > 0
                  ? "partial"
                  : "unpaid",
            },
          },
        };
      });
    } catch (error: unknown) {
      setErrors((prev) => ({
        ...prev,
        [bookingId]: error instanceof Error 
          ? error.message 
          : "Error updating payment status.",
      }));
    } finally {
      setUpdatingPayment((prev) => ({ ...prev, [paymentId]: false }));
    }
  };
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      pending: { 
        bg: "bg-amber-50 border border-amber-100", 
        text: "text-amber-800",
        icon: <Clock className="w-3 h-3 mr-1" />
      },
      confirmed: { 
        bg: "bg-blue-50 border border-blue-100", 
        text: "text-blue-800",
        icon: <CheckCircle className="w-3 h-3 mr-1" />
      },
      completed: { 
        bg: "bg-green-50 border border-green-100", 
        text: "text-green-800",
        icon: <CheckCircle className="w-3 h-3 mr-1" />
      },
      cancelled: { 
        bg: "bg-red-50 border border-red-100", 
        text: "text-red-800",
        icon: <AlertCircle className="w-3 h-3 mr-1" />
      },
      paid: { 
        bg: "bg-green-50 border border-green-100", 
        text: "text-green-800",
        icon: <CheckCircle className="w-3 h-3 mr-1" />
      },
      unpaid: { 
        bg: "bg-red-50 border border-red-100", 
        text: "text-red-800",
        icon: <AlertCircle className="w-3 h-3 mr-1" />
      },
      partial: { 
        bg: "bg-orange-50 border border-orange-100", 
        text: "text-orange-800",
        icon: <Clock className="w-3 h-3 mr-1" />
      },
    };

    const { bg, text, icon } =
      statusMap[status.toLowerCase()] || {
        bg: "bg-gray-50 border border-gray-100",
        text: "text-gray-800",
        icon: null
      };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center ${bg} ${text}`}
      >
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin h-10 w-10 text-blue-500 mb-3" />
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (!bookings.every((b) => b.id && Number.isFinite(b.budget))) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl mx-auto mt-8">
        <div className="flex items-start">
          <div className="bg-red-100 p-2 rounded-full mr-4">
            <AlertCircle className="text-red-500" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">Data Error</h3>
            <p className="text-gray-600">
              We encountered an issue loading your booking data. Please refresh the page or try again later.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Bookings</h1>
          <p className="text-gray-500 mt-1">
            Manage and review all your upcoming and past bookings
          </p>
        </div>
        <div className="mt-4 md:mt-0 bg-blue-50 px-4 py-2 rounded-full text-sm text-blue-800">
          {bookings.length} {bookings.length === 1 ? "booking" : "bookings"} found
        </div>
      </div>

      {errors.global && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg flex items-start">
          <AlertCircle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm">{errors.global}</p>
          </div>
        </div>
      )}

      {bookings.length > 0 ? (
        <div className="space-y-5">
          {bookings.map((booking) => {
            const paymentHistory = paymentHistories[booking.id];
            const isExpanded = expandedBooking === booking.id;
            const bookingStartDate = parseISO(booking.startDate);
            const bookingEndDate = parseISO(booking.endDate);
            const durationDays = differenceInDays(bookingEndDate, bookingStartDate) + 1;

            return (
              <div
                key={booking.id}
                className={`bg-white rounded-xl shadow-xs border ${
                  isExpanded ? "border-blue-200 shadow-md" : "border-gray-100 hover:border-gray-200"
                } transition-all overflow-hidden`}
              >
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => toggleBookingExpansion(booking.id)}
                >
                  <div className="flex flex-col sm:flex-row justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Calendar className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.userName || "Guest User"}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            {format(bookingStartDate, "MMM d")} -{" "}
                            {format(bookingEndDate, "MMM d, yyyy")}
                          </div>
                          <span className="text-gray-300">•</span>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            {durationDays} {durationDays === 1 ? "day" : "days"}
                          </div>
                          <span className="text-gray-300">•</span>
                          <div className="flex items-center text-sm text-gray-600">
                            <IndianRupee className="w-4 h-4 mr-1 text-gray-400" />
                            Rs. {Number.isFinite(booking.budget) ? booking.budget : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                      {getStatusBadge(booking.status)}
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        {isExpanded ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-6 py-5 bg-gray-50">
                    {/* Booking Details Card */}
                    <div className="mb-6">
                      <div className="flex items-center mb-4">
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <span className="bg-blue-100 p-1.5 rounded-lg mr-3">
                            <User className="text-blue-600" size={16} />
                          </span>
                          Booking Details
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-xs">
                          <h5 className="text-sm font-medium text-gray-500 mb-3">LOCATIONS</h5>
                          <div className="space-y-3">
                            <div className="flex">
                              <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-500">Pickup</p>
                                <p className="font-medium text-gray-900">
                                  {booking.pickupLocation || "Not specified"}
                                </p>
                              </div>
                            </div>
                            <div className="flex">
                              <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-500">Dropoff</p>
                                <p className="font-medium text-gray-900">
                                  {booking.dropoffLocation || "Not specified"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-xs">
                          <h5 className="text-sm font-medium text-gray-500 mb-3">OTHER DETAILS</h5>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <p className="text-sm text-gray-500">Activities</p>
                              <p className="font-medium text-gray-900 text-right">
                                {booking.activities?.length
                                  ? booking.activities.join(", ")
                                  : "None specified"}
                              </p>
                            </div>
                            <div className="flex justify-between">
                              <p className="text-sm text-gray-500">Special Requests</p>
                              <p className="font-medium text-gray-900 text-right">
                                {booking.specialRequests || "None"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Summary Card */}
                    <div className="mb-6">
                      <div className="flex items-center mb-4">
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <span className="bg-blue-100 p-1.5 rounded-lg mr-3">
                            <CreditCard className="text-blue-600" size={16} />
                          </span>
                          Payment Summary
                        </h4>
                      </div>
                      {paymentHistory && paymentHistory.summary ? (
                        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-xs">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="border-r border-gray-100 pr-4">
                              <p className="text-sm text-gray-500 mb-1">Total Budget</p>
                              <p className="text-xl font-semibold text-gray-900">
                                Rs. {paymentHistory.summary.totalBudget}
                              </p>
                            </div>
                            <div className="border-r border-gray-100 pr-4">
                              <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
                              <p className="text-xl font-semibold text-green-600">
                                Rs. {paymentHistory.summary.totalPaid}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Balance Due</p>
                              <p className={`text-xl font-semibold ${
                                paymentHistory.summary.remainingBalance > 0
                                  ? "text-amber-600"
                                  : "text-green-600"
                              }`}>
                                Rs. {paymentHistory.summary.remainingBalance}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-500">Payment Status</p>
                              <div className="mt-1">
                                {getStatusBadge(paymentHistory.summary.paymentStatus)}
                              </div>
                            </div>
                            {booking.status !== "completed" && (
                              <button
                                onClick={() => updateBookingStatus(booking.id)}
                                disabled={updatingStatus[booking.id]}
                                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                                  updatingStatus[booking.id]
                                    ? "bg-blue-400"
                                    : "bg-blue-600 hover:bg-blue-700"
                                } text-white shadow-sm`}
                              >
                                {updatingStatus[booking.id] ? (
                                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                ) : (
                                  <Check size={16} className="mr-2" />
                                )}
                                Mark as Completed
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white p-5 rounded-lg border border-gray-100 text-center text-gray-500">
                          No payment summary available
                        </div>
                      )}
                    </div>

                    {/* Payment History Card */}
                    <div>
                      <div className="flex items-center mb-4">
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <span className="bg-blue-100 p-1.5 rounded-lg mr-3">
                            <FileText className="text-blue-600" size={16} />
                          </span>
                          Payment History
                        </h4>
                      </div>
                      {paymentHistory && paymentHistory.payments?.length > 0 ? (
                        <div className="bg-white rounded-lg border border-gray-100 shadow-xs overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Method
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-100">
                                {paymentHistory.payments.map((payment) => (
                                  <tr key={payment.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                      {payment.date
                                        ? format(parseISO(payment.date), "MMM d, yyyy")
                                        : "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      Rs. {payment.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                                      {payment.method || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      {getStatusBadge(payment.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                      <div className="flex justify-end space-x-2">
                                        {payment.transactionDetails?.screenshotUrl && (
                                          <a
                                            href={payment.transactionDetails.screenshotUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-3 py-1 border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-50"
                                          >
                                            View Receipt
                                          </a>
                                        )}
                                        {payment.status !== "completed" && (
                                          <button
                                            onClick={() => updatePaymentStatus(booking.id, payment.id)}
                                            disabled={updatingPayment[payment.id]}
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                                              updatingPayment[payment.id]
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                            }`}
                                          >
                                            {updatingPayment[payment.id] ? (
                                              <Loader2 className="animate-spin h-3 w-3 mr-1" />
                                            ) : (
                                              <Check className="h-3 w-3 mr-1" />
                                            )}
                                            Mark Paid
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white p-5 rounded-lg border border-gray-100 text-center text-gray-500">
                          No payment history available
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center max-w-2xl mx-auto">
          <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-5">
            <Calendar className="text-blue-500" size={32} />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No bookings found
          </h3>
          <p className="text-gray-500 mb-6">
            {errors.global || "You don't have any bookings scheduled yet."}
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create New Booking
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;