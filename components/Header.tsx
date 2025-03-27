"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import Navbar from "./Navbar";
import { Filter } from "lucide-react";

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
  guides: any[]; // Simplified for brevity
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
  const cities = ["Chennai", "Ahmedabad", "Manali", "Bangalore", "Kochi"];
  const languages = ["Hindi", "English", "Tamil", "Marathi", "Bengali"];
  const activities = ["Wildlife Safari", "Trekking", "City Tour", "Water Sports"];
  const genders = ["Male", "Female", "Other"];
  const images = ["/images/hero-slider-1.jpg", "/images/hero-slider-2.jpg", "/images/hero-slider-3.jpg"];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />
      <div className="hero bg-[#6899ab] pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col-reverse lg:flex-row items-center justify-between">
            <div className="lg:w-7/12 mt-28 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-5 lg:relative lg:top-40 lg:left-64">
                Let’s Enjoy Your <br /> Trip In{" "}
                <span className="text-white underline">
                  <TypeAnimation
                    sequence={cities.flatMap((city) => [city, 2000])}
                    wrapper="span"
                    speed={50}
                    repeat={Infinity}
                  />
                </span>
              </h1>

              <form
                className="form bg-white p-5 rounded-lg shadow-lg mb-10 z-20 w-full max-w-lg mx-auto lg:relative lg:left-52 lg:top-40 lg:max-w-6xl"
                onSubmit={(e) => {
                  e.preventDefault();
                  onSearch();
                }}
              >
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <input
                    type="text"
                    className="form-control flex-1 p-2 border text-black border-gray-300 rounded"
                    placeholder="Search for a guide..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-button hover:bg-opacity-90 text-white font-bold rounded transition"
                    disabled={loading}
                  >
                    {loading ? "Searching..." : "Search"}
                  </button>
                </div>

                <div className="text-center mb-4">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 text-button transition"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  >
                    <Filter size={20} />
                    <span>{showAdvancedFilters ? "Hide Filters" : "Show Filters"}</span>
                  </button>
                </div>

                {showAdvancedFilters && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select
                      className="form-control flex-1 p-2 border text-black border-gray-300 rounded"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    >
                      <option value="">Select City</option>
                      {cities.map((cityOption) => (
                        <option key={cityOption} value={cityOption}>
                          {cityOption}
                        </option>
                      ))}
                    </select>

                    <select
                      className="form-control flex-1 p-2 border text-black border-gray-300 rounded"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="">Select Language</option>
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>

                    <select
                      className="form-control flex-1 p-2 border text-black border-gray-300 rounded"
                      value={activity}
                      onChange={(e) => setActivity(e.target.value)}
                    >
                      <option value="">Select Activity</option>
                      {activities.map((act) => (
                        <option key={act} value={act}>
                          {act}
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
                )}
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