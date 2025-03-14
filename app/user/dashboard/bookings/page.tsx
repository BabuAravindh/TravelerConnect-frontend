"use client";
import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import Link from "next/link";

import { Calendar, CheckCircle, IndianRupee } from "lucide-react";
import useAuth from "@/hooks/useAuth";

type Booking = {
  _id: string;
  tripDate: string;
  bookingDate: string;
  price: string;
  status: string;
};

export default function UserBookings() {
  const { userId } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchBookings = async () => {
      try {
        console.log("Fetching bookings for user:", userId);
        const apiUrl = `http://localhost:5000/api/bookings/user/${userId}`;
        console.log("API URL:", apiUrl);

        const { data } = await axios.get<Booking[]>(apiUrl, { withCredentials: true });
        console.log("Fetched Data:", data);

        setBookings(
          data.map((booking) => ({
            _id: booking._id.toString(),
            tripDate: booking.tripDate ? new Date(booking.tripDate).toDateString() : "N/A",
            bookingDate: booking.bookingDate ? new Date(booking.bookingDate).toDateString() : "N/A",
            price: booking.price ? `₹${booking.price}` : "N/A",
            status: booking.status || "Unknown",
          }))
        );
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        console.error("Error fetching bookings:", error);
        setError(error.response?.data?.message || "Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 p-6 md:ml-64">
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">📌 Your Bookings</h2>

        {loading && <p className="text-gray-500 text-center">Loading bookings...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {!loading && !error && bookings.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <Link key={booking._id} href={`/user/dashboard/bookings/${booking._id}`}>
                <div className="bg-primary rounded-2xl shadow-lg overflow-hidden border border-gray-200 transform transition-all duration-300 hover:scale-[1.02]">
                  <div className="p-5">
                    <div className="flex justify-between items-center text-white">
                      <p className="flex items-center">
                        <Calendar size={16} className="mr-2 text-white" />
                        {booking.tripDate}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-3 text-white">
                      <p className="flex items-center font-semibold text-primary">
                        <IndianRupee size={16} className="mr-2 text-primary" />
                        {booking.price}
                      </p>
                    </div>

                    <p
                      className={`mt-4 text-sm font-medium flex items-center px-3 py-1 rounded-xl w-fit ${
                        booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      <CheckCircle size={16} className="mr-2" />
                      {booking.status}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          !loading && !error && <p className="text-gray-500 text-center">No bookings available.</p>
        )}
      </div>
    </div>
  );
}
