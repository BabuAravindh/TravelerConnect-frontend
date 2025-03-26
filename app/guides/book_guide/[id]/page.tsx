"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Footer } from "@/components/Footer";

const BookingForm = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<"online" | "cash">("online");
  const [conversationError, setConversationError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    budget: "",
  });

  const guideId = params.id;
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token retrieved from localStorage:", token);
    setToken(token);
  }, []);

  const fetchLastBudget = async (userId: string, guideId: string, token: string): Promise<string | null> => {
    console.log("Fetching last budget for user:", userId, "guide:", guideId);
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
          console.log("No conversation found between user and guide");
          setConversationError("No conversation found. Please start a chat with the guide.");
          return null;
        }
        throw new Error(`Failed to fetch conversation: ${conversationRes.statusText}`);
      }

      const conversationData = await conversationRes.json();
      console.log("Conversation data:", conversationData);

      const budgetRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chats/conversations/${conversationData.conversationId}/lastBudget`,
        { method: "GET", headers: { Authorization: `Bearer ${token}` } }
      );

      if (!budgetRes.ok) {
        if (budgetRes.status === 404) {
          console.log("No budget found in conversation");
          setConversationError("No budget found. Discuss the budget with the guide.");
          return null;
        }
        throw new Error(`Failed to fetch last budget: ${budgetRes.statusText}`);
      }

      const lastBudgetMessage = await budgetRes.json();
      console.log("Last budget message:", lastBudgetMessage);
      return lastBudgetMessage.message;
    } catch (error) {
      console.error("Error fetching budget:", error);
      setConversationError("Error fetching budget. Please try again.");
      return null;
    }
  };

  const createBooking = async (paymentType: "online" | "cash"): Promise<string | null> => {
    console.log("Creating booking with payment type:", paymentType);
    if (!user?.id || !guideId) {
      console.error("User or Guide ID is missing");
      toast.error("User or Guide ID is missing.");
      return null;
    }

    const bookingPayload = {
      userId: user.id,
      guideId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      budget: formData.budget,
      places: ["Goa", "Mumbai"],
      duration: 5,
      status: paymentType === "cash" ? "pending" : "confirmed",
      paymentMode: paymentType,
      paymentStatus: paymentType === "cash" ? "pending" : "paid",
    };

    console.log("Booking payload:", bookingPayload);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingPayload),
      });

      const data = await response.json();
      console.log("Booking creation response:", data);

      if (data.message === "Booking created successfully!") {
        console.log("Booking created successfully with ID:", data.booking._id);
        toast.success("Booking created successfully!");
        return data.booking._id;
      } else {
        console.error("Failed to create booking:", data);
        toast.error("Failed to create booking.");
        return null;
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Something went wrong. Try again.");
      return null;
    }
  };

  const loadRazorpayScript = () => {
    console.log("Loading Razorpay script...");
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        console.log("Razorpay already loaded");
        return resolve(true);
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        console.log("Razorpay script loaded successfully");
        resolve(true);
      };
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
        toast.error("Failed to load Razorpay. Check your connection.");
        reject(false);
      };

      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    if (user?.id && guideId && token) {
      console.log("Fetching last budget for user:", user.id, "guide:", guideId);
      fetchLastBudget(user.id, guideId, token).then((data) => {
        if (data) {
          const extractedBudget = data.replace(/\D/g, "");
          console.log("Extracted budget:", extractedBudget);
          setFormData((prev) => ({ ...prev, budget: extractedBudget }));
        }
      });
    }
  }, [user, guideId, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log("Form field changed:", name, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    console.log("Validating form data:", formData);
    const { startDate, endDate, budget } = formData;
    const today = new Date().toISOString().split("T")[0];

    if (!startDate || !endDate || !budget) {
      console.error("Validation failed: All fields are required");
      toast.error("All fields are required.");
      return false;
    }

    if (startDate < today) {
      console.error("Validation failed: Start date in past");
      toast.error("Start date cannot be in the past.");
      return false;
    }

    if (endDate <= startDate) {
      console.error("Validation failed: End date before start date");
      toast.error("End date should be after the start date.");
      return false;
    }

    if (isNaN(Number(budget)) || Number(budget) <= 0) {
      console.error("Validation failed: Invalid budget");
      toast.error("Budget must be a valid positive number.");
      return false;
    }

    console.log("Form validation successful");
    return true;
  };

  const handlePayment = async () => {
    console.log("Payment initiated with mode:", paymentMode);
    if (!validateForm()) return;
  
    if (paymentMode === "cash") {
      console.log("Processing cash payment...");
      const bookingId = await createBooking("cash");
      if (bookingId) {
        console.log("Cash booking successful. Redirecting to booking:", bookingId);
        router.push(`/bookings/${bookingId}`);
      }
      return;
    }
  
    console.log("Processing online payment...");
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      return;
    }

    try {
      console.log("Creating booking record for online payment...");
      const newBookingId = await createBooking("online");
      if (!newBookingId) {
        return;
      }
      setBookingId(newBookingId);
      console.log("Booking ID stored for payment:", newBookingId);

      console.log("Creating payment order for booking:", newBookingId);
      const orderPayload = { 
        amount: formData.budget, 
        currency: "INR",
        bookingId: newBookingId
      };
      console.log("Order creation payload:", orderPayload);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      
      const orderData = await res.json();
      console.log("Order creation response:", orderData);

      if (!orderData.order) {
        toast.error("Failed to create Razorpay order");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "TravelerConnect",
        description: `Booking Payment (ID: ${newBookingId})`,
        order_id: orderData.order.id,
        handler: async function (response: any) {
          console.log("Razorpay payment response received:", response);
          console.log("Verifying payment for booking:", newBookingId);
          
          const verificationPayload = {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            bookingId: newBookingId
          };
          console.log("Payment verification payload:", verificationPayload);

          try {
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(verificationPayload),
            });
        
            const verifyData = await verifyRes.json();
            console.log("Payment verification response:", verifyData);
        
            if (verifyData.success) {
              console.log("Payment verified successfully for booking:", newBookingId);
              toast.success("Payment successful!");
              router.push(`/bookings/${newBookingId}`);
            } else {
              console.error("Payment verification failed for booking:", newBookingId);
              toast.error("Payment verification failed.");
            }
          } catch (error) {
            console.error("Verification error for booking:", newBookingId, error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user?.name || "Traveler",
          email: user?.email || "traveler@example.com",
        },
        theme: { color: "#1a202c" },
      };
      
      console.log("Opening Razorpay payment dialog with options:", options);
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error("Payment processing error:", error);
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
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            required
            className="mb-4 w-full px-3 py-2 border rounded"
          />
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            required
            className="mb-4 w-full px-3 py-2 border rounded"
          />
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleInputChange}
            required
            className="mb-4 w-full px-3 py-2 border rounded"
            placeholder="Enter Budget"
            readOnly
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <select
              value={paymentMode}
              onChange={(e) => {
                console.log("Payment mode changed to:", e.target.value);
                setPaymentMode(e.target.value as "online" | "cash");
              }}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="online">Online Payment (Razorpay)</option>
              <option value="cash">Cash on Hand</option>
            </select>
          </div>

          {conversationError && (
            <p className="text-sm text-red-500 mb-4">{conversationError}</p>
          )}
          <button
            type="button"
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 w-full"
            onClick={handlePayment}
          >
            Proceed to Payment
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default BookingForm;