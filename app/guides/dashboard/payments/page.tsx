"use client";

import Link from "next/link";
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
}

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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/guide/${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }
        
        const { success, payments, message } = await response.json();
        
        if (!success) {
          throw new Error(message || 'No payment data available');
        }
        
        setPayments(payments || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user?._id]);

  if (loading) {
    return (
      <div className="flex">
        <div className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-4">💳 Payment History</h2>
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-100 p-4 rounded-lg shadow-md h-16"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <div className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-4">💳 Payment History</h2>
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">💳 Payment History</h2>

        {payments.length ? (
          <div className="space-y-4">
            {payments.map((payment) => (
              <Link key={payment._id} href={`/guides/dashboard/payments/${payment._id}`}>
                <div className="bg-gray-100 p-4 rounded-lg shadow-md flex justify-between items-center cursor-pointer hover:bg-gray-200 transition-all">
                  <p className="font-semibold">₹{payment.amount.toLocaleString()}</p>
                  <p className={`text-sm font-medium ${
                    payment.paymentStatus === "completed" ? "text-green-600" : 
                    payment.paymentStatus === "pending" ? "text-yellow-600" :
                    payment.paymentStatus === "refunded" ? "text-blue-600" :
                    "text-red-600"
                  }`}>
                    {payment.paymentStatus.charAt(0).toUpperCase() + payment.paymentStatus.slice(1)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(payment.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center mt-4">No recent payments.</p>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;