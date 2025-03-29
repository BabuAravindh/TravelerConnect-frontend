'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle, Clock, XCircle, RotateCcw, MapPin, CreditCard, Info } from "lucide-react";
import Link from "next/link";

interface Payment {
  _id: string;
  amount: number;
  paymentStatus: 'completed' | 'pending' | 'failed' | 'refunded';
  bookingId: string;
  updatedAt: string;
  completedAt?: string;
  refundedAt?: string;
  payId?: string;
  customerRequest?: string;
  customerResponse?: string;
  modeOfPaymentId?: string;
  createdAt?: string;
}

interface PaymentDetails {
  entity?: string;
  currency?: string;
  status?: string;
  amount?: number;
  base_amount?: number;
  created_at?: number;
  speed_processed?: string;
  speed_requested?: string;
  acquirer_data?: {
    arn?: string | null;
  };
  // Excluded fields: id, payment_id
}

const PaymentDetailsPage = () => {
  const { id } = useParams();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/payment/info/${id}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch payment details');
        }

        const { success, payment } = await response.json();
        
        if (!success || !payment) {
          throw new Error('Payment details not found');
        }

        setPayment(payment);
        
        if (payment.customerResponse) {
          try {
            // Parse customerResponse but exclude sensitive IDs
            const { id, payment_id, ...details } = JSON.parse(payment.customerResponse);
            setPaymentDetails(details);
          } catch (e) {
            console.warn("Could not parse customerResponse", e);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [id]);

  const getStatusIcon = () => {
    switch (payment?.paymentStatus) {
      case 'completed': return <CheckCircle className="text-green-600" size={24} />;
      case 'pending': return <Clock className="text-yellow-600" size={24} />;
      case 'failed': return <XCircle className="text-red-600" size={24} />;
      case 'refunded': return <RotateCcw className="text-blue-600" size={24} />;
      default: return null;
    }
  };

  const getStatusColor = () => {
    switch (payment?.paymentStatus) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      case 'refunded': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  if (!payment) return <NotFoundDisplay />;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold">💳 Payment Details</h2>
        <Link href="/guides/dashboard/payments" className="text-sm text-indigo-600 hover:text-indigo-800">
          ← Back to Payments
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Amount</h3>
            <p className="text-2xl font-semibold">₹{payment.amount.toLocaleString()}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <div className="flex items-center mt-1">
              {getStatusIcon()}
              <span className={`ml-2 text-lg font-medium ${getStatusColor()}`}>
                {payment.paymentStatus.charAt(0).toUpperCase() + payment.paymentStatus.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {paymentDetails?.currency && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Currency</h3>
              <p className="text-gray-900">{paymentDetails.currency}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-500">
              {payment.paymentStatus === 'refunded' ? 'Refunded On' : 
               payment.paymentStatus === 'completed' ? 'Completed On' : 
               'Last Updated'}
            </h3>
            <p className="text-gray-900">
              {new Date(
                payment.paymentStatus === 'refunded' ? payment.refundedAt || payment.updatedAt :
                payment.paymentStatus === 'completed' ? payment.completedAt || payment.updatedAt :
                payment.updatedAt
              ).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Processing Details */}
      {paymentDetails && (
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h3 className="text-lg font-semibold flex items-center mb-4">
            <CreditCard className="mr-2" size={20} />
            Payment Processing
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentDetails.status && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <p className="text-gray-900 capitalize">{paymentDetails.status.replace(/_/g, ' ')}</p>
              </div>
            )}

            {paymentDetails.speed_processed && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Processing Speed</h4>
                <p className="text-gray-900 capitalize">{paymentDetails.speed_processed}</p>
              </div>
            )}

            {paymentDetails.created_at && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Processed At</h4>
                <p className="text-gray-900">
                  {new Date(paymentDetails.created_at * 1000).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Raw Data (hidden by default) */}
      <div className="border-t border-gray-200 pt-6">
        <details className="group">
          <summary className="flex items-center cursor-pointer text-sm font-medium text-gray-500">
            <Info className="mr-2" size={16} />
            Technical Details
          </summary>
          <div className="mt-2 bg-gray-50 p-4 rounded">
            <pre className="text-xs text-gray-700 overflow-x-auto">
              {JSON.stringify({
                ...payment,
                customerResponse: undefined, // Exclude from raw display too
                payId: undefined, // Exclude from raw display
                bookingId: undefined // Exclude from raw display
              }, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
};

// Sub-components remain the same as previous implementation
const LoadingSpinner = () => (
  <div className="max-w-3xl mx-auto p-6">
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
    </div>
  </div>
);

const ErrorDisplay = ({ error }: { error: string }) => (
  <div className="max-w-3xl mx-auto p-6">
    <div className="bg-red-50 border-l-4 border-red-500 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
    <Link
      href="/dashboard/payments"
      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
    >
      Back to Payments
    </Link>
  </div>
);

const NotFoundDisplay = () => (
  <div className="max-w-3xl mx-auto p-6">
    <p className="text-center text-gray-500">Payment details not found.</p>
    <Link
      href="/dashboard/payments"
      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
    >
      Back to Payments
    </Link>
  </div>
);

export default PaymentDetailsPage;