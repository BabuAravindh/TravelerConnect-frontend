"use client";

import { Bus, Train, Plane, Ship, Bike, Car, Star, MapPin, Clock } from 'lucide-react';
import { useState, useEffect, JSX } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
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
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [creditsInfo, setCreditsInfo] = useState<{ routes: number; attractions: number } | null>(null);

  const setDefaultCreditCosts = () => {
    setCreditsInfo({
      routes: 2,
      attractions: 3,
    });
  };

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

  const handleConfirmFetch = async () => {
    setShowPermissionModal(false);
    try {
      setGeneralError(null);
      await Promise.all([fetchRoutes(selectedCity), fetchAttractions()]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred while fetching data.';
      setGeneralError(message);
    }
  };

  useEffect(() => {
    if (!selectedCity) {
      setGeneralError("Please select a city to view travel routes and attractions.");
      return;
    }

    if (authLoading || !user) return;

    setDefaultCreditCosts();
    setShowPermissionModal(true);
  }, [selectedCity, user, authLoading]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md text-center">
        <div className="bg-gray-100 p-6 rounded-lg max-w-md mx-auto">
          <p className="text-xl font-semibold text-gray-800 mb-4">
            Please log in to view attractions and travel routes
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (showPermissionModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold mb-4">Credit Deduction Notice</h3>
          <p className="mb-4">
            Fetching travel information will deduct credits from your account:
          </p>
          <ul className="mb-4 space-y-2">
            {creditsInfo ? (
              <>
                <li>• Routes: {creditsInfo.routes} credits</li>
                <li>• Attractions: {creditsInfo.attractions} credits</li>
                <li className="font-semibold">
                  • Total: {creditsInfo.routes + creditsInfo.attractions} credits
                </li>
              </>
            ) : (
              <li>Loading credit information...</li>
            )}
          </ul>
          <p className="mb-6 text-sm text-gray-600">
            Please use this feature wisely as credits are limited.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowPermissionModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmFetch}
              disabled={!creditsInfo}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition disabled:bg-gray-400"
            >
              Confirm & Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (routesLoading || attractionsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-600">Loading travel information...</p>
      </div>
    );
  }

  if (generalError) {
    return (
      <div className="bg-primary text-white p-4 rounded-lg">
        {generalError}
      </div>
    );
  }

  const hasInsufficientCreditsError =
    (routesError && routesError.toLowerCase().includes("insufficient credits")) ||
    (attractionsError && attractionsError.toLowerCase().includes("insufficient credits"));

  const filteredRoutes = routes.filter((route) => {
    const matchesCity = !selectedCity || route.from.toLowerCase() === selectedCity.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      route.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.from.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCity && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Attractions Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Things to Do in {selectedCity}
            </h2>
            <Link href="#" className="text-primary hover:underline font-medium">
              See all attractions
            </Link>
          </div>
          
          {attractionsError ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              <p>{attractionsError}</p>
            </div>
          ) : attractions.length === 0 ? (
            <div className="bg-gray-100 text-gray-600 p-8 rounded-lg text-center">
              No attractions available for this city.
            </div>
          ) : (
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              autoplay={{ delay: 5000 }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              navigation
              pagination={{ clickable: true }}
              className="my-4"
            >
              {attractions.map((attraction) => {
                const cacheKey = attraction.cacheKey || `${selectedCity}:${attraction.name.replace(/\s+/g, "_")}`;
                return (
                  <SwiperSlide key={cacheKey}>
                    <Link href={`/guides/attraction/${encodeURIComponent(cacheKey)}`} className="block h-full group">
                      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col border border-gray-200">
                        <div className="relative h-48 w-full overflow-hidden">
                          <Image
                            src={attraction.images[0]}
                            alt={attraction.name}
                            fill
                            style={{ objectFit: "cover" }}
                            className="group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded flex items-center">
                            <Star className="text-yellow-500 fill-yellow-500 mr-1" size={16} />
                            <span className="text-sm font-medium">{attraction.rating?.toFixed(1) || '4.5'}</span>
                          </div>
                        </div>
                        <div className="p-4 flex-grow">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                            {attraction.name}
                          </h3>
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin size={16} className="mr-1" />
                            <span className="text-sm">{attraction.category}</span>
                          </div>
                          <p className="text-gray-500 text-sm line-clamp-3 mb-3">
                            {attraction.description}
                          </p>
                        </div>
                        <div className="px-4 pb-4">
                          <button className="w-full bg-primary hover:bg-opacity-90 text-white py-2 px-4 rounded-lg transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}
        </div>
      </div>

      {/* Routes Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Travel Routes {selectedCity && `from ${selectedCity}`}
            </h2>
            <Link href="#" className="text-primary hover:underline font-medium">
              Plan a trip
            </Link>
          </div>
          
          {routesError ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              <p>{routesError}</p>
            </div>
          ) : filteredRoutes.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoutes.map((route, index) => (
                <div key={`generated-${index}`} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-800 capitalize">
                        {route.from} → {route.to}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Popular
                      </span>
                    </div>
                    
                    <div className="mt-4 space-y-4">
                      <h4 className="font-medium text-gray-700 border-b pb-2">Transport Options:</h4>
                      {route.transports.map((transport, tIndex) => (
                        <div key={`transport-${tIndex}`} className="border-l-4 border-primary pl-3 py-2 bg-gray-50 rounded-r">
                          <div className="flex items-center gap-3">
                            {transportIcons[transport.mode] || <Bus size={20} className="text-gray-500" />}
                            <div>
                              <span className="font-medium text-gray-800">{transport.mode}</span>
                              <div className="flex items-center text-sm text-gray-600 mt-1">
                                <Clock size={14} className="mr-1" />
                                <span>Duration: {transport.duration}</span>
                              </div>
                            </div>
                          </div>
                          {transport.details && (
                            <div className="mt-2 text-xs text-gray-500 bg-white p-2 rounded">
                              {transport.details}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 text-xs text-gray-400 flex justify-between items-center">
                      <span>Updated: {new Date(route.updatedAt).toLocaleDateString()}</span>
                      <button className="text-primary hover:underline text-sm">
                        Save Route
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <div className="max-w-md mx-auto">
                <Plane size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No routes found</h3>
                <p className="text-gray-500 mb-4">
                  We couldn't find any travel routes from {selectedCity}. Try a different city or check back later.
                </p>
                <button className="bg-primary hover:bg-opacity-90 text-white py-2 px-6 rounded-lg transition-colors">
                  Explore Nearby Cities
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}