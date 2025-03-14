"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CreateProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const id = user?.id; // ✅ User ID
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    city: "",
    country: "",
    gender: "Male",
  });
  const [loading, setLoading] = useState(false);

  if (!id) {
    toast.error("User not authenticated.");
    router.push("/login");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: id, ...formData }),
      });

      if (!res.ok) throw new Error("Failed to create profile");

      toast.success("Profile created successfully!");
      router.push("/user/profile"); // ✅ Redirect to profile page
    } catch (error) {
      console.error("❌ Error creating profile:", error);
      toast.error("Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#6999aa] to-[#527a8c] text-white">
      <div className="bg-white/10 p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-xl font-bold text-center mb-4">Create Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="p-2 bg-white/20 rounded-md text-black" required />
            <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="p-2 bg-white/20 rounded-md text-black" required />
          </div>
          <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="p-2 w-full bg-white/20 rounded-md text-black" required />
          <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="p-2 w-full bg-white/20 rounded-md text-black" required />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="p-2 bg-white/20 rounded-md text-black" required />
            <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} className="p-2 bg-white/20 rounded-md text-black" required />
          </div>
          <select name="gender" value={formData.gender} onChange={handleChange} className="p-2 w-full bg-white/20 rounded-md text-black" required>
            <option value="Male" className="text-black">Male</option>
            <option value="Female" className="text-black">Female</option>
            <option value="Other" className="text-black">Other</option>
          </select>
          <button type="submit" disabled={loading} className="w-full p-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
            {loading ? "Creating..." : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
