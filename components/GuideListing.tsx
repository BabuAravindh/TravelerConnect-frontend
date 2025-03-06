"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

const guides = [
  { 
    id: 1, 
    name: "John Doe", 
    location: "Paris, France", 
    rating: 4.8, 
    image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
    bannerImage: "https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg"
  },
  { 
    id: 2, 
    name: "Sophia Lee", 
    location: "Kyoto, Japan", 
    rating: 4.9, 
    image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
    bannerImage: "https://images.pexels.com/photos/209074/pexels-photo-209074.jpeg"
  },
  { 
    id: 3, 
    name: "Carlos Mendes", 
    location: "Rio de Janeiro, Brazil", 
    rating: 4.7, 
    image: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg",
    bannerImage: "https://images.pexels.com/photos/772803/pexels-photo-772803.jpeg"
  },
  { 
    id: 4, 
    name: "Aisha Khan", 
    location: "Bali, Indonesia", 
    rating: 4.7, 
    image: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg",
    bannerImage: "https://images.pexels.com/photos/2190283/pexels-photo-2190283.jpeg"
  },
  { 
    id: 5, 
    name: "Liam Smith", 
    location: "Cape Town, South Africa", 
    rating: 4.6, 
    image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
    bannerImage: "https://images.pexels.com/photos/325807/pexels-photo-325807.jpeg"
  },
  { 
    id: 6, 
    name: "Emily Davis", 
    location: "New York, USA", 
    rating: 4.8, 
    image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
    bannerImage: "https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg"
  },
];

const GuideListing = () => {
  return (
    <div className="container max-w-7xl mx-auto px-6 py-12 mt-32">
      <h2 className="text-4xl font-bold text-center mb-10 text-gray-900">🌍 Find Your Local Guide</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {guides.map((guide) => (
          <div
            key={guide.id}
            className="bg-white/30 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="relative w-full h-52">
              <Image src={guide.bannerImage} alt={`${guide.name} banner`} layout="fill" objectFit="cover" className="rounded-t-2xl" />
            </div>
            <div className="p-6 text-center">
              <div className="relative -mt-16 w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image src={guide.image} alt={guide.name} width={100} height={100} className="object-cover" />
              </div>
              <h3 className="text-xl font-semibold mt-4 text-gray-900">{guide.name}</h3>
              <p className="text-gray-600">{guide.location}</p>
              <div className="flex items-center justify-center mt-3">
                <Star className="text-yellow-500" size={20} />
                <span className="ml-2 text-lg font-medium text-gray-800">{guide.rating}</span>
              </div>
              <Link href={`/guides/${guide.id}`}>
                <button className="mt-5 bg-button text-white px-6 py-2 rounded-full hover:bg-gray-800 transition">
                  View Profile
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuideListing;