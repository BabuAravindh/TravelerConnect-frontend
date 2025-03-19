"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  MapPin,
  User,
  CheckCircle,
  Clock,
  IndianRupee,
  Check,
} from "lucide-react";

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  startDate: string;
  endDate: string;
  location: string;
  guide: string;
  duration: string;
  price: number;
  paymentStatus: string;
}

const BookingsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user?.id) return;
  
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("⚠ No token found. Please log in.");
          return;
        }
  
        const res = await fetch(`http://localhost:5000/api/bookings/guide/${user.id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!res.ok) throw new Error("Failed to fetch bookings");
  
        const data = await res.json();
        console.log("Fetched Booking Data:", data);
  
        // Ensure data is an array for consistent mapping
        setBookings(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchBookings();
  }, [authLoading, user?.id]);
  

  const updateBookingStatus = async (bookingId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("⚠ No token found. Please login.");
        return;
      }
     

      const res = await fetch(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "finalized" }),
        }
      );

      if (!res.ok) throw new Error("Failed to update booking status");

      console.log("✅ Booking status updated successfully");
      // Update booking status in the UI
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, paymentStatus: "finalized" } : b
        )
      );
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  if (loading) {
    return <p>Loading bookings...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">📌 Upcoming Bookings</h2>

      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-gray-100 p-4 rounded-lg shadow-md mb-4"
          >
            <p className="text-lg font-semibold flex items-center">
              <User size={18} className="mr-2 text-gray-700" /> {booking.name}
            </p>
            <div className="flex justify-between mt-2 text-gray-700">
              <p className="flex items-center">
                <Calendar size={16} className="mr-2" />
                {booking.startDate} - {booking.endDate}
              </p>
              <p className="flex items-center">
                <MapPin size={16} className="mr-2" />
                {booking.location}
              </p>
            </div>
            <div className="flex justify-between mt-2 text-gray-700">
              <p className="flex items-center">
                <Clock size={16} className="mr-2" />
                {booking.duration}
              </p>
              <p className="flex items-center">
                <IndianRupee size={16} className="mr-2" />
                Rs. {booking.price}
              </p>
            </div>
            <p
              className={`mt-3 font-medium text-sm flex items-center ${
                booking.paymentStatus === "paid"
                  ? "text-green-600"
                  : booking.paymentStatus === "finalized"
                  ? "text-blue-600"
                  : "text-yellow-600"
              }`}
            >
              <CheckCircle size={16} className="mr-1" />
              {booking.paymentStatus.charAt(0).toUpperCase() +
                booking.paymentStatus.slice(1)}
            </p>

            {/* Finalize Booking Button */}
            {booking.paymentStatus !== "finalized" && (
              <button
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                onClick={() => updateBookingStatus(booking.id)}
              >
                <Check size={16} className="mr-1" />
                Finalize Booking
              </button>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-center">No upcoming bookings found.</p>
      )}
    </div>
  );
};

export default BookingsPage;
