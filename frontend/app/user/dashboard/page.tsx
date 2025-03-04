"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { useState, useEffect } from "react";
import UserSidebar from "@/components/UserSidebar";

type Profile = {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  profilePicture: string;
  gender: string;
  role: string;
  dateJoined: string;
  address: {
    street: string;
    city: string;
    stateId: string | null;
    countryId: string | null;
    postalCode: string;
  };
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");

    if (!storedUserId) {
      setError("User ID not found. Please log in.");
      setIsLoading(false);
      return;
    }

    console.log(`Fetching profile from: http://localhost:5000/api/profile/${storedUserId}`);

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/profile/${storedUserId}`);
    
        if (!res.ok) {
          throw new Error("Failed to fetch profile data.");
        }
    
        const data: Profile = await res.json();
        setProfile(data);
      } catch (err: unknown) { // Use `unknown` instead of `any`
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile((prev) =>
      prev ? { ...prev, [e.target.name]: e.target.value } : null
    );
  };

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file.");
        return;
      }
      setProfile((prev) =>
        prev ? { ...prev, profilePicture: URL.createObjectURL(file) } : null
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white text-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white text-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#6999aa] to-[#527a8c]">
      {/* Sidebar */}
      <UserSidebar />

      {/* Profile Content */}
      <div className="flex flex-col items-center w-full p-6">
        <h1 className="text-white text-2xl mb-4">Profile</h1>

        {profile && (
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <Image
                src={profile.profilePicture || "/default-profile.png"}
                alt="Profile Picture"
                width={128}
                height={128}
                className="rounded-full object-cover"
              />
              <label className="absolute bottom-0 right-0 bg-gray-700 text-white p-1 rounded-full cursor-pointer">
                <Camera size={18} />
                <input type="file" className="hidden" onChange={handleProfilePicUpload} />
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-700">First Name</label>
              <input
                type="text"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                className="border p-2 rounded"
              />

              <label className="text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                className="border p-2 rounded"
              />

              <label className="text-gray-700">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleChange}
                className="border p-2 rounded"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
