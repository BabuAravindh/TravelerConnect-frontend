"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import ChatMessageArea from "@/components/ChatMessageArea";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext"; // ✅ Using only useAuth()

interface Guide {
  _id: string;
  name: string;
  email: string;
  role: string;
  profilePic: string;
  bio: string;
  experience: string;
  location: string;
  languages: string;
  specialization: string;
  availability: string;
  pricePerTour: string;
  rating: number;
  bannerImage: string;
  services: { name: string; description: string }[];
}

const GuideProfile = () => {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // ✅ Get user from AuthContext
  const guideId = params?.id as string; // Guide ID from URL

  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/guide/profile/${guideId}`);
        setGuide(res.data);
      } catch (error) {
        console.error("Error fetching guide:", error);
      } finally {
        setLoading(false);
      }
    };

    if (guideId) fetchGuide();
  }, [guideId]);

  if (authLoading || loading) return <p>Loading...</p>; // ✅ Prevent UI rendering while loading
  if (!user) return <p>User not authenticated</p>; // ✅ Handle unauthenticated state

  const handleRequest = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to send a request.");
      return;
    }
  
    const requestData = {
      customerId: user.id, // ✅ User ID from AuthContext
      guideId: guideId, // ✅ Guide ID from URL
      paymentStatus: "pending",
    };
  
    console.log("Sending request with data:", requestData); // ✅ Log before sending
  
    try {
      const response = await axios.post("http://localhost:5000/api/requests", requestData);
  
      toast.success("Request sent to the guide!");
      console.log("Request Created:", response.data);
    } catch (error) {
      toast.error("Failed to send request.");
      console.error("Error:", error);
    }
  };
  

  return (
    <>
      <Navbar />
      <div className="bg-gray-100 min-h-screen py-12 px-6 md:px-12 flex flex-col items-center">
        <div className="relative w-full">
          {/* Banner Image */}
          <div className="absolute inset-0 h-96 w-full overflow-hidden rounded-3xl shadow-xl">
            <Image
              src={guide?.bannerImage || "https://picsum.photos/1200/320"}
              alt={`${guide?.name} banner`}
              width={1200}
              height={320}
              className="w-full h-full object-cover rounded-3xl"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                {guide?.name}
              </h1>
            </div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 max-w-5xl w-full mx-auto mt-40 bg-white shadow-xl rounded-3xl p-10">
            <div className="flex flex-col md:flex-row gap-12">
              {/* Profile Picture */}
              <div className="md:w-1/3 flex justify-center">
                <Image
                  src={guide?.profilePic || "https://picsum.photos/500"}
                  alt={guide?.name}
                  width={250}
                  height={250}
                  className="object-cover w-60 h-60 rounded-full border-4 border-gray-300"
                />
              </div>

              {/* Guide Details */}
              <div className="md:w-2/3 flex flex-col justify-center text-gray-900">
                <h2 className="text-4xl font-bold mb-2">{guide?.name}</h2>
                <p className="text-lg text-gray-700 mb-1">📧 {guide?.email}</p>
                <p className="text-lg text-gray-700 mb-1">📍 {guide?.location}</p>
                <p className="text-lg text-gray-700 mb-1">🛠 Role: {guide?.role?.toUpperCase()}</p>

                <div className="flex items-center gap-2 mt-2">
                  <Star className="text-yellow-500" size={30} />
                  <span className="text-2xl font-semibold">{guide?.rating}</span>
                </div>

                <p className="text-lg leading-relaxed mt-4 mb-6 text-gray-600">{guide?.bio}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "💼 Experience", value: guide?.experience },
                    { label: "🗣 Languages", value: guide?.languages },
                    { label: "🏔 Specialization", value: guide?.specialization },
                    { label: "📅 Availability", value: guide?.availability },
                    { label: "💰 Price Per Tour", value: guide?.pricePerTour },
                  ].map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-md">
                      <h4 className="text-lg font-semibold">{item.label}</h4>
                      <p className="text-gray-600">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Services Offered */}
            <div className="mt-8 bg-gray-50 p-6 rounded-xl shadow-md border border-gray-200">
              <h3 className="text-2xl font-semibold mb-3">Services Offered</h3>
              {guide?.services?.length ? (
                guide.services.map((service, index) => (
                  <div key={index} className="p-4 bg-white rounded-lg shadow-md mb-2">
                    <h4 className="font-medium text-lg">{service.name}</h4>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No services listed.</p>
              )}
            </div>

            {/* Book Guide & Request Chat Buttons */}
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => router.push(`/book-guide/${guideId}`)}
                className="bg-button hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition"
              >
                📅 Book Guide
              </button>

              <button
                onClick={handleRequest}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition"
              >
                💬 Request Chat with Guide
              </button>
            </div>
          </div>
        </div>

        {/* Chat System */}
        <div className="max-w-5xl w-full mx-auto mt-10">
          <ChatMessageArea guideId={guideId} />
        </div>
      </div>

      <Footer />
    </>
  );
};

export default GuideProfile;
