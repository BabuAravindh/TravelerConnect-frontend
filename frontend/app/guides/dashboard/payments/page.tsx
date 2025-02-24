'use client';

import GuideDashboard from "../page";
import Link from "next/link";

const payments = [
  { id: 1, amount: 'Rs. 15000', status: 'Completed', date: '2025-02-10' },
  { id: 2, amount: 'Rs. 20000', status: 'Pending', date: '2025-02-08' },
];

const PaymentsPage = () => {
  return (
    <GuideDashboard>
      <div className="space-y-4">
        {payments.length ? (
          payments.map((payment) => (
            <Link key={payment.id} href={`/guides/dashboard/payments/${payment.id}`}>
              <div className="bg-gray-100 p-4 rounded-lg shadow-md flex justify-between cursor-pointer hover:bg-gray-200 transition gap-4">
                <p className="font-medium">{payment.amount}</p>
                <p className={`text-sm ${payment.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {payment.status}
                </p>
                <p className="text-sm text-gray-600">{payment.date}</p>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-600 text-center">No recent payments.</p>
        )}
      </div>
    </GuideDashboard>
  );
};

export default PaymentsPage;
