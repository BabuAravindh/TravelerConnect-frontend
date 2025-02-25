'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, ArrowLeft, CreditCard, Calendar, Info } from 'lucide-react';
import UserSidebar from '@/components/UserSidebar';
import { payments, modeOfPayment } from '@/data/data';

const PaymentDetailsPage = () => {
  const params = useParams();
  const payment = Object.values(payments).find(p => p._id === params?.id);

  if (!payment) {
    return <div className="text-center text-red-500 mt-10 text-xl font-semibold">Payment not found</div>;
  }

  const paymentMode = Object.values(modeOfPayment).find(m => m._id === payment.modeOfPaymentId);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#1b374c] to-[#6999aa] text-white py-16 text-center shadow-lg">
        <h1 className="text-5xl font-extrabold">Secure Payment Details</h1>
        <p className="text-lg mt-4">Your transactions are safe with TravelerConnect</p>
      </section>

      <div className="flex">
       

        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col items-center bg-gray-50 p-12"
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-3xl"
          >
            <Link href="/user/dashboard/payments" className="flex items-center text-[#1b374c] mb-6 text-lg font-semibold hover:underline">
              <ArrowLeft size={24} className="mr-2" /> Back to Payments
            </Link>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Payment Details</h2>
            <p className="text-gray-700 text-lg mb-4">Review your payment transaction details carefully.</p>
            <div className="border-t border-gray-300 pt-6 space-y-4">
              <p className="text-lg"><strong>Amount:</strong> Rs. {payment.amount}</p>
              <p className="text-lg"><strong>Payment Method:</strong> {paymentMode?.modeOfPayment || "Unknown"}</p>
              <p className="text-lg"><strong>Transaction Date:</strong> {payment.updatedAt}</p>
              <p className="text-lg"><strong>Transaction ID:</strong> {payment._id}</p>
              <p className="text-lg"><strong>Order Number:</strong> {payment.order}</p>
              <p className="text-lg"><strong>Customer Request:</strong> {payment.customerRequest || "No additional details provided."}</p>
              <p className="text-lg"><strong>Customer Response:</strong> {payment.customerResponse || "No response recorded."}</p>
              <p className="text-lg"><strong>Completion Date:</strong> {payment.completedAt || "N/A"}</p>
              <p className="text-lg"><strong>Failure Date:</strong> {payment.failedAt || "N/A"}</p>
              <p className="text-lg"><strong>Refund Date:</strong> {payment.refundedAt || "N/A"}</p>
              <div className="flex items-center gap-2">
                {payment.paymentStatus === 'completed' ? <CheckCircle className="text-green-700" /> : payment.paymentStatus === 'pending' ? <Clock className="text-yellow-700" /> : <XCircle className="text-red-700" />}
                <p className="text-lg font-bold capitalize">{payment.paymentStatus}</p>
              </div>
            </div>
          </motion.div>

          {/* Additional Information Section */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl mt-8"
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center"><Info className="mr-2" /> Additional Information</h3>
            <p className="text-gray-700 text-lg">Your payment details are securely processed. If you have any concerns regarding this transaction, please contact support.</p>
            <p className="text-gray-700 text-lg mt-3"><strong>Support Email:</strong> <a href="mailto:support@travelerconnect.com" className="underline">support@travelerconnect.com</a></p>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer Section */}
      <footer className="bg-[#1b374c] text-white text-center py-10 mt-12 text-md shadow-lg">
        <h3 className="text-2xl font-bold">TravelerConnect</h3>
        <p className="mt-2 text-lg">Your trusted travel companion for hassle-free transactions.</p>
        <p className="mt-4">For inquiries, contact <a href="mailto:support@travelerconnect.com" className="underline">support@travelerconnect.com</a></p>
        <p className="mt-2">&copy; {new Date().getFullYear()} TravelerConnect. All rights reserved.</p>
      </footer>
    </>
  );
};

export default PaymentDetailsPage;
