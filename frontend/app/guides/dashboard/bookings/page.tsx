"use client";

import Link from "next/link";
import GuideDashboard from "../page";
import { Calendar, MapPin, DollarSign, User, CheckCircle, Clock, IndianRupee } from "lucide-react";

const bookings = [
  {
    id: 1,
    name: "John Doe",
    date: "2025-02-12",
    location: "Chennai, Tamil nadu",
    guide: "Alex Johnson",
    duration: "5 hours",
    price: "Rs.10000",
    paymentStatus: "Completed",
  },
  {
    id: 2,
    name: "Emma Smith",
    date: "2025-02-15",
    location: "Madurai, Tamil nadu",
    guide: "Maria Rossi",
    duration: "6 hours",
    price: "Rs.12000",
    paymentStatus: "Pending",
  },
];

const BookingsPage = () => {
  return (
    <GuideDashboard>
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">📌 Upcoming Bookings</h2>

        {bookings.length ? (
          bookings.map((booking) => (
            <Link key={booking.id} href={`/guides/dashboard/bookings/${booking.id}`}>
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
                <p className={`mt-3 font-medium text-sm flex items-center ${booking.paymentStatus === "Completed" ? "text-green-600" : "text-yellow-600"}`}>
                  <CheckCircle size={16} className="mr-1" />
                  {booking.paymentStatus}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-600 text-center">No new bookings.</p>
        )}
      </div>
    </GuideDashboard>
  );
};

export default BookingsPage;
