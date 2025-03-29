'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Clock, XCircle, CreditCard, Calendar, RefreshCw, DollarSign, RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

interface Payment {
  _id: string;
  amount: number;
  paymentStatus: 'completed' | 'pending' | 'failed' | 'refunded';
  bookingId: string;
  updatedAt: string;
  completedAt?: string;
  refundedAt?: string;
  payId?: string;
  // Add other payment fields as needed
}

const statusColors = {
  completed: "bg-green-50 text-green-700 border-green-300",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-300",
  failed: "bg-red-50 text-red-700 border-red-300",
  refunded: "bg-blue-50 text-blue-700 border-blue-300"
};

const statusIcons = {
  completed: <CheckCircle className="text-green-700" />,
  pending: <Clock className="text-yellow-700" />,
  failed: <XCircle className="text-red-700" />,
  refunded: <RotateCcw className="text-blue-700" />
};

const PaymentsPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/${user?.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }
        
        const { success, payments, message } = await response.json();
         
        if (!success) {
          throw new Error(message || 'No payment data available');
        }
        console.log(payments)
        setPayments(payments || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user?._id]);

  // Calculate summary statistics
  const totalPaid = payments
    .filter(p => p.paymentStatus === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalTransactions = payments.length;
  const pendingPayments = payments.filter(p => p.paymentStatus === 'pending').length;
  const refundedPayments = payments.filter(p => p.paymentStatus === 'refunded').length;

  const lastPaymentDate = payments
    .filter(p => p.paymentStatus === 'completed')
    .sort((a, b) => new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime())[0]?.completedAt;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 md:p-10">
          <PaymentSummary 
            totalPaid={totalPaid}
            totalTransactions={totalTransactions}
            pendingPayments={pendingPayments}
            refundedPayments={refundedPayments}
            lastPaymentDate={lastPaymentDate}
          />

          <PaymentHistory payments={payments} />
        </main>

        <Footer />
      </div>
    </div>
  );
};

// Sub-components for better organization
const LoadingSpinner = () => (
  <div className="flex min-h-screen bg-gray-100 items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const ErrorDisplay = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex min-h-screen bg-gray-100 items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <XCircle className="mx-auto text-red-500 size-12 mb-4" />
      <h2 className="text-xl font-semibold mb-2">Error loading payments</h2>
      <p className="text-gray-600 mb-4">{message}</p>
      <button 
        onClick={onRetry}
        className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
      >
        Try Again
      </button>
    </div>
  </div>
);

const Header = () => (
  <header className="bg-primary text-white py-6 px-10 flex flex-col md:flex-row justify-between items-center shadow-lg">
    <h1 className="text-3xl font-bold">My Payments</h1>
    <div className="flex gap-6 mt-4 md:mt-0">
      <Link href="/support" className="text-white font-medium underline hover:text-gray-300">Support</Link>
      <Link href="/user/dashboard" className="text-white font-medium underline hover:text-gray-300">My Profile</Link>
    </div>
  </header>
);

const PaymentSummary = ({ 
  totalPaid,
  totalTransactions,
  pendingPayments,
  refundedPayments,
  lastPaymentDate
}: {
  totalPaid: number;
  totalTransactions: number;
  pendingPayments: number;
  refundedPayments: number;
  lastPaymentDate?: string;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    {[
      {icon: DollarSign, label: "Total Paid", value: `₹${totalPaid.toLocaleString()}`, color: "text-blue-600"},
      {icon: CreditCard, label: "Total Transactions", value: totalTransactions, color: "text-green-600"},
      {icon: RefreshCw, label: "Pending Payments", value: pendingPayments, color: "text-yellow-600"},
      {icon: RotateCcw, label: "Refunded Payments", value: refundedPayments, color: "text-blue-600"},
      {icon: Calendar, label: "Last Payment Date", 
       value: lastPaymentDate ? new Date(lastPaymentDate).toLocaleDateString() : 'N/A', 
       color: "text-red-600"}
    ].map((item, index) => (
      <div key={index} className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4 border border-gray-200">
        <item.icon className={item.color} size={40} />
        <div>
          <p className="text-lg font-semibold text-gray-800">{item.label}</p>
          <p className="text-gray-600">{item.value}</p>
        </div>
      </div>
    ))}
  </div>
);

const PaymentHistory = ({ payments }: { payments: Payment[] }) => (
  <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg border border-gray-200">
    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Payment History</h2>
    
    {payments.length === 0 ? (
      <div className="text-center py-10">
        <p className="text-gray-500">No payment history found</p>
      </div>
    ) : (
      <div className="border-t border-gray-300 pt-4 space-y-4">
        {payments.map((payment) => {
          const paymentStatusClass = statusColors[payment.paymentStatus] || "bg-gray-50 text-gray-700 border-gray-300";
          const statusDate = payment.paymentStatus === 'refunded' ? payment.refundedAt : 
                           payment.paymentStatus === 'completed' ? payment.completedAt : 
                           payment.updatedAt;

          return (
            <motion.div 
              key={payment._id} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.3 }}
            >
              <Link href={`/user/dashboard/payments/${payment._id}`}>
                <div className={`p-6 rounded-lg shadow-sm flex justify-between items-center cursor-pointer border ${paymentStatusClass} hover:shadow-md transition-shadow`}>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">₹{payment.amount.toLocaleString()}</p>
                    
                  </div>
                  <div className="text-right flex items-center gap-2">
                    {statusIcons[payment.paymentStatus as keyof typeof statusIcons]}
                    <p className={`text-sm font-bold ${paymentStatusClass}`}>
                      {payment.paymentStatus.charAt(0).toUpperCase() + payment.paymentStatus.slice(1)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {statusDate ? new Date(statusDate).toLocaleString() : 'N/A'}
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

const Footer = () => (
  <footer className="bg-primary text-white py-6 text-center shadow-lg">
    <p className="text-sm">&copy; 2025 TravelerConnect. All rights reserved.</p>
  </footer>
);

export default PaymentsPage;