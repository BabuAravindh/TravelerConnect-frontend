"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

interface Guide {
  _id: string;
  name: string;
  location: string;
  rating: number;
  image: string;
  bannerImage: string;
}

const GuideListing = () => {
  const [guides, setGuides] = useState<Guide[]>([]);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/guide/profile`);
        setGuides(data);
      } catch (error) {
        console.error("Error fetching guides:", error);
      }
    };

    fetchGuides();
  }, []);

  return (
    <div className="container max-w-7xl mx-auto px-6 py-12 mt-32">
      <h2 className="text-4xl font-bold text-center mb-10 text-gray-900">🌍 Find Your Local Guide</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {guides.map((guide) => (
          <div
            key={guide._id}
            className="bg-white/30 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="relative w-full h-52">
            <Image
  src={guide.bannerImage || "https://picsum.photos/800/300"}
  alt={`${guide.name} banner`}
  layout="fill"
  objectFit="cover"
  className="rounded-t-2xl"
/>



            </div>
            <div className="p-6 text-center">
              <div className="relative -mt-16 w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
              <Image
  src={guide.image || "https://picsum.photos/100"}
  alt={guide.name}
  width={100}
  height={100}
  className="object-cover"
/>
              </div>
              <h3 className="text-xl font-semibold mt-4 text-gray-900">{guide.name}</h3>
              <p className="text-gray-600">{guide.location}</p>
              <div className="flex items-center justify-center mt-3">
                <Star className="text-yellow-500" size={20} />
                <span className="ml-2 text-lg font-semibold text-gray-800">{guide.rating}</span>
              </div>
              <Link href={`/guides/${guide._id}`} passHref>
  <button className="mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition">
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
