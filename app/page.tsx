"use client";

import AttractionsCarousel from "@/components/Attraction";
import DestinationRoutes from "@/components/DestinationRoutes";
import { Footer } from "@/components/Footer";
import GuideListing from "@/components/GuideListing";
import HeroSection from "@/components/Header";
import { useState } from "react";

// ... Guide interface remains the same ...

const Page: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [city, setCity] = useState("");
  const [language, setLanguage] = useState("");
  const [activity, setActivity] = useState("");
  const [gender, setGender] = useState("");
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.append("city", city);
      if (language) params.append("language", language);
      if (activity) params.append("activity", activity);
      if (gender) params.append("gender", gender);
      if (searchTerm) params.append("search", searchTerm);

      console.log("Fetching guides with params:", params.toString());

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/guides?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch guides");

      const data = await response.json();
      console.log("API response:", data);

      setGuides(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching guides:", error);
      setGuides([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <HeroSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        city={city}
        setCity={setCity}
        language={language}
        setLanguage={setLanguage}
        activity={activity}
        setActivity={setActivity}
        gender={gender}
        setGender={setGender}
        guides={guides}
        loading={loading}
        onSearch={fetchGuides}
      />

      <div className="flex flex-col gap-12 px-6 py-12 lg:px-16 flex-grow">
        <div className="max-w-7xl mx-auto w-full mt-20">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Popular Attractions</h2>
          <AttractionsCarousel 
            city={city}
            language={language}
            activity={activity}
          />
        </div>

        <div className="max-w-7xl mx-auto w-full">
          <div className="p-4">
            <GuideListing
              searchTerm={searchTerm}
              city={city}
              language={language}
              activity={activity}
              gender={gender}
              guides={guides}
              loading={loading}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full">
          <DestinationRoutes 
            city={city}
            language={language}
            activity={activity}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Page;