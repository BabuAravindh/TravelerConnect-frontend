"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import { List, GripHorizontal } from "lucide-react";

interface Attraction {
  id: number;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  city: string;
  activities: string[]; // Added for activity filtering
}

interface AttractionsCarouselProps {
  city: string;
  language: string;
  activity: string;
}

const attractions: Attraction[] = [
  {
    id: 1,
    name: "Madurai Meenakshi Amman Temple",
    image: "/images/meenakshi-temple.jpg",
    rating: 4.7,
    reviews: 4306,
    category: "Religious Sites",
    city: "Madurai",
    activities: ["City Tour"],
  },
  {
    id: 2,
    name: "Aayiram Kaal Mandapam",
    image: "/images/aayiram-kaal-mandapam.jpg",
    rating: 4.6,
    reviews: 281,
    category: "Religious Sites",
    city: "Madurai",
    activities: ["City Tour"],
  },
  {
    id: 3,
    name: "Chennai Marina Beach",
    image: "/images/marina-beach.jpg",
    rating: 4.3,
    reviews: 5281,
    category: "Beaches",
    city: "Chennai",
    activities: ["Water Sports", "City Tour"],
  },
  {
    id: 4,
    name: "Mumbai Gateway of India",
    image: "/images/gateway-of-india.jpg",
    rating: 4.6,
    reviews: 6391,
    category: "Historical Sites",
    city: "Mumbai",
    activities: ["City Tour"],
  },
  {
    id: 5,
    name: "Bangalore Lalbagh Botanical Garden",
    image: "/images/lalbagh.jpg",
    rating: 4.4,
    reviews: 2956,
    category: "Gardens",
    city: "Bangalore",
    activities: ["City Tour"],
  },
  {
    id: 6,
    name: "Kochi Fort Kochi",
    image: "/images/fort-kochi.jpg",
    rating: 4.5,
    reviews: 3206,
    category: "Historical Sites",
    city: "Kochi",
    activities: ["Water Sports", "City Tour"],
  },
  {
    id: 7,
    name: "Manali Rohtang Pass",
    image: "/images/rohtang-pass.jpg",
    rating: 4.8,
    reviews: 1875,
    category: "Nature",
    city: "Manali",
    activities: ["Trekking", "Wildlife Safari"],
  },
];

export default function AttractionsCarousel({ city, language, activity }: AttractionsCarouselProps) {
  const [viewMode, setViewMode] = useState<"carousel" | "list">("carousel");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAttractions = attractions.filter((attraction) => {
    const matchesCity = !city || attraction.city.toLowerCase() === city.toLowerCase();
    const matchesSearch = !searchTerm || attraction.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActivity = !activity || attraction.activities.some(act => act.toLowerCase() === activity.toLowerCase());
    return matchesCity && matchesSearch && matchesActivity;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          Things to do in {city || "All Cities"} {activity && `for ${activity}`}
        </h2>
        <div className="flex gap-2">
          <button
            className={`p-2 rounded ${viewMode === "carousel" ? "bg-button text-white" : "bg-gray-200"}`}
            onClick={() => setViewMode("carousel")}
          >
            <GripHorizontal size={20} />
          </button>
          <button
            className={`p-2 rounded ${viewMode === "list" ? "bg-button text-white" : "bg-gray-200"}`}
            onClick={() => setViewMode("list")}
          >
            <List size={20} />
          </button>
        </div>
      </div>

   

      {filteredAttractions.length > 0 ? (
        viewMode === "carousel" ? (
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {filteredAttractions.map((attraction) => (
              <SwiperSlide key={attraction.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="relative">
                  <Image
                    src={attraction.image}
                    alt={attraction.name}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                  <button className="absolute top-3 right-3 bg-white p-1 rounded-full shadow-md">❤️</button>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{attraction.name}</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-green-600 font-bold">{attraction.rating}</span>
                    <span className="text-gray-500 ml-2">({attraction.reviews})</span>
                  </div>
                  <p className="text-gray-500 text-sm">{attraction.category}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAttractions.map((attraction) => (
              <div key={attraction.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="relative">
                  <Image
                    src={attraction.image}
                    alt={attraction.name}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                  <button className="absolute top-3 right-3 bg-white p-1 rounded-full shadow-md">❤️</button>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{attraction.name}</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-green-600 font-bold">{attraction.rating}</span>
                    <span className="text-gray-500 ml-2">({attraction.reviews})</span>
                  </div>
                  <p className="text-gray-500 text-sm">{attraction.category}</p>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <p className="text-center text-gray-500">
          No attractions found for {city || "this search"}{activity && ` with ${activity}`}.
        </p>
      )}
    </div>
  );
}