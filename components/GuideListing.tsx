'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';


interface GuideListingProps {
  searchTerm: string;
  city: string;
  language: string;
  activity: string;
  gender: string;
  guides?: Guide[];
  loading: boolean;
}

interface Guide {
  _id: string;
  name?: string;
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
  dateOfBirth?: string;
  profilePicture?: string;
  gender: string;
  dateJoined: string;
  languages?: string[];
  bio?: string;
  activities?: string[];
  aadharCardPhoto?: string;
  bankAccountNumber?: string;
  serviceLocations?: string[];
  state?: string;
}

const GuideListing: React.FC<GuideListingProps> = ({
  searchTerm,
  city,
  language,
  activity,
  gender,
  guides: propGuides = [],
  loading: propLoading = false,
}) => {
  const [guides, setGuides] = useState<Guide[]>(propGuides);
  const [loading, setLoading] = useState(propLoading);

  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/guide/profile`);
        if (!response.ok) throw new Error('Failed to fetch guides');

        const data = await response.json();
        ('Fetched guides:', data);
        setGuides(data);
      } catch (error) {
        console.error('Error fetching guides:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  const filteredGuides = useMemo(() => {
    return guides.filter((guide) => {
      const fullName = `${guide.firstName} ${guide.lastName}`.toLowerCase();
      const matchesSearchTerm = !searchTerm || fullName.includes(searchTerm.toLowerCase());
      const matchesCity = !city || guide.serviceLocations?.some((loc) => loc.toLowerCase().includes(city.toLowerCase()));
      const matchesLanguage = !language || guide.languages?.some((lang) => lang.toLowerCase().includes(language.toLowerCase()));
      const matchesActivity = !activity || guide.activities?.some((act) => act.toLowerCase().includes(activity.toLowerCase()));
      const matchesGender = !gender || guide.gender?.toLowerCase() === gender.toLowerCase();

      return matchesSearchTerm && matchesCity && matchesLanguage && matchesActivity && matchesGender;
    });
  }, [guides, searchTerm, city, language, activity, gender]);

  return (
    <div className="container max-w-7xl mx-auto px-6 py-12 mt-32">
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
                  src={guide.profilePicture || 'https://picsum.photos/800/300'}
                  alt={`${guide.firstName} ${guide.lastName}'s guide banner`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"  // Add this line
                  style={{ objectFit: 'cover' }}
                  className="rounded-t-xl"
                />
              </div>

              {/* Profile Image */}
              <div className="relative flex justify-center -mt-16">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src={guide.profilePicture || 'https://picsum.photos/100'}
                    alt={`Profile picture of ${guide.firstName} ${guide.lastName}`}
                    width={100}
                    height={100}
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Guide Details */}
              <div className="text-center p-6">
                {/* Guide Name */}
                <h3 className="text-2xl font-bold text-gray-900 tracking-wide">
                  {guide.firstName} {guide.lastName}
                </h3>

                {/* State Name with Location Icon */}
                <p className="text-gray-600 mt-2 flex items-center justify-center gap-2 text-lg font-medium">
                  📍 <span className="text-gray-700">{guide.state || 'Unknown Location'}</span>
                </p>

                {/* Languages Section */}
                <div className="mt-4">
                  <p className="text-gray-600 font-semibold">Languages:</p>
                  <div className="flex flex-wrap gap-2 mt-1 justify-center">
                    {guide.languages?.length ? (
                      guide.languages.map((lang, index) => (
                        <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 text-sm rounded-full">
                          {lang}
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
                      guide.activities.map((act, index) => (
                        <span key={index} className="bg-green-100 text-green-700 px-3 py-1 text-sm rounded-full">
                          {act}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">N/A</span>
                    )}
                  </div>
                </div>

                {/* Service Locations (Cities) Section */}
                <div className="mt-4">
                  <p className="text-gray-600 font-semibold">Service Locations:</p>
                  <div className="flex flex-wrap gap-2 mt-1 justify-center">
                    {guide.serviceLocations?.length ? (
                      guide.serviceLocations.map((city, index) => (
                        <span key={index} className="bg-purple-100 text-purple-700 px-3 py-1 text-sm rounded-full">
                          {city}
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
