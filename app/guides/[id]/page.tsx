"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { Star, Verified, Languages, Activity, MapPin, Calendar, BadgeCheck, Globe, Award, User, BookOpen, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import ChatMessageArea from "@/components/ChatMessageArea";
import { useAuth } from "@/context/AuthContext";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import { Guide } from "./GuiteTypes";

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

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative w-32 h-32"
        >
          <div className="absolute inset-0 rounded-full border-8 border-t-transparent border-r-transparent border-b-transparent border-l-primary/50"></div>
          <div className="absolute inset-4 rounded-full border-8 border-t-transparent border-r-transparent border-b-transparent border-l-button/50 animate-spin animation-delay-200"></div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 bg-gray-100 p-8 text-center">
        <div className="relative w-40 h-40 mb-10">
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl opacity-40"></div>
          <div className="absolute inset-4 bg-white rounded-full shadow-lg flex items-center justify-center">
            <BadgeCheck className="w-20 h-20 text-button" />
          </div>
        </div>
        <h2 className="text-4xl font-bold text-gray-900">Authentication Required</h2>
        <p className="text-lg text-gray-600 max-w-lg">Please log in to view this guide&apos;s profile and access all features</p>
        <button 
          onClick={() => router.push('/login')}
          className="mt-8 px-10 py-4 bg-primary text-white rounded-md hover:bg-button transition-all duration-300 transform hover:scale-105 font-semibold text-lg shadow-md"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen relative">
        {/* Profile Header */}
        <div className="relative h-[600px] w-full overflow-hidden bg-primary">
          <Image
            src={guide?.profilePicture || "/default-banner.jpg"}
            alt="_banner"
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-black/30 z-10" />
          <div className="relative z-20 h-full flex items-center justify-center px-6 sm:px-8 lg:px-12">
            <div className="container mx-auto text-center">
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative inline-block h-48 w-48 md:h-64 md:w-64 rounded-full border-8 border-white shadow-lg overflow-hidden mb-6"
              >
                <Image
                  src={guide?.profilePicture || "/default-avatar.jpg"}
                  alt={`${guide?.firstName} ${guide?.lastName}`}
                  fill
                  className="object-cover"
                />
                {guide?.isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md z-20">
                    <Verified className="text-button" size={24} fill="currentColor" />
                  </div>
                )}
              </motion.div>
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                  {guide?.firstName} {guide?.lastName}
                </h1>
                <p className="text-2xl text-gray-200 font-semibold mt-2">{guide?.role}</p>
                <button 
                  onClick={() => router.push(`/guides/book_guide/${guideId}`)}
                  className="mt-6 px-8 py-4 bg-button text-white rounded-md hover:bg-primary transition-all duration-300 transform hover:scale-105 font-semibold text-lg shadow-md"
                >
                  <Calendar className="inline mr-2" size={20} /> Book Now
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-16">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar */}
            <div className="lg:w-1/3 space-y-8">
              {/* Verification Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white border-l-4 border-primary shadow-md p-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Verified size={28} className="text-button" />
                  <h3 className="text-2xl font-bold text-gray-900">Verification</h3>
                </div>
                <div className="flex items-center gap-6">
                  <div className={`p-3 rounded-full ${guide?.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {guide?.isVerified ? <Verified size={24} /> : <User size={24} />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900">Status</h4>
                    <p className="text-base text-gray-600">
                      {guide?.isVerified ? 'Verified Guide' : 'Verification Pending'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Languages Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white border-l-4 border-primary shadow-md p-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Languages size={28} className="text-button" />
                  <h3 className="text-2xl font-bold text-gray-900">Languages</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {guide?.languages?.map((lang, index) => (
                    <span 
                      key={index} 
                      className="px-4 py-2 bg-primary/10 text-primary rounded-md text-base font-medium hover:bg-primary/20 transition-colors"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Specialties Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="bg-white border-l-4 border-primary shadow-md p-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Award size={28} className="text-button" />
                  <h3 className="text-2xl font-bold text-gray-900">Specialties</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {guide?.activities?.map((activity, index) => (
                    <span 
                      key={index} 
                      className="px-4 py-2 bg-button/10 text-button rounded-md text-base font-medium hover:bg-button/20 transition-colors"
                    >
                      {activity}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="lg:w-2/3">
              {/* Tab Navigation */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white border-b-4 border-primary shadow-md sticky top-6 z-20 mb-8"
              >
                <div className="flex overflow-x-auto">
                  {[
                    { id: 'about', icon: <User size={24} />, label: 'About' },
                    { id: 'reviews', icon: <Star size={24} />, label: 'Reviews' },
                    { id: 'chat', icon: <MessageSquare size={24} />, label: 'Chat' }
                  ].map((tab) => (
                    <motion.button
                      key={tab.id}
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 px-6 py-4 font-semibold text-lg flex items-center justify-center gap-3 transition-colors duration-300 ${
                        activeTab === tab.id 
                          ? 'text-primary bg-primary/10 border-b-4 border-primary' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Tab Content */}
              <div className="space-y-8">
                <AnimatePresence mode="wait">
                  {activeTab === 'about' && (
                    <motion.div
                      key="about"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                      className="bg-white shadow-md p-10"
                    >
                      <div className="flex items-center gap-6 mb-8">
                        <BookOpen size={32} className="text-primary" />
                        <h3 className="text-3xl font-extrabold text-gray-900">
                          About <span className="text-primary">{guide?.firstName}</span>
                        </h3>
                      </div>
                      <div className="prose max-w-none text-base text-gray-600">
                        {guide?.bio ? (
                          <div className="space-y-6">
                            <p className="leading-relaxed whitespace-pre-line">{guide.bio}</p>
                            <div className="mt-8">
                              <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                                <MapPin size={24} className="text-primary" /> Location
                              </h4>
                              <div className="flex items-center gap-4 bg-gray-50 p-6 border-l-4 border-primary">
                                <Globe size={28} className="text-button" />
                                <div>
                                  <p className="font-semibold text-lg text-gray-900">
                                    {guide?.state}, {guide?.country}
                                  </p>
                                  <p className="text-base text-gray-600">
                                    Member since {new Date(guide?.dateJoined || '').getFullYear()}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="mt-8">
                              <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                                <Activity size={24} className="text-primary" /> Specialized Activities
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {guide?.activities?.map((activity, index) => (
                                  <motion.div 
                                    key={index}
                                    whileHover={{ scale: 1.02 }}
                                    className="p-4 bg-gray-50 border-l-4 border-primary flex items-center gap-4"
                                  >
                                    <Activity size={20} className="text-button" />
                                    <span className="font-medium text-base text-gray-900">{activity}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-16 text-gray-600 border-l-4 border-primary">
                            <BookOpen className="mx-auto mb-6 text-gray-500 w-12 h-12" />
                            <p className="text-xl font-medium">This guide has not written a bio yet</p>
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
                      transition={{ duration: 0.4 }}
                      className="space-y-8"
                    >
                      <div className="bg-white shadow-md p-10">
                        <ReviewList entityId={guideId} entityType="guide" />
                      </div>
                      <div className="bg-white shadow-md p-10">
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
                      transition={{ duration: 0.4 }}
                      className="bg-white shadow-md p-10"
                    >
                      <div className="flex items-center gap-6 mb-8">
                        <MessageSquare size={32} className="text-primary" />
                        <h3 className="text-3xl font-extrabold text-gray-900">
                          Chat with <span className="text-primary">{guide?.firstName}</span>
                        </h3>
                      </div>
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
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float { animation: float 7s ease-in-out infinite; }
        .animate-float-delay { animation: float-delay 9s ease-in-out infinite; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .container {
          max-width: 1440px !important;
        }
        @media (max-width: 1024px) {
          .lg\\:w-1\\/3 { width: 100%; }
          .lg\\:w-2\\/3 { width: 100%; }
        }
      `}</style>
    </>
  );
};

export default GuideProfile;