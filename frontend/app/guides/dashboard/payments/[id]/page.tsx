'use client';

import GuideDashboard from "../../page";
import { useParams } from "next/navigation";

const payments = [
  {
    id: 1,
    amount: 'Rs. 15000',
    status: 'Completed',
    date: '2025-02-10',
    customer: 'John Doe',
    locationsVisited: [
      'Chennai, Tamil Nadu',
      'Mahabalipuram, Tamil Nadu'
    ],
  },
  {
    id: 2,
    amount: 'Rs. 20000',
    status: 'Pending',
    date: '2025-02-08',
    customer: 'Emma Smith',
    locationsVisited: [
      'Madurai, Tamil Nadu',
      'Rameswaram, Tamil Nadu'
    ],
  },
];

const PaymentDetails = () => {
  const { id } = useParams();
  const payment = payments.find((p) => p.id === Number(id));

  if (!payment) {
    return <p className="text-center text-gray-500">Payment details not found.</p>;
  }

  return (
    <GuideDashboard>
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-4">💳 Payment Details</h2>
        <p className="text-lg font-semibold">Customer: {payment.customer}</p>
        <p className="text-lg font-semibold">Amount Paid: {payment.amount}</p>
        <p className={`text-lg font-semibold ${payment.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'}`}>Status: {payment.status}</p>
        <p className="text-lg font-semibold">Date: {payment.date}</p>
        
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">📍 Locations Visited</h3>
          <ul className="list-disc pl-6 text-gray-700">
            {payment.locationsVisited.map((location, index) => (
              <li key={index}>{location}</li>
            ))}
          </ul>
        </div>
      </div>
    </GuideDashboard>
  );
};

export default PaymentDetails;
