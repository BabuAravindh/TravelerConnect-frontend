"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

interface GuideListingProps {
  searchTerm: string;
  destination: string;
  language: string;
  activity: string;
  guides?: Guide[]; // Make guides optional
  loading: boolean;
}

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

const GuideListing: React.FC<GuideListingProps> = ({
  searchTerm,
  destination,
  language,
  activity,
  guides: propGuides = [], // Guides passed as props (optional)
  loading: propLoading = false, // Loading state passed as props (optional)
}) => {
  const [guides, setGuides] = useState<Guide[]>(propGuides); // Local state for guides
  const [loading, setLoading] = useState(propLoading); // Local state for loading

  // Fetch all guides when the component mounts
  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/guide/profile");
        if (!response.ok) throw new Error("Failed to fetch guides");

        const data = await response.json();
        setGuides(data); // Set the fetched guides
      } catch (error) {
        console.error("Error fetching guides:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Filter guides based on search term, destination, language, and activity
  const filteredGuides = guides.filter((guide) => {
    const matchesSearchTerm = !searchTerm || guide.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDestination = !destination || guide.address?.stateId?.stateName?.toLowerCase().includes(destination.toLowerCase());
    const matchesLanguage = !language || guide.languages?.some((lang) => lang.languageName.toLowerCase().includes(language.toLowerCase()));
    const matchesActivity = !activity || guide.activities?.some((act) => act.activityName.toLowerCase().includes(activity.toLowerCase()));

    return matchesSearchTerm && matchesDestination && matchesLanguage && matchesActivity;
  });

  return (
    <div className="container max-w-7xl mx-auto px-6 py-12 mt-32">
      <h2 className="text-4xl font-bold text-center mb-10 text-gray-900">🌍 Find Your Local Guide</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading guides...</p>
        ) : filteredGuides.length > 0 ? (
          filteredGuides.map((guide) => (
            <div
              key={guide._id}
              className="bg-white/30 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              {/* Banner Image */}
              <div className="relative w-full h-52">
                <Image
                  src={guide.profilePicture || "https://picsum.photos/800/300"} // Use profilePicture or default
                  alt={`${guide.name}'s guide banner`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-2xl"
                />
              </div>

              {/* Profile Image */}
              <div className="relative flex justify-center -mt-12">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src={guide.profilePicture || "https://picsum.photos/100"} // Use profilePicture or default
                    alt={`Profile picture of ${guide.name}`}
                    width={100}
                    height={100}
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Guide Details */}
              <div className="text-center p-6">
                <h3 className="text-xl font-semibold text-gray-900">{guide.name}</h3>
                <p className="text-gray-600">{guide.address?.stateId?.stateName || "Default Destination"}</p> {/* Use stateName or default */}
                <div className="flex items-center justify-center mt-3">
                  <Star className="text-yellow-500" size={20} />
                  <span className="ml-2 text-lg font-semibold text-gray-800">{"N/A"}</span> {/* Default rating */}
                </div>

                {/* Languages */}
                <div className="mt-3">
                  <p className="text-gray-600">
                    <strong>Languages:</strong>{" "}
                    {guide.languages?.map((lang) => lang.languageName).join(", ") || "N/A"}
                  </p>
                </div>

                {/* Activities */}
                <div className="mt-3">
                  <p className="text-gray-600">
                    <strong>Activities:</strong>{" "}
                    {guide.activities?.map((act) => act.activityName).join(", ") || "N/A"}
                  </p>
                </div>

                {/* View Profile Button */}
                <Link
                  href={`/guides/${guide.userId}`} // Use _id as userId
                  className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 text-lg">No guides found.</p>
        )}
      </div>
    </div>
  );
};

export default GuideListing;