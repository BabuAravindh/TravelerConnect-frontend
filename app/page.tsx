"use client";

import { Footer } from "@/components/Footer";
import GuideListing from "@/components/GuideListing";
import HeroSection from "@/components/Header";
import { useState } from "react";

interface Guide {
  _id: string;
  name: string;
  email: string;
  role: string;
  verificationToken?: string;
  isVerified: boolean;
  __v?: number;
  address?: {
    stateId: {
      _id: string;
      stateName: string;
      order: number;
      createdAt: string;
      __v: number;
    };
    countryId: string;
  };
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  profilePicture: string;
  gender: string;
  dateJoined: string;
  languages?: Array<{
    _id: string;
    languageName: string;
    languageStatus: string;
    order: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }>;
  bio?: string;
  activities?: Array<{
    _id: string;
    activityName: string;
    order: number;
    __v: number;
    createdAt: string;
    updatedAt: string;
  }>;
  aadharCardPhoto?: string;
  bankAccountNumber?: string;
}
const Page: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [destination, setDestination] = useState("");
  const [language, setLanguage] = useState("");
  const [activity, setActivity] = useState("");
  const [gender, setGender] = useState("");
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch guides only when the form is submitted
  const fetchGuides = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (destination) params.append("destination", destination);
      if (language) params.append("language", language);
      if (activity) params.append("activity", activity);
      if (gender) params.append("gender", gender);
      if (searchTerm) params.append("search", searchTerm);

      console.log("Fetching guides with params:", params.toString());

      const response = await fetch(`http://localhost:5000/api/search/guides?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch guides");

      const data = await response.json();
      console.log("API response:", data);

      setGuides(Array.isArray(data) ? data : []); // Update guides state with fetched data
    } catch (error) {
      console.error("Error fetching guides:", error);
      setGuides([]); // Clear guides on error
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        destination={destination}
        setDestination={setDestination}
        language={language}
        setLanguage={setLanguage}
        activity={activity}
        setActivity={setActivity}
        gender={gender}
        setGender={setGender}
        guides={guides}
        loading={loading}
        onSearch={fetchGuides} // Pass fetchGuides to be called on form submission
      />
      <div className="flex flex-row gap-4 p-4 flex-grow">
        <div className="flex-1 flex justify-center items-center bg-primar">
          <GuideListing
            searchTerm={searchTerm}
            destination={destination}
            language={language}
            activity={activity}
            gender={gender}
            guides={guides} // Pass filtered guides
            loading={loading}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Page;