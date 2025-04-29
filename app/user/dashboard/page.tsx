"use client";

import Image from "next/image";
import { Save, X, Camera } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { ProfileService } from "@/services/user/profile/profile.service";
import { DropdownService } from "@/services/user/profile/dropdown.service";
import type { Profile } from "@/services/types/user/profile.type";
import type { Country, State } from "@/services/types/user/dropdown.types";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({
    userId: user?.id || "",
    firstName: "",
    lastName: "",
    profilePicture: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: { countryId: "", stateId: "", countryName: "", stateName: "" },
    gender: "male",
  });
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userId = user?.id;

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [profileData, dropdownData] = await Promise.all([
          userId ? ProfileService.fetchProfile(userId) : Promise.resolve(null),
          DropdownService.fetchAllDropdownData(),
        ]);

        if (profileData) {
          setProfile(profileData);
        }
        setCountries(dropdownData.countries);
        setStates(dropdownData.states);
      } catch (error: unknown) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  const handleCancel = () => {
    setProfilePicFile(null);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setProfile((prev) => ({
        ...prev,
        address: {
          ...prev.address!,
          [field]: value,
          ...(field === "countryId" && {
            countryName: countries.find((c) => c._id === value)?.countryName || "",
          }),
          ...(field === "stateId" && {
            stateName: states.find((s) => s._id === value)?.stateName || "",
          }),
        },
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      setProfile((prev) => ({
        ...prev,
        profilePicture: URL.createObjectURL(file),
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = ProfileService.validateProfile(profile, countries, states);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    setIsSubmitting(true);

    try {
      const savedProfile = await ProfileService.saveProfile(
        profile,
        profilePicFile,
        !!profile._id
      );

      setProfile(savedProfile);
      setProfilePicFile(null);
      toast.success("Profile saved successfully!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save profile";
      console.error("Error updating profile:", error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#6999aa]">
        <div className="text-white text-2xl">Loading profile...</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#6999aa] p-4">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6">
        {/* Profile Picture Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full md:w-1/3 flex flex-col items-center">
          <h2 className="text-xl font-semibold text-[#1b374c] mb-4">Profile Picture</h2>
          <div className="relative w-32 h-32">
            <Image
              src={profile.profilePicture || "/default-profile.png"}
              alt="Profile"
              width={128}
              height={128}
              className="rounded-full object-cover border-4 border-[#6999aa]"
              priority
            />
            <label className="absolute bottom-0 right-0 bg-[#1b374c] p-2 rounded-full cursor-pointer">
              <Camera size={16} className="text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full md:w-2/3">
          <h2 className="text-2xl font-semibold text-[#1b374c] text-center mb-6">
            {profile._id ? "Edit Profile" : "Create Your Profile"}
          </h2>

          <form className="space-y-4" onSubmit={handleSave}>
            <div>
              <label className="block text-sm font-medium text-[#1b374c]">First Name</label>
              <input
                type="text"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-[#6999aa] rounded-lg focus:ring-2 focus:ring-[#1b374c] focus:border-transparent"
                placeholder="Enter first name"
              />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1b374c]">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-[#6999aa] rounded-lg focus:ring-2 focus:ring-[#1b374c] focus:border-transparent"
                placeholder="Enter last name"
              />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1b374c]">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-[#6999aa] rounded-lg focus:ring-2 focus:ring-[#1b374c] focus:border-transparent"
                placeholder="e.g., +1234567890"
              />
              {errors.phoneNumber && (
                <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1b374c]">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={profile.dateOfBirth || ""} // Ensure valid string for date input
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-[#6999aa] rounded-lg focus:ring-2 focus:ring-[#1b374c] focus:border-transparent"
              />
              {errors.dateOfBirth && (
                <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1b374c]">Gender</label>
              <select
                name="gender"
                value={profile.gender || "male"} // Default to "male" if undefined
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-[#6999aa] rounded-lg focus:ring-2 focus:ring-[#1b374c] focus:border-transparent"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
              {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1b374c]">Country</label>
              <select
                name="address.countryId"
                value={profile.address?.countryId || ""}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-[#6999aa] rounded-lg focus:ring-2 focus:ring-[#1b374c] focus:border-transparent"
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country._id} value={country._id}>
                    {country.countryName}
                  </option>
                ))}
              </select>
              {errors["address.countryId"] && (
                <p className="text-xs text-red-500 mt-1">{errors["address.countryId"]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1b374c]">State</label>
              <select
                name="address.stateId"
                value={profile.address?.stateId || ""}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-[#6999aa] rounded-lg focus:ring-2 focus:ring-[#1b374c] focus:border-transparent"
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state._id} value={state._id}>
                    {state.stateName}
                  </option>
                ))}
              </select>
              {errors["address.stateId"] && (
                <p className="text-xs text-red-500 mt-1">{errors["address.stateId"]}</p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 py-2 bg-[#1b374c] text-white rounded-lg flex items-center justify-center gap-2 hover:bg-[#2a4a6a] transition-colors ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isSubmitting ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={16} /> {profile._id ? "Save" : "Create Profile"}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 py-2 bg-gray-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-gray-600 transition-colors"
              >
                <X size={16} /> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}