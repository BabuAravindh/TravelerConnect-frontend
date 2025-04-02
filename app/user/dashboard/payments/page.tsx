"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Clock, XCircle, CreditCard, Calendar, RefreshCw, DollarSign, RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

interface Payment {
  _id: string;
  amount: number;
  paymentStatus: "completed" | "pending" | "failed" | "refunded";
  bookingId: string;
  updatedAt: string;
  completedAt?: string;
  refundedAt?: string;
  payId?: string;
}

const statusConfig = {
  completed: {
    color: "bg-green-50 text-green-700 border-green-300",
    icon: <CheckCircle className="text-green-700" />,
    label: "Completed",
  },
  pending: {
    color: "bg-blue-500 text-yellow-700 border-yellow-300",
    icon: <Clock className="text-yellow-700" />,
    label: "Pending",
  },
  failed: {
    color: "bg-red-50 text-red-700 border-red-300",
    icon: <XCircle className="text-red-700" />,
    label: "Failed",
  },
  refunded: {
    color: "bg-blue-50 text-blue-700 border-blue-300",
    icon: <RotateCcw className="text-blue-700" />,
    label: "Refunded",
  },
};

const PaymentsPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/${user.id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { success, payments, message } = await response.json();

      if (!success) {
        throw new Error(message || "Failed to load payment data");
      }

      setPayments(payments || []);
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

  // Calculate summary statistics
  const stats = {
    totalPaid: payments
      .filter((p) => p.paymentStatus === "completed")
      .reduce((sum, p) => sum + p.amount, 0),
    totalTransactions: payments.length,
    pendingPayments: payments.filter((p) => p.paymentStatus === "pending").length,
    refundedPayments: payments.filter((p) => p.paymentStatus === "refunded").length,
    lastPaymentDate: payments
      .filter((p) => p.paymentStatus === "completed")
      .sort((a, b) => new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime())[0]?.completedAt,
  };

  if (loading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={fetchPayments} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      

      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment History</h1>

        <PaymentSummary stats={stats} />

        <PaymentList payments={payments} />
      </main>

     
    </div>
  );
};

// Sub-components
const LoadingView = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="space-y-4 w-full max-w-4xl">
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

const ErrorView = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
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



const PaymentSummary = ({ stats }: { stats: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    {[
      { icon: DollarSign, label: "Total Paid", value: `₹${stats.totalPaid.toLocaleString()}` },
      { icon: CreditCard, label: "Transactions", value: stats.totalTransactions },
      { icon: Clock, label: "Pending", value: stats.pendingPayments },
      { icon: RotateCcw, label: "Refunded", value: stats.refundedPayments },
    ].map((item, index) => (
      <div key={index} className="bg-white shadow-md rounded-lg p-6 flex items-center">
        <div className="mr-4 p-3 rounded-full bg-gray-100">
          <item.icon className="text-primary" size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{item.label}</p>
          <p className="text-xl font-semibold text-gray-900">{item.value}</p>
        </div>
      </div>
    ))}
  </div>
);

const PaymentList = ({ payments }: { payments: Payment[] }) => (
  <div className="bg-white shadow-md rounded-lg">
    {payments.length === 0 ? (
      <div className="p-8 text-center">
        <p className="text-gray-500">No payment history found</p>
        <Link href="/">
          <button className="mt-4 bg-transparent border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition">
            Make a Booking
          </button>
        </Link>
      </div>
    ) : (
      <div className="divide-y divide-gray-200">
        {payments.map((payment) => {
          const status = statusConfig[payment.paymentStatus];
          const statusDate =
            payment.paymentStatus === "refunded"
              ? payment.refundedAt
              : payment.paymentStatus === "completed"
              ? payment.completedAt
              : payment.updatedAt;

          return (
            <motion.div
              key={payment._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link href={`/user/dashboard/payments/${payment._id}`}>
                <div
                  className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer flex justify-between items-center ${status.color} border-l-4`}
                >
                  <div>
                    <p className="font-semibold">₹{payment.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                      {payment.payId ? `Payment ID: ${payment.payId}` : "No transaction ID"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {status.icon}
                      <span className="font-medium">{status.label}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {statusDate ? new Date(statusDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    )}
  </div>
);



export default PaymentsPage;
