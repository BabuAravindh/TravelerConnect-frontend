"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { userProfiles } from "@/data/data";
import { useState, useEffect } from "react";
import UserSidebar from "@/components/UserSidebar";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
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
    <div className="min-h-screen flex bg-gradient-to-br from-[#6999aa] to-[#527a8c]">
      {/* Sidebar */}
      <UserSidebar />

      {/* Main Content */}
      <div className="flex-grow flex justify-center items-center px-6 py-10">
        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8">
          {/* Profile Picture Card */}
          <div className="bg-white/20 backdrop-blur-lg shadow-lg rounded-xl p-6 w-full md:w-1/3 flex flex-col items-center border border-[#6999aa]/50">
            <h2 className="text-xl font-bold text-white mb-4">Profile Picture</h2>
            <div className="relative w-28 h-28 sm:w-36 sm:h-36">
              <Image
                src={profile.profilePic}
                alt="Profile Picture"
                width={144}
                height={144}
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
            <p className="text-sm text-gray-200 mt-2">Upload a new picture</p>
          </div>

          {/* Profile Information Card */}
          <div className="bg-white/20 backdrop-blur-lg shadow-lg rounded-xl p-6 w-full md:w-2/3 border border-[#6999aa]/50">
            <h2 className="text-xl font-bold text-white text-center">Profile Details</h2>

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
                    className="mt-1 block w-full p-2 border rounded-lg bg-white/30 text-white placeholder-gray-300 border-[#6999aa]/50 focus:ring-white focus:border-white"
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
      </div>
    </div>
  );
}
