"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Calendar, Clock, IndianRupee, User } from "lucide-react";
import Image from "next/image";

type Booking = {
  _id: string;
  date: string;
  location: string;
  guide: string;
  guideImage: string;
  days: string;
  price: string;
  paymentStatus: string;
};

export default function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchBookingDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/bookings/${id}`);
        setBooking(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-semibold text-gray-900 mb-6">📌 Booking Details</h2>

      {loading && <p className="text-gray-500 text-center">Loading...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {booking && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Image
  src={booking.guideImage || "https://picsum.photos/600/240"} 
  alt={booking.guide}
  width={600}
  height={240}
  className="w-full h-60 object-cover rounded-lg"
/>


          <div className="mt-4">
            <h3 className="text-2xl font-semibold">{booking.location}</h3>
            <p className="text-gray-600 flex items-center">
              <User size={16} className="mr-2" /> Guide: {booking.guide}
            </p>
            <p className="text-gray-600 flex items-center">
              <Calendar size={16} className="mr-2" /> Date: {new Date(booking.date).toDateString()}
            </p>
            <p className="text-gray-600 flex items-center">
              <Clock size={16} className="mr-2" /> Duration: {booking.days} {booking.days === "1" ? "day" : "days"}
            </p>
            <p className="text-gray-600 flex items-center">
              <IndianRupee size={16} className="mr-2" /> Price: ₹{booking.price}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
