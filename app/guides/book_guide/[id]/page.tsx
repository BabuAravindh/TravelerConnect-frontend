"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

const BookingForm = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    price: "",
    budget: "", // Added Budget Field
    selectedActivities: [],
    state: "",
    message: "",
  });
  const [activities, setActivities] = useState([]);
  const [states, setStates] = useState([]);
  const guideId = params.id;

  useEffect(() => {
    const fetchStatesAndActivities = async () => {
      try {
        // Fetch states
        const stateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/state`);
        if (stateResponse.ok) {
          const stateData = await stateResponse.json();
          setStates(stateData);
        } else {
          toast.error("Failed to fetch states.");
        }

        // Fetch all activities
        const activityResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities`);
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setActivities(activityData);
        } else {
          toast.error("Failed to fetch activities.");
        }
      } catch (error) {
        toast.error("Error fetching data.");
      }
    };

    fetchStatesAndActivities();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleActivityChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      selectedActivities: checked
        ? [...prev.selectedActivities, value]
        : prev.selectedActivities.filter((activity) => activity !== value),
    }));
  };

  const validateForm = () => {
    const { startDate, endDate, price, budget, selectedActivities, state } = formData;
    const today = new Date().toISOString().split("T")[0];

    if (!startDate || !endDate || !price || !budget || selectedActivities.length === 0 || !state) {
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

    if (isNaN(price) || Number(price) <= 0 || isNaN(budget) || Number(budget) <= 0) {
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
      price: formData.price,
      budget: formData.budget, // Sending Budget
      state: formData.state,
      activities: formData.selectedActivities,
      status: "pending",
      paymentStatus: "pending",
    };

    console.log("Submitting Booking Data:", bookingData); // Debug Log

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          required
          className="mb-4 w-full px-3 py-2 border rounded"
          placeholder="Enter Price"
        />
        <input
          type="number"
          name="budget"
          value={formData.budget}
          onChange={handleInputChange}
          required
          className="mb-4 w-full px-3 py-2 border rounded"
          placeholder="Enter Budget"
        />
        <select
          name="state"
          value={formData.state}
          onChange={handleInputChange}
          required
          className="mb-4 w-full px-3 py-2 border rounded"
        >
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state._id} value={state._id}>
              {state.stateName}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-gray-900 text-white py-2 px-4 rounded hover:bg-gray-800 w-full"
        >
          Submit Booking
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
