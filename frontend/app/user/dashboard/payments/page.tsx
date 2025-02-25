'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Clock, XCircle, CreditCard, Calendar, RefreshCw, DollarSign } from "lucide-react";
import UserSidebar from "@/components/UserSidebar";
import { payments, modeOfPayment } from "@/data/data"; 

const userPayments = Object.values(payments);

const totalPaid = userPayments
  .filter(p => p.paymentStatus === 'completed')
  .reduce((sum, p) => sum + p.amount, 0);

const totalTransactions = userPayments.length;
const pendingPayments = userPayments.filter(p => p.paymentStatus === 'pending').length;
const lastPaymentDate = userPayments
  .filter(p => p.paymentStatus === 'completed')
  .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0]?.completedAt || 'N/A';

const PaymentsPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <UserSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-primary text-white py-6 px-10 flex flex-col md:flex-row justify-between items-center shadow-lg">
          <h1 className="text-3xl font-bold">My Payments</h1>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/support" className="text-white font-medium underline hover:text-gray-300">Support</Link>
            <Link href="/user/dashboard" className="text-white font-medium underline hover:text-gray-300">My Profile</Link>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 bg-primary">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[{icon: DollarSign, label: "Total Paid", value: `Rs. ${totalPaid}`, color: "text-blue-600"},
              {icon: CreditCard, label: "Total Transactions", value: totalTransactions, color: "text-green-600"},
              {icon: RefreshCw, label: "Pending Payments", value: pendingPayments, color: "text-yellow-600"},
              {icon: Calendar, label: "Last Payment Date", value: lastPaymentDate, color: "text-red-600"}].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4 border border-gray-200">
                <item.icon className={item.color} size={40} />
                <div>
                  <p className="text-lg font-semibold text-gray-800">{item.label}</p>
                  <p className="text-gray-600">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Payment History</h2>
            <div className="border-t border-gray-300 pt-4 space-y-4">
              {userPayments.map((payment) => {
                const paymentMode = Object.values(modeOfPayment).find(m => m._id === payment.modeOfPaymentId);
                const statusColors = {
                  completed: "bg-green-50 text-green-700 border-green-300",
                  pending: "bg-yellow-50 text-yellow-700 border-yellow-300",
                  failed: "bg-red-50 text-red-700 border-red-300"
                };

                return (
                  <motion.div 
                    key={payment._id} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.3 }}
                  >
                    <Link href={`/user/dashboard/payments/${payment._id}`}>
                      <div className={`p-6 rounded-lg shadow-sm flex justify-between items-center cursor-pointer border ${statusColors[payment.paymentStatus]}`}>
                        <div>
                          <p className="text-lg font-semibold text-gray-900">Rs. {payment.amount}</p>
                          <p className="text-sm text-gray-600">{paymentMode?.modeOfPayment || "Unknown Method"}</p>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          {payment.paymentStatus === 'completed' ? <CheckCircle className="text-green-700" /> : payment.paymentStatus === 'pending' ? <Clock className="text-yellow-700" /> : <XCircle className="text-red-700" />}
                          <p className={`text-sm font-bold ${statusColors[payment.paymentStatus]}`}>{payment.paymentStatus}</p>
                          <p className="text-sm text-gray-500">{payment.updatedAt}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </main>

        <footer className="bg-primary text-white py-6 text-center  shadow-lg">
          <p className="text-sm">&copy; 2025 TravelerConnect. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default PaymentsPage;
