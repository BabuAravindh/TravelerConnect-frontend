"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Profile {
  firstName: string;
  lastName: string;
  profilePicture: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  gender: string;
}

export default function CreateProfileForm() {
  const [profile, setProfile] = useState<Profile>({
    firstName: "",
    lastName: "",
    profilePicture: "https://picsum.photos/300/300?grayscale",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
    gender: "",
  });
  const route = useRouter()

  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Get userId from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      toast.error("User ID not found. Please log in.");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("User ID is missing. Please log in.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, userId }), // ✅ Include userId
      });

      if (!res.ok) throw new Error("Failed to create profile");

      toast.success("Profile created successfully!");
      
      setTimeout(() => route.push('/login'),3000)
    } catch (error) {
      console.error("❌ Error creating profile:", error);
      toast.error("Failed to create profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-4">Create Profile</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {Object.keys(profile).map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700">{field}</label>
            <input
              type="text"
              name={field}
              value={profile[field as keyof Profile]}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded-lg"
              required
            />
          </div>
        ))}
        <button type="submit" className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-500" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Profile"}
        </button>
      </form>
    </div>
  );
}
