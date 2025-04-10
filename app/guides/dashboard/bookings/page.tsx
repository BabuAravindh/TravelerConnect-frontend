"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Calendar, 
  User, 
  Clock, 
  IndianRupee, 
  CheckCircle, 
  Check, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  Loader2
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import Image from "next/image";

interface Booking {
  id: string;
  userName: string;
  email: string;
  phoneNumber: Number;
  startDate: string;
  endDate: string;
  activities: string[];
  duration: string | number;
  budget?: number;
  paymentStatus: string;
  status: string;
 
  pickupLocation?: string;
  dropoffLocation?: string;
}

interface Payment {
  id: string;
  amount: number;
  type: string;
  status: string;
  paymentType: string;
  method: string;
  installmentNumber?: number;
  isPartial?: boolean;
  details?: {
    notes?: string;
    [key: string]: any;
  };
  transactionId?: string;
  date?: string;
  transactionDetails?: {
    screenshotUrl?: string | null;
    [key: string]: any;
  };
}

interface PaymentHistoryResponse {
  success: boolean;
  payments: Payment[];
  summary: {
    totalBudget: number;
    totalPaid: number;
    remainingBalance: number;
    paymentStatus: string;
    nextPaymentDue?: string;
  };
}

const BookingsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [paymentHistories, setPaymentHistories] = useState<Record<string, PaymentHistoryResponse>>({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});
  const [updatingPayment, setUpdatingPayment] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (authLoading || !user?.id) return;

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
        const bookingsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/guide/${user.id}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!bookingsRes.ok) {
          throw new Error(bookingsRes.status === 404 
            ? "No bookings found" 
            : "Failed to fetch bookings");
        }

        const bookingsData = await bookingsRes.json();
        const bookingsArray = Array.isArray(bookingsData) 
          ? bookingsData 
          : bookingsData.bookings || [bookingsData];
        
        if (!bookingsArray.length) {
          setBookings([]);
          setLoading(false);
          return;
        }

        setBookings(bookingsArray);

        // Fetch payment histories in parallel
        const paymentPromises = bookingsArray.map(booking =>
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/payment/history/${booking.id}`,
            {
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
            }
          )
            .then(async res => {
              if (!res.ok) {
                console.warn(`Payment history not found for booking ${booking.id}`);
                return { bookingId: booking.id, paymentHistory: null };
              }
              const data = await res.json();
              return { bookingId: booking.id, paymentHistory: data };
            })
            .catch(error => {
              console.error(`Error fetching payment history for booking ${booking.id}:`, error);
              return { bookingId: booking.id, paymentHistory: null };
            })
        );

        const paymentResults = await Promise.all(paymentPromises);
        const paymentHistoriesObj = paymentResults.reduce((acc, { bookingId, paymentHistory }) => {
          if (paymentHistory) {
            acc[bookingId] = paymentHistory;
          }
          return acc;
        }, {} as Record<string, PaymentHistoryResponse>);
        
        setPaymentHistories(paymentHistoriesObj);
      } catch (error) {
        setErrors({
          global: error.message || "Error fetching bookings. Please try again."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookingsAndPayments();
  }, [authLoading, user?.id]);

  const toggleBookingExpansion = (bookingId: string) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const updateBookingStatus = async (bookingId: string) => {
    setUpdatingStatus(prev => ({ ...prev, [bookingId]: true }));
    setErrors(prev => ({ ...prev, [bookingId]: null }));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrors(prev => ({ ...prev, [bookingId]: "⚠ No token found. Please login." }));
        return;
      }

      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) {
        setErrors(prev => ({ ...prev, [bookingId]: "Booking not found." }));
        return;
      }

      const today = new Date();
      const bookingEndDate = parseISO(booking.endDate);

      if (bookingEndDate > today) {
        setErrors(prev => ({
          ...prev,
          [bookingId]: `Cannot mark booking as completed until after ${format(bookingEndDate, 'PPP')}.`
        }));
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ status: "completed" }),
        }
      );
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update booking status");
      }
  
      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: "completed" } : b))
      );
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [bookingId]: error.message || "Error updating booking status."
      }));
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const updatePaymentStatus = async (bookingId: string, paymentId: string) => {
    setUpdatingPayment(prev => ({ ...prev, [paymentId]: true }));
    setErrors(prev => ({ ...prev, [bookingId]: null }));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrors(prev => ({ ...prev, [bookingId]: "⚠ No token found. Please login." }));
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment/${paymentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ paymentStatus : "completed" }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update payment status");
      }

      const updatedPayment = await res.json();

      setPaymentHistories(prev => {
        const currentHistory = prev[bookingId];
        if (!currentHistory) return prev;

        const updatedPayments = currentHistory.payments.map(p => 
          p.id === paymentId ? { ...p, status: "completed" } : p
        );

        const paidAmount = updatedPayments
          .filter(p => p.status === "completed")
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
                paidAmount >= currentHistory.summary.totalBudget ? "paid" :
                paidAmount > 0 ? "partial" : "unpaid"
            }
          }
        };
      });
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [bookingId]: error.message || "Error updating payment status."
      }));
    } finally {
      setUpdatingPayment(prev => ({ ...prev, [paymentId]: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string }> = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
      confirmed: { bg: "bg-blue-100", text: "text-blue-800" },
      completed: { bg: "bg-green-100", text: "text-green-800" },
      cancelled: { bg: "bg-red-100", text: "text-red-800" },
      paid: { bg: "bg-green-100", text: "text-green-800" },
      unpaid: { bg: "bg-red-100", text: "text-red-800" },
      partial: { bg: "bg-orange-100", text: "text-orange-800" },
    };

    const { bg, text } = statusMap[status.toLowerCase()] || { bg: "bg-gray-100", text: "text-gray-800" };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="bg-blue-100 p-2 rounded-full mr-3">
            <Calendar className="text-blue-600" size={20} />
          </span>
          Your Bookings
        </h2>
        <div className="text-sm text-gray-500">
          {bookings.length} {bookings.length === 1 ? "booking" : "bookings"} found
        </div>
      </div>

      {errors.global && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded flex items-start">
          <AlertCircle className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 font-medium">{errors.global}</p>
        </div>
      )}

      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const paymentHistory = paymentHistories[booking.id];
            const isExpanded = expandedBooking === booking.id;
            const bookingStartDate = parseISO(booking.startDate);
            const bookingEndDate = parseISO(booking.endDate);
            const durationDays = differenceInDays(bookingEndDate, bookingStartDate) + 1; // Inclusive of end date

            return (
              <div 
                key={booking.id} 
                className={`bg-white rounded-xl shadow-sm border ${isExpanded ? "border-blue-200" : "border-gray-200"} overflow-hidden transition-all`}
              >
                <div 
                  className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleBookingExpansion(booking.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-2">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <User className="text-blue-600" size={16} />
                        </div>
                        <div className="truncate">
                          <h3 className="text-lg font-semibold text-gray-800 truncate">
                            <span className="text-2xl">Client:</span> {booking.userName || "Guest User"}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {booking.email || "No email provided"} • {booking.phoneNumber || "No phone provided"}
                          </p>
                        </div>
                      </div>
                      
                     
                    </div>
                    
                    <div className="flex items-center">
                      {getStatusBadge(booking.status)}
                      <button className="ml-3 text-gray-500 hover:text-gray-700">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 ml-11 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center text-gray-700">
                      <Calendar size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                      <span>
                        {format(bookingStartDate, 'MMM d')} - {format(bookingEndDate, 'MMM d, yyyy')}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <Clock size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                      <span>{durationDays} {durationDays === 1 ? "day" : "days"}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <IndianRupee size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                      <span>Rs. {booking.budget?.toLocaleString('en-IN') || 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <span className="truncate">

                        Activites : {booking.activities?.length ? booking.activities.join(", ") : "No activities specified"}
                      </span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 p-5 bg-gray-50">
                    {/* Booking Details Section */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                        <span className="bg-blue-100 p-1.5 rounded-full mr-2">
                          <Calendar className="text-blue-600" size={14} />
                        </span>
                        Booking Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-gray-200">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pickup Location:</span>
                            <span className="font-medium text-gray-800">
                              {booking.pickupLocation || "Not specified"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Dropoff Location:</span>
                            <span className="font-medium text-gray-800">
                              {booking.dropoffLocation || "Not specified"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                         
                        </div>
                      </div>
                    </div>

                    {/* Payment Summary Section */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                        <span className="bg-blue-100 p-1.5 rounded-full mr-2">
                          <IndianRupee className="text-blue-600" size={14} />
                        </span>
                        Payment Summary
                      </h4>
                      {paymentHistory ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-gray-200">
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Budget:</span>
                              <span className="font-medium">
                                Rs. {paymentHistory.summary.totalBudget.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Paid:</span>
                              <span className="font-medium text-green-600">
                                Rs. {paymentHistory.summary.totalPaid.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Remaining Balance:</span>
                              <span className={`font-medium ${
                                paymentHistory.summary.remainingBalance > 0 
                                  ? "text-red-600" 
                                  : "text-green-600"
                              }`}>
                                Rs. {paymentHistory.summary.remainingBalance.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Payment Status:</span>
                              {getStatusBadge(paymentHistory.summary.paymentStatus)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center text-gray-500">
                          No payment summary available
                        </div>
                      )}
                    </div>

                    {/* Payment History Section */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                        <span className="bg-blue-100 p-1.5 rounded-full mr-2">
                          <CheckCircle className="text-blue-600" size={14} />
                        </span>
                        Payment History
                      </h4>
                      {paymentHistory?.payments?.length > 0 ? (
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Method
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Receipt
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {paymentHistory.payments.map((payment) => (
                                  <tr key={payment.id}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                      {payment.date ? format(parseISO(payment.date), 'MMM d, yyyy') : 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                      Rs. {payment.amount.toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 capitalize">
                                      {payment.method || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                      {getStatusBadge(payment.status)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                      {payment.transactionDetails?.screenshotUrl ? (
                                        <a 
                                          href={payment.transactionDetails.screenshotUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                                        >
                                          View Receipt
                                        </a>
                                      ) : (
                                        <span className="text-gray-500">N/A</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                      {payment.status !== "completed" && (
                                        <button 
                                          onClick={() => updatePaymentStatus(booking.id, payment.id)}
                                          disabled={updatingPayment[payment.id]}
                                          className={`flex items-center px-3 py-1 rounded-md text-xs transition-colors ${
                                            updatingPayment[payment.id]
                                              ? "bg-blue-400 text-white"
                                              : "bg-blue-500 hover:bg-blue-600 text-white"
                                          }`}
                                        >
                                          {updatingPayment[payment.id] ? (
                                            <Loader2 className="animate-spin h-4 w-4 mr-1" />
                                          ) : (
                                            <Check size={14} className="mr-1" />
                                          )}
                                          Mark Paid
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center text-gray-500">
                          No payment history available
                        </div>
                      )}
                    </div>

                    {/* Booking Completion Section */}
                    {booking.status !== "completed" && (
                      <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          {errors[booking.id] && (
                            <div className="flex items-center text-red-600 text-sm">
                              <AlertCircle className="mr-1" size={14} />
                              {errors[booking.id]}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => updateBookingStatus(booking.id)}
                          disabled={updatingStatus[booking.id]}
                          className={`flex items-center px-4 py-2 rounded-lg transition-colors shadow-sm ${
                            updatingStatus[booking.id]
                              ? "bg-blue-400 text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          {updatingStatus[booking.id] ? (
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          ) : (
                            <Check size={16} className="mr-2" />
                          )}
                          Mark as Completed
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-1">No bookings found</h3>
          <p className="text-gray-500">
            {errors.global ? errors.global : "You don't have any bookings scheduled yet."}
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;