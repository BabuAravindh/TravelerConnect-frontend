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
  const [creditsInfo, setCreditsInfo] = useState<{routes: number, attractions: number} | null>(null);

  // // Fetch credit cost information
  // const fetchCreditCosts = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     if (!token) return;

  //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/credits/costs`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       setCreditsInfo({
  //         routes: data.routesCost,
  //         attractions: data.attractionsCost
  //       });
  //     }
  //   } catch (err) {
  //     console.error("Failed to fetch credit costs:", err);
  //   }
  // };

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

  // Handle user confirmation to fetch data
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

  // Fetch data when selectedCity or user changes
  useEffect(() => {
    if (!selectedCity) {
      setGeneralError("Please select a city to view travel routes and attractions.");
      return;
    }

    if (authLoading || !user) return;

    // // Fetch credit costs first
    // fetchCreditCosts().then(() => {
    //   // Show permission modal with credit costs
    //   setShowPermissionModal(true);
    // });
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

  // Permission modal
  if (showPermissionModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold mb-4">Credit Deduction Notice</h3>
          <p className="mb-4">
            Fetching travel information will deduct credits from your account:
          </p>
          <ul className="mb-4 space-y-2">
            {creditsInfo && (
              <>
                <li>• Routes: {creditsInfo.routes} credits</li>
                <li>• Attractions: {creditsInfo.attractions} credits</li>
                <li className="font-semibold">• Total: {creditsInfo.routes + creditsInfo.attractions} credits</li>
              </>
            )}
          </ul>
          <p className="mb-6 text-sm text-gray-600">
            Please use this feature wisely as credits are limited. You can request more credits from the admin if needed.
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
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              Confirm & Continue
            </button>
          </div>
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

  // Check if either error is due to insufficient credits error
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
      {/* Attractions Section with TripAdvisor-style design */}
      <div className="py-8 px-4 bg-white rounded-xl shadow-md mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Things to Do in {selectedCity}
          </h2>
          <Link href="#" className="text-blue-600 hover:underline font-medium">
            See all attractions
          </Link>
        </div>
        
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
            className="my-8"
          >
            {attractions.map((attraction) => {
              const cacheKey = attraction.cacheKey || `${selectedCity}:${attraction.name.replace(/\s+/g, "_")}`;
              return (
                <SwiperSlide key={cacheKey}>
                  <Link href={`/guides/attraction/${encodeURIComponent(cacheKey)}`} className="block h-full group">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={attraction.images[0]}
                          alt={attraction.name}
                          fill
                          style={{ objectFit: "cover" }}
                          className="rounded-t-lg group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded flex items-center">
                          <Star className="text-yellow-500 fill-yellow-500 mr-1" size={16} />
                          <span className="text-sm font-medium">{attraction.rating?.toFixed(1) || '4.5'}</span>
                        </div>
                      </div>
                      <div className="p-4 flex-grow">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
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
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
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

      {/* Routes Section with TripAdvisor-style design */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Travel Routes {selectedCity && `from ${selectedCity}`}
          </h2>
          <Link href="#" className="text-blue-600 hover:underline font-medium">
            Plan a trip
          </Link>
        </div>
        
        {routesError ? (
          <div className="text-red-500 text-center py-8 bg-red-50 rounded-lg">
            <p>{routesError}</p>
          </div>
        ) : filteredRoutes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoutes.map((route, index) => (
              <div key={`generated-${index}`} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
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
                      <div key={`transport-${tIndex}`} className="border-l-4 border-blue-400 pl-3 py-2 bg-gray-50 rounded-r">
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
                    <button className="text-blue-600 hover:underline text-sm">
                      Save Route
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-100 rounded-lg">
            <div className="max-w-md mx-auto">
              <Plane size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No routes found</h3>
              <p className="text-gray-500 mb-4">
                We couldn't find any travel routes from {selectedCity}. Try a different city or check back later.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors">
                Explore Nearby Cities
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}