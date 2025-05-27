"use client";

import { Bus, Train, Plane, Ship, Bike, Car, Star, MapPin, Clock, ChevronRight, Calendar, Compass, Utensils, Users, Briefcase, Paintbrush, Building2 } from 'lucide-react';
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

type Item = {
  _id?: string;
  name?: string;
  description?: string;
  city: string;
  cityId: string;
  images?: string[];
  category?: string;
  rating?: number;
  from?: string;
  to?: string;
  transports?: TransportMode[];
  guideId?: string;
  type: 'attractions' | 'events' | 'adventures' | 'cuisines' | 'travelRoutes';
  createdAt: string;
  updatedAt?: string;
  cacheKey?: string;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

type PoliticalContext = {
  MP: {
    name: string;
    constituency: string;
    party: string;
  };
  MLA: {
    name: string;
    constituency: string;
    party: string;
  }[];
};

type Personality = {
  name: string;
  description: string;
};

type PopularFor = {
  business: string;
  craft: string;
  events: string;
};

type CityDetails = {
  city: string;
  latitude?: number;
  longitude?: number;
  country?: string;
  population?: number;
  description?: string;
  cityMap?: string;
  capital?: string;
  politicalContext?: PoliticalContext;
  historicalImportance?: string;
  topPersonalities?: Personality[];
  popularFor?: PopularFor;
};

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
  const [items, setItems] = useState<Item[]>([]);
  const [cityDetails, setCityDetails] = useState<CityDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'attractions' | 'routes'>('attractions');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error("NEXT_PUBLIC_API_URL is not defined in environment variables.");
  }

  const fetchCityItems = async () => {
    if (!selectedCity || !user) {
      return "You must be logged in and select a city to view items.";
    }

    if (!apiUrl) {
      return "API URL is not configured.";
    }

    try {
      if (!navigator.onLine) {
        throw new Error("You are offline. Please check your internet connection and try again.");
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const response = await fetch(
        `${apiUrl}/api/attractions?cityName=${encodeURIComponent(selectedCity)}`,
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
        } else if (response.status === 404) {
          throw new Error("No items found for this city.");
        } else if (response.status === 429) {
          throw new Error("Too many requests. Please try again later.");
        } else if (response.status >= 500) {
          throw new Error("Server error while fetching items. Please try again later.");
        } else {
          throw new Error(`Failed to fetch items: ${statusText}`);
        }
      }

      const data = await response.json();
      if (!data.cityDetails || !Array.isArray(data.items)) {
        throw new Error("Received invalid data from the server. Please try again.");
      }

      setCityDetails(data.cityDetails);
      return data.items;
    } catch (err) {
      return err instanceof Error ? err.message : 'An unknown error occurred while fetching items.';
    }
  };

  const fetchRoutes = async () => {
    if (!selectedCity || !user) {
      return "You must be logged in and select a city to view routes.";
    }

    if (!apiUrl) {
      return "API URL is not configured.";
    }

    try {
      if (!navigator.onLine) {
        throw new Error("You are offline. Please check your internet connection and try again.");
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const response = await fetch(
        `${apiUrl}/api/routes?cityName=${encodeURIComponent(selectedCity)}`,
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
        } else if (response.status === 404) {
          throw new Error("No routes found for this city.");
        } else if (response.status === 429) {
          throw new Error("Too many requests. Please try again later.");
        } else if (response.status >= 500) {
          throw new Error("Server error while fetching routes. Please try again later.");
        } else {
          throw new Error(`Failed to fetch routes: ${statusText}`);
        }
      }

      const routes: Item[] = await response.json();
      if (!Array.isArray(routes)) {
        throw new Error("Received invalid route data from the server. Please try again.");
      }

      return routes;
    } catch (err) {
      return err instanceof Error ? err.message : 'An unknown error occurred while fetching routes.';
    }
  };

  useEffect(() => {
    if (!selectedCity) {
      setError("Please select a city to view travel routes and items.");
      return;
    }

    if (authLoading || !user) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setCityDetails(null);

      const [itemsResult, routesResult] = await Promise.all([fetchCityItems(), fetchRoutes()]);

      const errors: string[] = [];
      let newItems: Item[] = [];

      if (typeof itemsResult === 'string') {
        errors.push(itemsResult);
      } else {
        newItems = itemsResult;
      }

      if (typeof routesResult === 'string') {
        errors.push(routesResult);
      } else {
        newItems = [...newItems.filter((item) => item.type !== 'travelRoutes'), ...routesResult];
      }

      // Deduplicate items by cacheKey, keeping the most recent updatedAt
      const itemMap = new Map<string, Item>();
      newItems.forEach((item) => {
        if (!item.cacheKey) return;
        const existing = itemMap.get(item.cacheKey);
        if (!existing || (item.updatedAt && existing.updatedAt && new Date(item.updatedAt) > new Date(existing.updatedAt))) {
          itemMap.set(item.cacheKey, item);
        }
      });
      setItems(Array.from(itemMap.values()));

      setError(errors.length > 0 ? errors.join(' ') : null);
      setLoading(false);
    };

    fetchData();
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
            Please log in to view items and travel routes
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-600">Loading travel information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  // Filter items by city and search term
  const filteredItems = items.filter((item) => {
    const matchesCity = !selectedCity || item.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesSearch = !searchTerm || (
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.from && item.from.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.to && item.to.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return matchesCity && matchesSearch;
  });

  // Group items by type and category
  const groupedItems: { [type: string]: { [category: string]: Item[] } } = {
    attractions: {},
    events: {},
    adventures: {},
    cuisines: {},
  };

  filteredItems.forEach((item) => {
    if (item.type === 'travelRoutes') return; // Handle routes separately
    const category = item.category || 'Uncategorized';
    if (!groupedItems[item.type][category]) {
      groupedItems[item.type][category] = [];
    }
    groupedItems[item.type][category].push(item);
  });

  // Sort categories alphabetically
  Object.keys(groupedItems).forEach((type) => {
    groupedItems[type] = Object.keys(groupedItems[type])
      .sort()
      .reduce((acc, category) => {
        acc[category] = groupedItems[type][category];
        return acc;
      }, {} as { [category: string]: Item[] });
  });

  // Separate routes
  const routes = filteredItems.filter((item) => item.type === 'travelRoutes');

  const renderCityOverview = () => (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          About {selectedCity}
        </h2>
        {cityDetails ? (
          <div className="space-y-4">
            {cityDetails.description && (
              <p className="text-gray-600 leading-relaxed">
                {cityDetails.description}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <MapPin size={20} className="text-primary mr-2" />
                <span className="text-gray-700">
                  Capital: {cityDetails.capital || 'N/A'}
                </span>
              </div>
              <div className="flex items-center">
                <Users size={20} className="text-primary mr-2" />
                <span className="text-gray-700">
                  Population: {cityDetails.population?.toLocaleString() || 'N/A'}
                </span>
              </div>
              {cityDetails.cityMap && (
                <div className="flex items-center">
                  <MapPin size={20} className="text-primary mr-2" />
                  <a
                    href={cityDetails.cityMap}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View City Map
                  </a>
                </div>
              )}
            </div>
            {cityDetails.historicalImportance && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Historical Importance</h3>
                <p className="text-gray-600 leading-relaxed">
                  {cityDetails.historicalImportance}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No overview available for this city.</p>
        )}
      </div>
    </section>
  );

  const renderFamousPersonalities = () => (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Famous Personalities from {selectedCity}
        </h2>
        {cityDetails?.topPersonalities && cityDetails.topPersonalities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cityDetails.topPersonalities.map((personality, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{personality.name}</h3>
                    <p className="text-sm text-gray-600">{personality.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 text-gray-600 p-8 rounded-lg text-center border border-gray-200">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p>No famous personalities listed for this city yet.</p>
          </div>
        )}
      </div>
    </section>
  );

  const renderPoliticalContext = () => (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Political Leadership in {selectedCity}
        </h2>
        {cityDetails?.politicalContext ? (
          <div className="space-y-6">
            {cityDetails.politicalContext.MP && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Member of Parliament (MP)</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-800 font-medium">{cityDetails.politicalContext.MP.name}</p>
                  <p className="text-gray-600 text-sm">Constituency: {cityDetails.politicalContext.MP.constituency}</p>
                  <p className="text-gray-600 text-sm">Party: {cityDetails.politicalContext.MP.party}</p>
                </div>
              </div>
            )}
            {cityDetails.politicalContext.MLA && cityDetails.politicalContext.MLA.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Members of Legislative Assembly (MLA)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cityDetails.politicalContext.MLA.map((mla, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-800 font-medium">{mla.name}</p>
                      <p className="text-gray-600 text-sm">Constituency: {mla.constituency}</p>
                      <p className="text-gray-600 text-sm">Party: {mla.party}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 text-gray-600 p-8 rounded-lg text-center border border-gray-200">
            <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
            <p>No political information available for this city yet.</p>
          </div>
        )}
      </div>
    </section>
  );

  const renderWhatKnownFor = () => (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          What {selectedCity} is Known For
        </h2>
        {cityDetails?.popularFor ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase size={24} className="text-primary" />
                <h3 className="text-lg font-semibold text-gray-700">Business</h3>
              </div>
              <p className="text-gray-600 text-sm">{cityDetails.popularFor.business}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Paintbrush size={24} className="text-primary" />
                <h3 className="text-lg font-semibold text-gray-700">Craft</h3>
              </div>
              <p className="text-gray-600 text-sm">{cityDetails.popularFor.craft}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Calendar size={24} className="text-primary" />
                <h3 className="text-lg font-semibold text-gray-700">Events</h3>
              </div>
              <p className="text-gray-600 text-sm">{cityDetails.popularFor.events}</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 text-gray-600 p-8 rounded-lg text-center border border-gray-200">
            <p>No information available about what this city is known for.</p>
          </div>
        )}
      </div>
    </section>
  );

  const renderAttractionsTab = () => (
    <div className="space-y-8">
      {renderCityOverview()}
      {renderWhatKnownFor()}
      {renderFamousPersonalities()}
      {renderPoliticalContext()}

      {/* Attractions Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Things to Do in {selectedCity}
            </h2>
            <Link href="#" className="text-primary hover:underline font-medium flex items-center">
              See all <ChevronRight size={18} />
            </Link>
          </div>
          
          {Object.keys(groupedItems.attractions).length === 0 ? (
            <div className="bg-gray-50 text-gray-600 p-8 rounded-lg text-center border border-gray-200">
              <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
              <p>No attractions found for this city yet.</p>
            </div>
          ) : (
            Object.entries(groupedItems.attractions).map(([category, items]) => (
              <div key={category} className="mb-10 last:mb-0">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">{category}</h3>
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={24}
                  slidesPerView={1}
                  autoplay={{ delay: 5000, disableOnInteraction: true }}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                  }}
                  navigation
                  pagination={{ clickable: true }}
                  className="my-4 pb-8"
                >
                  {items.map((item) => (
                    <SwiperSlide key={item.cacheKey || item._id}>
                      <Link href={`/guides/attraction/${encodeURIComponent(item.cacheKey || item._id || '')}`} className="block h-full group">
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col border border-gray-200">
                          <div className="relative h-48 w-full overflow-hidden">
                            <Image
                              src={item.images?.[0] || '/placeholder-attraction.jpg'}
                              alt={item.name || 'Item'}
                              fill
                              style={{ objectFit: "cover" }}
                              className="group-hover:scale-105 transition-transform duration-500"
                              quality={80}
                            />
                            <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded flex items-center shadow-xs">
                              <Star className="text-yellow-500 fill-yellow-500 mr-1" size={16} />
                              <span className="text-sm font-medium">{item.rating?.toFixed(1) || '4.5'}</span>
                            </div>
                          </div>
                          <div className="p-4 flex-grow">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                              {item.name || 'Unnamed Item'}
                            </h3>
                            <div className="flex items-center text-gray-600 mb-2 text-sm">
                              <MapPin size={14} className="mr-1" />
                              <span>{item.category || item.type}</span>
                            </div>
                            <p className="text-gray-500 text-sm line-clamp-3 mb-3">
                              {item.description || 'No description available.'}
                            </p>
                          </div>
                          <div className="px-4 pb-4">
                            <button className="w-full bg-primary/10 hover:bg-primary/20 text-primary py-2 px-4 rounded-lg transition-colors font-medium text-sm">
                              View Details
                            </button>
                          </div>
                        </div>
                      </Link>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Events Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Events in {selectedCity}
            </h2>
            <Link href="#" className="text-primary hover:underline font-medium flex items-center">
              See all <ChevronRight size={18} />
            </Link>
          </div>
          
          {Object.keys(groupedItems.events).length === 0 ? (
            <div className="bg-gray-50 text-gray-600 p-8 rounded-lg text-center border border-gray-200">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <p>No events scheduled for this city yet.</p>
            </div>
          ) : (
            Object.entries(groupedItems.events).map(([category, items]) => (
              <div key={category} className="mb-10 last:mb-0">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <Link 
                      key={item.cacheKey || item._id} 
                      href={`/guides/event/${encodeURIComponent(item.cacheKey || item._id || '')}`} 
                      className="block h-full group"
                    >
                      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col border border-gray-200">
                        <div className="relative h-40 w-full overflow-hidden">
                          <Image
                            src={item.images?.[0] || '/placeholder-event.jpg'}
                            alt={item.name || 'Event'}
                            fill
                            style={{ objectFit: "cover" }}
                            className="group-hover:scale-105 transition-transform duration-500"
                            quality={80}
                          />
                        </div>
                        <div className="p-4 flex-grow">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                            {item.name || 'Unnamed Event'}
                          </h3>
                          <div className="flex items-center text-gray-600 mb-2 text-sm">
                            <Clock size={14} className="mr-1" />
                            <span>Upcoming event</span>
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {item.description || 'No description available.'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Adventures Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Adventures in {selectedCity}
            </h2>
            <Link href="#" className="text-primary hover:underline font-medium flex items-center">
              See all <ChevronRight size={18} />
            </Link>
          </div>
          
          {Object.keys(groupedItems.adventures).length === 0 ? (
            <div className="bg-gray-50 text-gray-600 p-8 rounded-lg text-center border border-gray-200">
              <Compass size={48} className="mx-auto text-gray-400 mb-4" />
              <p>No adventures available for this city yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(groupedItems.adventures).map(([category, items]) => (
                <div key={category} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">{category}</h3>
                  {items.map((item) => (
                    <Link 
                      key={item.cacheKey || item._id} 
                      href={`/guides/adventure/${encodeURIComponent(item.cacheKey || item._id || '')}`} 
                      className="block group"
                    >
                      <div className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-colors">
                        <div className="relative h-16 w-16 min-w-[64px] overflow-hidden rounded-md">
                          <Image
                            src={item.images?.[0] || '/placeholder-adventure.jpg'}
                            alt={item.name || 'Adventure'}
                            fill
                            style={{ objectFit: "cover" }}
                            className="group-hover:scale-105 transition-transform duration-500"
                            quality={80}
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-gray-800 group-hover:text-primary transition-colors">
                            {item.name || 'Unnamed Adventure'}
                          </h3>
                          <div className="flex items-center text-gray-600 text-xs mt-1">
                            <Star className="text-yellow-500 fill-yellow-500 mr-1" size={12} />
                            <span>{item.rating?.toFixed(1) || '4.5'}</span>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cuisines Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Local Cuisines in {selectedCity}
            </h2>
            <Link href="#" className="text-primary hover:underline font-medium flex items-center">
              See all <ChevronRight size={18} />
            </Link>
          </div>
          
          {Object.keys(groupedItems.cuisines).length === 0 ? (
            <div className="bg-gray-50 text-gray-600 p-8 rounded-lg text-center border border-gray-200">
              <Utensils size={48} className="mx-auto text-gray-400 mb-4" />
              <p>No cuisine information available for this city yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(groupedItems.cuisines).map(([category, items]) => (
                <div key={category} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">{category}</h3>
                  {items.map((item) => (
                    <Link 
                      key={item.cacheKey || item._id} 
                      href={`/guides/cuisine/${encodeURIComponent(item.cacheKey || item._id || '')}`} 
                      className="block group"
                    >
                      <div className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-colors text-center">
                        <div className="relative h-16 w-16 mb-3 overflow-hidden rounded-full">
                          <Image
                            src={item.images?.[0] || '/placeholder-food.jpg'}
                            alt={item.name || 'Cuisine'}
                            fill
                            style={{ objectFit: "cover" }}
                            className="group-hover:scale-110 transition-transform duration-500"
                            quality={80}
                          />
                        </div>
                        <h3 className="font-medium text-gray-800 group-hover:text-primary transition-colors text-sm">
                          {item.name || 'Local Dish'}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );

  const renderRoutesTab = () => (
    <div className="space-y-6">
      {/* Routes Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Travel Routes to {selectedCity}
            </h2>
            <button className="text-primary hover:underline font-medium flex items-center">
              Plan a custom trip <ChevronRight size={18} />
            </button>
          </div>
          
          {routes.length > 0 ? (
            <div className="space-y-6">
              {routes.map((route) => (
                <div key={route._id || route.cacheKey} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800 capitalize">
                        {route.from} → {route.to}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Popular Route
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">Transport Options:</h4>
                      {route.transports?.map((transport, tIndex) => (
                        <div key={`transport-${tIndex}`} className="border-l-4 border-primary pl-3 py-2 bg-gray-50 rounded-r">
                          <div className="flex items-center gap-3">
                            {transportIcons[transport.mode] || <Bus size={20} className="text-gray-500" />}
                            <div className="flex-grow">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-800">{transport.mode}</span>
                                <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                                  {transport.duration}
                                </span>
                              </div>
                              {transport.details && (
                                <div className="mt-1 text-xs text-gray-500">
                                  {transport.details}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        Updated: {new Date(route.updatedAt || route.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <button className="text-primary hover:bg-primary/10 text-sm px-3 py-1 rounded-lg transition-colors">
                          Save
                        </button>
                        <button className="bg-primary hover:bg-primary/90 text-white text-sm px-3 py-1 rounded-lg transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
              <div className="max-w-md mx-auto">
                <Plane size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No routes found</h3>
                <p className="text-gray-500 mb-4">
                  We couldn't find any travel routes to {selectedCity}. Try a different city or check back later.
                </p>
                <button className="bg-primary hover:bg-opacity-90 text-white py-2 px-6 rounded-lg transition-colors">
                  Explore Nearby Cities
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Transportation Guide Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Getting Around {selectedCity}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(transportIcons).map(([mode, icon]) => (
              <div key={mode} className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200 hover:border-primary/50 transition-colors">
                <div className="flex justify-center mb-2">
                  {icon}
                </div>
                <h3 className="font-medium text-gray-800">{mode}</h3>
                <p className="text-xs text-gray-500 mt-1">Available in city</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Explore {selectedCity}
        </h1>
        <p className="text-gray-600">
          Discover the best attractions, events, and travel routes in {selectedCity}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('attractions')}
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'attractions' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <MapPin size={16} />
          Attractions & Activities
        </button>
        <button
          onClick={() => setActiveTab('routes')}
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'routes' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Plane size={16} />
          Travel Routes
        </button>
      </div>

      {activeTab === 'attractions' ? renderAttractionsTab() : renderRoutesTab()}
    </div>
  );
}