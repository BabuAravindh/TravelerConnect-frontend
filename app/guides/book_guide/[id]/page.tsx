"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import Razorpay from "razorpay"
const BookingForm = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [conversationError, setConversationError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    budget: "",
  });

  const guideId = params.id;
  
  useEffect(() => {
    setToken(localStorage.getItem("token") || null);
  }, []);

  const fetchLastBudget = async (userId: string, guideId: string, token: string): Promise<string | null> => {
    try {
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const conversationRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chats/conversation/${userId}/${guideId}`,
        { method: "GET", headers: { Authorization: `Bearer ${token}` } }
      );

      if (!conversationRes.ok) {
        if (conversationRes.status === 404) {
          setConversationError("No conversation found. Please start a chat with the guide.");
          return null;
        }
        throw new Error(`Failed to fetch conversation: ${conversationRes.statusText}`);
      }

      const { conversationId } = await conversationRes.json();

      const budgetRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chats/conversations/${conversationId}/lastBudget`,
        { method: "GET", headers: { Authorization: `Bearer ${token}` } }
      );

      if (!budgetRes.ok) {
        if (budgetRes.status === 404) {
          setConversationError("No budget found. Discuss the budget with the guide.");
          return null;
        }
        throw new Error(`Failed to fetch last budget: ${budgetRes.statusText}`);
      }

      const lastBudgetMessage = await budgetRes.json();
      return lastBudgetMessage.message;
    } catch (error) {
      console.error("Error fetching budget:", error);
      setConversationError("Error fetching budget. Please try again.");
      return null;
    }
  };
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
  
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
  
      document.body.appendChild(script);
    });
  };
  
  useEffect(() => {
    if (user?.id && guideId && token) {
      fetchLastBudget(user.id, guideId, token).then((data) => {
        if (data) {
          const extractedBudget = data.replace(/\D/g, ""); // Extract numbers only
          setFormData((prev) => ({ ...prev, budget: extractedBudget }));
        }
      });
    }
  }, [user, guideId, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { startDate, endDate, budget } = formData;
    const today = new Date().toISOString().split("T")[0];

    if (!startDate || !endDate || !budget) {
      toast.error("All fields are required.");
      return false;
    }

    if (startDate < today) {
      toast.error("Start date cannot be in the past.");
      return false;
    }

    if (endDate <= startDate) {
      toast.error("End date should be after the start date.");
      return false;
    }

    if (isNaN(Number(budget)) || Number(budget) <= 0) {
      toast.error("Budget must be a valid positive number.");
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
  
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Razorpay SDK failed to load. Check your internet connection.");
      return;
    }
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: formData.budget }),
      });
  
      const { order } = await res.json();
  
      if (!order) {
        toast.error("Failed to create Razorpay order");
        return;
      }
  
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Public key
        amount: order.amount,
        currency: order.currency,
        name: "TravelerConnect",
        description: "Booking Payment",
        order_id: order.id,
        handler: async function (response: any) {
          console.log("🔹 Razorpay Payment Response:", response);
          if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
            toast.error("Payment verification failed: Missing response parameters.");
            return;
          }
      
          console.log("🔹 Sending data to backend for verification...");
          console.log("🔹 Order ID:", response.razorpay_order_id);
          console.log("🔹 Payment ID:", response.razorpay_payment_id);
          console.log("🔹 Signature:", response.razorpay_signature);
      
          const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });
      
          const verifyData = await verifyRes.json();
          console.log("🔹 Payment Verification Response:", verifyData);
      
          if (verifyData.success) {
            toast.success("Payment successful!");
            router.push(`/`);
          } else {
            toast.error("Payment verification failed.");
          }
        },
        prefill: {
          name: user?.name || "Traveler",
          email: user?.email || "traveler@example.com",
        },
        theme: { color: "#1a202c" },
      };
      
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Something went wrong. Try again.");
    }
  };
  

  return (
    <div>
      <header className="bg-gray-900 text-white py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            TravelerConnect
          </Link>
          <nav>
            <ul className="flex space-x-4">
              <li><Link href="/" className="hover:text-gray-400">Home</Link></li>
              <li><Link href="/profile" className="hover:text-gray-400">Profile</Link></li>
              <li><Link href="/logout" className="hover:text-gray-400">Logout</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-lg">
        <div className="text-2xl py-4 px-6 bg-gray-900 text-white text-center font-bold uppercase">
          Booking Form
        </div>
        <form className="py-4 px-6">
          <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required className="mb-4 w-full px-3 py-2 border rounded" />
          <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} required className="mb-4 w-full px-3 py-2 border rounded" />
          <input type="number" name="budget" value={formData.budget} onChange={handleInputChange} required className="mb-4 w-full px-3 py-2 border rounded" placeholder="Enter Budget" />
          {conversationError && <p className="text-sm text-red-500 mb-4">{conversationError}</p>}
          <button type="button" className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 w-full" onClick={handlePayment}>
            Proceed to Payment
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default BookingForm;
