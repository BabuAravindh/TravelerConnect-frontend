'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Clock, XCircle, CreditCard, Calendar, RefreshCw, DollarSign, Info } from "lucide-react";

const payments = [
  { id: 1, amount: 'Rs. 15,000', status: 'Completed', date: '2025-02-10', method: 'Bank Transfer', transactionId: 'TXN12345' },
  { id: 2, amount: 'Rs. 20,000', status: 'Pending', date: '2025-02-08', method: 'Credit Card', transactionId: 'TXN67890' },
  { id: 3, amount: 'Rs. 18,500', status: 'Completed', date: '2025-02-05', method: 'UPI', transactionId: 'TXN98765' },
  { id: 4, amount: 'Rs. 12,000', status: 'Failed', date: '2025-02-02', method: 'Net Banking', transactionId: 'TXN54321' },
];

const totalPaid = payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + parseInt(p.amount.replace(/\D/g, '')), 0);
const totalTransactions = payments.length;
const pendingPayments = payments.filter(p => p.status === 'Pending').length;
const lastPaymentDate = payments.filter(p => p.status === 'Completed').sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date || 'N/A';

const PaymentsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-[#1b374c] text-white py-6 px-10 flex flex-col md:flex-row justify-between items-center shadow-lg">
        <h1 className="text-4xl font-bold">My Payments</h1>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link href="/support" className="text-white font-medium underline hover:text-gray-300">Support</Link>
          <Link href="/profile" className="text-white font-medium underline hover:text-gray-300">My Profile</Link>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 p-10">
        {/* User Payment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-4">
            <DollarSign className="text-blue-600" size={40} />
            <div>
              <p className="text-xl font-semibold">Total Paid</p>
              <p className="text-gray-600">Rs. {totalPaid}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-4">
            <CreditCard className="text-green-600" size={40} />
            <div>
              <p className="text-xl font-semibold">Total Transactions</p>
              <p className="text-gray-600">{totalTransactions}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-4">
            <RefreshCw className="text-yellow-600" size={40} />
            <div>
              <p className="text-xl font-semibold">Pending Payments</p>
              <p className="text-gray-600">{pendingPayments}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-4">
            <Calendar className="text-red-600" size={40} />
            <div>
              <p className="text-xl font-semibold">Last Payment Date</p>
              <p className="text-gray-600">{lastPaymentDate}</p>
            </div>
          </div>
        </div>
        
        {/* Payment History */}
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Payment History</h2>
          <div className="border-t border-gray-300 pt-4 space-y-4">
            {payments.map((payment) => (
              <motion.div 
                key={payment.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.3 }}
              >
                <Link href={`/payments/${payment.id}`}>
                  <div className={`p-6 rounded-lg shadow-sm flex justify-between items-center cursor-pointer transition-all border border-gray-200 ${payment.status === 'Completed' ? 'bg-green-50' : payment.status === 'Pending' ? 'bg-yellow-50' : 'bg-red-50'}`}>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{payment.amount}</p>
                      <p className="text-sm text-gray-600">{payment.method} - {payment.transactionId}</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      {payment.status === 'Completed' ? <CheckCircle className="text-green-700" /> : payment.status === 'Pending' ? <Clock className="text-yellow-700" /> : <XCircle className="text-red-700" />}
                      <p className={`text-sm font-bold ${payment.status === 'Completed' ? 'text-green-700' : payment.status === 'Pending' ? 'text-yellow-700' : 'text-red-700'}`}>{payment.status}</p>
                      <p className="text-sm text-gray-500">{payment.date}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1b374c] text-white py-6 text-center mt-8 shadow-lg">
        <p className="text-sm">&copy; 2025 TravelerConnect. All rights reserved.</p>
        <p className="text-sm">For any queries, email us at support@travelerconnect.com | Phone: +91-9876543210</p>
        <p className="text-sm">Address: 123, Traveler Street, Mumbai, India</p>
        <p className="text-sm flex items-center justify-center gap-2 mt-2"><Info size={16} /> Secure & Reliable Payment System</p>
      </footer>
    </div>
  );
};

export default PaymentsPage;





