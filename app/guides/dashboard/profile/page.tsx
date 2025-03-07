"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Camera, Save, XCircle } from "lucide-react";
import UserSidebar from "@/components/UserSidebar";

const EditProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId"); // Replace with actual logged-in user ID

  // ✅ Fetch guide profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/guide/profile/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        setProfile(data);
        setProfilePic(data.profilePic || "/default-profile.jpg");
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (!profile) return <div className="text-center p-6 text-red-500">Profile not found</div>;

  // ✅ Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/guide/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
  
      if (!response.ok) throw new Error("Failed to update profile");
  
      // Refetch profile data
      const updatedResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/guide/profile/${userId}`);
      const updatedData = await updatedResponse.json();
      setProfile(updatedData); // Update UI
  
      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Error updating profile");
    }
  };
  

  return (
    <div className="flex flex-row">
      <UserSidebar />
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

        {/* Profile Image Upload */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Image src={profilePic} alt="Profile Picture" width={120} height={120} className="rounded-full shadow-md border" />
            <label htmlFor="profilePicUpload" className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full cursor-pointer">
              <Camera size={18} />
            </label>
            <input type="file" id="profilePicUpload" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setProfilePic(URL.createObjectURL(file)); // Update preview
              // TODO: Upload file to backend & update profile.profilePic
            }} />
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {["name", "location", "experience", "languages", "specialization", "availability", "pricePerTour", "email", "phone"].map((field) => (
            <div key={field}>
              <label className="font-medium capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
              <input type="text" name={field} value={profile[field] || ""} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex space-x-4">
          <button onClick={handleSave} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow">
            <Save size={18} />
            <span>Save</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow">
            <XCircle size={18} />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
