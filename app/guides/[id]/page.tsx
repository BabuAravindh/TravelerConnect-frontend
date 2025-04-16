"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { Star, Verified, Languages, Activity, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import ChatMessageArea from "@/components/ChatMessageArea";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import Chatbot from "@/components/ChatBot";

interface Guide {
  _id?: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePicture?: string;
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
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/guide/profile/${guideId}`);
        setGuide(res.data);
      } catch (error) {
        console.error("Error fetching guide:", error);
      } finally {
        setLoading(false);
      }
    };

    if (guideId) fetchGuide();
  }, [guideId]);

  const handleRequest = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to send a request.");
      return;
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/requests`, {
        customerId: user.id,
        guideId: guideId,
        paymentStatus: "pending",
      });
      toast.success(response.data?.message || "Request sent to the guide!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-2xl font-semibold">Please log in to view this page</h2>
        <button 
          onClick={() => router.push('/login')}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <div className="relative h-96 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 z-10" />
          <Image
            src={guide?.profilePicture || "/default-banner.jpg"}
            alt="Banner"
            fill
            className="object-cover"
            priority
          />
          <div className="relative z-20 h-full flex items-center justify-center">
            <div className="text-center px-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {guide?.firstName} {guide?.lastName}
              </h1>
              <div className="flex items-center justify-center gap-2">
                <MapPin className="text-white" size={20} />
                <p className="text-xl text-white">
                  {guide?.state}, {guide?.country}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-8">
                <div className="p-6">
                  <div className="flex justify-center -mt-20 mb-4">
                    <div className="relative h-40 w-40 rounded-full border-4 border-white shadow-lg mt-20">
                      <Image
                        src={guide?.profilePicture || "/default-avatar.jpg"}
                        alt={`${guide?.firstName} ${guide?.lastName}`}
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {guide?.firstName} {guide?.lastName}
                    </h2>
                    <p className="text-gray-600">{guide?.role}</p>
                    
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Verified className={`${guide?.isVerified ? 'text-blue-500' : 'text-gray-400'}`} size={18} />
                      <span className="text-sm font-medium">
                        {guide?.isVerified ? "Verified Guide" : "Not Verified"}
                      </span>
                    </div>
                    
                    <div className="mt-6 flex flex-col gap-3">
                      <button
                        onClick={() => router.push(`/guides/book_guide/${guideId}`)}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition"
                      >
                        Book Guide
                      </button>
                      <button
                        onClick={handleRequest}
                        className="w-full bg-button hover:bg-opacity-90 text-white font-medium py-2 px-4 rounded-lg transition"
                      >
                        Request Chat
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Languages className="text-gray-500" size={18} />
                    <div>
                      <h4 className="font-medium text-gray-900">Languages</h4>
                      <p className="text-gray-600 text-sm">
                        {guide?.languages?.join(", ") || "Not specified"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Activity className="text-gray-500" size={18} />
                    <div>
                      <h4 className="font-medium text-gray-900">Activities</h4>
                      <p className="text-gray-600 text-sm">
                        {guide?.activities?.join(", ") || "No activities listed"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="lg:w-2/3 space-y-8">
              {/* About Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">About Me</h3>
                <p className="text-gray-700 leading-relaxed">
                  {guide?.bio || "This guide hasn't written a bio yet."}
                </p>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
              
                <ReviewList entityId={guideId} entityType="guide" />
              </div>

              {/* Leave a Review */}
              <div className="bg-white rounded-xl shadow-md p-6">
               
                <ReviewForm entityId={guideId} entityType="guide" />
              </div>

              {/* Chat Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Chat with Guide</h3>
                <ChatMessageArea guideId={guideId} />
              </div>
            </div>
          </div>
        </div>

   
        <Footer />
      </div>
    </>
  );
};

export default GuideProfile;