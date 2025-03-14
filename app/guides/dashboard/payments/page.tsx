"use client";


import Link from "next/link";

const payments = [
  { id: 1, amount: "Rs. 15000", status: "Completed", date: "2025-02-10" },
  { id: 2, amount: "Rs. 20000", status: "Pending", date: "2025-02-08" },
];

const PaymentsPage: React.FC = () => {
  return (
    <div className="flex">
      {/* Sidebar */}


      {/* Main Content */}
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">💳 Payment History</h2>

        {payments.length ? (
          <div className="space-y-4">
            {payments.map((payment) => (
              <Link key={payment.id} href={`/guides/dashboard/payments/${payment.id}`}>
                <div className="bg-gray-100 p-4 rounded-lg shadow-md flex justify-between items-center cursor-pointer hover:bg-gray-200 transition-all">
                  <p className="font-semibold">{payment.amount}</p>
                  <p className={`text-sm font-medium ${payment.status === "Completed" ? "text-green-600" : "text-yellow-600"}`}>
                    {payment.status}
                  </p>
                  <p className="text-sm text-gray-600">{payment.date}</p>
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
