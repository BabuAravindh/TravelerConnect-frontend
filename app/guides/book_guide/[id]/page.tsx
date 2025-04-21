"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import Select from "react-select";

interface Activity {
  label: string;
  value: string;
}

interface Location {
  label: string;
  value: string;
}

const BookingForm = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [conversationError, setConversationError] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [bookingConflict, setBookingConflict] = useState<{
    show: boolean;
    dates?: { start: string; end: string };
  }>({ show: false });

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    budget: "",
    pickupLocation: "",
    dropoffLocation: "",
    activities: [] as string[],
  });

  const locationOptions: Location[] = [
    { label: "Bus Stand", value: "Bus Stand" },
    { label: "Airport", value: "Airport" },
    { label: "Railway Station", value: "Railway Station" },
  ];

  const guideId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(token);
  }, []);

  // Fetch guide's activities
  useEffect(() => {
    const fetchGuideActivities = async () => {
      try {
        if (!guideId) return;
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/guide/profile/${guideId}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch guide profile");
        }
        
        const guideData = await response.json();
        const guideActivities = guideData.activities || [];
        
        const activityOptions = guideActivities.map((activity: string) => ({
          label: activity,
          value: activity
        }));
        
        setActivities(activityOptions);
      } catch (error) {
        console.error("Error fetching guide activities:", error);
        toast.error("Failed to load guide's activities");
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchGuideActivities();
  }, [guideId]);

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

      const conversationData = await conversationRes.json();

      const budgetRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chats/conversations/${conversationData.conversationId}/lastBudget`,
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

  const createBooking = async () => {
    if (!user?.id || !guideId) {
      toast.error("User or Guide ID is missing.");
      return null;
    }

    const bookingPayload = {
      userId: user.id,
      guideId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      budget: formData.budget,
      pickupLocation: formData.pickupLocation,
      dropoffLocation: formData.dropoffLocation,
      activities: formData.activities,
      status: "pending",
      paymentStatus: "pending",
    };

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

      if (!response.ok) {
        if (data.message === "Guide is already booked for the selected dates") {
          setBookingConflict({
            show: true,
            dates: data.conflictingDates,
          });
          return null;
        }
        throw new Error(data.message || "Failed to create booking");
      }

      toast.success("Booking created successfully!");
      return data.booking._id;
    } catch (error) {
      console.error("Error creating booking:", error);
      if (!(error instanceof Error && error.message.includes("already booked"))) {
        toast.error("Something went wrong. Try again.");
      }
      return null;
    }
  };

  useEffect(() => {
    if (user?.id && guideId && token) {
      fetchLastBudget(user.id, guideId, token).then((data) => {
        if (data) {
          const extractedBudget = data.replace(/\D/g, "");
          setFormData((prev) => ({ ...prev, budget: extractedBudget }));
        }
      });
    }
  }, [user, guideId, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear conflict message when dates change
    if (name === "startDate" || name === "endDate") {
      setBookingConflict({ show: false });
    }
  };

  const handleLocationChange = (name: string) => (selectedOption: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : ""
    }));
  };

  const handleActivitiesChange = (selectedOptions: any) => {
    setSelectedActivities(selectedOptions || []);
    setFormData(prev => ({
      ...prev,
      activities: selectedOptions ? selectedOptions.map((opt: any) => opt.value) : []
    }));
  };

  const validateForm = () => {
    const { startDate, endDate, budget, pickupLocation, dropoffLocation } = formData;
    const today = new Date().toISOString().split("T")[0];

    if (!startDate || !endDate || !budget || !pickupLocation || !dropoffLocation) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingConflict({ show: false }); // Reset conflict message
    
    if (!validateForm()) return;

    const bookingId = await createBooking();
    if (bookingId) {
      router.push(`/bookings/${bookingId}`);
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
        
        {/* Booking conflict message */}
        {bookingConflict.show && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mx-6 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  The guide is already booked from {new Date(bookingConflict.dates?.start || '').toLocaleDateString()} to {new Date(bookingConflict.dates?.end || '').toLocaleDateString()}. 
                  Please choose different dates or contact the guide for availability.
                </p>
              </div>
            </div>
          </div>
        )}

        <form className="py-4 px-6" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Pickup Location</label>
            <Select
              options={locationOptions}
              value={locationOptions.find(option => option.value === formData.pickupLocation) || null}
              onChange={handleLocationChange("pickupLocation")}
              placeholder="Select pickup location..."
              className="basic-single-select"
              classNamePrefix="select"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Dropoff Location</label>
            <Select
              options={locationOptions}
              value={locationOptions.find(option => option.value === formData.dropoffLocation) || null}
              onChange={handleLocationChange("dropoffLocation")}
              placeholder="Select dropoff location..."
              className="basic-single-select"
              classNamePrefix="select"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Budget</label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter budget"
              readOnly
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Select Activities</label>
            <Select
              options={activities}
              value={selectedActivities}
              onChange={handleActivitiesChange}
              isMulti
              isLoading={loadingActivities}
              placeholder={loadingActivities ? "Loading activities..." : "Select activities..."}
              className="basic-multi-select"
              classNamePrefix="select"
            />
          </div>

          {conversationError && (
            <p className="text-sm text-red-500 mb-4">{conversationError}</p>
          )}
          
          <button
            type="submit"
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 w-full"
          >
            Create Booking
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default BookingForm;