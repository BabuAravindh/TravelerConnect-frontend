"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// Fix Leaflet's default icon issue in Next.js
const icon = new L.Icon({
  iconUrl: "/marker-icon.png", // Store the image in public/ directory
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const cityCoordinates: { [key: string]: [number, number] } = {
  Paris: [48.8566, 2.3522],
  Rome: [41.9028, 12.4964],
  Barcelona: [41.3851, 2.1734],
  London: [51.5074, -0.1278],
  "New York": [40.7128, -74.0060],
};

const MapChart = ({ data }: { data: { city: string; bookings: number }[] }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevents hydration mismatch error in Next.js

  return (
    <MapContainer center={[48.8566, 2.3522]} zoom={3} className="w-full h-60 rounded-lg">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {data.map((location, index) => (
        cityCoordinates[location.city] && (
          <Marker key={index} position={cityCoordinates[location.city]} icon={icon}>
            <Popup>
              📍 {location.city} <br />
              📅 {location.bookings} Bookings
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
};

export default MapChart;
