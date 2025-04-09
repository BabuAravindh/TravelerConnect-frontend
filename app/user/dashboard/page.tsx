"use client";

import Image from "next/image";
import { Pencil, Save, X, Camera } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface Profile {
  _id?: string;
  userId?: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  phoneNumber: string;
  dateOfBirth: string;
  address?: {
    countryId?: string;
    stateId?: string;
    countryName?: string;
    stateName?: string;
  };
  gender: string;
}

interface Country {
  _id: string;
  countryName: string;
}

interface State {
  _id: string;
  stateName: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({
    userId: user?.id || "",
    firstName: "",
    lastName: "",
    profilePicture: "",
    phoneNumber: "",
    dateOfBirth: "", // Default to empty string, will be set by API or user
    address: { countryId: "", stateId: "", countryName: "", stateName: "" },
    gender: "male", // Default to "male"
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
        await Promise.all([fetchProfile(), fetchDropdownData()]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchProfile() {
      try {
        if (!userId) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/${userId}`);
        if (!res.ok) throw new Error("Profile not found");
        const data = await res.json();
        // Handle dateOfBirth conversion based on possible API formats
        let formattedDateOfBirth = "";
        if (data.dateOfBirth) {
          const date = new Date(data.dateOfBirth);
          if (!isNaN(date.getTime())) {
            formattedDateOfBirth = date.toISOString().split("T")[0]; // Ensures YYYY-MM-DD
          } else {
            console.warn("Invalid date from API, using empty string:", data.dateOfBirth);
          }
        }
        const formattedData = {
          ...data,
          dateOfBirth: formattedDateOfBirth,
          gender: data.gender || "male", // Default to "male" if undefined
        };
        setProfile({
          userId: userId || "",
          firstName: "",
          lastName: "",
          profilePicture: "",
          phoneNumber: "",
          dateOfBirth: "",
          address: { countryId: "", stateId: "", countryName: "", stateName: "" },
          gender: "male",
          ...formattedData,
        });
      } catch (error: any) {
        console.warn("No profile found, user may be new:", error.message);
        // Keep default profile if fetch fails
      }
    }

    async function fetchDropdownData() {
      try {
        const [countriesRes, statesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predefine/countries`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predefine/states`),
        ]);

        if (!countriesRes.ok || !statesRes.ok) throw new Error("Failed to fetch data");

        const countriesData: Country[] = await countriesRes.json();
        const statesData: State[] = await statesRes.json();

        setCountries(countriesData);
        setStates(statesData);
      } catch (error: any) {
        console.error("Error fetching dropdown data:", error);
        toast.error("Failed to load country and state data");
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

  const validateForm = () => {
    const validationErrors: Record<string, string> = {};
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const nameRegex = /^[A-Za-z\s]{2,50}$/;

    if (!profile.firstName.trim()) validationErrors.firstName = "First name is required.";
    else if (!nameRegex.test(profile.firstName))
      validationErrors.firstName = "First name must be 2-50 letters only.";

    if (!profile.lastName.trim()) validationErrors.lastName = "Last name is required.";
    else if (!nameRegex.test(profile.lastName))
      validationErrors.lastName = "Last name must be 2-50 letters only.";

    if (!profile.phoneNumber.trim()) validationErrors.phoneNumber = "Phone number is required.";
    else if (!phoneRegex.test(profile.phoneNumber))
      validationErrors.phoneNumber = "Invalid phone number format (e.g., +1234567890).";

    if (!profile.dateOfBirth) validationErrors.dateOfBirth = "Date of birth is required.";
    else {
      const dob = new Date(profile.dateOfBirth);
      const today = new Date();
      const minDate = new Date("1900-01-01");
      if (isNaN(dob.getTime())) {
        validationErrors.dateOfBirth = "Invalid date format.";
      } else if (dob >= today) {
        validationErrors.dateOfBirth = "Date of birth must be in the past.";
      } else if (dob < minDate) {
        validationErrors.dateOfBirth = "Date of birth is too far in the past.";
      }
    }

    if (!profile.address?.countryId) validationErrors["address.countryId"] = "Country is required.";
    else if (!countries.some((c) => c._id === profile.address?.countryId))
      validationErrors["address.countryId"] = "Invalid country selection.";

    if (!profile.address?.stateId) validationErrors["address.stateId"] = "State is required.";
    else if (!states.some((s) => s._id === profile.address?.stateId))
      validationErrors["address.stateId"] = "Invalid state selection.";

    if (!profile.gender) validationErrors.gender = "Gender is required.";
    else if (!["male", "female", "others"].includes(profile.gender.toLowerCase()))
      validationErrors.gender = "Invalid gender selection.";

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    
    formData.append("userId", profile.userId || userId);
    formData.append("firstName", profile.firstName);
    formData.append("lastName", profile.lastName);
    formData.append("gender", profile.gender);
    formData.append("phoneNumber", profile.phoneNumber);
    formData.append("dateOfBirth", profile.dateOfBirth);
    formData.append("countryId", profile.address?.countryId || "");
    formData.append("stateId", profile.address?.stateId || "");
    formData.append("countryName", profile.address?.countryName || "");
    formData.append("stateName", profile.address?.stateName || "");

    if (profilePicFile) {
      formData.append("profilePic", profilePicFile);
    }

    try {
      const url = profile._id
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/profile/${userId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/profile`;

      const res = await fetch(url, {
        method: profile._id ? "PUT" : "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save profile");
      }

      const data = await res.json();
      setProfile(data);
      setProfilePicFile(null);
      toast.success("Profile saved successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to save profile");
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