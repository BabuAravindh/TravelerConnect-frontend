"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  User,
  Clock,
  IndianRupee,
  CheckCircle,
  Check,
} from "lucide-react";

interface Booking {
  id: string;
  userName: string;
  email: string;
  phone: string;
  startDate: string;
  endDate: string;
  duration: string | number;
  budget: number;
  paymentStatus: string;
  status: string; // ✅ Added status field
}


const BookingsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user?.id) return;

    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("⚠ No token found. Please log in.");
          return;
        }

        const res = await fetch(`http://localhost:5000/api/bookings/guide/${user.id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch bookings");

        const data = await res.json();
        setBookings(Array.isArray(data) ? data : [data]);
      } catch (error) {
        setError("Error fetching bookings. Please try again.");
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
        setError("⚠ No token found. Please login.");
        return;
      }
  
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/details`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "completed" }), // 🔹 Ensure status is being updated
      });
  
      if (!res.ok) throw new Error("Failed to update booking status");
  
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "completed" } : b)) // 🔹 Update status, not paymentStatus
      );
    } catch (error) {
      setError("Error updating booking status.");
    }
  };
  
  if (loading) return <p className="text-center text-gray-600">Loading bookings...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">📌 Upcoming Bookings</h2>

      {error && <p className="text-red-600 text-center">{error}</p>}

      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <div key={booking.id} className="bg-gray-100 p-5 rounded-lg shadow-md mb-4">
            <p className="text-lg font-semibold flex items-center">
              <User size={18} className="mr-2 text-gray-700" /> {booking.userName}
            </p>
            <p className="text-sm text-gray-700">{booking.email}</p>

            <div className="flex justify-between mt-3 text-gray-700">
              <p className="flex items-center">
                <Calendar size={16} className="mr-2" />
                {booking.startDate} - {booking.endDate}
              </p>
            </div>
            <div className="flex justify-between mt-2 text-gray-700">
              <p className="flex items-center">
                <Clock size={16} className="mr-2" />
                {typeof booking.duration === "number" ? `${booking.duration} days` : booking.duration}
              </p>
              <p className="flex items-center">
                <IndianRupee size={16} className="mr-2" />
                Rs. {booking.budget.toLocaleString()}
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
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}

            </p>

            {booking.status !== "completed" && (

              <button
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                onClick={() => updateBookingStatus(booking.id)}
              >
                <Check size={16} className="mr-1" />
                 complete the Trip
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
