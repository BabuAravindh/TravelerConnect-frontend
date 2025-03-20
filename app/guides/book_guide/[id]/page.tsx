"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

const BookingForm = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    price: "",
    budget: "", // Budget Field
    selectedActivities: [],
    state: "",
    message: "",
  });


  const guideId = params.id;

  useEffect(() => {
    setToken(localStorage.getItem("token") || null);
  }, []);

  
  const fetchLastBudget = async (userId: string, guideId: string, token: string) => {
    try {
      if (!token) throw new Error("Authentication token is missing");

      const conversationRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chats/conversation/${userId}/${guideId}`,
        { method: "GET", headers: { Authorization: `Bearer ${token}` } }
      );

      if (!conversationRes.ok) throw new Error("Failed to fetch conversation");
      const { conversationId } = await conversationRes.json();

      const budgetRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chats/conversations/${conversationId}/lastBudget`,
        { method: "GET", headers: { Authorization: `Bearer ${token}` } }
      );

      if (!budgetRes.ok) throw new Error("Failed to fetch last budget message");
      const lastBudgetMessage = await budgetRes.json();

      console.log("Last Budget Message:", lastBudgetMessage);

      return lastBudgetMessage.message;
    } catch (error) {
      console.error("Error fetching last budget:", error);
      return null;
    }
  };

  useEffect(() => {
    if (user?.id && guideId && token) {
      fetchLastBudget(user.id, guideId, token).then((data) => {
        if (data) {
          const extractedBudget = data.replace(/\D/g, ""); // Extracts only numbers
          setFormData((prev) => ({ ...prev, budget: extractedBudget }));
        }
      });
    }
  }, [user, guideId, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

 

  const validateForm = () => {
    const { startDate, endDate, price, budget, selectedActivities, state } = formData;
    const today = new Date().toISOString().split("T")[0];

    if (!startDate || !endDate  || !budget ) {
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
      toast.error("Price and Budget must be valid positive numbers.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("You need to be logged in to make a booking.");
      return;
    }

    if (!validateForm()) return;

    const bookingData = {
      userId: user.id,
      guideId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      budget: formData.budget,
      status: "pending",
      paymentStatus: "pending",
    };

    console.log("Submitting Booking Data:", bookingData);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        toast.success("Booking request sent successfully!");
        router.push(`/guide-profile/${guideId}`);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to send booking request: ${errorData.message}`);
      }
    } catch {
      toast.error("Failed to send booking request.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="text-2xl py-4 px-6 bg-gray-900 text-white text-center font-bold uppercase">
        Booking Form
      </div>
      <form className="py-4 px-6" onSubmit={handleSubmit}>
        <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required className="mb-4 w-full px-3 py-2 border rounded" />
        <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} required className="mb-4 w-full px-3 py-2 border rounded" />
      
        <input type="number" name="budget" value={formData.budget} onChange={handleInputChange} required className="mb-4 w-full px-3 py-2 border rounded" placeholder="Enter Budget" />
       
        <button type="submit" className="bg-gray-900 text-white py-2 px-4 rounded hover:bg-gray-800 w-full">Submit Booking</button>
      </form>
    </div>
  );
};

export default BookingForm;
