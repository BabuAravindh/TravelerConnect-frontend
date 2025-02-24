"use client";

import { useParams } from "next/navigation";
import GuideDashboard from "@/app/guides/dashboard/page";
import { Calendar, MapPin, Clock, DollarSign, User, Mail, Phone, ClipboardList } from "lucide-react";

const bookings = [
  {
    id: 1,
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "+1 234 567 8901",
    date: "2025-02-12",
    location: "Paris, France",
    details: "Tour of Eiffel Tower and Louvre Museum",
    guide: "Alex Johnson",
    guideRating: 4.8,
    duration: "5 hours",
    meetingPoint: "Eiffel Tower Entrance",
    price: "$100",
    paymentStatus: "Completed",
    specialRequests: "Vegetarian meal preference",
  },
];

const BookingDetails = () => {
  const { id } = useParams();
  const booking = bookings.find((b) => b.id === Number(id));

  if (!booking) {
    return (
      <GuideDashboard>
        <div className="text-center text-red-500 font-semibold">Booking not found.</div>
      </GuideDashboard>
    );
  }

  return (
    <GuideDashboard>
      <div className="max-w-3xl mx-auto p-6 ">
        <h2 className="text-2xl font-bold mb-4">📜 Booking Details</h2>

        {/* Booking Overview */}
        <div className="space-y-3">
          <p className="text-lg font-semibold flex items-center">
            <User size={18} className="mr-2 text-gray-700" />
            {booking.name}
          </p>
          <p className="flex items-center text-gray-700">
            <Calendar size={16} className="mr-2" />
            {booking.date}
          </p>
          <p className="flex items-center text-gray-700">
            <MapPin size={16} className="mr-2" />
            {booking.location}
          </p>
        </div>

        {/* Tour Details */}
        <div className="mt-4 space-y-3">
          <h3 className="font-semibold">Tour Details:</h3>
          <p className="text-gray-700">{booking.details}</p>
          <p className="flex items-center">
            <ClipboardList size={16} className="mr-2 text-gray-700" />
            Meeting Point: {booking.meetingPoint}
          </p>
          <p className="flex items-center">
            <Clock size={16} className="mr-2 text-gray-700" />
            Duration: {booking.duration}
          </p>
        </div>

        {/* Payment & Contact Info */}
        <div className="mt-4 space-y-3">
          <h3 className="font-semibold">Payment & Contact:</h3>
          <p className="flex items-center text-gray-700">
            <DollarSign size={16} className="mr-2" />
            Price: {booking.price}
          </p>
          <p className="flex items-center">
            <Mail size={16} className="mr-2 text-gray-700" />
            {booking.email}
          </p>
          <p className="flex items-center">
            <Phone size={16} className="mr-2 text-gray-700" />
            {booking.phone}
          </p>
        </div>
      </div>
    </GuideDashboard>
  );
};

export default BookingDetails;
