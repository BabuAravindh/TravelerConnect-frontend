// dashboard/payments/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

interface Payment {
  id: string;
  orderNumber: number;
  amount: number;
  status: string;
  paymentMethod: string;
  paymentId: string;
  completedAt: string;
  updatedAt: string;
  refundedAt: string | null;
  booking: {
    user?: {
      name: string;
      email: string;
    };
    guide?: {
      name: string;
      email: string;
    };
  };
}

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/admin`);
      if (!response.ok) throw new Error('Failed to fetch payments');
      const data = await response.json();
      setPayments(data.payments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/admin/${paymentId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete payment');
      }

      toast.success('Payment deleted successfully');
      fetchPayments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error deleting payment:', err);
    }
  };

  if (loading) return <div className="p-6">Loading payments...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payments Management</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left">Order #</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Method</th>
              <th className="px-6 py-3 text-left">Updated At</th>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{payment.orderNumber}</td>
                <td className="px-6 py-4">₹{payment.amount.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    payment.status === 'refunded' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 capitalize">{payment.paymentMethod}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {format(new Date(payment.updatedAt), 'PPpp')}
                </td>
                <td className="px-6 py-4">
                  {payment.booking?.user ? (
                    <div>
                      <p className="font-medium">{payment.booking.user.name}</p>
                      <p className="text-sm text-gray-500">{payment.booking.user.email}</p>
                    </div>
                  ) : payment.booking?.guide ? (
                    <div>
                      <p className="font-medium">{payment.booking.guide.name}</p>
                      <p className="text-sm text-gray-500">{payment.booking.guide.email}</p>
                    </div>
                  ) : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDeletePayment(payment.id)}
                    disabled={['completed', 'refunded'].includes(payment.status)}
                    className={`px-3 py-1 text-sm rounded ${
                      ['completed', 'refunded'].includes(payment.status)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsPage;