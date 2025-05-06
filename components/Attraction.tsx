"use client";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useAuth } from "../context/AuthContext"; // Adjust path to your AuthContext

interface Attraction {
  name: string;
  description: string;
  city: string;
  cityId: string;
  images: string[]; // Backend ensures valid URLs
  category: string;
  rating: number;
  createdAt: string;
  cacheKey?: string;
}

interface AttractionsCarouselProps {
  selectedCity: string;
}

export default function AttractionsCarousel({ selectedCity }: AttractionsCarouselProps) {
  const { user, loading } = useAuth();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch attractions only if authenticated and city is selected
  useEffect(() => {
    async function fetchAttractions() {
      if (!selectedCity || !user) return;

      setFetchLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/attractions?cityName=${encodeURIComponent(selectedCity)}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch attractions: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Fetched attractions:", data);
        setAttractions(data);
      } catch (err) {
        console.error("Error fetching attractions:", err);
        setError("Failed to load attractions. Please try again.");
      } finally {
        setFetchLoading(false);
      }
    }

    if (user && !loading && selectedCity) {
      fetchAttractions();
    }
  }, [selectedCity, user, loading]);

  // Loading state with spinner
  if (loading || fetchLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  // Carousel content
  const carouselContent = (
    <div className="py-8 px-4">
      {error ? (
        <div className="text-red-500 text-center py-8 bg-red-50 rounded-lg">
          {error}
        </div>
      ) : attractions.length === 0 ? (
        <div className="text-gray-600 text-center py-8 bg-gray-100 rounded-lg">
  Please select a city to view attractions.
        </div>
      ) : (
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          navigation
          pagination={{ clickable: true }}
          className="my-8"
        >
          {attractions.map((attraction) => {
            const cacheKey = attraction.cacheKey || `${attraction.city}:${attraction.name.replace(/\s+/g, "_")}`;
            return (
              <SwiperSlide key={cacheKey}>
                <Link href={`/guides/attraction/${encodeURIComponent(cacheKey)}`} className="block h-full">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48 w-full">
                      <Image
                        src={attraction.images[0]} // Backend ensures valid URL
                        alt={attraction.name}
                        fill
                        style={{ objectFit: "cover" }}
                        className="rounded-t-lg"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-gray-800 truncate">{attraction.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{attraction.category}</p>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{attraction.description}</p>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
    </div>
  );

  // Wrap content with overlay if unauthenticated
  return (
    <div className="relative max-w-7xl mx-auto">
      <div className={!user ? "opacity-30" : ""}>{carouselContent}</div>
      {!user && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="text-center text-white bg-gray-800 bg-opacity-80 p-6 rounded-lg">
            <p className="text-xl font-semibold mb-4">Please log in to view attractions</p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Log In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}