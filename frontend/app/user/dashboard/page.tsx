"use client";

import Image from "next/image";
import { Camera, Menu } from "lucide-react";
import { userProfiles } from "@/data/data";
import { useState, useEffect } from "react";
import UserSidebar from "@/components/UserSidebar";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const profileData = userProfiles.profile1;
    if (profileData) {
      setProfile({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        profilePic: profileData.profilePicture || "/default-avatar.png",
        phone: profileData.phoneNumber || "",
        dateOfBirth: profileData.dateOfBirth || "",
        city: profileData.address.city || "",
        country: profileData.address.countryId || "",
        dateJoined: profileData.dateJoined || "",
        lastLogin: profileData.lastLogin || "",
        gender: profileData.gender || "",
      });
      setIsLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfilePicUpload = (e) => {
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
      setProfile((prev) => ({
        ...prev,
        profilePic: URL.createObjectURL(file),
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white text-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#6999aa] to-[#527a8c]">
      {/* Sidebar (Hidden on small screens) */}
     

      {/* Mobile Sidebar Toggle */}
      <button
        className="md:hidden absolute top-4 left-4 text-white bg-[#1b374c] p-2 rounded-md hover:bg-[#132430] transition"
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full bg-white w-64 shadow-lg z-50 transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <UserSidebar />
          </div>
        </div>
      )}

      {/* Profile Content */}
      <div className="flex-grow flex justify-center items-center px-4 py-10">
        <div className="bg-white/20 backdrop-blur-lg shadow-lg rounded-xl p-8 w-full max-w-lg border border-[#6999aa]/50">
          {/* Header */}
          <h2 className="text-2xl font-bold text-white text-center">Public Profile</h2>

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mt-6">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32">
              <Image
                src={profile.profilePic}
                alt="Profile Picture"
                width={128}
                height={128}
                className="object-cover w-full h-full rounded-full border-4 border-white shadow-md"
              />
              <label
                htmlFor="profilePicUpload"
                className="absolute bottom-2 right-2 bg-[#1b374c] text-white p-2 rounded-full cursor-pointer hover:bg-[#132430] transition"
              >
                <Camera size={18} />
              </label>
              <input
                type="file"
                id="profilePicUpload"
                className="hidden"
                onChange={handleProfilePicUpload}
                accept="image/*"
              />
            </div>
            <p className="text-sm text-gray-200 mt-2">Upload a new profile picture</p>
          </div>

          {/* Profile Form */}
          <form className="mt-6 space-y-4">
            {[
              { label: "First Name", name: "firstName", type: "text" },
              { label: "Last Name", name: "lastName", type: "text" },
              { label: "Phone", name: "phone", type: "text" },
              { label: "Date of Birth", name: "dateOfBirth", type: "date" },
              { label: "City", name: "city", type: "text" },
              { label: "Country", name: "country", type: "text" },
              { label: "Gender", name: "gender", type: "text" },
            ].map(({ label, name, type }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-200">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={profile[name]}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-lg bg-white/30 backdrop-blur-lg text-white placeholder-gray-300 border-[#6999aa]/50 focus:ring-white focus:border-white"
                  placeholder={label}
                  required
                />
              </div>
            ))}

            {/* Read-only Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200">Date Joined</label>
                <input
                  type="text"
                  value={profile.dateJoined}
                  readOnly
                  className="mt-1 block w-full p-2 border rounded-lg bg-white/30 text-white border-[#6999aa]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200">Last Login</label>
                <input
                  type="text"
                  value={profile.lastLogin}
                  readOnly
                  className="mt-1 block w-full p-2 border rounded-lg bg-white/30 text-white border-[#6999aa]/50"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-center mt-4">
              <button
                type="submit"
                className="px-6 py-2 text-white bg-[#1b374c] rounded-lg hover:bg-[#132430] transition shadow-md hover:shadow-lg hover:scale-105 transform duration-300"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="hidden md:block">
        <UserSidebar />
      </div>
    </div>
  );
}