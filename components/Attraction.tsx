
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
  images: (string | null)[]; // Images may contain null
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

  // Fetch attractions only if authenticated
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
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Include JWT token
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

    if (user && !loading) {
      fetchAttractions();
    }
  }, [selectedCity, user, loading]);

  // Show loading state during auth or fetch
  if (loading || fetchLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  // Carousel content (blurred if unauthenticated)
  const carouselContent = (
    <>
      {error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : attractions.length === 0 ? (
        <div className="text-center py-8">No attractions found for {selectedCity}.</div>
      ) : (
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={30}
          slidesPerView={3}
          navigation
          pagination={{ clickable: true }}
          className="my-8"
        >
          {attractions.map((attraction) => {
            const cacheKey = attraction.cacheKey || `${attraction.city}:${attraction.category || "default"}`;
            return (
              <SwiperSlide key={cacheKey}>
                <Link
                  href={`/guides/attraction/${encodeURIComponent(cacheKey)}`}
                  className="block h-full"
                >
                  <div className="relative h-64 w-full">
                    <Image
                      src={attraction.images[0] || "/about1.png"} // Use fallback if null
                      alt={attraction.name}
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-lg"
                      onError={(e) => {
                        console.warn(`Image failed for ${attraction.name}: ${attraction.images[0]}`);
                        e.currentTarget.src = "/about1.png"; // Fallback on error
                      }}
                    />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{attraction.name}</h3>
                  <p className="text-sm text-gray-600">{attraction.category}</p>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
    </>
  );

  // Wrap content with blur and overlay if unauthenticated
  return (
    <div className="relative">
      <div className={!user ? "filter blur-sm" : ""}>{carouselContent}</div>
      {!user && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center text-white">
            <p className="text-xl font-semibold mb-4">You need to log in to view attractions</p>
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
