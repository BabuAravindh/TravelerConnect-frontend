"use client";

import { useParams } from "next/navigation";
import GuideDashboard from "../../../page";
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
    review: "Great experience! The guide was knowledgeable and friendly.",
    rating: 4.9,
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
    review: "Amazing tour! Learned a lot about Mumbai's history.",
    rating: 4.8,
  },
];

const BookingDetailPage = () => {
  const { id } = useParams();
  const booking = bookingHistory.find((b) => b.id === Number(id));

  if (!booking) {
    return (
      <GuideDashboard>
        <div className="text-center text-gray-500 p-6">Booking not found.</div>
      </GuideDashboard>
    );
  }

  return (
    <GuideDashboard>
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl border border-gray-200">
        <h2 className="text-2xl font-bold mb-4"> Booking Details</h2>

        <div className="space-y-4 text-gray-800">
          <p className="text-lg font-semibold flex items-center">
            <User size={18} className="mr-2 text-gray-700" />
            {booking.name}
          </p>
          <p className="flex items-center">
            <Calendar size={16} className="mr-2 text-gray-700" />
            {booking.date}
          </p>
          <p className="flex items-center">
            <MapPin size={16} className="mr-2 text-gray-700" />
            {booking.location}
          </p>
          <p className="flex items-center">
            <User size={16} className="mr-2 text-gray-700" />
            Guide: <span className="font-semibold ml-1">{booking.guide}</span>
          </p>
          <p className="flex items-center">
            <Clock size={16} className="mr-2 text-gray-700" />
            {booking.duration}
          </p>
          <p className="flex items-center">
            <IndianRupee size={16} className="mr-2 text-gray-700" />
            {booking.price}
          </p>
          <p className="flex items-center text-green-600">
            <CheckCircle size={16} className="mr-2" />
            {booking.paymentStatus}
          </p>

          {/* Review & Rating */}
          {booking.review && (
            <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <h3 className="text-xl font-semibold mb-2">🌟 Review & Rating</h3>
              <p className="text-gray-700 italic">"{booking.review}"</p>
              <p className="mt-2 font-semibold text-yellow-500">⭐ {booking.rating}/5</p>
            </div>
          )}
        </div>
      </div>
    </GuideDashboard>
  );
};

export default BookingDetailPage;
