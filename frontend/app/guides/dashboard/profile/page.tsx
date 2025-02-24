"use client"
import Image from "next/image";
import { useState } from "react";
import { Camera, Save, XCircle } from "lucide-react";
import GuideDashboard from "../page";

const initialProfile = {
  name: "Alex Johnson",
  profilePic: "/images/men2.jpg",
  bio: "Passionate tour guide with a love for history and culture. I specialize in immersive experiences around Barcelona.",
  experience: "5 Years",
  location: "Barcelona, Spain",
  languages: "English, Spanish, French",
  specialization: "Historical Tours, Food & Wine Tours, Art & Architecture",
  availability: "Monday - Saturday (9 AM - 6 PM)",
  pricePerTour: "$80 per tour",
  email: "alex.johnson@example.com",
  phone: "+34 678 901 234",
};

const EditProfilePage = () => {
  const [profile, setProfile] = useState(initialProfile);
  const [profilePic, setProfilePic] = useState(profile.profilePic);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Profile Saved", profile);
  };

  return (
    <GuideDashboard>
      <div className="max-w-3xl mx-auto p-6 ">
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
              if (file) setProfilePic(URL.createObjectURL(file));
            }} />
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <label className="font-medium">Full Name</label>
            <input type="text" name="name" value={profile.name} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" />
          </div>

          <div>
            <label className="font-medium">Location</label>
            <input type="text" name="location" value={profile.location} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" />
          </div>

          <div>
            <label className="font-medium">Experience</label>
            <input type="text" name="experience" value={profile.experience} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" />
          </div>

          <div>
            <label className="font-medium">Languages</label>
            <input type="text" name="languages" value={profile.languages} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" />
          </div>

          <div>
            <label className="font-medium">Specialization</label>
            <input type="text" name="specialization" value={profile.specialization} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" />
          </div>

          <div>
            <label className="font-medium">Availability</label>
            <input type="text" name="availability" value={profile.availability} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" />
          </div>

          <div>
            <label className="font-medium">Price Per Tour</label>
            <input type="text" name="pricePerTour" value={profile.pricePerTour} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" />
          </div>

          <div>
            <label className="font-medium">Email</label>
            <input type="email" name="email" value={profile.email} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" />
          </div>

          <div>
            <label className="font-medium">Phone</label>
            <input type="text" name="phone" value={profile.phone} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" />
          </div>
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
    </GuideDashboard>
  );
};

export default EditProfilePage;
