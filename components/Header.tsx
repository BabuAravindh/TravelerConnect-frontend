"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import Navbar from "./Navbar";
import { Guide } from "@/types";

interface HeroSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  destination: string;
  setDestination: (dest: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  activity: string;
  setActivity: (act: string) => void;
  guides: Guide[];
  loading: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  searchTerm,
  setSearchTerm,
  destination,
  setDestination,
  language,
  setLanguage,
  activity,
  setActivity,
  guides,
  loading,
}) => {
  const destinations = ["Tamil Nadu", "Gujarat", "Manali", "Bangalore", "Kerala"];
  const languages = ["Hindi", "English", "Tamil", "Marathi", "Bengali"];
  const activities = ["Wildlife Safari", "Trekking", "City Tour", "Water Sports"];
  const images = ["/images/hero-slider-1.jpg", "/images/hero-slider-2.jpg", "/images/hero-slider-3.jpg"];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
                    sequence={destinations.flatMap((dest) => [dest, 2000])}
                    wrapper="span"
                    speed={50}
                    repeat={Infinity}
                  />
                </span>
              </h1>

              {/* Search & Filters */}
              <form className="form bg-white p-5 rounded-lg shadow-lg mb-10 z-20 w-full max-w-lg mx-auto lg:relative lg:left-52 lg:top-40 lg:max-w-6xl">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <input
                    type="text"
                    className="form-control flex-1 p-2 border text-black border-gray-300 rounded"
                    placeholder="Search for a guide..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Destination Filter */}
                  <select
                    className="form-control flex-1 p-2 border text-black border-gray-300 rounded"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  >
                    <option value="">Select Destination</option>
                    {destinations.map((dest) => (
                      <option key={dest} value={dest}>
                        {dest}
                      </option>
                    ))}
                  </select>

                  {/* Language Filter */}
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

                  {/* Activity Filter */}
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
                </div>
              </form>
            </div>

            {/* Image Slider */}
            <div className="lg:w-5/12 flex justify-center mt-10 lg:mt-0">
              <div className="relative w-[250px] sm:w-[300px] md:w-[350px] lg:w-[400px] h-[250px] sm:h-[300px] md:h-[350px] lg:h-96 lg:top-20 flex justify-center items-center">
                {images.map((img, index) => (
                  <Image
                    key={index}
                    src={img}
                    alt={`Travel destination ${index + 1}`}
                    width={600}
                    height={600}
                    className={`rounded-full object-cover absolute transition-all duration-1000 ease-in-out ${
                      currentImageIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    }`}
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