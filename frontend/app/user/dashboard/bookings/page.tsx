"use client";
import Link from "next/link";
import UserSidebar from "@/components/UserSidebar";
import { Calendar, CheckCircle, Clock, IndianRupee, MapPin, User } from "lucide-react";

const bookings = [
  {
    id: 1,
    date: "2023-02-12",
    location: "Chennai, Tamil Nadu",
    guide: "Alex",
    days: "5 days",
    price: "Rs. 10,000",
    paymentStatus: "Completed",
  },
  {
    id: 2,
    date: "2023-04-22",
    location: "Madurai, Tamil Nadu",
    guide: "Maria",
    days: "4 days",
    price: "Rs. 20,000",
    paymentStatus: "Pending",
  },
];

export default function UserBookings() {
  return (
    <>
      <UserSidebar />
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">📌 Your Bookings</h2>

        {bookings.length ? (
          bookings.map((booking) => (
            <Link key={booking.id} href={`/user/dashboard/bookings/${booking.id}`} className="block">
              <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 mb-4 border border-gray-200">
                {/* Guide Name */}
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-gray-800 flex items-center">
                    <User size={18} className="mr-2 text-gray-600" />
                    Guide: <span className="ml-1 text-primary">{booking.guide}</span>
                  </p>
                </div>

                {/* Date & Location */}
                <div className="flex justify-between items-center mt-3 text-gray-700">
                  <p className="flex items-center">
                    <Calendar size={16} className="mr-2 text-gray-600" />
                    {booking.date}
                  </p>
                  <p className="flex items-center">
                    <MapPin size={16} className="mr-2 text-gray-600" />
                    {booking.location}
                  </p>
                </div>

                {/* Duration & Price */}
                <div className="flex justify-between items-center mt-3 text-gray-700">
                  <p className="flex items-center">
                    <Clock size={16} className="mr-2 text-gray-600" />
                    {booking.days}
                  </p>
                  <p className="flex items-center font-semibold text-primary">
                    <IndianRupee size={16} className="mr-2 text-primary" />
                    {booking.price}
                  </p>
                </div>

                {/* Payment Status */}
                <p
                  className={`mt-4 font-medium text-sm flex items-center px-3 py-1 rounded-lg w-fit ${
                    booking.paymentStatus === "Completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  <CheckCircle size={16} className="mr-2" />
                  {booking.paymentStatus}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-500 text-center">No new bookings available.</p>
        )}
      </div>
    </>
  );
}
