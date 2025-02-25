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
    guideImage: "/images/men1.jpg", // Example Image
    days: "5 days",
    price: "Rs. 10,000",
    paymentStatus: "Completed",
  },
  {
    id: 2,
    date: "2023-04-22",
    location: "Madurai, Tamil Nadu",
    guide: "Alfred",
    guideImage: "/images/men2.jpg", // Example Image
    days: "4 days",
    price: "Rs. 20,000",
    paymentStatus: "Pending",
  },
];

export default function UserBookings() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <UserSidebar />
      <div className="flex-1 p-6 md:ml-64">
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">📌 Your Bookings</h2>

        {bookings.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <Link key={booking.id} href={`/user/dashboard/bookings/${booking.id}`}>
                <div className="bg-primary rounded-2xl shadow-lg overflow-hidden border border-gray-200 transform transition-all duration-300 hover:scale-[1.02]">
                  {/* Guide Image */}
                  <div className="relative">
                    <img
                      src={booking.guideImage}
                      alt={booking.guide}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-3 py-1 text-sm rounded-lg">
                      Guide: {booking.guide}
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="p-5">
                    <div className="flex justify-between items-center text-white">
                      <p className="flex items-center">
                        <Calendar size={16} className="mr-2 text-white" />
                        {booking.date}
                      </p>
                      <p className="flex items-center">
                        <MapPin size={16} className="mr-2 text-white" />
                        {booking.location}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-3 text-white">
                      <p className="flex items-center">
                        <Clock size={16} className="mr-2 text-white" />
                        {booking.days}
                      </p>
                      <p className="flex items-center font-semibold text-primary">
                        <IndianRupee size={16} className="mr-2 text-primary" />
                        {booking.price}
                      </p>
                    </div>

                    {/* Payment Status Badge */}
                    <p
                      className={`mt-4 text-sm font-medium flex items-center px-3 py-1 rounded-xl w-fit ${
                        booking.paymentStatus === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      <CheckCircle size={16} className="mr-2" />
                      {booking.paymentStatus}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No new bookings available.</p>
        )}
      </div>
    </div>
  );
}
