"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Request {
  _id: string;
  customerId: {
    name: string;
    email: string;
    profilePic?: string; // ✅ Optional field for profile picture
  };
  status: string; // ✅ Added to track request status
  paymentStatus: string;
  createdAt: string;
}

const GuideRequests = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "guide") {
      router.push("/dashboard"); // Redirect non-guides
      return;
    }

    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/requests/${user.id}`);
        setRequests(res.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user, router]);

  const handleAccept = async (requestId: string) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/requests/${requestId}/status`, { status: "accepted" });

      setRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: "accepted" } : req
        )
      );

      toast.success("Request Accepted!");
    } catch (error) {
      toast.error("Failed to accept request.");
      console.error("Error:", error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/requests/${requestId}/status`, { status: "rejected" });
      setRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: "rejected" } : req
        )
      );
      toast.success("Request Rejected.");
    } catch (error) {
      toast.error("Failed to reject request.");
      console.error("Error:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (requests.length === 0)
    return (
      <p className="bg-gray-100 text-gray-600 py-3 px-4 rounded-md text-center">
        No requests found.
      </p>
    );
  

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Booking Requests</h2>
      <div className="grid gap-4">
        {requests.map((request) => (
          <div key={request._id} className="p-4 border rounded-lg shadow-md bg-white">
            <div className="flex items-center gap-4">
              {/* ✅ Profile picture temporarily commented out */}
              {/* <img
                src={request.customerId.profilePic}
                alt={request.customerId.name}
                className="w-12 h-12 rounded-full"
              /> */}
              <div>
                <p className="text-lg font-medium">{request.customerId.name}</p>
                <p className="text-gray-500">{request.customerId.email}</p>
                <p className="text-sm text-gray-600">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      request.status === "accepted"
                        ? "text-green-600"
                        : request.status === "rejected"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {request.status}
                  </span>
                </p>
              </div>
            </div>
            {/* ✅ Buttons only show if request is pending */}
            {request.status === "pending" && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleAccept(request._id)}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
                >
                  ✅ Accept
                </button>
                <button
                  onClick={() => handleReject(request._id)}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
                >
                  ❌ Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuideRequests;
