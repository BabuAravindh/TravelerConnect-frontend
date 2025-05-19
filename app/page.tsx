"use client";

import CityInsights from "@/components/ChatBot";
import { Footer } from "@/components/Footer";
import GuideListing from "@/components/GuideListing";
import HeroSection from "@/components/Header";
import { useState, useEffect, useCallback } from "react";
import { Guide } from "./guides/[id]/GuiteTypes";
import TravelRoutesAndAttractions from "@/components/TravelRouteAndAttractions";
import AIRecommendation from "@/components/TravelPlanner";

const Page: React.FC = () => {
  const [searchTerm] = useState("");
  const [city, setCity] = useState("");
  const [language, setLanguage] = useState("");
  const [activity, setActivity] = useState("");
  const [gender, setGender] = useState("");
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(false);

  const getCityFromCoordinates = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/reverse.php?key=${process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&format=json`
      );
      const data = await response.json();
      return data.address?.city || data.address?.town || data.address?.village || "";
    } catch (error) {
      console.error("Error in LocationIQ reverse geocoding:", error);
      return "";
    }
  };

  const getUserLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      return;
    }

    try {
      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const detectedCity = await getCityFromCoordinates(latitude, longitude);
            if (detectedCity) {
              setCity(detectedCity);
            }
            resolve();
          },
          (error) => {
            console.warn("Location access error:", error.message);
            resolve();
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });
    } catch (error) {
      console.error("Geolocation error:", error);
    }
  }, []);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.append("city", city);
      if (language) params.append("language", language);
      if (activity) params.append("activity", activity);
      if (gender) params.append("gender", gender);
      if (searchTerm) params.append("searchTerm", searchTerm);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/guides?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch guides");

      const data = await response.json();
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
        city={city}
        setCity={setCity}
        language={language}
        setLanguage={setLanguage}
        activity={activity}
        setActivity={setActivity}
        gender={gender}
        setGender={setGender}
        onSearch={fetchGuides}
      />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* AI Recommendation Section */}
        <section className="bg-white rounded-lg shadow p-6  mt-20">
          <AIRecommendation city={city} />
        </section>

        {/* Travel Routes Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <TravelRoutesAndAttractions selectedCity={city} searchTerm={searchTerm} />
        </section>

        {/* Guides Listing Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <GuideListing
            searchTerm={searchTerm}
            city={city}
            language={language}
            activity={activity}
            gender={gender}
            guides={guides}
            loading={loading}
          />
        </section>
      </main>

      {/* Chat Bot */}
      <CityInsights cityName={city} />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Page;