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
import { useAuth } from "@/context/AuthContext";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList"
import Chatbot from "@/components/ChatBot";
interface Guide {

  _id?: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePic?: string;
  bio: string;
  isVerified: boolean;
  gender: string;
  dateJoined: string;
  state: string;
  country: string;
  activities: string[];
  languages: string[];
}

const GuideProfile = () => {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const guideId = params?.id as string;

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

  if (authLoading || loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return <p className="text-center mt-10">User not authenticated</p>;

  const handleRequest = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to send a request.");
      return;
    }

    const requestData = {
      customerId: user.id,
      guideId: guideId,
      paymentStatus: "pending",
    };

    try {
      const response = await axios.post("http://localhost:5000/api/requests", requestData);

      if (response.data?.message === "You have already sent a request. Try again later.") {
        toast.success(response.data.message);
      } else {
        toast.success("Request sent to the guide!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request.");
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
              src="https://picsum.photos/1200/320"
              alt="Banner Image"
              width={1200}
              height={320}
              className="w-full h-full object-cover rounded-3xl"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                {guide?.firstName} {guide?.lastName}
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
                  alt={`${guide?.firstName} ${guide?.lastName}`}
                  width={250}
                  height={250}
                  className="object-cover w-60 h-60 rounded-full border-4 border-gray-300"
                />
              </div>

              {/* Guide Details */}
              <div className="md:w-2/3 flex flex-col justify-center text-gray-900">
                <h2 className="text-4xl font-bold mb-2">{guide?.firstName} {guide?.lastName}</h2>
                <p className="text-lg text-gray-700 mb-1">📍 {guide?.state}, {guide?.country}</p>
                <p className="text-lg text-gray-700 mb-1">🛠 Role: {guide?.role?.toUpperCase()}</p>

                <div className="flex items-center gap-2 mt-2">
                  <Star className="text-yellow-500" size={30} />
                  <span className="text-2xl font-semibold">⭐ {guide?.isVerified ? "Verified Guide" : "Not Verified"}</span>
                </div>

                <p className="text-lg leading-relaxed mt-4 mb-6 text-gray-600">{guide?.bio}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                    <h4 className="text-lg font-semibold">🗣 Languages</h4>
                    <p className="text-gray-600">{guide?.languages?.join(", ") || "Not specified"}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                    <h4 className="text-lg font-semibold">🎭 Activities</h4>
                    <p className="text-gray-600">{guide?.activities?.join(", ") || "No activities listed"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Book Guide & Request Chat Buttons */}
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => router.push(`/guides/book_guide/${guideId}`)}
                className="bg-button hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition"
              >
                📅 Book Guide
              </button>

              <button
                onClick={handleRequest}
                className="bg-primary bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition"
              >
                💬 Request Chat with Guide
              </button>
            </div>
          </div>
        </div>
        <Chatbot/>
        {/* Chat System */}
        <div className=" mx-auto max-w-5xl w-full  mt-10 ">
          <ChatMessageArea guideId={guideId} />
        </div>
        <div className="mx-auto max-w-5xl w-full mt-20">
        <ReviewForm guideId={guideId}/>
        <ReviewList guideId={guideId}/>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default GuideProfile;
