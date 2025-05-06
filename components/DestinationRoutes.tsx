'use client';

import { Bus, Train, Plane, Ship, Bike, Car } from 'lucide-react';
import { useState, JSX } from 'react';

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

interface DestinationRoutesProps {
  city?: string;
  searchTerm?: string;
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

export default function DestinationRoutes({ city, searchTerm }: DestinationRoutesProps) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    from: city || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/routes/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate routes');
      }

      const newRoutes = await response.json();
      console.log('API Response:', newRoutes);

      let routesToAdd: Route[];
      if (Array.isArray(newRoutes) && newRoutes.length === 1 && Array.isArray(newRoutes[0].routes)) {
        routesToAdd = newRoutes[0].routes;
      } else if (Array.isArray(newRoutes)) {
        routesToAdd = newRoutes;
      } else {
        console.error('Unexpected response format:', newRoutes);
        routesToAdd = [newRoutes].filter(Boolean);
      }

      setRoutes(routesToAdd);
      setFormData({ from: city || '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = routes.filter((route) => {
    const matchesCity = !city || route.from.toLowerCase() === city.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      route.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.from.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCity && matchesSearch;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p>Generating routes...</p>
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

      <form onSubmit={handleSubmit} className="mb-8 bg-white shadow-lg rounded-lg p-5">
        <h3 className="text-lg font-semibold mb-4">Generate Travel Routes</h3>
        <div className="grid md:grid-cols-1 gap-4">
          <input
            type="text"
            name="from"
            value={formData.from}
            onChange={handleInputChange}
            placeholder="Starting City (e.g., Paris)"
            className="border rounded-lg p-2"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Routes'}
        </button>
      </form>

      {filteredRoutes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map((route, index) => (
            <div key={`generated-${index}`} className="bg-white shadow-lg rounded-lg p-5">
              <h3 className="text-lg font-semibold">
                {route.from} → {route.to}
              </h3>
              <div className="mt-4 space-y-3">
                <h4 className="font-medium">Transport Options:</h4>
                {route.transports.map((transport, tIndex) => (
                  <div key={`transport-${tIndex}`} className="border-l-4 border-blue-200 pl-3 py-1">
                    <div className="flex items-center gap-2">
                      {transportIcons[transport.mode] || <Bus size={20} className="text-gray-500" />}
                      <span className="font-medium">{transport.mode}</span>
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
        <p className="text-center text-gray-500">
          Enter a city to generate travel routes.
        </p>
      )}
    </div>
  );
}