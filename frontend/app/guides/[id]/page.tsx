"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Star } from "lucide-react";
import Chat from "@/components/MobileChat";
import Chatbot from "@/components/ChatBot";
import ReviewList from "@/components/ReviewList"
import ReviewForm from "@/components/ReviewForm";
import { Footer } from "@/components/Footer";
import Navbar from "@/components/Navbar";


const guides = [
  { 
    id: 1, 
    name: "John Doe", 
    location: "Paris, France", 
    rating: 4.8, 
    image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
    bannerImage: "https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg",
    bio: "Passionate guide with extensive knowledge of Parisian history and culture.",
    services: [
      { name: "Art & Museums", description: "Guided tours of the Louvre and other famous museums." },
      { name: "Night Clubs", description: "Experience the best nightlife in Paris with exclusive access." },
      { name: "Historical Sites", description: "Explore historic landmarks and learn about their significance." }
    ]
  },
  { 
    id: 2, 
    name: "Sophia Lee", 
    location: "Kyoto, Japan", 
    rating: 4.9, 
    image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
    bannerImage: "https://images.pexels.com/photos/209074/pexels-photo-209074.jpeg",
    bio: "Local expert in Kyoto’s temples, gardens, and culinary delights.",
    services: [
      { name: "Temple Tours", description: "Discover the history of Kyoto’s ancient temples." },
      { name: "Food Experiences", description: "Savor Kyoto’s finest traditional cuisine." },
      { name: "Tea Ceremonies", description: "Immerse yourself in the art of Japanese tea culture." }
    ]
  }
];

const GuideProfile = () => {
  const { id } = useParams();
  const guide = guides.find((g) => g.id === Number(id));
  const [selectedUser, setSelectedUser] = useState(null);

  if (!guide) {
    return <p className="text-center text-gray-500">Guide not found.</p>;
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-100 min-h-screen py-12 px-6 md:px-12 flex flex-col items-center">
        {/* Guide Banner */}
        <div className="relative w-full">
          <div className="absolute inset-0 h-96 w-full overflow-hidden rounded-3xl shadow-xl max-w-full">
            <Image
              src={guide.bannerImage}
              alt={`${guide.name} banner`}
              width={1200}
              height={320}
              className="w-full h-full object-cover rounded-3xl"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{guide.name}</h1>
            </div>
          </div>

          {/* Guide Details */}
          <div className="relative z-10 max-w-5xl w-full mx-auto mt-40 bg-white shadow-xl rounded-3xl p-10 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-12">
              {/* Guide Image */}
              <div className="md:w-1/2 flex justify-center">
                <div className="w-full max-w-md h-auto overflow-hidden rounded-2xl shadow-lg border border-gray-300">
                  <Image src={guide.image} alt={guide.name} width={500} height={500} className="object-cover w-full h-full" />
                </div>
              </div>

              {/* Guide Info */}
              <div className="md:w-1/2 flex flex-col justify-center text-gray-900">
                <h2 className="text-4xl font-bold mb-3">{guide.name}</h2>
                <p className="text-lg text-gray-700 mb-2">📍 {guide.location}</p>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="text-yellow-500" size={30} />
                  <span className="text-2xl font-semibold">{guide.rating}</span>
                </div>
                <p className="text-lg leading-relaxed mb-6 text-gray-600">{guide.bio}</p>

                <div className="bg-gray-50 p-6 rounded-xl shadow-md border border-gray-200">
                  <h3 className="text-2xl font-semibold mb-3">Services Offered</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {guide.services.map((service, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition">
                        <h4 className="font-medium text-lg">{service.name}</h4>
                        <p className="text-gray-600 text-sm">{service.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                  <button className="w-1/2 bg-button text-white py-3 text-xl rounded-xl font-bold hover:bg-opacity-90 hover:shadow-lg transition">
                    Book Guide
                  </button>
                  <button 
                    onClick={() => setSelectedUser({ username: guide.name, img: guide.image })} 
                    className="w-1/2 bg-white text-gray-900 py-3 text-xl rounded-xl font-bold border border-gray-300 hover:bg-gray-100 hover:shadow-md transition"
                  >
                    Message Guide
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Application */}
        <div className="mt-20 w-full max-w-5xl">
          <h3 className="text-2xl font-bold mb-4 text-center text-gray-900">Chat with {guide.name}</h3>
          {selectedUser ? (
            <Chat user={selectedUser} onBack={() => setSelectedUser(null)} />
          ) : (
            <p className="text-center text-gray-500">Click "Message Guide" to start a conversation.</p>
          )}
        </div>

        {/* Other Sections */}
        <div className="mt-20 w-full max-w-5xl">
          <Chatbot />
        </div>

        <div className="mt-20 w-full max-w-5xl">
          <ReviewForm />
        </div>

        <div className="mt-20 w-full max-w-5xl">
          <ReviewList />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default GuideProfile;
