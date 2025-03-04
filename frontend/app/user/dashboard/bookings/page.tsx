"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import UserSidebar from "@/components/UserSidebar";
import { Calendar, CheckCircle, Clock, IndianRupee, MapPin } from "lucide-react";

type Booking = {
  _id: string;
  tripDate: string;
  bookingDate: string;
  places: string;
  guideName: string;
  guideImage: string;
  duration: number;
  price: string;
  status: string;
};

export default function UserBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");

    if (!storedUserId) {
      setError("User ID not found. Please log in.");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/booking/user/${storedUserId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch bookings");
        return res.json();
      })
      .then((data) => {
        console.log("Fetched Data:", data); // Debugging

        if (!Array.isArray(data)) {
          console.error("Unexpected response format:", data);
          throw new Error("Invalid response format, expected an array");
        }

        const formattedBookings = data.map((booking: any) => ({
          _id: booking._id,
          tripDate: booking.tripDate ? new Date(booking.tripDate).toDateString() : "N/A",
          bookingDate: booking.bookingDate ? new Date(booking.bookingDate).toDateString() : "N/A",
          places: booking.places?.length > 0 ? booking.places.join(", ") : "Not specified",
          guideName: booking.guideId?.name || "Guide not assigned",
          guideImage: booking.guideImage || "https://example.com/default-guide.jpg",
          duration: booking.duration || "N/A",
          price: booking.price ? `₹${booking.price}` : "N/A",
          status: booking.status || "Unknown",
        }));

        console.log("Formatted Bookings:", formattedBookings); // Debugging
        setBookings(formattedBookings);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <UserSidebar />
      <div className="flex-1 p-6 md:ml-64">
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">📌 Your Bookings</h2>

        {loading && <p className="text-gray-500 text-center">Loading bookings...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {!loading && !error && bookings.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <Link key={booking._id} href={`/user/dashboard/bookings/${booking._id}`}>
                <div className="bg-primary rounded-2xl shadow-lg overflow-hidden border border-gray-200 transform transition-all duration-300 hover:scale-[1.02]">
                  <div className="relative">
                    <img
                      src={booking.guideImage}
                      alt={booking.guideName}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-3 py-1 text-sm rounded-lg">
                      Guide: {booking.guideName}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-center text-white">
                      <p className="flex items-center">
                        <Calendar size={16} className="mr-2 text-white" />
                        {booking.tripDate}
                      </p>
                      <p className="flex items-center">
                        <MapPin size={16} className="mr-2 text-white" />
                        {booking.places}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-3 text-white">
                      <p className="flex items-center">
                        <Clock size={16} className="mr-2 text-white" />
                        {booking.duration} days
                      </p>
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
