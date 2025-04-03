"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import Navbar from "./Navbar";
import { Filter, Search } from "lucide-react";

interface HeroSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  city: string;
  setCity: (city: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  activity: string;
  setActivity: (act: string) => void;
  gender: string;
  setGender: (gender: string) => void;
  loading: boolean;
  onSearch: () => void;
  guides: any[];
}

interface CityWithGuides {
  cityName: string;
  guideCount: number;
}

interface Language {
  _id: string;
  languageName: string;
  languageStatus: string;
  order: number;
}

interface Activity {
  _id: string;
  activityName: string;
  order: number;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  searchTerm,
  setSearchTerm,
  city,
  setCity,
  language,
  setLanguage,
  activity,
  setActivity,
  gender,
  setGender,
  loading,
  onSearch,
}) => {
  const [citiesWithGuides, setCitiesWithGuides] = useState<CityWithGuides[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const genders = ["Male", "Female", "Other"];
  const images = ["/images/hero-slider-1.jpg", "/images/hero-slider-2.jpg", "/images/hero-slider-3.jpg"];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState("");
  const [filteredCities, setFilteredCities] = useState<CityWithGuides[]>([]);

  // Fetch cities with guides, languages, and activities
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        // Fetch cities with guides
        const citiesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/guide/cities_with_guides`);
        const citiesData = await citiesRes.json();
        setCitiesWithGuides(citiesData);
        setFilteredCities(citiesData);

        // Fetch languages
        const languagesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predefine/languages`);
        const languagesData = await languagesRes.json();
        setLanguages(languagesData.filter((lang: Language) => lang.languageStatus === "active"));

        // Fetch activities
        const activitiesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities`);
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Filter cities based on search term
  useEffect(() => {
    if (citySearchTerm.trim() === "") {
      setFilteredCities(citiesWithGuides);
    } else {
      const filtered = citiesWithGuides.filter(city =>
        city.cityName.toLowerCase().includes(citySearchTerm.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [citySearchTerm, citiesWithGuides]);

  // Rotate images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Get city names for the TypeAnimation (only cities with guides)
  const citiesWithGuidesNames = citiesWithGuides
    .filter(city => city.guideCount > 0)
    .map(city => city.cityName);

  return (
    <>
      <Navbar />
      <div className="hero bg-[#6899ab] pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col-reverse lg:flex-row items-center justify-between">
            <div className="lg:w-7/12 mt-28 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-5 lg:relative lg:top-40 lg:left-64">
                Let's Enjoy Your <br /> Trip In{" "}
                <span className="text-white underline">
                  {citiesWithGuidesNames.length > 0 ? (
                    <TypeAnimation
                      sequence={citiesWithGuidesNames.flatMap((city) => [city, 2000])}
                      wrapper="span"
                      speed={50}
                      repeat={Infinity}
                    />
                  ) : (
                    "India"
                  )}
                </span>
              </h1>

              <form
                className="form bg-white p-5 rounded-lg shadow-lg mb-10 z-20 w-full max-w-xl flex flex-col gap-6 mx-auto lg:relative lg:left-52 lg:top-40 lg:max-w-6xl"
                onSubmit={(e) => {
                  e.preventDefault();
                  onSearch();
                }}
              >
                {/* City search input */}
                <div className="relative">
                  <div className="flex items-center border border-gray-300 rounded">
                    <input
                      type="text"
                      className="form-control flex-1 p-2 text-black rounded"
                      placeholder="Search for a city..."
                      value={citySearchTerm}
                      onChange={(e) => setCitySearchTerm(e.target.value)}
                    />
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200"
                      onClick={() => setCitySearchTerm("")}
                    >
                      <Search size={18} />
                    </button>
                  </div>
                  {citySearchTerm && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                      {filteredCities.length > 0 ? (
                        filteredCities.map((cityOption) => (
                          <div
                            key={cityOption.cityName}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setCity(cityOption.cityName);
                              setCitySearchTerm(cityOption.cityName);
                            }}
                          >
                            {cityOption.cityName} {cityOption.guideCount > 0 && `(${cityOption.guideCount})`}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500">No cities found</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Advanced filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <select
                    className="form-control flex-1 p-2 border text-black border-gray-300 rounded"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={isLoadingData}
                  >
                    <option value="">Select City</option>
                    {filteredCities.map((cityOption) => (
                      <option key={cityOption.cityName} value={cityOption.cityName}>
                        {cityOption.cityName} {cityOption.guideCount > 0 && `(${cityOption.guideCount})`}
                      </option>
                    ))}
                  </select>

                  <select
                    className="form-control flex-1 p-2 border text-black border-gray-300 rounded"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={isLoadingData}
                  >
                    <option value="">Select Language</option>
                    {languages.map((lang) => (
                      <option key={lang._id} value={lang.languageName}>
                        {lang.languageName}
                      </option>
                    ))}
                  </select>

                  <select
                    className="form-control flex-1 p-2 border text-black border-gray-300 rounded"
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    disabled={isLoadingData}
                  >
                    <option value="">Select Activity</option>
                    {activities.map((act) => (
                      <option key={act._id} value={act.activityName}>
                        {act.activityName}
                      </option>
                    ))}
                  </select>

                  <select
                    className="form-control flex-1 p-2 border text-black border-gray-300 rounded"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    {genders.map((gen) => (
                      <option key={gen} value={gen}>
                        {gen}
                      </option>
                    ))}
                  </select>
                </div>
               
              </form>
            </div>

            <div className="lg:w-5/12 flex justify-center mt-10 lg:mt-0">
              <div className="relative w-[250px] sm:w-[300px] md:w-[350px] lg:w-[400px] h-[250px] sm:h-[300px] md:h-[350px] lg:h-96 lg:top-20 flex justify-center items-center">
                {images.map((img, index) => (
                  <Image
                    key={index}
                    src={img}
                    alt={`Travel destination ${index + 1}`}
                    width={600}
                    height={600}
                    className={`rounded-full object-cover absolute transition-all duration-1000 ease-in-out ${currentImageIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;