"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Clock } from "lucide-react";

interface Attraction {
  _id: string;
  name: string;
  description: string;
  city: string;
  images: string[];
  category: string;
  price: number;
  rating: number;
  duration: string;
  createdAt: string;
}

interface AttractionsCarouselProps {
  selectedCity: string;
}

export default function AttractionsCarousel({
  selectedCity,
}: AttractionsCarouselProps) {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [filteredAttractions, setFilteredAttractions] = useState<Attraction[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/attractions`
        );

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received");
        }

        setAttractions(data);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttractions();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      setFilteredAttractions(
        attractions.filter(
          (attraction) =>
            attraction.city.toLowerCase() === selectedCity.toLowerCase()
        )
      );
    } else {
      setFilteredAttractions(attractions);
    }
  }, [selectedCity, attractions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-6 max-w-4xl mx-auto my-8 border border-red-100">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <svg
              className="h-5 w-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading attractions
            </h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm font-medium text-red-600 hover:text-red-500"
            >
              Try again →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayAttractions =
    filteredAttractions.length > 0 || selectedCity
      ? filteredAttractions
      : attractions;

  if (displayAttractions.length === 0) {
    return (
      <div className="text-center py-12 max-w-4xl mx-auto my-8">
        <div className="mx-auto h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <svg
            className="h-12 w-12 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {selectedCity
            ? `No attractions in ${selectedCity} yet`
            : "No attractions available"}
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          {selectedCity
            ? "Check back later or explore other cities"
            : "Our collection is growing. Please check back soon!"}
        </p>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full mb-4">
          {selectedCity ? "Local Experiences" : "Worldwide Adventures"}
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {selectedCity
            ? `Explore ${selectedCity}`
            : "Discover Amazing Attractions"}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {selectedCity
            ? `Top-rated experiences in ${selectedCity}`
            : "Curated collection of must-see destinations"}
        </p>
      </div>

      <div className="relative group">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
            el: ".swiper-pagination",
            renderBullet: (index, className) => {
              return `<span class="${className} bg-blue-500/30 hover:bg-blue-500/50 transition-all duration-200 w-2.5 h-2.5 mx-1"></span>`;
            },
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={displayAttractions.length >= 4} // Only enable loop if there are enough slides
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          className="!pb-12"
        >
          {displayAttractions.map((attraction) => (
            <SwiperSlide key={attraction._id}>
              <Link
                href={`/guides/attraction/${attraction._id}`}
                className="block h-full"
              >
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full flex flex-col border border-gray-100 overflow-hidden group/card">
                  <div className="relative h-60 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent z-10"></div>
                    <Image
                      src={
                        attraction.images[0] || "/images/default-attraction.jpg"
                      }
                      alt={attraction.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={false}
                    />
                    <div className="absolute bottom-4 left-4 right-4 z-20">
                      <div className="flex justify-between items-start">
                        <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm bg-opacity-90">
                          {attraction.category}
                        </span>
                        <div className="flex items-center bg-black/70 text-white px-3 py-1.5 rounded-full backdrop-blur-sm">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-xs font-medium">
                            {attraction.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 flex-grow flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {attraction.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {attraction.description}
                    </p>

                    <div className="mt-auto pt-4">
                      <div className="flex items-center text-gray-700 text-sm mb-2.5">
                        <MapPin className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                        <span className="truncate">{attraction.city}</span>
                      </div>

                      <div className="flex items-center text-gray-700 text-sm">
                        <Clock className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                        <span>
                          {attraction.duration || "Flexible duration"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom navigation buttons */}
        <div className="swiper-button-prev opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md hover:shadow-lg absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 cursor-pointer transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:scale-105">
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </div>
        <div className="swiper-button-next opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md hover:shadow-lg absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 cursor-pointer transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:scale-105">
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>

        {/* Custom pagination */}
        <div className="swiper-pagination !bottom-0 flex justify-center mt-8 space-x-1.5"></div>
      </div>
    </section>
  );
}
