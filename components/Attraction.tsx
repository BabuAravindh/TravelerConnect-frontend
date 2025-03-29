"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Clock } from "lucide-react";

interface Attraction {
  _id: string;
  name: string;
  description: string;
  city: string;
  images: string[];
  category: string;
  price: number;
  rating: number;
  duration: string;
  createdAt: string;
}

interface AttractionsCarouselProps {
  selectedCity: string;
}

export default function AttractionsCarousel({ selectedCity }: AttractionsCarouselProps) {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [filteredAttractions, setFilteredAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attractions`);
        
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }

        setAttractions(data);
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAttractions();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      setFilteredAttractions(
        attractions.filter(attraction => 
          attraction.city.toLowerCase() === selectedCity.toLowerCase()
        )
      );
    } else {
      setFilteredAttractions(attractions);
    }
  }, [selectedCity, attractions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg max-w-4xl mx-auto">
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  const displayAttractions = filteredAttractions.length > 0 || selectedCity ? filteredAttractions : attractions;

  if (displayAttractions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl max-w-4xl mx-auto">
        <p className="text-gray-500 text-lg">
          {selectedCity ? `No attractions found in ${selectedCity}` : "No attractions available"}
        </p>
        <p className="text-gray-400 mt-2">Check back later or explore other cities</p>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          {selectedCity ? `Explore ${selectedCity}` : "Discover Amazing Attractions"}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {selectedCity ? `Top-rated experiences in ${selectedCity}` : "Popular destinations across the world"}
        </p>
      </div>
      
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        pagination={{ 
          clickable: true,
          dynamicBullets: true
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
        className="relative group"
      >
        {displayAttractions.map((attraction) => (
          <SwiperSlide key={attraction._id}>
            <Link href={`/guides/attraction/${attraction._id}`}>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
                <div className="relative h-60 overflow-hidden">
                  <Image
                    src={attraction.images[0] || '/images/default-attraction.jpg'}
                    alt={attraction.name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="flex justify-between items-center">
                      <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded">
                        {attraction.category}
                      </span>
                      <div className="flex items-center bg-black/60 text-white px-2 py-1 rounded">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{attraction.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {attraction.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {attraction.description}
                  </p>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{attraction.city}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{attraction.duration || 'Flexible duration'}</span>
                  </div>
                  
                  
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}

        {/* Custom navigation buttons */}
        <div className="swiper-button-prev hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg hover:bg-gray-100 absolute left-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer transition-colors">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <div className="swiper-button-next hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg hover:bg-gray-100 absolute right-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer transition-colors">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Swiper>
    </section>
  );
}