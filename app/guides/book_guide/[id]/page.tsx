"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

const BookingForm = () => {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    price: "",
    selectedActivities: [],
    message: "",
  });
  const [activities, setActivities] = useState([]);
  const guideId = params.id;

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/activities`
        );
        if (response.ok) {
          const data = await response.json();
          setActivities(data);
        } else {
          toast.error("Failed to fetch activities.");
        }
      } catch (error) {
        toast.error("Error fetching activities.");
      }
    };

    const fetchBudgetPrice = async () => {
      if (!user || !guideId) return;

      try {
        const convResponse = await fetch(
          `http://localhost:5000/api/chats/conversation/${user.id}/${guideId}`
        );

        if (convResponse.ok) {
          const { conversationId } = await convResponse.json();
          const budgetResponse = await fetch(
            `http://localhost:5000/api/chats/conversations/${conversationId}/lastBudget`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (budgetResponse.ok) {
            const { message } = await budgetResponse.json();
            const budget = message.split("@budget ")[1];
            setFormData((prevData) => ({
              ...prevData,
              price: budget || "",
            }));
          }
        }
      } catch {
        toast.error("Error fetching the last budget.");
      }
    };

    fetchActivities();
    fetchBudgetPrice();
  }, [guideId, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleActivityChange = (e) => {
    const activityId = e.target.value;
    const isChecked = e.target.checked;

    setFormData((prevData) => ({
      ...prevData,
      selectedActivities: isChecked
        ? [...prevData.selectedActivities, activityId]
        : prevData.selectedActivities.filter((id) => id !== activityId),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("You need to be logged in to make a booking.");
      return;
    }

    const bookingData = {
      userId: user.id,
      guideId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      price: formData.price,
      activities: formData.selectedActivities,
  
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bookings`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData),
        }
      );

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
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            required
            className="shadow border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">End Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            required
            className="shadow border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            className="shadow border rounded w-full py-2 px-3 text-gray-700"
            placeholder="Auto-filled Budget Price"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Activities</label>
          <div className="flex flex-wrap gap-4">
            {activities.map((activity) => (
              <div key={activity._id} className="flex items-center">
                <input
                  type="checkbox"
                  value={activity._id}
                  onChange={handleActivityChange}
                  className="h-4 w-4 text-primary"
                />
                <label className="ml-2 text-gray-800">{activity.activityName}</label>
              </div>
            ))}
          </div>
        </div>

     

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-gray-900 text-white py-2 px-4 rounded hover:bg-gray-800"
          >
            Submit Booking
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
