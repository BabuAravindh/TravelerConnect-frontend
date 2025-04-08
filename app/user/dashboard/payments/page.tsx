"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Clock, XCircle, CreditCard, Calendar, RefreshCw, DollarSign, RotateCcw, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

// Types (Updated to exclude MongoDB IDs)
interface Payment {
  amount: number;
  status: "completed" | "pending" | "failed" | "refunded";
  type: string;
  transactionId: string; // Kept as it’s not a MongoDB ID
  installmentNumber?: number;
  isPartial?: boolean;
  createdAt: string;
  completedAt?: string;
  notes?: string;
  modeOfPayment: {
    type: string;
    details: Record<string, any>;
    createdAt: string;
  };
}

interface BookingPaymentData {
  userName: string;
  dateRange: string;
  budget: number;
  totalPaid: number;
  remainingBalance: number;
  paymentStatus: string;
  status: string;
  payments: Payment[];
}

interface PaymentDetails {
  payment: {
    amount: number;
    status: "completed" | "pending" | "failed" | "refunded";
    type: string;
    transactionId: string; // Kept as it’s not a MongoDB ID
    installmentNumber: number;
    isPartial: boolean;
    createdAt: string;
    completedAt?: string;
    notes?: string;
  };
  booking: {
    userName: string;
    startDate: string;
    endDate: string;
    duration: string;
    budget: number;
    totalPaid: number;
    remainingBalance: number;
    paymentStatus: string;
    status: string;
  };
  modeOfPayment: {
    type: string;
    details: Record<string, any>;
    createdAt: string;
  };
}

// Status configuration
const statusConfig = {
  completed: {
    color: "bg-green-50 text-green-700 border-l-green-500",
    icon: <CheckCircle className="text-green-600" size={18} />,
    label: "Completed",
  },
  pending: {
    color: "bg-yellow-50 text-yellow-700 border-l-yellow-500",
    icon: <Clock className="text-yellow-600" size={18} />,
    label: "Pending",
  },
  failed: {
    color: "bg-red-50 text-red-700 border-l-red-500",
    icon: <XCircle className="text-red-600" size={18} />,
    label: "Failed",
  },
  refunded: {
    color: "bg-blue-50 text-blue-700 border-l-blue-500",
    icon: <RotateCcw className="text-blue-600" size={18} />,
    label: "Refunded",
  },
};

// Main Payments Page Component
export default function PaymentsPage() {
  const { user } = useAuth();
  const [bookingPayments, setBookingPayments] = useState<BookingPaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Note: Assuming the backend endpoint is now `/api/payments/user/:userId`
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment/booking/${user.id}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { success, data, message } = await response.json();

      if (!success) {
        throw new Error(message || "Failed to load payment data");
      }

      setBookingPayments(data || []);
    } catch (err) {
      console.error("Payment fetch error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user?.id]);

  // Flatten all payments for summary stats
  const allPayments = bookingPayments.flatMap(booking => booking.payments);

  // Calculate summary statistics
  const stats = {
    totalPaid: bookingPayments.reduce((sum, booking) => sum + booking.totalPaid, 0),
    totalBudget: bookingPayments.reduce((sum, booking) => sum + booking.budget, 0),
    totalTransactions: allPayments.length,
    pendingPayments: allPayments.filter(p => p.status === "pending").length,
    completedPayments: allPayments.filter(p => p.status === "completed").length,
    lastPaymentDate: allPayments
      .filter(p => p.status === "completed")
      .sort((a, b) => new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime())[0]?.completedAt,
  };

  if (loading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={fetchPayments} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-500 mt-2">View all your payment transactions</p>
        </div>

        <PaymentSummary stats={stats} />

        {bookingPayments.length === 0 ? (
          <EmptyState onRefresh={fetchPayments} />
        ) : (
          <div className="space-y-8">
            {bookingPayments.map((booking, index) => (
              // Using index as key since bookingId is no longer available
              <BookingPaymentSection key={index} booking={booking} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Payment Detail Page Component
export function PaymentDetailPage({ transactionId }: { transactionId: string }) {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Note: Since paymentId is removed, assuming we’d pass transactionId instead
      // Adjust the endpoint if backend uses a different identifier
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/transaction/${transactionId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { success, data, message } = await response.json();

      if (!success) {
        throw new Error(message || "Failed to load payment details");
      }

      setPaymentDetails(data);
    } catch (err) {
      console.error("Payment details fetch error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentDetails();
  }, [transactionId]);

  if (loading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={fetchPaymentDetails} />;
  }

  if (!paymentDetails) {
    return <ErrorView message="Payment not found" onRetry={fetchPaymentDetails} />;
  }

  const status = statusConfig[paymentDetails.payment.status];
  const paymentDate = paymentDetails.payment.completedAt || paymentDetails.payment.createdAt;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Link href="/user/dashboard/payments" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payments
        </Link>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Payment #{paymentDetails.payment.transactionId.slice(-6)}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(paymentDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span
                className={`mt-2 sm:mt-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color.replace(
                  "border-l-",
                  "border-"
                )}`}
              >
                {status.icon}
                <span className="ml-1">{status.label}</span>
              </span>
            </div>
          </div>

          <div className="px-6 py-5 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">₹{paymentDetails.payment.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium capitalize">{paymentDetails.payment.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-medium">{paymentDetails.payment.transactionId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium capitalize">{paymentDetails.modeOfPayment.type}</p>
                  {paymentDetails.modeOfPayment.details && (
                    <p className="text-sm text-gray-500 mt-1">
                      {Object.entries(paymentDetails.modeOfPayment.details).map(([key, value]) => (
                        <span key={key} className="block">
                          {key}: {value}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
                {paymentDetails.payment.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="font-medium">{paymentDetails.payment.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">User</p>
                  <p className="font-medium">{paymentDetails.booking.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dates</p>
                  <p className="font-medium">
                    {new Date(paymentDetails.booking.startDate).toLocaleDateString()} -{" "}
                    {new Date(paymentDetails.booking.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{paymentDetails.booking.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-medium">₹{paymentDetails.booking.budget}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="font-medium">₹{paymentDetails.booking.totalPaid}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Remaining Balance</p>
                  <p className="font-medium">₹{paymentDetails.booking.remainingBalance}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Booking Status</p>
                  <p className="font-medium capitalize">{paymentDetails.booking.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub-components
function LoadingView() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="space-y-4 w-full max-w-4xl px-4">
        <div className="h-12 w-full bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 w-full bg-gray-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}

function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-center text-red-600 text-xl font-semibold mb-4">Payment Error</h2>
        <div className="flex justify-center mb-4">
          <XCircle className="h-12 w-12 text-red-500" />
        </div>
        <p className="text-center text-gray-700 mb-4">{message}</p>
        <div className="flex justify-center">
          <button
            onClick={onRetry}
            className="flex items-center bg-transparent border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="bg-white shadow rounded-lg p-8 text-center">
      <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-lg font-medium text-gray-900">No payments found</h3>
      <p className="mt-1 text-sm text-gray-500">You haven’t made any payments yet.</p>
      <div className="mt-6">
        <button
          onClick={onRefresh}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <RefreshCw className="-ml-1 mr-2 h-5 w-5" />
          Refresh
        </button>
      </div>
    </div>
  );
}

function PaymentSummary({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[
        { icon: DollarSign, label: "Total Budget", value: `₹${stats.totalBudget.toLocaleString()}` },
        { icon: CreditCard, label: "Total Paid", value: `₹${stats.totalPaid.toLocaleString()}` },
        { icon: CheckCircle, label: "Completed", value: stats.completedPayments },
        { icon: Clock, label: "Pending", value: stats.pendingPayments },
      ].map((item, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gray-100 mr-4">
              <item.icon className="text-indigo-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <p className="text-xl font-semibold">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BookingPaymentSection({ booking }: { booking: BookingPaymentData }) {
  // Sort payments by createdAt date
  const sortedPayments = [...booking.payments].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Add installment numbers to each payment
  const paymentsWithInstallmentNumbers = sortedPayments.map((payment, index) => ({
    ...payment,
    installmentNumber: index + 1
  }));

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Booking for {booking.userName}
            </h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <Calendar className="mr-1.5 h-4 w-4" />
              {booking.dateRange}
            </p>
          </div>
          <div className="mt-2 sm:mt-0">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                booking.paymentStatus === "paid"
                  ? "bg-green-100 text-green-800"
                  : booking.paymentStatus === "partial"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {booking.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50">
        <StatCard label="Budget" value={`₹${booking.budget}`} />
        <StatCard label="Paid" value={`₹${booking.totalPaid}`} />
        <StatCard
          label="Balance"
          value={`₹${booking.remainingBalance}`}
          highlight={booking.remainingBalance > 0}
        />
      </div>

      <div className="divide-y divide-gray-200">
        {paymentsWithInstallmentNumbers.length === 0 ? (
          <div className="px-6 py-4 text-center text-gray-500">
            No payments recorded for this booking
          </div>
        ) : (
          paymentsWithInstallmentNumbers.map((payment, index) => (
            <PaymentListItem 
              key={index} 
              payment={payment} 
              transactionId={payment.transactionId} 
            />
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-3 rounded-lg ${highlight ? "bg-amber-50 border border-amber-200" : "bg-white"}`}>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`text-lg font-semibold ${highlight ? "text-amber-700" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}
function PaymentListItem({ payment, transactionId }: { payment: Payment; transactionId: string }) {
  const status = statusConfig[payment.status];
  
  // Format the installment text
  const getInstallmentText = (payment: Payment) => {
    if (payment.type === 'full') return 'Full Payment';
    if (payment.isPartial) return 'Partial Payment';
    return `Installment #${payment.installmentNumber}`;
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
  
        <div className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${status.color} border-l-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">₹{payment.amount}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded capitalize">
                  {getInstallmentText(payment)}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded capitalize">
                  {payment.modeOfPayment.type}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                  {new Date(payment.createdAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
            <div className="mt-3 sm:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {status.icon}
                <span className="text-sm font-medium">{status.label}</span>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(payment.createdAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
         
        </div>
    </motion.div>
  );
}