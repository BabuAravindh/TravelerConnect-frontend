"use client";

import { Bus, Train, Plane } from "lucide-react";
import { useState } from "react";

type Route = {
  id: number;
  from: string;
  to: string;
  distance: string;
  duration: string;
  travelModes: { mode: string; icon: JSX.Element }[];
  activities?: string[]; // Added for activity filtering
};

interface DestinationRoutesProps {
  city: string;
  language: string;
  activity: string;
}

const routes: Route[] = [
  {
    id: 1,
    from: "Madurai",
    to: "Chennai",
    distance: "462 km",
    duration: "8h (Bus) | 7h 30m (Train) | 1h (Flight)",
    travelModes: [
      { mode: "Bus", icon: <Bus size={20} className="text-blue-500" /> },
      { mode: "Train", icon: <Train size={20} className="text-green-500" /> },
      { mode: "Flight", icon: <Plane size={20} className="text-red-500" /> },
    ],
    activities: ["City Tour", "Water Sports"],
  },
  {
    id: 2,
    from: "Madurai",
    to: "Mumbai",
    distance: "1,460 km",
    duration: "26h (Train) | 2h 30m (Flight)",
    travelModes: [
      { mode: "Train", icon: <Train size={20} className="text-green-500" /> },
      { mode: "Flight", icon: <Plane size={20} className="text-red-500" /> },
    ],
    activities: ["City Tour"],
  },
  {
    id: 3,
    from: "Madurai",
    to: "Bangalore",
    distance: "435 km",
    duration: "7h (Bus) | 6h 30m (Train) | 1h (Flight)",
    travelModes: [
      { mode: "Bus", icon: <Bus size={20} className="text-blue-500" /> },
      { mode: "Train", icon: <Train size={20} className="text-green-500" /> },
      { mode: "Flight", icon: <Plane size={20} className="text-red-500" /> },
    ],
    activities: ["City Tour"],
  },
  {
    id: 4,
    from: "Madurai",
    to: "Kochi",
    distance: "270 km",
    duration: "5h 30m (Bus) | 5h (Train)",
    travelModes: [
      { mode: "Bus", icon: <Bus size={20} className="text-blue-500" /> },
      { mode: "Train", icon: <Train size={20} className="text-green-500" /> },
    ],
    activities: ["Water Sports"],
  },
  {
    id: 5,
    from: "Madurai",
    to: "Ahmedabad",
    distance: "1,870 km",
    duration: "30h (Train) | 2h 45m (Flight)",
    travelModes: [
      { mode: "Train", icon: <Train size={20} className="text-green-500" /> },
      { mode: "Flight", icon: <Plane size={20} className="text-red-500" /> },
    ],
    activities: ["City Tour"],
  },
  {
    id: 6,
    from: "Madurai",
    to: "Manali",
    distance: "2,750 km",
    duration: "45h (Bus+Train) | 4h (Flight via Delhi)",
    travelModes: [
      { mode: "Bus", icon: <Bus size={20} className="text-blue-500" /> },
      { mode: "Train", icon: <Train size={20} className="text-green-500" /> },
      { mode: "Flight", icon: <Plane size={20} className="text-red-500" /> },
    ],
    activities: ["Trekking", "Wildlife Safari"],
  },
];

export default function DestinationRoutes({ city, language, activity }: DestinationRoutesProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRoutes = routes.filter((route) => {
    const matchesCity = !city || route.to.toLowerCase() === city.toLowerCase();
    const matchesSearch = !searchTerm || route.to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActivity = !activity || (route.activities && route.activities.some(act => act.toLowerCase() === activity.toLowerCase()));
    return matchesCity && matchesSearch && matchesActivity;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Travel Routes from Madurai {city && `to ${city}`} {activity && `for ${activity}`}
      </h2>
      
    

      {filteredRoutes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map((route) => (
            <div key={route.id} className="bg-white shadow-lg rounded-lg p-5">
              <h3 className="text-lg font-semibold">
                {route.from} → {route.to}
              </h3>
              <p className="text-gray-600 text-sm">{route.distance}</p>
              <p className="text-gray-500 text-sm mb-3">{route.duration}</p>

              <div className="flex gap-3">
                {route.travelModes.map((travel, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {travel.icon}
                    <span className="text-sm">{travel.mode}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No routes found for {city || "this search"}{activity && ` with ${activity}`}.
        </p>
      )}
    </div>
  );
}