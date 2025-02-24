"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import Navbar from "./Navbar";


const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const destinations = ["Gujarat", "Chennai", "Manali", "Bangalore", "Kerala"];
  const images = [
    "/images/hero-slider-1.jpg",
    "/images/hero-slider-2.jpg",
    "/images/hero-slider-3.jpg",
  ];

  const imageChangeTime = 3000; // Change image every 3 seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, imageChangeTime);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar/>
      <div className="hero bg-[#6899ab] pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col-reverse lg:flex-row items-center justify-between">
            {/* Left Side - Form & Text */}
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

              {/* Form Section */}
              <form className="form bg-white p-5 rounded-lg shadow-lg mb-10 z-20 w-full max-w-lg mx-auto lg:relative lg:left-52 lg:top-40 lg:max-w-6xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-4 mb-4">
                  <select className="form-control w-full p-2 border text-black border-gray-300 rounded">
                    <option value="">Select Destination</option>
                    {destinations.map((dest, index) => (
                      <option key={index} value={dest}>
                        {dest}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    className="form-control w-full p-2 border text-black border-gray-300 rounded"
                  />

                  <input
                    type="number"
                    min="1"
                    className="form-control w-full p-2 border text-black border-gray-300 rounded"
                    placeholder="# of People"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:justify-start gap-4">
                  <button
                    type="submit"
                    className="bg-[#1b374c] text-white px-6 py-3 rounded-xl w-full sm:w-auto"
                  >
                    Search
                  </button>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={showFilters}
                      onChange={() => setShowFilters(!showFilters)}
                    />
                    <span className="text-sm text-black">Show more filters</span>
                  </label>
                </div>

                {showFilters && (
                  <div className="mt-4 p-4 bg-transparent text-black rounded-lg shadow-lg flex flex-wrap gap-4">
                    <div>
                      <label className="block text-sm mb-1">Language</label>
                      <select className="w-full p-2 rounded bg-transparent text-black border border-gray-600">
                        <option>Any</option>
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                        <option>Chinese</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Experience Level</label>
                      <select className="w-full p-2 rounded bg-transparent text-black border border-gray-600">
                        <option>Any</option>
                        <option>Beginner (0-2 years)</option>
                        <option>Intermediate (3-5 years)</option>
                        <option>Expert (6+ years)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Available Days</label>
                      <select className="w-full p-2 rounded bg-transparent text-black border border-gray-600">
                        <option>Any</option>
                        <option>Weekdays</option>
                        <option>Weekends</option>
                        <option>Specific Dates</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Tour Type</label>
                      <select className="w-full p-2 rounded bg-transparent text-black border border-gray-600">
                        <option>Any</option>
                        <option>Cultural</option>
                        <option>Adventure</option>
                        <option>Food & Drink</option>
                        <option>Historical</option>
                        <option>Nature & Wildlife</option>
                      </select>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Right Side - Image Slider */}
            <div className="lg:w-5/12 flex justify-center mt-10 lg:mt-0">
              <div className="relative w-[250px] sm:w-[300px] md:w-[350px] lg:w-[400px] h-[250px] sm:h-[300px] md:h-[350px] lg:h-96 lg:top-20 flex justify-center items-center">
                {images.map((img, index) => (
                  <Image
                    key={index}
                    src={img}
                    alt="Travel Destination"
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
