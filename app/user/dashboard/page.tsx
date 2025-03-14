"use client";

import Image from "next/image";
import { Pencil, Save, X } from "lucide-react";
import { useState, useEffect } from "react";

import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext"; // Assuming you have an AuthContext

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Profile {
  firstName: string;
  lastName: string;
  profilePic: string;
  phone: string;
  dateOfBirth: string;
  city: string;
  country: string;
  dateJoined: string;
  lastLogin: string;
  gender: string;
}

export default function ProfilePage() {
  const { user } = useAuth(); // Get user info from AuthContext
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user?.id) return; // Ensure user ID is available

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/profile/${user.id}`);
        if (!res.ok) throw new Error("Profile not found");

        const data = await res.json();
        setProfile({
          firstName: data.firstName || "John",
          lastName: data.lastName || "Doe",
          profilePic: data.profilePic || "https://picsum.photos/300/300?grayscale",
          phone: data.phoneNumber || "",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
          city: data.address?.city || "Madurai",
          country: data.address?.country?.name || "India",
          dateJoined: data.dateJoined ? data.dateJoined.split("T")[0] : "",
          lastLogin: data.lastLogin ? data.lastLogin.split("T")[0] : "",
          gender: data.gender || "Male",
        });
      } catch (error) {
        console.error("❌ Error fetching profile:", error);
        toast.error("Failed to load profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !profile) {
      toast.error("User ID is missing.");
      return;
    }

    const updatedProfile = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phoneNumber: profile.phone,
      dateOfBirth: profile.dateOfBirth,
      address: { city: profile.city, country: profile.country },
      gender: profile.gender,
      profilePicture: profile.profilePic,
    };

    try {
      const res = await fetch(`${API_URL}/api/profile/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      toast.error("❌ " + (error as Error).message);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center text-white text-lg">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#6999aa] to-[#527a8c]">
     
      <div className="flex-grow flex justify-center items-center px-6 py-10">
        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8">
          {/* Profile Picture Section */}
          <div className="bg-white/20 p-6 rounded-xl w-full md:w-1/3 flex flex-col items-center">
            <h2 className="text-xl font-bold text-white mb-4">Profile Picture</h2>
            <div className="relative w-28 h-28">
              <Image
                src={profile?.profilePic || ""}
                alt="Profile"
                width={144}
                height={144}
                className="rounded-full"
              />
            </div>
          </div>

          {/* Profile Details Section */}
          <div className="bg-white/20 p-6 rounded-xl w-full md:w-2/3">
            <h2 className="text-xl font-bold text-white text-center">Profile Details</h2>

            {!isEditing ? (
              <div className="mt-6 space-y-4 text-white">
                <p><strong>Name:</strong> {profile?.firstName} {profile?.lastName}</p>
                <p><strong>Phone:</strong> {profile?.phone}</p>
                <p><strong>Date of Birth:</strong> {profile?.dateOfBirth}</p>
                <p><strong>City:</strong> {profile?.city}</p>
                <p><strong>Country:</strong> {profile?.country}</p>
                <p><strong>Gender:</strong> {profile?.gender}</p>
                <button
                  onClick={handleEdit}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2"
                >
                  <Pencil size={16} /> Edit Profile
                </button>
              </div>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={handleSave}>
                {["firstName", "lastName", "phone", "dateOfBirth", "gender"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-200">{field}</label>
                    <input
                      type="text"
                      name={field}
                      value={profile?.[field as keyof Profile] || ""}
                      onChange={handleChange}
                      className="mt-1 w-full p-2 border rounded-lg bg-white/30 text-white"
                      required
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-200">City</label>
                  <input
                    type="text"
                    name="city"
                    value={profile?.city || ""}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border rounded-lg bg-white/30 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={profile?.country || ""}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border rounded-lg bg-white/30 text-white"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
                  >
                    <Save size={16} /> Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
