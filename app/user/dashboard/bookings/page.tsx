"use client";
import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import Link from "next/link";

import { Calendar, CheckCircle, IndianRupee, User, Mail, Phone, Languages } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Booking = {
  id: string;
  guideName: string;
  guideLanguages: string[];
  startDate: string;
  endDate: string;
  budget: number;
  status: string;
  duration: string;
  guideEmail: string;
  guidePhoneNumber: string;
};

export default function UserBookings() {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || !token) {
      setLoading(false);
      setError("User not authenticated.");
      return;
    }

    const fetchBookings = async () => {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/user/${user?.id}`;
        const { data } = await axios.get<any[]>(apiUrl, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const mappedBookings = data.map((booking) => ({
          id: booking._id,
          guideName: booking.guideProfile.guideName,
          guideLanguages: booking.guideProfile.languages.join(", "),
          startDate: new Date(booking.startDate).toLocaleDateString(),
          endDate: new Date(booking.endDate).toLocaleDateString(),
          budget: booking.budget,
          status: booking.status,
          duration: `${Math.ceil(
            (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )} days`,
          guideEmail: booking.guideProfile.guideEmail,
          guidePhoneNumber: booking.guideProfile.guidePhoneNumber,
        }));

        setBookings(mappedBookings);
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        console.error("Error fetching bookings:", error);
        setError(error.response?.data?.message || "Failed to fetch bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user?.id, token]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">📌 Your Bookings</h2>

        {loading && <p className="text-gray-500 text-center">Loading bookings...</p>}

        {error && <p className="text-red-500 text-center">{error}</p>}

        {!loading && !error && bookings.length === 0 && (
          <p className="text-gray-500 text-center">No bookings available.</p>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <Link key={booking.id} href={`/user/dashboard/bookings/${booking.id}`}>
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200">
                  <div className="p-6">
                    {/* Booking Dates */}
                    <div className="flex items-center text-gray-700 mb-4">
                      <Calendar size={18} className="mr-2 text-gray-500" />
                      <span className="text-sm">
                        {booking.startDate} - {booking.endDate}
                      </span>
                    </div>

                    {/* Budget */}
                    <div className="flex items-center text-gray-700 mb-4">
                      <IndianRupee size={18} className="mr-2 text-gray-500" />
                      <span className="text-sm font-semibold">₹{booking.budget}</span>
                    </div>

                    {/* Status */}
                    <div
                      className={`flex items-center text-sm font-medium px-3 py-1 rounded-full w-fit mb-4 ${
                        booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      <CheckCircle size={16} className="mr-2" />
                      {booking.status}
                    </div>

                    {/* Guide Information */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Guide Details</h3>

                      <div className="flex items-center text-gray-700">
                        <User size={18} className="mr-2 text-gray-500" />
                        <span className="text-sm">{booking.guideName}</span>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <Mail size={18} className="mr-2 text-gray-500" />
                        <span className="text-sm">{booking.guideEmail}</span>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <Phone size={18} className="mr-2 text-gray-500" />
                        <span className="text-sm">{booking.guidePhoneNumber}</span>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <Languages size={18} className="mr-2 text-gray-500" />
                        <span className="text-sm">{booking.guideLanguages}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}t