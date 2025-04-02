"use client";
import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import Link from "next/link";

import { Calendar, CheckCircle, IndianRupee, User, Mail, Phone, Languages, RotateCcw } from "lucide-react";
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
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
        const response = await axios.get<any[]>(apiUrl, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          validateStatus: function (status) {
            // Consider 404 as a valid status (no bookings found)
            return (status >= 200 && status < 300) || status === 404;
          }
        });

        if (response.status === 404) {
          setBookings([]);
          return;
        }

        const mappedBookings = response.data.map((booking) => ({
          id: booking._id,
          guideName: booking.guideProfile.guideName,
          guideLanguages: booking.guideProfile.languages.join(", "),
          startDate: new Date(booking.startDate).toLocaleDateString(),
          endDate: new Date(booking.endDate).toLocaleDateString(),
          budget: booking.budget,
          status: booking.status,
          duration: `${Math.ceil(
            (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)
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

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
              <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
            <p className="text-gray-500">You haven't made any bookings yet.</p>
            <div className="mt-6">
              <Link href="/">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-button hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Find a Guide
                </button>
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 p-6">
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
                      : booking.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
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

                {/* Refund Button (Only for Completed Bookings) */}
                {booking.status === "completed" && (
                  <Link href={`/user/dashboard/refund/${booking.id}`}>
                    <button className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded-lg flex items-center justify-center hover:bg-red-600 transition duration-300">
                      <RotateCcw size={18} className="mr-2" />
                      Request Refund
                    </button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}