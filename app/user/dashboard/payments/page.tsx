"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  Calendar,
  RefreshCw,
  DollarSign,
  RotateCcw,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { BookingPaymentData, PaymentWithInstallment } from "./paymentTypes";
import { fetchBookingPayments } from "./payment.service";

// Define stats interface for PaymentSummary
interface PaymentStats {
  totalPaid: number;
  totalBudget: number;
  totalRefunded: number;
  totalTransactions: number;
  pendingPayments: number;
  completedPayments: number;
  refundedPayments: number;
  lastPaymentDate?: string;
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
  const [error, setError] = useState<{ message: string; status?: number } | null>(
    null
  );

  const loadPayments = useCallback(async () => {
    if (!user?.id) {
      setError({ message: "User not authenticated. Please log in." });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payments = await fetchBookingPayments(user.id);
      setBookingPayments(payments);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      const status = err instanceof Object && "status" in err ? Number(err.status) : undefined;
      setError({ message: errorMessage, status });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleRetry = () => {
    setError(null);
    loadPayments();
  };

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // Calculate summary statistics
  const allPayments = bookingPayments.flatMap((booking) => booking.payments);
  const allRefunds = bookingPayments.flatMap((booking) => booking.refunds);
  const stats: PaymentStats = {
    totalPaid: bookingPayments.reduce((sum, booking) => sum + booking.totalPaid, 0),
    totalBudget: bookingPayments.reduce((sum, booking) => sum + booking.budget, 0),
    totalRefunded: allRefunds.reduce((sum, refund) => sum + refund.amount, 0),
    totalTransactions: allPayments.length,
    pendingPayments: allPayments.filter((p) => p.status === "pending").length,
    completedPayments: allPayments.filter((p) => p.status === "completed").length,
    refundedPayments: allRefunds.length,
    lastPaymentDate: allPayments
      .filter((p) => p.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]?.createdAt,
  };

  if (loading) {
    return <LoadingView />;
  }

  if (error) {
    return (
      <ErrorView
        message={error.message}
        status={error.status}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Payment History
          </h1>
          <p className="text-gray-500 mt-2">
            View all your payment and refund transactions
          </p>
        </div>

        <PaymentSummary stats={stats} />

        {bookingPayments.length === 0 ? (
          <EmptyState onRefresh={loadPayments} />
        ) : (
          <div className="space-y-8">
            {bookingPayments.map((booking, index) => (
              <BookingPaymentSection
                key={index}
                booking={booking}
                onSelectTransaction={() => {}} // Placeholder, no action needed
              />
            ))}
          </div>
        )}
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

function ErrorView({
  message,
  status,
  onRetry,
}: {
  message: string;
  status?: number;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-red-600 mb-2">Payment Error</h2>
        <p className="text-gray-700 mb-4">{message}</p>
        {status === 500 && (
          <p className="text-sm text-gray-500 mb-4">
            This could be due to a server issue. Please try again later or contact support at{" "}
            <Link
              href="mailto:support@travelerconnect.com"
              className="text-indigo-600 hover:underline"
            >
              support@travelerconnect.com
            </Link>
            .
          </p>
        )}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onRetry}
            className="flex items-center bg-transparent border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/user/dashboard"
            className="flex items-center text-indigo-600 hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="min-h-full bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 text-center max-w-md w-full">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 mb-6">
          <CreditCard className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Payments Found
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Welcome to your payments dashboard! When you make your first booking or payment, 
          all your transaction details will appear here.
        </p>
        <div className="flex flex-col space-y-3">
          <button
            onClick={onRefresh}
            className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <RefreshCw className="-ml-1 mr-2 h-5 w-5" />
            Refresh
          </button>
          <Link
            href="/user/dashboard/bookings/new"
            className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Make Your First Booking
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Need help?{" "}
          <Link
            href="/contact"
            className="text-indigo-600 hover:underline"
          >
            Contact our support team
          </Link>
        </p>
      </div>
    </div>
  );
}

function PaymentSummary({ stats }: { stats: PaymentStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[
        {
          icon: DollarSign,
          label: "Total Budget",
          value: `₹${stats.totalBudget.toLocaleString()}`,
        },
        {
          icon: CreditCard,
          label: "Total Paid",
          value: `₹${stats.totalPaid.toLocaleString()}`,
        },
        {
          icon: RotateCcw,
          label: "Total Refunded",
          value: `₹${stats.totalRefunded.toLocaleString()}`,
        },
        {
          icon: CheckCircle,
          label: "Completed",
          value: stats.completedPayments,
        },
      ].map((item, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
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

function BookingPaymentSection({
  booking,
}: {
  booking: BookingPaymentData;
  onSelectTransaction: (transactionId: string) => void;
}) {
  const sortedPayments = [...booking.payments].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const paymentsWithInstallmentNumbers: PaymentWithInstallment[] = [
    ...sortedPayments
      .filter((payment) => payment.type === "installment")
      .map((payment, index) => ({
        ...payment,
        installmentNumber: index + 1,
      })),
    ...sortedPayments
      .filter((payment) => payment.type !== "installment")
      .map((payment) => ({
        ...payment,
        installmentNumber: undefined,
      })),
  ];

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
            <p className="text-sm text-gray-500 mt-1">{booking.userEmail}</p>
          </div>
          <div className="mt-2 sm:mt-0 flex space-x-4">
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
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                booking.status === "confirmed"
                  ? "bg-green-100 text-green-800"
                  : booking.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {booking.status}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50">
        <StatCard label="Budget" value={`₹${booking.budget}`} />
        <StatCard label="Paid" value={`₹${booking.totalPaid}`} />
        <StatCard
          label="Balance"
          value={`₹${booking.remainingBalance}`}
          highlight={booking.remainingBalance > 0}
        />
        <StatCard
          label="Refunded"
          value={`₹${booking.refunds.reduce(
            (sum, refund) => sum + refund.amount,
            0
          )}`}
          highlight={booking.refunds.length > 0}
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
            />
          ))
        )}
      </div>

      {booking.refunds.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Refunds</h4>
          {booking.refunds.map((refund, index) => (
            <div
              key={index}
              className="p-4 bg-blue-50 border-l-4 border-blue-500 mb-2 rounded-r-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-blue-700">
                    ₹{refund.amount} Refunded
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {new Date(refund.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {refund.proof && (
                      <a
                        href={refund.proof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:underline"
                      >
                        View Proof
                      </a>
                    )}
                    {refund.adminComment && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        Note: {refund.adminComment}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                  <RotateCcw className="text-blue-600" size={18} />
                  <span className="text-sm font-medium text-blue-700">
                    {refund.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-lg ${
        highlight ? "bg-amber-50 border border-amber-200" : "bg-white"
      }`}
    >
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p
        className={`text-lg font-semibold ${
          highlight ? "text-amber-700" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function PaymentListItem({
  payment,
}: {
  payment: PaymentWithInstallment;
}) {
  const status = statusConfig[payment.status];

  const getInstallmentText = (payment: PaymentWithInstallment) => {
    if (payment.type === "deposit") return "Deposit";
    if (payment.type === "full") return "Full Payment";
    return payment.installmentNumber
      ? `Installment #${payment.installmentNumber}`
      : payment.type;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${status.color} border-l-4`}
      >
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
                {new Date(payment.createdAt).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
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
              {new Date(payment.createdAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}