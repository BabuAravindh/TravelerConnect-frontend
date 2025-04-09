"use client";
import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { 
  Calendar, 
  CheckCircle, 
  User, 
  Mail, 
  Phone, 
  Languages, 
  RotateCcw, 
  CreditCard, 
  Banknote, 
  ChevronDown, 
  Activity 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const BASE_URL = "http://localhost:5000";
const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

type Booking = {
  id: string;
  guideName: string;
  guideLanguages: string[];
  startDate: string;
  endDate: string;
  budget: number;
  status: string;
  duration: string;
  guideEmail: string;
  guidePhoneNumber: string;
  paymentStatus?: string;
  totalPaid?: number;
  remainingBalance?: number;
  activities: string[];
};

type PaymentHistory = {
  id: string;
  amount: number;
  paymentType: string;
  status: string;
  method: string;
  date: Date;
  installmentNumber: number;
  receiptId: string;
  screenshotUrl?: string; // Added to store screenshot URL or failure message
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function UserBookings() {
  const { user } = useAuth();
  
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<Record<string, PaymentHistory[]>>({});
  const [paymentAmounts, setPaymentAmounts] = useState<{ [key: string]: number }>({});
  const [paymentMethods, setPaymentMethods] = useState<{ [key: string]: string }>({});
  const [screenshots, setScreenshots] = useState<{ [key: string]: File | null }>({}); // New state for screenshot files
  const [showManualPayment, setShowManualPayment] = useState<{ [key: string]: boolean }>({});
  const [showPaymentHistory, setShowPaymentHistory] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || !token) {
      setLoading(false);
      setError("User not authenticated.");
      return;
    }

    const fetchData = async () => {
      try {
        const bookingsRes = await axios.get(`${BASE_URL}/api/bookings/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const mappedBookings = bookingsRes.data?.map((booking: any) => {
          const bookingId = booking?._id || `fallback-${Date.now()}-${Math.random()}`;
          return {
            id: bookingId,
            guideName: booking?.guideProfile?.guideName || "Unknown Guide",
            guideLanguages: booking?.guideProfile?.languages?.join(", ") || "Not specified",
            startDate: booking?.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A',
            endDate: booking?.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A',
            budget: booking?.budget || 0,
            status: booking?.status || 'unknown',
            paymentStatus: booking?.paymentStatus || "pending",
            totalPaid: booking?.totalPaid || 0,
            remainingBalance: booking?.remainingBalance || (booking?.budget || 0),
            activities: booking?.activities || [],
            duration: booking?.startDate && booking?.endDate 
              ? `${Math.ceil(
                  (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)
                )} days` 
              : 'N/A',
            guideEmail: booking?.guideProfile?.guideEmail || "",
            guidePhoneNumber: booking?.guideProfile?.guidePhoneNumber || "",
          };
        }) || [];

        const paymentMap: Record<string, PaymentHistory[]> = {};
        await Promise.all(mappedBookings.map(async (booking: Booking) => {
          try {
            const paymentsRes = await axios.get(`${BASE_URL}/api/payment/history/${booking.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            paymentMap[booking.id] = paymentsRes.data?.payments?.map((payment: any) => {
              const paymentId = payment?._id || `fallback-payment-${Date.now()}-${Math.random()}`;
              return {
                id: paymentId,
                amount: payment?.amount || 0,
                paymentType: payment.type || 'unknown',
                status: payment.status || 'unknown',
                method: payment.method || "unknown",
                date: payment?.completedAt ? new Date(payment.completedAt) : new Date(),
                installmentNumber: payment.installmentNumber || 0,
                receiptId: payment?.payId || '',
                screenshotUrl: payment?.transactionDetails?.screenshotUrl || undefined, // Include screenshot URL
              };
            }) || [];
          } catch (err) {
            console.error(`Failed to fetch payments for booking ${booking.id}:`, err);
            paymentMap[booking.id] = [];
          }
        }));

        setBookings(mappedBookings);
        setPaymentHistory(paymentMap);
      } catch (err) {
        const error = err as AxiosError;
        setError((error.response?.data as { message?: string })?.message || "Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, token]);

  const togglePaymentHistory = (bookingId: string) => {
    setShowPaymentHistory(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  const initiatePayment = async (bookingId: string, amount: number, paymentType = "installment") => {
    try {
      if (!bookingId || !amount || amount < 1) {
        throw new Error("Invalid payment details");
      }

      const response = await axios.post(
        `${BASE_URL}/api/payment/initiate`,
        { bookingId, amount, paymentType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        const { order } = response.data;
        const isScriptLoaded = await loadRazorpayScript();
        
        if (!isScriptLoaded) {
          throw new Error("Failed to load payment processor");
        }

        const options = {
          key: RAZORPAY_KEY,
          amount: amount * 100,
          currency: "INR",
          order_id: order.id,
          name: "Tour Guide Booking",
          description: `Payment for booking ${bookingId}`,
          handler: async (response: any) => {
            await verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              bookingId,
              amount,
            });
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone?.replace(/\D/g, '').slice(-10) || '',
          },
          theme: {
            color: "#4f46e5",
          },
          modal: {
            ondismiss: function () {
              console.log("Checkout form closed");
            },
            escape: false,
          }
        };
        
        console.log("➡️ Razorpay prefill:", options.prefill);

        new window.Razorpay(options).open();
      }
      
    } catch (err) {
      const error = err as AxiosError;
      setError((error.response?.data as { message?: string })?.message || error.message || "Payment failed");
    }
  };

  const verifyPayment = async (paymentData: {
    orderId: string;
    paymentId: string;
    signature: string;
    bookingId: string;
    amount: number;
  }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/payment/verify`,
        paymentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        const { payment, booking } = response.data;
        
        setBookings(prev =>
          prev.map(b =>
            b.id === paymentData.bookingId
              ? {
                  ...b,
                  totalPaid: booking?.totalPaid || 0,
                  remainingBalance: booking?.remainingBalance || 0,
                  paymentStatus: booking?.paymentStatus || 'partial',
                }
              : b
          )
        );
        
        setPaymentHistory(prev => ({
          ...prev,
          [paymentData.bookingId]: [
            ...(prev[paymentData.bookingId] || []),
            {
              id: payment?._id || `new-payment-${Date.now()}`,
              amount: payment?.amount || 0,
              paymentType: payment?.paymentType || 'installment',
              status: payment?.paymentStatus || 'completed',
              method: "razorpay",
              date: payment?.completedAt ? new Date(payment.completedAt) : new Date(),
              installmentNumber: payment?.installmentNumber || 0,
              receiptId: payment?.payId || '',
            },
          ],
        }));

        setSuccessMessage(`Payment of ₹${payment?.amount || 0} completed successfully!`);
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err) {
      const error = err as AxiosError;
      setError((error.response?.data as { message?: string })?.message || "Payment verification failed");
    }
  };

  const toggleManualPayment = (bookingId: string) => {
    setShowManualPayment(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  const recordManualPayment = async (bookingId: string) => {
    try {
      const amount = paymentAmounts[bookingId] || 0;
      const method = paymentMethods[bookingId] || "cash";
      const screenshot = screenshots[bookingId];

      if (!amount || amount < 1) {
        throw new Error("Invalid amount");
      }

      const formData = new FormData();
      formData.append("bookingId", bookingId);
      formData.append("amount", amount.toString());
      formData.append("paymentMethod", method);
      formData.append("notes", `${method} payment recorded`);
      if (method === "bank_transfer") {
        formData.append("bankName", "Customer Bank");
        formData.append("accountLast4", "1234");
      }
      if (screenshot) {
        formData.append("screenshot", screenshot);
      }

      const response = await axios.post(
        `${BASE_URL}/api/payment/cash`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.status === 200) {
        const { bookingStatus, message } = response.data;
        const updatedBooking = {
          ...bookingStatus,
          id: bookingId,
          totalPaid: bookingStatus.totalPaid || 0,
          remainingBalance: bookingStatus.remainingBalance || 0,
          paymentStatus: bookingStatus.paymentStatus || 'partial',
        };

        setBookings(prev =>
          prev.map(b => b.id === bookingId ? updatedBooking : b)
        );

        setPaymentHistory(prev => ({
          ...prev,
          [bookingId]: [
            ...(prev[bookingId] || []),
            {
              id: `manual-payment-${Date.now()}`,
              amount: amount,
              paymentType: bookingStatus.remainingBalance === 0 ? "full" : "installment",
              status: "pending", // Initial status from backend
              method: method,
              date: new Date(),
              installmentNumber: (prev[bookingId]?.length || 0) + 1,
              receiptId: `${method}_${Date.now()}`,
              screenshotUrl: message?.includes("with screenshot") ? "Uploaded successfully" : "Upload failed",
            },
          ],
        }));

        setSuccessMessage(`${message || `₹${amount} ${method} payment recorded!`}`);
        setTimeout(() => setSuccessMessage(null), 5000);
        setPaymentAmounts(prev => ({ ...prev, [bookingId]: 0 }));
        setScreenshots(prev => ({ ...prev, [bookingId]: null }));
        setShowManualPayment(prev => ({ ...prev, [bookingId]: false }));
      }
    } catch (err) {
      const error = err as AxiosError;
      setError((error.response?.data as { message?: string })?.message || "Failed to record payment");
    }
  };

  const getPaymentStatusStyle = (status?: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "partial": return "bg-blue-100 text-blue-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getBookingStatusStyle = (status?: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "razorpay": return <CreditCard className="h-4 w-4" />;
      case "cash": return <Banknote className="h-4 w-4" />;
      case "gpay": return <CreditCard className="h-4 w-4" />;
      case "phonepe": return <CreditCard className="h-4 w-4" />;
      case "bank_transfer": return <CreditCard className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Bookings</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-red-500">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-green-500">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
              <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
            <p className="text-gray-500">You haven't made any bookings yet.</p>
            <div className="mt-6">
              <Link href="/">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Find a Guide
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => {
              const maxAllowed = (booking.budget || 0) - (booking.totalPaid || 0);
              const paymentHistoryForBooking = paymentHistory[booking.id] || [];

              return (
                <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBookingStatusStyle(booking.status)}`}>
                        {booking.status || 'unknown'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusStyle(booking.paymentStatus)}`}>
                        {booking.paymentStatus || "pending"}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      {booking.startDate} - {booking.endDate} ({booking.duration})
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Paid: ₹{booking.totalPaid || 0}</span>
                        <span>Total: ₹{booking.budget || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ 
                            width: `${((booking.totalPaid || 0) / (booking.budget || 1)) * 100}%`,
                            maxWidth: '100%'
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        Remaining: ₹{booking.remainingBalance || maxAllowed}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <h3 className="font-medium text-gray-900 mb-2">Guide Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{booking.guideName}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{booking.guideEmail}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{booking.guidePhoneNumber}</span>
                        </div>
                        <div className="flex items-center">
                          <Languages className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{booking.guideLanguages}</span>
                        </div>
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{booking.activities.join(", ") || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {paymentHistoryForBooking.length > 0 && (
                      <div className="border-t border-gray-200 pt-4 mb-4">
                        <button 
                          onClick={() => togglePaymentHistory(booking.id)}
                          className="flex items-center justify-between w-full font-medium text-gray-900 mb-3"
                        >
                          <span>Payment History ({paymentHistoryForBooking.length})</span>
                          <ChevronDown className={`h-5 w-5 transition-transform ${showPaymentHistory[booking.id] ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showPaymentHistory[booking.id] && (
                          <div className="max-h-60 overflow-y-auto pr-2">
                            <div className="space-y-3">
                              {paymentHistoryForBooking.map((payment) => (
                                <div 
                                  key={payment.id} 
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                                >
                                  <div className="flex items-center gap-3">
                                    {getPaymentMethodIcon(payment.method)}
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        ₹{payment.amount} 
                                        <span className="text-xs text-gray-500 ml-2">
                                          ({payment.paymentType})
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-600 ">
                                        {payment.method.charAt(0).toUpperCase() + payment.method.slice(1)} • 
                                        {payment.date.toLocaleDateString()} • 
                                        Installment #{payment.installmentNumber}
                                        {payment.screenshotUrl && (
                                          <span className="block text-xs text-blue-600">
                                            Screenshot: {payment.screenshotUrl}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <span 
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      payment.status === 'completed' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {payment.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {booking.paymentStatus !== "paid" && maxAllowed > 0 && (
                      <div className="border-t border-gray-200 pt-4">
                        <h3 className="font-medium text-gray-900 mb-3">Make Payment</h3>
                        
                        <div className="mb-4">
                          <label htmlFor={`amount-${booking.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Amount (max ₹{maxAllowed})
                          </label>
                          <input
                            id={`amount-${booking.id}`}
                            type="number"
                            value={paymentAmounts[booking.id] || ""}
                            onChange={(e) => setPaymentAmounts(prev => ({
                              ...prev,
                              [booking.id]: Math.min(maxAllowed, parseFloat(e.target.value) || 0)
                            }))}
                            placeholder="Enter amount"
                            className="w-full p-2 border rounded-md"
                            min="1"
                            max={maxAllowed}
                          />
                        </div>

                        <button
                          onClick={() => initiatePayment(booking.id, paymentAmounts[booking.id] || maxAllowed)}
                          disabled={!paymentAmounts[booking.id] || paymentAmounts[booking.id] < 1}
                          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed mb-3"
                        >
                          <CreditCard className="h-4 w-4" />
                          Pay Online with Razorpay
                        </button>

                        <div className="mb-3">
                          <button
                            onClick={() => toggleManualPayment(booking.id)}
                            className="w-full flex items-center justify-between gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
                          >
                            <div className="flex items-center gap-2">
                              <Banknote className="h-4 w-4" />
                              Record Manual Payment
                            </div>
                            <ChevronDown className={`h-4 w-4 transition-transform ${showManualPayment[booking.id] ? 'rotate-180' : ''}`} />
                          </button>
                        </div>

                        {showManualPayment[booking.id] && (
                          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <div className="mb-3">
                              <label htmlFor={`method-${booking.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Method
                              </label>
                              <select
                                id={`method-${booking.id}`}
                                value={paymentMethods[booking.id] || "cash"}
                                onChange={(e) => setPaymentMethods(prev => ({
                                  ...prev,
                                  [booking.id]: e.target.value
                                }))}
                                className="w-full p-2 border rounded-md"
                              >
                                <option value="cash">Cash</option>
                                <option value="gpay">Google Pay</option>
                                <option value="phonepe">PhonePe</option>
                                <option value="bank_transfer">Bank Transfer</option>
                              </select>
                            </div>

                            <div className="mb-3">
                              <label htmlFor={`screenshot-${booking.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                Upload Screenshot (Optional, max 5MB)
                              </label>
                              <input
                                id={`screenshot-${booking.id}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file && file.size > 5 * 1024 * 1024) {
                                    setError("File size exceeds 5MB limit");
                                    return;
                                  }
                                  setScreenshots(prev => ({ ...prev, [booking.id]: file || null }));
                                }}
                                className="w-full p-2 border rounded-md"
                              />
                            </div>

                            <button
                              onClick={() => recordManualPayment(booking.id)}
                              disabled={!paymentAmounts[booking.id] || paymentAmounts[booking.id] < 1}
                              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Confirm Manual Payment
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {booking.status === "completed" && (
                      <div className="mt-4">
                        <Link href={`/user/dashboard/refund/${booking.id}`}>
                          <button className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700">
                            <RotateCcw className="h-4 w-4" />
                            Request Refund
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}