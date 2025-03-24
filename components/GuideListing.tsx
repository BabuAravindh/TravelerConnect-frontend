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
  gender: string;
  guides?: Guide[];
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
  gender,
  guides: propGuides = [],
  loading: propLoading = false,
}) => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(propLoading);

  // Dummy data for testing
  const dummyGuides: Guide[] = [
    {
      _id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "guide",
      isVerified: true,
      address: {
        stateId: {
          _id: "1",
          stateName: "California",
          order: 1,
          createdAt: "2023-01-01",
          __v: 0,
        },
        countryId: "US",
      },
      userId: "1",
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "1234567890",
      dateOfBirth: "1990-01-01",
      profilePicture: "https://picsum.photos/100",
      gender: "male",
      dateJoined: "2023-01-01",
      languages: [
        {
          _id: "1",
          languageName: "English",
          languageStatus: "active",
          order: 1,
          createdAt: "2023-01-01",
          updatedAt: "2023-01-01",
          __v: 0,
        },
      ],
      bio: "Experienced guide with a passion for adventure.",
      activities: [
        {
          _id: "1",
          activityName: "Hiking",
          order: 1,
          __v: 0,
          createdAt: "2023-01-01",
          updatedAt: "2023-01-01",
        },
      ],
      aadharCardPhoto: "https://picsum.photos/300",
      bankAccountNumber: "12345678901234",
    },
    // Add more dummy guides...
  ];

  // Fetch all guides when the component mounts
  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/guide/profile");
        if (!response.ok) throw new Error("Failed to fetch guides");

        const data = await response.json();
        setGuides(data);
      } catch (error) {
        console.error("Error fetching guides:", error);
        setGuides(dummyGuides);
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  // Filter guides based on search term, destination, language, activity, and gender
  const filteredGuides = guides.filter((guide) => {
    const matchesSearchTerm = !searchTerm || guide.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDestination = !destination || guide.address?.stateId?.stateName?.toLowerCase().includes(destination.toLowerCase());
    const matchesLanguage = !language || guide.languages?.some((lang) => lang.languageName.toLowerCase().includes(language.toLowerCase()));
    const matchesActivity = !activity || guide.activities?.some((act) => act.activityName.toLowerCase().includes(activity.toLowerCase()));
    const matchesGender = !gender || guide.gender?.toLowerCase() === gender.toLowerCase();

    return matchesSearchTerm && matchesDestination && matchesLanguage && matchesActivity && matchesGender;
  });

  return (
    <div className="container max-w-7xl mx-auto px-6 py-12 mt-32  ">
      <h2 className="text-4xl font-bold text-center mb-10 text-gray-900">🌍 Find Your Local Guide</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading guides...</p>
        ) : filteredGuides.length > 0 ? (
          filteredGuides.map((guide) => (
            <div
              key={guide._id}
              className="bg-white/90 backdrop-blur-md shadow-lg rounded-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              {/* Banner Image */}
              <div className="relative w-full h-52">
                <Image
                  src={guide.profilePicture || "https://picsum.photos/800/300"}
                  alt={`${guide.name}'s guide banner`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-xl"
                />
              </div>

              {/* Profile Image */}
              <div className="relative flex justify-center -mt-16">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src={guide.profilePicture || "https://picsum.photos/100"}
                    alt={`Profile picture of ${guide.name}`}
                    width={100}
                    height={100}
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Guide Details */}
              <div className="text-center p-6">
              {/* Guide Name */}
<h3 className="text-2xl font-bold text-gray-900 tracking-wide">{guide.name}</h3>

{/* State Name with Location Icon */}
<p className="text-gray-600 mt-2 flex items-center justify-center gap-2 text-lg font-medium">
  📍 <span className="text-gray-700">{guide.address?.stateId?.stateName || "Unknown Location"}</span>
</p>


                {/* Languages */}
                {/* Languages Section */}
<div className="mt-4">
  <p className="text-gray-600 font-semibold">Languages:</p>
  <div className="flex flex-wrap gap-2 mt-1 justify-center">
    {guide.languages?.length ? (
      guide.languages.map((lang) => (
        <span key={lang._id} className="bg-blue-100 text-blue-700 px-3 py-1 text-sm rounded-full">
          {lang.languageName}
        </span>
      ))
    ) : (
      <span className="text-gray-500 text-sm">N/A</span>
    )}
  </div>
</div>

{/* Activities Section */}
<div className="mt-4">
  <p className="text-gray-600 font-semibold">Activities:</p>
  <div className="flex flex-wrap gap-2 mt-1 justify-center">
    {guide.activities?.length ? (
      guide.activities.map((act) => (
        <span key={act._id} className="bg-green-100 text-green-700 px-3 py-1 text-sm rounded-full">
          {act.activityName}
        </span>
      ))
    ) : (
      <span className="text-gray-500 text-sm">N/A</span>
    )}
  </div>
</div>

                {/* View Profile Button */}
                <Link
                  href={`/guides/${guide.userId}`}
                  className="mt-6 inline-block px-6 py-3 bg-[#6899ab] text-white font-bold rounded-lg shadow-md transition hover:bg-[#5a8a9b]"
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