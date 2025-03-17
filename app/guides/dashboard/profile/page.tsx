"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Camera, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

type Profile = {
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  languages: string;
  specialization: string;
  availability: string;
  pricePerTour: string;
  profilePic?: string;
};

const EditProfilePage = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (loading || !user) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/guide/profile/${user.id}`
        );
        if (!response.ok) throw new Error("Failed to fetch profile");

        const data: Profile = await response.json();
        setProfile(data);
        setProfilePic(data.profilePic || "/default-profile.jpg");
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch profile.");
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [user, loading]);

  // ✅ Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return null;
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error("Image upload failed:", error);
      return null;
    }
  };

  // ✅ Form Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!profile?.name?.trim()) newErrors.name = "Name is required.";
    if (!profile?.email?.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(profile.email))
      newErrors.email = "Invalid email format.";

    if (!profile?.phone?.trim()) newErrors.phone = "Phone number is required.";
    else if (!/^\d{10}$/.test(profile.phone))
      newErrors.phone = "Phone must be 10 digits.";

    if (!profile?.location?.trim()) newErrors.location = "Location is required.";
    if (!profile?.experience?.trim()) newErrors.experience = "Experience is required.";
    if (!profile?.languages?.trim()) newErrors.languages = "Languages are required.";
    if (!profile?.specialization?.trim()) newErrors.specialization = "Specialization is required.";
    if (!profile?.availability?.trim()) newErrors.availability = "Availability is required.";
    if (!profile?.pricePerTour?.trim()) newErrors.pricePerTour = "Price per tour is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle Profile Update
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    let uploadedImageUrl = profile?.profilePic || "";
    if (selectedFile) {
      uploadedImageUrl = await uploadImage();
      if (!uploadedImageUrl) return toast.error("Image upload failed!");
    }

    try {
      if (!user) {
        toast.error("User not found.");
        return;
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/guide/profile/${user?.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...profile, profilePic: uploadedImageUrl }),
        }
      );

      if (!response.ok) throw new Error("Failed to update profile");
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("Profile update failed!");
    }
  };

  if (loading || fetching)
    return <div className="text-center p-6">Loading...</div>;
  if (!profile)
    return (
      <div className="text-center p-6 text-red-500">Profile not found</div>
    );

  return (
    <div className="flex">
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

        {/* Profile Image Upload */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Image
              src={profilePic || "/default-profile.jpg"}
              alt="Profile Picture"
              width={120}
              height={120}
              className="rounded-full shadow-md border"
            />
            <label
              htmlFor="profilePicUpload"
              className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full cursor-pointer"
            >
              <Camera size={18} />
            </label>
            <input
              type="file"
              id="profilePicUpload"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {[
            { label: "Name", key: "name" },
            { label: "Email", key: "email" },
            { label: "Phone", key: "phone" },
            { label: "Location", key: "location" },
            { label: "Experience", key: "experience" },
            { label: "Languages", key: "languages" },
            { label: "Specialization", key: "specialization" },
            { label: "Availability", key: "availability" },
            { label: "Price Per Tour", key: "pricePerTour" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="font-medium">{label}</label>
              <input
                type="text"
                value={profile?.[key] || ""}
                onChange={(e) =>
                  setProfile((prevProfile) => ({
                    ...prevProfile!,
                    [key]: e.target.value,
                  }))
                }
                className={`w-full mt-1 p-2 border rounded-lg ${
                  errors[key] ? "border-red-500" : ""
                }`}
              />
              {errors[key] && (
                <p className="text-red-500 text-sm mt-1">{errors[key]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
          >
            <Save size={18} />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
