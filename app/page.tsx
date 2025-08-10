"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import CityInsights from "@/components/ChatBot";
import { Footer } from "@/components/Footer";
import GuideListing from "@/components/GuideListing";
import HeroSection from "@/components/Header";
import { Guide } from "./guides/[id]/GuiteTypes";
import TravelRoutesAndAttractions from "@/components/TravelRouteAndAttractions";
import AIRecommendation from "@/components/TravelPlanner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface LocationData {
  address: {
    city?: string;
    town?: string;
    village?: string;
  };
}

const Page = () => {
  const [city, setCity] = useState("");
  const [language, setLanguage] = useState("");
  const [activity, setActivity] = useState("");
  const [gender, setGender] = useState("");
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const { toast } = useToast();

  const getCityFromCoordinates = async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/reverse.php?key=${process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&format=json`
      );
      
      if (!response.ok) {
        throw new Error(`LocationIQ API error: ${response.status}`);
      }

      const data: LocationData = await response.json();
      return data.address?.city || data.address?.town || data.address?.village || "";
    } catch (error) {
      console.error("Error in LocationIQ reverse geocoding:", error);
      setLocationError("Could not determine your current city");
      return "";
    }
  };

  const getUserLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      const detectedCity = await getCityFromCoordinates(latitude, longitude);
      
      if (detectedCity) {
        setCity(detectedCity);
        toast({
          title: "Location detected",
          description: `We've set your location to ${detectedCity}`,
        });
      }
    } catch (error) {
      console.error("Geolocation error:", error);
      setLocationError("Could not access your location. Please enable location services.");
    }
  }, [toast]);

  const fetchGuides = async () => {
    if (!city) {
      toast({
        variant: "destructive",
        title: "No city selected",
        description: "Please select a city to search for guides",
      });
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.append("city", city);
      if (language) params.append("language", language);
      if (activity) params.append("activity", activity);
      if (gender) params.append("gender", gender);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/search/guides?${params.toString()}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGuides(Array.isArray(data) ? data : []);
      
      if (data.length === 0) {
        toast({
          description: "No guides found matching your criteria",
        });
      }
    } catch (error) {
      console.error("Error fetching guides:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch guides. Please try again.",
      });
      setGuides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <HeroSection
        city={city}
        setCity={setCity}
        language={language}
        setLanguage={setLanguage}
        activity={activity}
        setActivity={setActivity}
        gender={gender}
        setGender={setGender}
        onSearch={fetchGuides}
      />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {locationError && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>{locationError}</AlertDescription>
          </Alert>
        )}

        {/* AI Recommendation Section */}
        <section>
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Trip Planner AI</h2>
            <AIRecommendation city={city} />
          </Card>
        </section>

        {/* Travel Routes Section */}
        <section>
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Travel Routes & Attractions</h2>
            {city ? (
              <TravelRoutesAndAttractions selectedCity={city} />
            ) : (
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-64 w-full" />
              </div>
            )}
          </Card>
        </section>

        {/* Guides Listing Section */}
        <section>
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Available Guides</h2>
              <Button 
                onClick={fetchGuides}
                disabled={loading}
              >
                {loading ? "Searching..." : "Refresh Results"}
              </Button>
            </div>
            <GuideListing
              city={city}
              language={language}
              activity={activity}
              gender={gender}
              guides={guides}
              loading={loading} searchTerm={""}            />
          </Card>
        </section>
      </main>

      {/* Chat Bot */}
      <CityInsights cityName={city} />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Page;