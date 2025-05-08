"use client";

import { Bus, Train, Plane, Ship, Bike, Car } from 'lucide-react';
import { useState, useEffect, JSX } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useAuth } from "../context/AuthContext";

type TransportMode = {
  mode: string;
  duration: string;
  details?: string;
};

type Route = {
  from: string;
  to: string;
  transports: TransportMode[];
  createdAt: string;
  updatedAt: string;
};

interface Attraction {
  name: string;
  description: string;
  city: string;
  cityId: string;
  images: string[];
  category: string;
  rating: number;
  createdAt: string;
  cacheKey?: string;
}

interface TravelRoutesAndAttractionsProps {
  selectedCity: string;
  searchTerm?: string;
}

const transportIcons: Record<string, JSX.Element> = {
  Bus: <Bus size={20} className="text-blue-500" />,
  Train: <Train size={20} className="text-green-600" />,
  Flight: <Plane size={20} className="text-red-500" />,
  Ferry: <Ship size={20} className="text-purple-500" />,
  'Private Vehicle': <Car size={20} className="text-yellow-600" />,
  Bicycle: <Bike size={20} className="text-teal-500" />,
  Motorcycle: <Bike size={20} className="text-orange-500" />,
  Car: <Car size={20} className="text-yellow-600" />,
};

export default function TravelRoutesAndAttractions({ selectedCity, searchTerm }: TravelRoutesAndAttractionsProps) {
  const { user, loading: authLoading } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [attractionsLoading, setAttractionsLoading] = useState(false);
  const [routesError, setRoutesError] = useState<string | null>(null);
  const [attractionsError, setAttractionsError] = useState<string | null>(null);

  // Fetch routes
  const fetchRoutes = async (fromCity: string) => {
    if (!user) return;

    setRoutesLoading(true);
    setRoutesError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/routes/generate/${fromCity}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch routes');
      }

      const newRoutes = await response.json();
      console.log('Routes API Response:', newRoutes);

      let routesToAdd: Route[];
      if (Array.isArray(newRoutes) && newRoutes.length === 1 && Array.isArray(newRoutes[0].routes)) {
        routesToAdd = newRoutes[0].routes;
      } else if (Array.isArray(newRoutes)) {
        routesToAdd = newRoutes;
      } else {
        console.error('Unexpected routes response format:', newRoutes);
        routesToAdd = [newRoutes].filter(Boolean);
      }

      setRoutes(routesToAdd);
    } catch (err) {
      setRoutesError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setRoutesLoading(false);
    }
  };

  // Fetch attractions
  const fetchAttractions = async () => {
    if (!selectedCity || !user) return;

    setAttractionsLoading(true);
    setAttractionsError(null);

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
      setAttractionsError("Failed to load attractions. Please try again.");
    } finally {
      setAttractionsLoading(false);
    }
  };

  // Fetch data when selectedCity or user changes
  useEffect(() => {
    if (selectedCity && user && !authLoading) {
      fetchRoutes(selectedCity);
      fetchAttractions();
    }
  }, [selectedCity, user, authLoading]);

  // If still loading authentication state
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  // If user is not logged in, show login prompt only
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-xl max-w-md mx-auto">
          <p className="text-xl font-semibold text-white mb-4">
            Please log in to view attractions and travel routes
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  // If routes or attractions are loading
  if (routesLoading || attractionsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">Loading travel information...</p>
      </div>
    );
  }

  // Filter routes based on search term
  const filteredRoutes = routes.filter((route) => {
    const matchesCity = !selectedCity || route.from.toLowerCase() === selectedCity.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      route.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.from.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCity && matchesSearch;
  });

  // Attractions carousel content
  const attractionsContent = (
    <div className="py-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Attractions in {selectedCity}
      </h2>
      {attractionsError ? (
        <div className="text-red-500 text-center py-8 bg-red-50 rounded-lg">
          {attractionsError}
        </div>
      ) : attractions.length === 0 ? (
        <div className="text-gray-600 text-center py-8 bg-gray-100 rounded-lg">
          No attractions available for this city.
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
            const cacheKey = attraction.cacheKey || `${selectedCity}:${attraction.name.replace(/\s+/g, "_")}`;
            return (
              <SwiperSlide key={attraction.cacheKey || `${selectedCity}:${attraction.name.replace(/\s+/g, "_")}`}>
                <Link href={`/guides/attraction/${encodeURIComponent(attraction.cacheKey || `${selectedCity}:${attraction.name.replace(/\s+/g, "_")}`)}`} className="block h-full">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48 w-full">
                      <Image
                        src={attraction.images[0]}
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

  // Routes content
  const routesContent = (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Travel Routes {selectedCity && `from ${selectedCity}`}
      </h2>
      {routesError ? (
        <div className="text-red-500 text-center py-8 bg-red-50 rounded-lg">
          {routesError}
        </div>
      ) : filteredRoutes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map((route, index) => (
            <div key={`generated-${index}`} className="bg-white shadow-lg rounded-lg p-5">
              <h3 className="text-lg font-semibold capitalize text-gray-800">
                {route.from} → {route.to}
              </h3>
              <div className="mt-4 space-y-3">
                <h4 className="font-medium text-gray-700">Transport Options:</h4>
                {route.transports.map((transport, tIndex) => (
                  <div key={`transport-${tIndex}`} className="border-l-4 border-blue-200 pl-3 py-1">
                    <div className="flex items-center gap-2">
                      {transportIcons[transport.mode] || <Bus size={20} className="text-gray-500" />}
                      <span className="font-medium text-gray-800">{transport.mode}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <div>Duration: {transport.duration}</div>
                      {transport.details && <div className="mt-1">Details: {transport.details}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-400">
                Generated: {new Date(route.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8 bg-gray-100 rounded-lg">
          No routes available. Please try a different city.
        </p>
      )}
    </div>
  );

  return (
    <div className="relative max-w-7xl mx-auto">
      {attractionsContent}
      {routesContent}
    </div>
  );
}