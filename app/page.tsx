"use client";

import { Footer } from "@/components/Footer";
import GuideListing from "@/components/GuideListing";
import HeroSection from "@/components/Header";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
 interface Guide {
  _id: string;
  name: string;
  email: string;
  role: string;
  verificationToken?: string;
  isVerified: boolean;
  __v?: number;
}

const Page: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [destination, setDestination] = useState("");
  const [language, setLanguage] = useState(""); // Add language state
  const [activity, setActivity] = useState("");
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(false);

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (destination) params.append("destination", destination);
        if (language) params.append("language", language);
        if (activity) params.append("activity", activity);
        if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
  
        console.log("Fetching guides with params:", params.toString()); // Log the query params
  
        const response = await fetch(`http://localhost:5000/api/search/guides?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch guides");
  
        const data = await response.json();
        console.log("API response:", data); // Log the API response
  
        setGuides(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching guides:", error);
        setGuides([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchGuides();
  }, [debouncedSearchTerm, destination, language, activity]);

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        destination={destination}
        setDestination={setDestination}
        language={language} // Pass language state
        setLanguage={setLanguage} // Pass setLanguage
        activity={activity}
        setActivity={setActivity}
        guides={guides}
        loading={loading}
      />
      <div className="flex flex-row gap-4 p-4 flex-grow">
        <div className="flex-1 flex justify-center items-center">
          <GuideListing
            searchTerm={searchTerm}
            destination={destination}
            language={language} // Pass language state
            activity={activity}
            guides={guides}
            loading={loading}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Page;