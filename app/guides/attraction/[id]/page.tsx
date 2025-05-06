"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Star, MapPin, CalendarDays, DollarSign, ChevronLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import GuideListing from "@/components/GuideListing";
import DestinationRoutes from "@/components/DestinationRoutes";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import { Attraction } from "./attractionType";

export default function AttractionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestingChat, setRequestingChat] = useState(false);

  useEffect(() => {
    const fetchAttraction = async () => {
      if (!id) {
        setError("Invalid attraction ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attractions/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch attraction: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data) {
          throw new Error("No attraction data received");
        }

        setAttraction(data);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(
          error instanceof Error
            ? `Unable to load attraction: ${error.message}. Please try again.`
            : "An unknown error occurred. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttraction();
  }, [id]);

  const handleChatRequest = async () => {
    if (!user) {
      toast.error("Please sign in to request a chat");
      router.push("/login");
      return;
    }

    if (!attraction?.guideId) {
      toast.error("This attraction has no guide assigned");
      return;
    }

    setRequestingChat(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          customerId: user.id,
          guideId: attraction.guideId,
          attractionId: attraction._id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send request");

      toast.success("Request sent to guide successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setRequestingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition flex items-center"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12 bg-gray-100 rounded-xl shadow-sm">
          <p className="text-gray-600 text-lg">Attraction not found</p>
          <button
            onClick={() => router.push("/attractions")}
            className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Browse Attractions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center text-gray-600 hover:text-blue-500 transition-colors"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Back to Attractions
          </button>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {/* Image Gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
              {attraction.images.length > 0 ? (
                attraction.images.map((image, index) => (
                  <div key={index} className="relative h-64 w-full">
                    <Image
                      src={image}
                      alt={`${attraction.name} - Image ${index + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-lg hover:opacity-90 transition-opacity"
                    />
                  </div>
                ))
              ) : (
                <div className="relative h-64 w-full bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">No images available</p>
                </div>
              )}
            </div>

            {/* Attraction Details */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-3">{attraction.name}</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                      {attraction.category}
                    </span>
                    {attraction.rating ? (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-sm font-medium text-gray-700">
                          {attraction.rating.toFixed(1)}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <button
                  onClick={handleChatRequest}
                  disabled={requestingChat || !attraction.guideId}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition ${
                    requestingChat || !attraction.guideId
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {requestingChat ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Request Chat with Guide"
                  )}
                </button>
              </div>

              <div className="flex flex-wrap gap-4 mb-6 text-gray-600">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                  <span>{attraction.city || "Unknown City"}</span>
                </div>
                {attraction.price ? (
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4 text-blue-500" />
                    <span>${attraction.price.toFixed(2)}</span>
                  </div>
                ) : null}
                <div className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4 text-blue-500" />
                  <span>Added: {new Date(attraction.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Description</h2>
                <p className="text-gray-600 leading-relaxed">{attraction.description}</p>
              </div>

              <div className="pt-4 border-t border-gray-200 text-sm text-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Guide:</span>
                  {attraction.guideId ? (
                    <span className="text-gray-800">Guide available</span>
                  ) : (
                    <span className="text-gray-500">No guide assigned</span>
                  )}
                </div>
                <p className="mb-1">
                  <span className="font-medium">Last updated:</span>{" "}
                  {new Date(attraction.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {attraction.city && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Routes to {attraction.city}
              </h2>
              <DestinationRoutes city={attraction.city} />
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Available Guides in {attraction.city}
              </h2>
              <GuideListing
                city={attraction.city}
                searchTerm=""
                language=""
                activity=""
                gender=""
                loading={false}
              />
              <ReviewForm entityId={attraction._id} entityType="attraction" />
              <ReviewList entityId={attraction._id} entityType="attraction" />
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}