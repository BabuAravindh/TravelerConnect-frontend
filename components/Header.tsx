"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import Navbar from "@/components/Navbar";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HeroSectionProps {
  city: string;
  setCity: (city: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  activity: string;
  setActivity: (act: string) => void;
  gender: string;
  setGender: (gender: string) => void;
  onSearch: () => void;
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
  city,
  setCity,
  language,
  setLanguage,
  activity,
  setActivity,
  gender,
  setGender,
  onSearch,
}) => {
  const [citiesWithGuides, setCitiesWithGuides] = useState<CityWithGuides[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const genders = ["Male", "Female", "Other"];
  const images = ["/images/hero-slider-1.jpg", "/images/hero-slider-2.jpg", "/images/hero-slider-3.jpg"];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
  }, [images.length]);

  // Get city names for the TypeAnimation (only cities with guides)
  const citiesWithGuidesNames = citiesWithGuides
    .filter(city => city.guideCount > 0)
    .map(city => city.cityName);

  return (
    <>
      <Navbar />
      <div className="hero bg-primary pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-8">
            <div className="lg:w-7/12 mt-28 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 lg:relative lg:top-40 lg:left-64 text-white">
                Let&apos;s Enjoy Your <br /> Trip In{" "}
                <span className="text-secondary underline">
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

              <Card className="p-6 shadow-lg mb-10 z-20 w-full max-w-xl mx-auto lg:relative lg:left-52 lg:top-40 lg:max-w-6xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSearch();
                  }}
                  className="flex flex-col gap-6"
                >
                  {/* City search input */}
                  <div className="relative">
                    <div className="flex items-center">
                      <Input
                        type="text"
                        className="flex-1 pr-10"
                        placeholder="Search for a city..."
                        value={citySearchTerm}
                        onChange={(e) => setCitySearchTerm(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0"
                        onClick={() => setCitySearchTerm("")}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    {citySearchTerm && (
                      <Card className="absolute z-10 mt-1 w-full border shadow-lg max-h-60 overflow-hidden">
                        <ScrollArea className="h-full">
                          {filteredCities.length > 0 ? (
                            filteredCities.map((cityOption) => (
                              <div
                                key={cityOption.cityName}
                                className="p-2 hover:bg-accent cursor-pointer"
                                onClick={() => {
                                  setCity(cityOption.cityName);
                                  setCitySearchTerm(cityOption.cityName);
                                }}
                              >
                                {cityOption.cityName} {cityOption.guideCount > 0 && (
                                  <span className="text-muted-foreground">({cityOption.guideCount})</span>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="p-2 text-muted-foreground">No cities found</div>
                          )}
                        </ScrollArea>
                      </Card>
                    )}
                  </div>

                  {/* Advanced filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Select
                      value={city}
                      onValueChange={setCity}
                      disabled={isLoadingData}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCities.map((cityOption) => (
                          <SelectItem key={cityOption.cityName} value={cityOption.cityName}>
                            {cityOption.cityName} {cityOption.guideCount > 0 && (
                              <span className="text-muted-foreground">({cityOption.guideCount})</span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={language}
                      onValueChange={setLanguage}
                      disabled={isLoadingData}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang._id} value={lang.languageName}>
                            {lang.languageName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={activity}
                      onValueChange={setActivity}
                      disabled={isLoadingData}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Activity" />
                      </SelectTrigger>
                      <SelectContent>
                        {activities.map((act) => (
                          <SelectItem key={act._id} value={act.activityName}>
                            {act.activityName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={gender}
                      onValueChange={setGender}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genders.map((gen) => (
                          <SelectItem key={gen} value={gen}>
                            {gen}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full sm:w-auto sm:ml-auto">
                    Search Guides
                  </Button>
                </form>
              </Card>
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