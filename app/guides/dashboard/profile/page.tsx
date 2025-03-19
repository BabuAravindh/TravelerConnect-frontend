"use client";
import { useState } from "react";
import Image from "next/image";
import { Camera, Save } from "lucide-react";
import toast from "react-hot-toast";

const countries = ["India", "USA", "Canada", "Australia"];
const states = ["Maharashtra", "California", "Ontario", "New South Wales"];
const services = ["Hiking", "Trekking", "City Tours", "Wildlife Safaris"];
const languagesList = ["English", "Spanish", "French", "German"];

type Profile = {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth?: string;
  profilePicture?: string;
  countryId: string;
  stateId: string;
  dateJoined?: string;
  lastLogin?: string;
  gender: 'male' | 'female' | 'others';
  role: 'user' | 'guide';
  languages: string[];
  certifications?: string;
  govId: string;
  servicesOffered: string[];
  bio: string;
};

const EditProfilePage = () => {
  const [profile, setProfile] = useState<Profile>({
    userId: "123456",
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "123-456-7890",
    dateOfBirth: "1990-01-01",
    profilePicture: "https://picsum.photos/300/300?grayscale",
    countryId: "India",
    stateId: "Maharashtra",
    dateJoined: "2022-01-01",
    lastLogin: "2023-12-31",
    gender: "male",
    role: "guide",
    languages: ["English", "Spanish"],
    certifications: "Certified Mountain Guide",
    govId: "ID123456789",
    servicesOffered: ["Hiking", "Trekking"],
    bio: "Experienced guide with a deep passion for the outdoors.",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setProfile({ ...profile, profilePicture: URL.createObjectURL(file) });
    }
  };

  const handleSave = () => {
    toast.success("Profile updated successfully!");
    console.log("Updated Profile:", profile);  // This logs the updated profile in the frontend
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Guide Profile</h2>
      <div className="flex flex-col items-center">
        <div className="relative">
          <Image
            src={profile.profilePicture}
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

      <div className="grid grid-cols-2 gap-4 mt-4">
        {["firstName", "lastName", "phoneNumber", "dateOfBirth", "bio", "govId"].map((key) => (
          <div key={key}>
            <label className="font-medium capitalize">{key}</label>
            <input
              type="text"
              value={(profile as any)[key]}
              onChange={(e) =>
                setProfile({ ...profile, [key]: e.target.value })
              }
              className="w-full mt-1 p-2 border rounded-lg"
            />
          </div>
        ))}

        <div>
          <label className="font-medium">Gender</label>
          <select
            value={profile.gender}
            onChange={(e) =>
              setProfile({ ...profile, gender: e.target.value as 'male' | 'female' | 'others' })
            }
            className="w-full mt-1 p-2 border rounded-lg"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="others">Others</option>
          </select>
        </div>

        <div>
          <label className="font-medium">Country</label>
          <select
            value={profile.countryId}
            onChange={(e) =>
              setProfile({ ...profile, countryId: e.target.value })
            }
            className="w-full mt-1 p-2 border rounded-lg"
          >
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-medium">State</label>
          <select
            value={profile.stateId}
            onChange={(e) =>
              setProfile({ ...profile, stateId: e.target.value })
            }
            className="w-full mt-1 p-2 border rounded-lg"
          >
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-medium">Languages</label>
          <select
            multiple
            value={profile.languages}
            onChange={(e) =>
              setProfile({
                ...profile,
                languages: Array.from(e.target.selectedOptions, (opt) => opt.value),
              })
            }
            className="w-full mt-1 p-2 border rounded-lg"
          >
            {languagesList.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>

       
        <div>
          <label className="font-medium">Services Offered</label>
          <select
            multiple
            value={profile.servicesOffered}
            onChange={(e) =>
              setProfile({
                ...profile,
                servicesOffered: Array.from(e.target.selectedOptions, (opt) => opt.value),
              })
            }
            className="w-full mt-1 p-2 border rounded-lg"
          >
            {services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
      >
        <Save size={18} /> Save
      </button>
    </div>
  );
};

export default EditProfilePage;
