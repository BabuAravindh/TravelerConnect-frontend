"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import { Loader2, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RefundPage() {
  const { id } = useParams();
  const bookingId = id ? id.toString() : "";
  
  const { user } = useAuth();
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleRefundRequest = async () => {
    if (!token) {
      setError("Authentication token not found.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/payment/refund`;
      const response = await axios.post(
        apiUrl,
        { bookingId },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      setMessage("Refund request submitted successfully!");
      setTimeout(() => router.push("/user/dashboard/bookings"), 2000);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>; 
      setError(error.response?.data?.message || "Failed to request refund.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🔄 Request Refund</h2>
        <p className="text-gray-700 mb-6">Are you sure you want to request a refund for booking ID </p>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {message && <p className="text-green-500 mb-4">{message}</p>}

        <button
          onClick={handleRefundRequest}
          disabled={loading}
          className="w-full flex items-center justify-center bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" />} 
          {loading ? "Submitting..." : "Submit Refund Request"}
        </button>
      </div>
    </div>
  );
}
