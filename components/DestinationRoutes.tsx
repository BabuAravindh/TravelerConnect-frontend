"use client";

import { Bus, Train, Plane, Ship, Bike, Car } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type TransportMode = {
  mode: string;
  duration: string;
  details?: string;
  _id?: string;
};

type Route = {
  _id: string;
  from: string;
  to: string;
  transports: TransportMode[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

interface DestinationRoutesProps {
  city?: string;
  language?: string;
  activity?: string;
}

const transportIcons: Record<string, JSX.Element> = {
  Bus: <Bus size={20} className="text-blue-500" />, 
  Train: <Train size={20} className="text-green-500" />, 
  Flight: <Plane size={20} className="text-red-500" />, 
  Ferry: <Ship size={20} className="text-purple-500" />, 
  'Private Vehicle': <Car size={20} className="text-yellow-500" />, 
  Bicycle: <Bike size={20} className="text-teal-500" />, 
  Motorcycle: <Bike size={20} className="text-orange-500" />,
};

export default function DestinationRoutes({ city }: DestinationRoutesProps) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/api/routes`;
        if (city) {
          url += `?from=${encodeURIComponent(city)}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch routes');
        }
        const data = await response.json();
        setRoutes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [city]);

  const filteredRoutes = routes.filter((route) => {
    const matchesCity = !city || route.from.toLowerCase() === city.toLowerCase();
    const matchesSearch = !searchTerm || 
      route.to.toLowerCase().includes(searchTerm.toLowerCase()) || 
      route.from.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCity && matchesSearch;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p>Loading routes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Travel Routes {city && `from ${city}`}
      </h2>

      
      {filteredRoutes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map((route) => (
            <div key={route._id} className="bg-white shadow-lg rounded-lg p-5">
              <h3 className="text-lg font-semibold">
                {route.from} → {route.to}
              </h3>
              <div className="mt-4 space-y-3">
                {route.transports.map((transport, index) => (
                  <div key={transport._id || index} className="border-l-4 border-blue-200 pl-3 py-1">
                    <div className="flex items-center gap-2">
                      {transportIcons[transport.mode] || <Bus size={20} className="text-gray-500" />}
                      <span className="font-medium">{transport.mode}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <div>Duration: {transport.duration}</div>
                      {transport.details && (
                        <div className="mt-1">Details: {transport.details}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-400">
                Created: {new Date(route.createdAt).toLocaleString()}
              </div>
              <button 
                onClick={() => router.push(`/guides/routes/${route._id}`)} 
                className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition">
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No routes found {city ? `from ${city}` : "matching your search"}.
        </p>
      )}
    </div>
  );
}
