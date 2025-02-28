"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

interface Profile {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  city: string;
  country: string;
  gender: string;
  profilePic: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    city: "",
    country: "",
    gender: "",
    profilePic: "/default-avatar.png",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) setUserId(storedUserId);
  }, []);

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/profile/${userId}`);
      const data = await res.json();

      if (!data.profile || Object.keys(data.profile).length === 0) {
        setIsNewUser(true);
      } else {
        setProfile({
          firstName: data.profile.firstName || "",
          lastName: data.profile.lastName || "",
          phone: data.profile.phoneNumber || "",
          dateOfBirth: data.profile.dateOfBirth || "",
          city: data.profile.address?.city || "",
          country: data.profile.address?.countryId || "",
          gender: data.profile.gender || "",
          profilePic: data.profile.profilePicture || "/default-avatar.png",
        });
        setIsNewUser(false);
      }
    } catch (err) {
      toast.error("Failed to fetch profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!userId) {
      toast.error("User not found. Please log in.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...profile }),
      });

      if (!response.ok) throw new Error("Failed to create profile.");

      toast.success("Profile created successfully!");
      setIsNewUser(false);
      await fetchProfile();
    } catch (error) {
      toast.error("Error creating profile.");
    }
  };

  const handleUpdateProfile = async () => {
    if (!userId) {
      toast.error("User not found. Please log in.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) throw new Error("Failed to update profile.");

      toast.success("Profile updated successfully!");
      await fetchProfile();
    } catch (error) {
      toast.error("Error updating profile.");
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="max-w-lg mx-auto p-4">
      <Toaster position="top-right" />

      {isNewUser ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">No profile found</h2>
          <p className="text-gray-600 mb-4">Click below to create your profile.</p>
          <button
            onClick={handleCreateProfile}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Create Profile
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Profile Details</h2>

          <label className="block text-gray-600">First Name:</label>
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            className="w-full border p-2 rounded-md mb-3"
          />

          <label className="block text-gray-600">Last Name:</label>
          <input
            type="text"
            value={profile.lastName}
            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            className="w-full border p-2 rounded-md mb-3"
          />

          <label className="block text-gray-600">Phone:</label>
          <input
            type="text"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="w-full border p-2 rounded-md mb-3"
          />

          <label className="block text-gray-600">Date of Birth:</label>
          <input
            type="date"
            value={profile.dateOfBirth}
            onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
            className="w-full border p-2 rounded-md mb-3"
          />

          <label className="block text-gray-600">City:</label>
          <input
            type="text"
            value={profile.city}
            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            className="w-full border p-2 rounded-md mb-3"
          />

          <label className="block text-gray-600">Country:</label>
          <input
            type="text"
            value={profile.country}
            onChange={(e) => setProfile({ ...profile, country: e.target.value })}
            className="w-full border p-2 rounded-md mb-3"
          />

          <label className="block text-gray-600">Gender:</label>
          <select
            value={profile.gender}
            onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
            className="w-full border p-2 rounded-md mb-3"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <div className="mt-4 flex justify-between">
            <button
              onClick={handleUpdateProfile}
              className="bg-green-500 text-white px-4 py-2 rounded-md"
            >
              Update Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
