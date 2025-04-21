"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { Star, Verified, Languages, Activity, MapPin, MessageSquare, Calendar, BadgeCheck, Globe, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import ChatMessageArea from "@/components/ChatMessageArea";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";

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
  rating?: number;
  reviewCount?: number;
}

const GuideProfile = () => {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const guideId = params?.id as string;

  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative w-24 h-24"
        >
          <div className="absolute inset-0 rounded-full border-8 border-t-transparent border-r-transparent border-b-transparent border-l-blue-500/30"></div>
          <div className="absolute inset-4 rounded-full border-8 border-t-transparent border-r-transparent border-b-transparent border-l-purple-500/30 animate-spin animation-delay-200"></div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gradient-to-br from-blue-50 to-purple-50 p-6 text-center">
        <div className="relative w-32 h-32 mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-20"></div>
          <div className="absolute inset-4 bg-white rounded-full shadow-2xl flex items-center justify-center">
            <BadgeCheck className="w-16 h-16 text-purple-500" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Authentication Required</h2>
        <p className="text-gray-600 max-w-md">Please log in to view this guide's profile and access all features</p>
        <button 
          onClick={() => router.push('/login')}
          className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium shadow-md"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-15 animate-float-delay"></div>
        </div>

        {/* Profile Header */}
        <div className="relative h-[500px] w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-purple-100/80 z-10" />
          <Image
            src={guide?.profilePicture || "/default-banner.jpg"}
            alt="Banner"
            fill
            className="object-cover"
            priority
          />
          <div className="relative z-20 h-full flex items-end pb-12 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="relative h-40 w-40 md:h-48 md:w-48 rounded-2xl border-4 border-white shadow-2xl -mb-20 md:mb-0 overflow-hidden"
                >
                  <Image
                    src={guide?.profilePicture || "/default-avatar.jpg"}
                    alt={`${guide?.firstName} ${guide?.lastName}`}
                    fill
                    className="object-cover"
                  />
                  {guide?.isVerified && (
                    <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-full shadow-lg z-20">
                      <Verified className="text-white" size={20} />
                    </div>
                  )}
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                    {guide?.firstName} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{guide?.lastName}</span>
                  </h1>
                  <p className="text-xl text-purple-600 font-medium mb-4">{guide?.role}</p>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                      <MapPin className="text-blue-500" size={18} />
                      <span className="text-sm font-medium text-gray-700">
                        {guide?.state}, {guide?.country}
                      </span>
                    </div>
                    {guide?.rating && (
                      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                        <Star className="text-amber-400" size={18} fill="currentColor" />
                        <span className="text-sm font-medium text-gray-700">
                          {guide.rating.toFixed(1)} <span className="text-gray-500">({guide.reviewCount || 0})</span>
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                      <Award className="text-purple-500" size={18} />
                      <span className="text-sm font-medium text-gray-700">
                        Member since {new Date(guide?.dateJoined || '').getFullYear()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-20 relative z-30">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-1/3 space-y-6">
              {/* Action Buttons */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-xl sticky top-8"
              >
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(`/guides/book_guide/${guideId}`)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                  >
                    <Calendar className="w-5 h-5" />
                    Book Guide
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRequest}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Request Chat
                  </motion.button>
                </div>
              </motion.div>

              {/* Guide Details */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-xl"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Globe className="text-blue-500" /> Guide Details
                </h3>
                
                <div className="space-y-5">
                  {/* Languages */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {guide?.languages?.map((lang, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm border border-blue-100"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Activities */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {guide?.activities?.map((activity, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm border border-purple-100"
                        >
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Verification Status */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${guide?.isVerified ? 'bg-green-100 text-green-500' : 'bg-yellow-100 text-yellow-500'}`}>
                        {guide?.isVerified ? <Verified size={18} /> : <Award size={18} />}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">Verification Status</h4>
                        <p className="text-sm text-gray-600">
                          {guide?.isVerified ? 'Fully verified guide' : 'Not yet verified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="lg:w-2/3">
              {/* Floating Tab Navigation */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white/90 backdrop-blur-lg rounded-2xl overflow-hidden mb-6 border border-gray-200 shadow-xl sticky top-4 z-20"
              >
                <div className="flex overflow-x-auto">
                  {['about', 'reviews', 'chat'].map((tab) => (
                    <motion.button
                      key={tab}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 font-medium text-sm flex-1 whitespace-nowrap transition-colors duration-300 ${
                        activeTab === tab 
                          ? 'text-purple-600 bg-white border-b-2 border-purple-500' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab === 'about' && 'About Guide'}
                      {tab === 'reviews' && 'Reviews'}
                      {tab === 'chat' && 'Direct Chat'}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Tab Content */}
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'about' && (
                    <motion.div
                      key="about"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 border border-gray-200 shadow-xl"
                    >
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">About</span> This Guide
                      </h3>
                      <div className="prose max-w-none">
                        {guide?.bio ? (
                          <div className="space-y-4">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{guide.bio}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                              {guide?.activities?.map((activity, index) => (
                                <motion.div 
                                  key={index}
                                  whileHover={{ y: -5 }}
                                  className="p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-200 transition-colors"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                      <Activity className="w-6 h-6" />
                                    </div>
                                    <span className="font-medium text-gray-800">{activity}</span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-16 text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
                            <Award className="mx-auto mb-6 text-gray-400 w-12 h-12" />
                            <p className="text-xl">This guide hasn't configured their bio yet</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'reviews' && (
                    <motion.div
                      key="reviews"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 border border-gray-200 shadow-xl">
                        <ReviewList entityId={guideId} entityType="guide" />
                      </div>
                      <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 border border-gray-200 shadow-xl">
                        <ReviewForm entityId={guideId} entityType="guide" />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'chat' && (
                    <motion.div
                      key="chat"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 border border-gray-200 shadow-xl"
                    >
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Direct</span> Messaging
                      </h3>
                      <ChatMessageArea guideId={guideId} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delay { animation: float-delay 8s ease-in-out infinite; }
        .animation-delay-200 { animation-delay: 0.2s; }
      `}</style>
    </>
  );
};

export default GuideProfile;