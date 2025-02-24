"use client";

import Link from "next/link";
import GuideDashboard from "../../page";
import { Calendar, MapPin, DollarSign, User, CheckCircle, Clock, IndianRupee } from "lucide-react";

const bookingHistory = [
  {
    id: 101,
    name: "Alice Brown",
    date: "2025-01-25",
    location: "Bangalore, Karnataka",
    guide: "David Warner",
    duration: "4 hours",
    price: "Rs.8000",
    paymentStatus: "Completed",
  },
  {
    id: 102,
    name: "Michael Johnson",
    date: "2025-01-20",
    location: "Mumbai, Maharashtra",
    guide: "Sophia Lee",
    duration: "3 hours",
    price: "Rs.7500",
    paymentStatus: "Completed",
  },
];

const BookingsHistoryPage = () => {
  return (
    <GuideDashboard>
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Booking History</h2>

        {bookingHistory.length ? (
          bookingHistory.map((booking) => (
            <Link key={booking.id} href={`/guides/dashboard/bookings/history/${booking.id}`}>
              <div className="bg-gray-100 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-200 transition-all mb-4">
                {/* Customer Name & Guide */}
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold flex items-center">
                    <User size={18} className="mr-2 text-gray-700" />
                    {booking.name}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <User size={14} className="mr-1" />
                    Guide: <span className="font-semibold ml-1">{booking.guide}</span>
                  </p>
                </div>

                {/* Date & Location */}
                <div className="flex justify-between items-center mt-2 text-gray-700">
                  <p className="flex items-center">
                    <Calendar size={16} className="mr-2 text-gray-700" />
                    {booking.date}
                  </p>
                  <p className="flex items-center">
                    <MapPin size={16} className="mr-2 text-gray-700" />
                    {booking.location}
                  </p>
                </div>

                {/* Duration & Price */}
                <div className="flex justify-between items-center mt-2 text-gray-700">
                  <p className="flex items-center">
                    <Clock size={16} className="mr-2 text-gray-700" />
                    {booking.duration}
                  </p>
                  <p className="flex items-center">
                    <IndianRupee size={16} className="mr-2 text-gray-700" />
                    {booking.price}
                  </p>
                </div>

                {/* Payment Status */}
                <p className="mt-3 font-medium text-green-600 flex items-center">
                  <CheckCircle size={16} className="mr-1" />
                  {booking.paymentStatus}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-600 text-center">No past bookings.</p>
        )}
      </div>
    </GuideDashboard>
  );
};

export default BookingsHistoryPage;
