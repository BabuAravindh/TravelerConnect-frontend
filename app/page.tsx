"use client";

import AttractionsCarousel from "@/components/Attraction";
import CityInsights from "@/components/ChatBot";
import DestinationRoutes from "@/components/DestinationRoutes";
import { Footer } from "@/components/Footer";
import GuideListing from "@/components/GuideListing";
import HeroSection from "@/components/Header";
import { useState, useEffect } from "react";

const Page: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [city, setCity] = useState("");
  const [language, setLanguage] = useState("");
  const [activity, setActivity] = useState("");
  const [gender, setGender] = useState("");
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Function to get city name from coordinates using LocationIQ
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

  // Function to get user's location
  const getUserLocation = async () => {
    setIsGettingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
      return;
    }

    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const detectedCity = await getCityFromCoordinates(latitude, longitude);
          if (detectedCity) {
            setCity(detectedCity);
            setLocationError("");
          } else {
            setLocationError("Could not determine city from your location");
          }
          setIsGettingLocation(false);
        },
        (error) => {
          let errorMessage = "Unable to retrieve your location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access was denied. Please enable location services in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "The request to get location timed out.";
              break;
            default:
              errorMessage = "An unknown error occurred while getting location.";
          }
          setLocationError(errorMessage);
          setIsGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds
          maximumAge: 0, // Don't use cached position
        }
      );
    } catch (error) {
      console.error("Geolocation error:", error);
      setLocationError("An error occurred while trying to get your location");
      setIsGettingLocation(false);
    }
  };

  // Get user's location when component mounts (optional)
  useEffect(() => {
    getUserLocation();
  }, []);

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
        locationError={locationError}
        isGettingLocation={isGettingLocation}
        onRequestLocation={getUserLocation}
      />

      <div className="flex flex-col gap-12 px-6 py-12 lg:px-16 flex-grow">
        <div className="max-w-7xl mx-auto w-full mt-20">
          <AttractionsCarousel selectedCity={city} />
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
          <DestinationRoutes city={city} language={language} activity={activity} />
        </div>
      </div>
    <CityInsights cityName={city} />
      <Footer />
    </div>
  );
};

export default Page;
