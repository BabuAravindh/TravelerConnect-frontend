"use client";

import Image from "next/image";
import { Pencil, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface Profile {
  _id?: string;
  userId?: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: {
    countryId: string;
    stateId: string;
    countryName: string;
    stateName: string;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const userId = user?.id;

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`http://localhost:5000/api/profile/${userId}`);
        if (!res.ok) throw new Error("Profile not found");
        const data = await res.json();
        setProfile(data);
      } catch (error) {
        console.warn("No profile found, user may be new");
        setProfile(null);
      }
    }

    async function fetchDropdownData() {
      try {
        const [countriesRes, statesRes] = await Promise.all([
          fetch("http://localhost:5000/api/predefine/countries"),
          fetch("http://localhost:5000/api/predefine/states"),
        ]);

        if (!countriesRes.ok || !statesRes.ok) throw new Error("Failed to fetch data");

        const countriesData: Country[] = await countriesRes.json();
        const statesData: State[] = await statesRes.json();

        setCountries(countriesData);
        setStates(statesData);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        toast.error("Failed to load country and state data");
      }
    }

    fetchProfile();
    fetchDropdownData();
  }, [userId]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setProfile((prev) => ({
        ...(prev || {
          userId,
          firstName: "",
          lastName: "",
          profilePic: "",
          phoneNumber: "",
          dateOfBirth: "",
          address: { countryId: "", stateId: "", countryName: "", stateName: "" },
          gender: "",
        }),
        address: {
          ...(prev?.address || { countryId: "", stateId: "", countryName: "", stateName: "" }),
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
        ...(prev || {
          userId,
          firstName: "",
          lastName: "",
          profilePic: "",
          phoneNumber: "",
          dateOfBirth: "",
          address: { countryId: "", stateId: "", countryName: "", stateName: "" },
          gender: "",
        }),
        [name]: value,
      }));
    }
    setErrors((prev: any) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const validationErrors: any = {};
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const nameRegex = /^[A-Za-z\s]{2,50}$/;

    if (!profile?.firstName) validationErrors.firstName = "First name is required.";
    else if (!nameRegex.test(profile.firstName))
      validationErrors.firstName = "First name must be 2-50 letters only.";

    if (!profile?.lastName) validationErrors.lastName = "Last name is required.";
    else if (!nameRegex.test(profile.lastName))
      validationErrors.lastName = "Last name must be 2-50 letters only.";

    if (!profile?.phoneNumber) validationErrors.phoneNumber = "Phone number is required.";
    else if (!phoneRegex.test(profile.phoneNumber))
      validationErrors.phoneNumber = "Invalid phone number format (e.g., +1234567890).";

    if (!profile?.dateOfBirth) validationErrors.dateOfBirth = "Date of birth is required.";
    else {
      const dob = new Date(profile.dateOfBirth);
      const today = new Date();
      const minDate = new Date("1900-01-01");
      if (dob >= today) validationErrors.dateOfBirth = "Date of birth must be in the past.";
      else if (dob < minDate) validationErrors.dateOfBirth = "Date of birth is too far in the past.";
    }

    if (!profile?.address?.countryId) validationErrors.countryId = "Country is required.";
    else if (!countries.some((c) => c._id === profile.address.countryId))
      validationErrors.countryId = "Invalid country selection.";

    if (!profile?.address?.stateId) validationErrors.stateId = "State is required.";
    else if (!states.some((s) => s._id === profile.address.stateId))
      validationErrors.stateId = "Invalid state selection.";

    if (!profile?.gender) validationErrors.gender = "Gender is required.";
    else if (!["male", "female", "others"].includes(profile.gender.toLowerCase()))
      validationErrors.gender = "Invalid gender selection.";

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!profile || !userId) return;

    const requestBody = {
      userId: profile.userId || userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      gender: profile.gender,
      phoneNumber: profile.phoneNumber,
      dateOfBirth: profile.dateOfBirth,
      profilePic: profile.profilePic || "https://picsum.photos/200",
      countryName: profile.address?.countryName,
      stateName: profile.address?.stateName,
    };

    try {
      const url = profile._id
        ? `http://localhost:5000/api/profile/${userId}`
        : `http://localhost:5000/api/profile`;

      const res = await fetch(url, {
        method: profile._id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save profile");
      }

      const data = await res.json();
      setProfile(data);
      toast.success("Profile saved successfully!");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to save profile");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#6999aa] p-4">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6">
        {/* Profile Picture Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full md:w-1/3 flex flex-col items-center">
          <h2 className="text-xl font-semibold text-[#1b374c] mb-4">Profile Picture</h2>
          <div className="relative w-32 h-32">
            <Image
              src={profile?.profilePic || "https://via.placeholder.com/144"}
              alt="Profile"
              width={128}
              height={128}
              className="rounded-full object-cover border-4 border-[#6999aa]"
            />
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full md:w-2/3">
          <h2 className="text-2xl font-semibold text-[#1b374c] text-center mb-6">
            {profile ? "Profile Details" : "Create Your Profile"}
          </h2>

          {!profile ? (
            // Create Profile Form
            <form className="space-y-4" onSubmit={handleSave}>
              <div>
                <label className="block text-sm font-medium text-[#1b374c]">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={profile?.firstName || ""}
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
                  value={profile?.lastName || ""}
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
                  value={profile?.phoneNumber || ""}
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
                  value={profile?.dateOfBirth || ""}
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
                  value={profile?.gender || ""}
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
                  value={profile?.address?.countryId || ""}
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
                {errors.countryId && <p className="text-xs text-red-500 mt-1">{errors.countryId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1b374c]">State</label>
                <select
                  name="address.stateId"
                  value={profile?.address?.stateId || ""}
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
                {errors.stateId && <p className="text-xs text-red-500 mt-1">{errors.stateId}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#1b374c] text-white rounded-lg hover:bg-[#2a4a6a] transition-colors"
              >
                Create Profile
              </button>
            </form>
          ) : !isEditing ? (
            // Display Profile Details
            <div className="space-y-4 text-[#1b374c]">
              <p>
                <strong>Name:</strong> {profile.firstName} {profile.lastName}
              </p>
              <p>
                <strong>Phone:</strong> {profile.phoneNumber}
              </p>
              <p>
                <strong>Date of Birth:</strong> {new Date(profile.dateOfBirth).toLocaleDateString()}
              </p>
              <p>
                <strong>Country:</strong> {profile.address.countryName || "N/A"}
              </p>
              <p>
                <strong>State:</strong> {profile.address.stateName || "N/A"}
              </p>
              <p>
                <strong>Gender:</strong> {profile.gender}
              </p>
              <button
                onClick={handleEdit}
                className="mt-4 w-full py-2 bg-[#1b374c] text-white rounded-lg flex items-center justify-center gap-2 hover:bg-[#2a4a6a] transition-colors"
              >
                <Pencil size={16} /> Edit Profile
              </button>
            </div>
          ) : (
            // Edit Profile Form
            <form className="space-y-4" onSubmit={handleSave}>
              <div>
                <label className="block text-sm font-medium text-[#1b374c]">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={profile?.firstName || ""}
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
                  value={profile?.lastName || ""}
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
                  value={profile?.phoneNumber || ""}
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
                  value={profile?.dateOfBirth || ""}
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
                  value={profile?.gender || ""}
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
                  value={profile?.address?.countryId || ""}
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
                {errors.countryId && <p className="text-xs text-red-500 mt-1">{errors.countryId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1b374c]">State</label>
                <select
                  name="address.stateId"
                  value={profile?.address?.stateId || ""}
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
                {errors.stateId && <p className="text-xs text-red-500 mt-1">{errors.stateId}</p>}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#1b374c] text-white rounded-lg flex items-center justify-center gap-2 hover:bg-[#2a4a6a] transition-colors"
                >
                  <Save size={16} /> Save
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-2 bg-[#1b374c] text-white rounded-lg flex items-center justify-center gap-2 hover:bg-[#2a4a6a] transition-colors"
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}