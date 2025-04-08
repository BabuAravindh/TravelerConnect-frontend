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
  ChevronUp 
} from "lucide-react";

interface Booking {
  id: string;
  userName: string;
  email: string;
  phone: string;
  startDate: string;
  endDate: string;
  activites: string[];
  duration: string | number;
  budget?: number;
  paymentStatus: string;
  status: string;
}

interface Payment {
  id: string;
  amount: number;
  type: string;
  status: string;
  paymentType: string;
  method: string;
  installmentNumber: number;
  isPartial: boolean;
  details: {
    notes?: string;
    [key: string]: any;
  };
  transactionId: string;
  date?: string;
  transactionDetails: {
    screenshotUrl?: string | null; // Nested under transactionDetails
    [key: string]: any; // Allow other fields in transactionDetails
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
    nextPaymentDue: string;
  };
}

const BookingsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [paymentHistories, setPaymentHistories] = useState<Record<string, PaymentHistoryResponse>>({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string | null>>({}); // Errors per booking
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user?.id) return;

    const fetchBookingsAndPayments = async () => {
      setLoading(true);
      setErrors({});
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setErrors({ global: "⚠ No token found. Please log in." });
          return;
        }
        
        const bookingsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/guide/${user.id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!bookingsRes.ok) throw new Error("Failed to fetch bookings");

        const bookingsData = await bookingsRes.json();
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [bookingsData];
        setBookings(bookingsArray);

        const paymentPromises = bookingsArray.map(booking =>
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/history/${booking.id}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch payment history for booking ${booking.id}`);
            return res.json();
          }).then(data => ({ bookingId: booking.id, paymentHistory: data }))
        );

        const paymentResults = await Promise.all(paymentPromises);
        const paymentHistoriesObj = paymentResults.reduce((acc, { bookingId, paymentHistory }) => {
          acc[bookingId] = paymentHistory;
          return acc;
        }, {} as Record<string, PaymentHistoryResponse>);
        
        setPaymentHistories(paymentHistoriesObj);
      } catch (error) {
        setErrors({ global: "Error fetching bookings or payment history. Please try again." });
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
      const bookingEndDate = new Date(booking.endDate);

      if (bookingEndDate > today) {
        setErrors(prev => ({
          ...prev,
          [bookingId]: `Cannot mark booking as completed until after ${bookingEndDate.toLocaleDateString()}.`
        }));
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/details(findByIdAndUpdate)`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: "completed" }),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update booking status");
      }
  
      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: "completed" } : b))
      );
      setErrors(prev => ({ ...prev, [bookingId]: null })); // Clear error on success
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [bookingId]: error.message || "Error updating booking status."
      }));
    }
  };

  const updatePaymentStatus = async (bookingId: string, paymentId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrors(prev => ({ ...prev, [bookingId]: "⚠ No token found. Please login." }));
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/guide/${paymentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentStatus: "completed" }),
      });

      if (!res.ok) throw new Error("Failed to update payment status");

      const updatedPaymentData = await res.json();

      setPaymentHistories(prev => ({
        ...prev,
        [bookingId]: {
          ...prev[bookingId],
          payments: prev[bookingId].payments.map(payment =>
            payment.id === paymentId ? { ...payment, status: "completed" } : payment
          ),
          summary: {
            ...prev[bookingId].summary,
            totalPaid: prev[bookingId].summary.totalPaid + (updatedPaymentData.payment?.amount || 0),
            remainingBalance: prev[bookingId].summary.remainingBalance - (updatedPaymentData.payment?.amount || 0),
            paymentStatus: prev[bookingId].summary.remainingBalance - (updatedPaymentData.payment?.amount || 0) <= 0 ? "paid" : "partial"
          }
        }
      }));
      setErrors(prev => ({ ...prev, [bookingId]: null })); // Clear error on success
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [bookingId]: "Error updating payment status."
      }));
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <span className="bg-blue-100 p-2 rounded-full mr-3">
          <Calendar className="text-blue-600" size={20} />
        </span>
        Upcoming Bookings
      </h2>

      {errors.global && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <p className="text-red-700 font-medium">{errors.global}</p>
        </div>
      )}

      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div 
                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleBookingExpansion(booking.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <User className="text-blue-600" size={16} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">{booking.userName}</h3>
                    </div>
                    <p className="text-sm text-gray-600 ml-11">{booking.email} • {booking.phone}</p>
                    <p className="text-sm text-gray-600 ml-11">
                      {Array.isArray(booking.activites) ? booking.activites.join(", ") : "N/A"}
                    </p>
                  </div>
                  <button className="text-gray-500">
                    {expandedBooking === booking.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                <div className="mt-4 ml-11 grid grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-700">
                    <Calendar size={16} className="mr-2 text-gray-500" />
                    <span>{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock size={16} className="mr-2 text-gray-500" />
                    <span>{typeof booking.duration === "number" ? `${booking.duration} days` : booking.duration}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <IndianRupee size={16} className="mr-2 text-gray-500" />
                    <span>Rs. {booking.budget?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === "completed" 
                        ? "bg-green-100 text-green-800" 
                        : booking.status === "confirmed" 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {expandedBooking === booking.id && (
                <div className="border-t border-gray-200 p-5 bg-gray-50">
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                      <span className="bg-blue-100 p-1.5 rounded-full mr-2">
                        <IndianRupee className="text-blue-600" size={14} />
                      </span>
                      Payment Summary
                    </h4>
                    {paymentHistories[booking.id] ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-gray-200">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Budget:</span>
                            <span className="font-medium">Rs. {paymentHistories[booking.id].summary.totalBudget.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Paid:</span>
                            <span className="font-medium text-green-600">Rs. {paymentHistories[booking.id].summary.totalPaid.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Remaining:</span>
                            <span className="font-medium text-red-600">Rs. {paymentHistories[booking.id].summary.remainingBalance.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Status:</span>
                            <span className="font-medium capitalize">{paymentHistories[booking.id].summary.paymentStatus}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Next Payment Due:</span>
                            <span className="font-medium">
                              {paymentHistories[booking.id].summary.nextPaymentDue || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No payment summary available</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                      <span className="bg-blue-100 p-1.5 rounded-full mr-2">
                        <CheckCircle className="text-blue-600" size={14} />
                      </span>
                      Payment History
                    </h4>
                    {paymentHistories[booking.id]?.payments?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden border border-gray-200">
                          <thead className="bg-gray-100">
                            <tr><th className="py-2 px-4 text-left text-xs font-medium text-gray-600 uppercase">Date</th><th className="py-2 px-4 text-left text-xs font-medium text-gray-600 uppercase">Amount</th><th className="py-2 px-4 text-left text-xs font-medium text-gray-600 uppercase">Method</th><th className="py-2 px-4 text-left text-xs font-medium text-gray-600 uppercase">Status</th><th className="py-2 px-4 text-left text-xs font-medium text-gray-600 uppercase">Screenshot</th><th className="py-2 px-4 text-left text-xs font-medium text-gray-600 uppercase">Action</th></tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {paymentHistories[booking.id].payments.map((payment) => (
                              <tr key={payment.id}><td className="py-3 px-4 text-sm text-gray-700">{payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}</td><td className="py-3 px-4 text-sm font-medium text-gray-900">Rs. {payment.amount.toLocaleString()}</td><td className="py-3 px-4 text-sm text-gray-700 capitalize">{payment.method}</td><td className="py-3 px-4 text-sm"><span className={`px-2 py-1 rounded-full text-xs ${payment.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{payment.status}</span></td><td className="py-3 px-4 text-sm">{payment.transactionDetails?.screenshotUrl ? (payment.transactionDetails.screenshotUrl.startsWith("http") ? <a href={payment.transactionDetails.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Screenshot</a> : <span className="text-red-600">{payment.transactionDetails.screenshotUrl}</span>) : <span className="text-gray-500">N/A</span>}</td><td className="py-3 px-4 text-sm">{payment.status !== "completed" && <button onClick={() => updatePaymentStatus(booking.id, payment.id)} className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs transition-colors"><Check size={14} className="mr-1" />Mark Complete</button>}</td></tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No payment history available</p>
                    )}
                  </div>

                  {booking.status !== "completed" && (
                    <div className="mt-6 flex justify-end items-center gap-4">
                      <button
                        onClick={() => updateBookingStatus(booking.id)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        <Check size={16} className="mr-2" />
                        Mark as Completed
                      </button>
                      {errors[booking.id] && (
                        <span className="text-red-600 text-sm font-medium">{errors[booking.id]}</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-1">No upcoming bookings</h3>
          <p className="text-gray-500">You don't have any bookings scheduled yet.</p>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;