
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
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Fetch routes
  const fetchRoutes = async (fromCity: string) => {
    if (!user) {
      setRoutesError("You must be logged in to fetch travel routes.");
      return;
    }

    setRoutesLoading(true);
    setRoutesError(null);

    try {
      if (!navigator.onLine) {
        throw new Error("You are offline. Please check your internet connection and try again.");
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/routes/generate/${fromCity}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const statusText = response.statusText || "Unknown error";
        if (response.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        } else if (response.status === 403) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "You do not have sufficient credits to fetch routes. Please request credits from the admin via the navbar.");
        } else if (response.status === 429) {
          throw new Error("Too many requests. Please try again later.");
        } else if (response.status >= 500) {
          throw new Error("Server error while fetching routes. Please try again later.");
        } else {
          throw new Error(`Failed to fetch routes: ${statusText}`);
        }
      }

      let newRoutes;
      try {
        newRoutes = await response.json();
      } catch (parseErr) {
        throw new Error("Failed to parse route data from the server. Please try again.");
      }

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

      if (!routesToAdd.every(route => route.from && route.to && Array.isArray(route.transports))) {
        throw new Error("Received invalid route data from the server. Please try again.");
      }

      setRoutes(routesToAdd);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred while fetching routes.';
      setRoutesError(message);
    } finally {
      setRoutesLoading(false);
    }
  };

  // Fetch attractions
  const fetchAttractions = async () => {
    if (!selectedCity || !user) {
      setAttractionsError("You must be logged in and select a city to fetch attractions.");
      return;
    }

    setAttractionsLoading(true);
    setAttractionsError(null);

    try {
      if (!navigator.onLine) {
        throw new Error("You are offline. Please check your internet connection and try again.");
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attractions?cityName=${encodeURIComponent(selectedCity)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const statusText = response.statusText || "Unknown error";
        if (response.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        } else if (response.status === 403) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "You do not have sufficient credits to fetch attractions. Please request credits from the admin via the navbar.");
        } else if (response.status === 404) {
          throw new Error("No attractions found for this city.");
        } else if (response.status === 429) {
          throw new Error("Too many requests. Please try again later.");
        } else if (response.status >= 500) {
          throw new Error("Server error while fetching attractions. Please try again later.");
        } else {
          throw new Error(`Failed to fetch attractions: ${statusText}`);
        }
      }

      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        throw new Error("Failed to parse attractions data from the server. Please try again.");
      }

      console.log("Fetched attractions:", data);

      if (!Array.isArray(data) || !data.every(attr => attr.name && attr.city && Array.isArray(attr.images))) {
        throw new Error("Received invalid attractions data from the server. Please try again.");
      }

      setAttractions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred while fetching attractions.';
      setAttractionsError(message);
    } finally {
      setAttractionsLoading(false);
    }
  };

  // Fetch data when selectedCity or user changes
  useEffect(() => {
    if (!selectedCity) {
      setGeneralError("Please select a city to view travel routes and attractions.");
      return;
    }

    if (authLoading || !user) return;

    const fetchData = async () => {
      try {
        setGeneralError(null);
        await Promise.all([fetchRoutes(selectedCity), fetchAttractions()]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred while fetching data.';
        setGeneralError(message);
      }
    };

    fetchData();
  }, [selectedCity, user, authLoading]);

  // If still loading authentication state
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">Loading authentication...</p>
      </div>
    );
  }

  // If user is not logged in, show login prompt
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

  // Display general errors from useEffect
  if (generalError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-red-500 text-center py-8 bg-red-50 rounded-lg">
          {generalError}
        </div>
      </div>
    );
  }

  // Check if either error is due to insufficient credits
  const hasInsufficientCreditsError =
    (routesError && routesError.toLowerCase().includes("insufficient credits")) ||
    (attractionsError && attractionsError.toLowerCase().includes("insufficient credits"));

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
          <p>{attractionsError}</p>
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
              <SwiperSlide key={cacheKey}>
                <Link href={`/guides/attraction/${encodeURIComponent(cacheKey)}`} className="block h-full">
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
          <p>{routesError}</p>
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
