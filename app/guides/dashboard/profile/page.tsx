"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Camera, Save } from "lucide-react";
import Select from "react-select";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { 
  Profile, 
  SelectOption, 
  genderOptions 
} from "./profileTypes";
import { 
  fetchCities, 
  fetchProfile, 
  fetchInitialData, 
  updateProfile 
} from "./profile.service";

const EditProfilePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [countries, setCountries] = useState<SelectOption[]>([]);
  const [states, setStates] = useState<SelectOption[]>([]);
  const [activitiesList, setActivitiesList] = useState<SelectOption[]>([]);
  const [languagesList, setLanguagesList] = useState<SelectOption[]>([]);
  const [cities, setCities] = useState<SelectOption[]>([]);
  const [serviceLocations, setServiceLocations] = useState<SelectOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();

  // Fetch Cities
  useEffect(() => {
    const loadCities = async () => {
      const cityOptions = await fetchCities();
      setCities(cityOptions);
    };
    loadCities();
  }, []);

  // Set service locations when profile or cities change
  useEffect(() => {
    if (profile?.serviceLocations && cities.length > 0) {
      const locations = profile.serviceLocations
        .map((loc: string) => cities.find((city) => city.value === loc))
        .filter(Boolean) as SelectOption[];
      setServiceLocations(locations);
    }
  }, [profile?.serviceLocations, cities]);

  // Fetch Profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      try {
        const data = await fetchProfile(user.id);
        
        if (data) {
          setProfile({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            role: data.role || "guide",
            isVerified: data.isVerified ?? false,
            phoneNumber: data.phoneNumber || "",
            gender: data.gender || "",
            dateJoined: data.dateJoined || new Date().toISOString(),
            state: data.state || "",
            country: data.country || "",
            bio: data.bio || "",
            activities: Array.isArray(data.activities) ? data.activities : [],
            languages: Array.isArray(data.languages) ? data.languages : [],
            bankAccountNumber: data.bankAccountNumber || "",
            ifscCode: data.ifscCode || "",
            bankName: data.bankName || "",
            profilePic: data.profilePicture || "https://picsum.photos/300/300?grayscale",
            serviceLocations: data.serviceLocations || [],
          });
        } else {
          // Create empty profile if not found
          setProfile({
            firstName: "",
            lastName: "",
            email: user?.email || "",
            role: "guide",
            isVerified: false,
            phoneNumber: "",
            gender: "",
            dateJoined: new Date().toISOString(),
            state: "",
            country: "",
            bio: "",
            activities: [],
            languages: [],
            bankAccountNumber: "",
            ifscCode: "",
            bankName: "",
            profilePic: "https://picsum.photos/300/300?grayscale",
            serviceLocations: [],
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, [user?.id, user?.email]);

  // Fetch additional data
  useEffect(() => {
    const loadInitialData = async () => {
      const { countries, states, activitiesList, languagesList } = await fetchInitialData();
      setCountries(countries || []);
      setStates(states || []);
      setActivitiesList(activitiesList || []);
      setLanguagesList(languagesList || []);
    };

    loadInitialData();
  }, []);

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      setProfile((prev) =>
        prev ? { ...prev, profilePic: URL.createObjectURL(file) } : prev
      );
    }
  };

  const handleInputChange = (key: string, value: string | string[] | null) => {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            [key]:
              key === "gender" && value === null
                ? "" // Ensure gender is never null
                : Array.isArray(value)
                ? value
                : value || "",
          }
        : prev
    );
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleServiceLocationsChange = (selectedOptions: ReadonlyArray<SelectOption> | null) => {
    setServiceLocations(selectedOptions ? [...selectedOptions] : []);
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            serviceLocations: selectedOptions ? selectedOptions.map((opt: SelectOption) => opt.value) : [],
            firstName: prev.firstName || "",
            lastName: prev.lastName || "",
            email: prev.email || "",
            role: prev.role || "guide",
            isVerified: prev.isVerified ?? false,
            phoneNumber: prev.phoneNumber || "",
            gender: prev.gender || "",
            dateJoined: prev.dateJoined || new Date().toISOString(),
            state: prev.state || "",
            country: prev.country || "",
            bio: prev.bio || "",
            activities: prev.activities || [],
            languages: prev.languages || [],
            bankAccountNumber: prev.bankAccountNumber || "",
            ifscCode: prev.ifscCode || "",
            bankName: prev.bankName || "",
            profilePic: prev.profilePic || "https://picsum.photos/300/300?grayscale",
          }
        : null
    );
    if (errors.serviceLocations) {
      setErrors((prev) => ({ ...prev, serviceLocations: "" }));
    }
  };

  const validateProfile = (profile: Profile) => {
    const newErrors: { [key: string]: string } = {};

    if (!profile.firstName.trim()) newErrors.firstName = "First Name is required";
    if (!profile.lastName.trim()) newErrors.lastName = "Last Name is required";
    if (!profile.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone Number is required";
    } else if (!/^\d{10,15}$/.test(profile.phoneNumber)) {
      newErrors.phoneNumber = "Phone Number must be 10-15 digits";
    }
    if (!profile.bio.trim()) newErrors.bio = "Bio is required";
    if (!profile.gender) newErrors.gender = "Gender is required";
    if (!profile.languages || profile.languages.length === 0)
      newErrors.languages = "At least one language must be selected";
    if (!profile.activities || profile.activities.length === 0)
      newErrors.activities = "At least one activity must be selected";
    if (!profile.country) newErrors.country = "Country is required";
    if (!profile.state) newErrors.state = "State is required";
    if (!profile.bankAccountNumber.trim())
      newErrors.bankAccountNumber = "Bank Account Number is required";
    if (!profile.ifscCode.trim()) newErrors.ifscCode = "IFSC Code is required";
    if (!profile.bankName.trim()) newErrors.bankName = "Bank Name is required";
    if (!profile.serviceLocations || profile.serviceLocations.length === 0)
      newErrors.serviceLocations = "At least one service location must be selected";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!profile || !user?.id) return;

    const isValid = validateProfile(profile);
    if (!isValid) return;

    setIsSaving(true);
    try {
      const { guideProfile } = await updateProfile(
        user.id,
        {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phoneNumber: profile.phoneNumber,
          gender: profile.gender,
          dateJoined: profile.dateJoined,
          state: profile.state,
          country: profile.country,
          bio: profile.bio,
          activities: profile.activities,
          languages: profile.languages,
          bankAccountNumber: profile.bankAccountNumber,
          ifscCode: profile.ifscCode,
          bankName: profile.bankName,
          serviceLocations: profile.serviceLocations,
        },
        profilePicFile || undefined
      );

      toast.success("Profile updated successfully!");
      setProfile((prev) => ({
        ...prev!,
        profilePic: guideProfile.profilePic || prev!.profilePic,
      }));
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (
    !profile ||
    countries.length === 0 ||
    states.length === 0 ||
    activitiesList.length === 0 ||
    languagesList.length === 0 ||
    cities.length === 0
  ) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Guide Profile</h2>

      <div className="flex flex-col items-center">
        <div className="relative">
          <Image
            src={profile.profilePic}
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
            onChange={handleProfilePicChange}
            accept="image/*"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {[
          { label: "First Name", key: "firstName" },
          { label: "Last Name", key: "lastName" },
          { label: "Phone Number", key: "phoneNumber" },
          { label: "Role", key: "role", readOnly: true },
        ].map(({ label, key, readOnly }) => (
          <div key={key}>
            <label className="font-medium">{label}</label>
            <input
              type="text"
              value={typeof profile[key as keyof Profile] === "boolean" ? String(profile[key as keyof Profile]) : (profile[key as keyof Profile] as string | undefined) || ""}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className={`w-full mt-1 p-2 border rounded-lg ${errors[key] ? "border-red-500" : ""}`}
              readOnly={readOnly}
            />
            {errors[key] && <p className="text-red-500 text-sm mt-1">{errors[key]}</p>}
          </div>
        ))}

        <div className="col-span-1 md:col-span-2">
          <label className="font-medium">Bio</label>
          <textarea
            value={profile.bio || ""}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            className={`w-full mt-1 p-2 border rounded-lg resize-none h-24 ${errors.bio ? "border-red-500" : ""}`}
            placeholder="Tell us about yourself and your guiding experience..."
          />
          {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
        </div>

        <div>
          <label className="font-medium">Date Joined</label>
          <input
            type="date"
            value={profile.dateJoined ? profile.dateJoined.split("T")[0] : ""}
            onChange={(e) => handleInputChange("dateJoined", e.target.value)}
            className="w-full mt-1 p-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="font-medium">Bank Account Number</label>
          <input
            type="text"
            value={profile.bankAccountNumber || ""}
            onChange={(e) => handleInputChange("bankAccountNumber", e.target.value)}
            className={`w-full mt-1 p-2 border rounded-lg ${errors.bankAccountNumber ? "border-red-500" : ""}`}
            placeholder="Enter your bank account number"
          />
          {errors.bankAccountNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.bankAccountNumber}</p>
          )}
        </div>

        <div>
          <label className="font-medium">IFSC Code</label>
          <input
            type="text"
            value={profile.ifscCode || ""}
            onChange={(e) => handleInputChange("ifscCode", e.target.value)}
            className={`w-full mt-1 p-2 border rounded-lg ${errors.ifscCode ? "border-red-500" : ""}`}
            placeholder="Enter your IFSC code"
          />
          {errors.ifscCode && <p className="text-red-500 text-sm mt-1">{errors.ifscCode}</p>}
        </div>

        <div>
          <label className="font-medium">Bank Name</label>
          <input
            type="text"
            value={profile.bankName || ""}
            onChange={(e) => handleInputChange("bankName", e.target.value)}
            className={`w-full mt-1 p-2 border rounded-lg ${errors.bankName ? "border-red-500" : ""}`}
            placeholder="Enter your bank name"
          />
          {errors.bankName && <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>}
        </div>

        <div>
          <label className="font-medium">Gender</label>
          <Select
            options={genderOptions}
            value={genderOptions.find((option) => option.value === profile.gender) || null}
            onChange={(selected) => handleInputChange("gender", selected?.value || "")}
            className="mt-1"
            classNamePrefix="select"
          />
          {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
        </div>

        <div>
          <label className="font-medium">Languages</label>
          <Select
            options={languagesList}
            value={languagesList.filter((option) => profile.languages.includes(option.value))}
            isMulti
            onChange={(selected) =>
              handleInputChange("languages", selected?.map((item) => item.value) || [])
            }
            className="mt-1"
            classNamePrefix="select"
          />
          {errors.languages && <p className="text-red-500 text-sm mt-1">{errors.languages}</p>}
        </div>

        <div>
          <label className="font-medium">Activities Offered</label>
          <Select
            options={activitiesList}
            value={activitiesList.filter((option) => profile.activities.includes(option.value))}
            isMulti
            onChange={(selected) =>
              handleInputChange("activities", selected?.map((item) => item.value) || [])
            }
            className="mt-1"
            classNamePrefix="select"
          />
          {errors.activities && <p className="text-red-500 text-sm mt-1">{errors.activities}</p>}
        </div>

        <div>
          <label className="font-medium">Country</label>
          <Select
            options={countries}
            value={countries.find((option) => option.value === profile.country) || null}
            onChange={(selected) => handleInputChange("country", selected?.value || "")}
            className="mt-1"
            classNamePrefix="select"
          />
          {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
        </div>

        <div>
          <label className="font-medium">State</label>
          <Select
            options={states}
            value={states.find((option) => option.value === profile.state) || null}
            onChange={(selected) => handleInputChange("state", selected?.value || "")}
            className="mt-1"
            classNamePrefix="select"
          />
          {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="font-medium">Service Locations (Cities)</label>
          <Select
            options={cities}
            value={serviceLocations}
            onChange={handleServiceLocationsChange}
            isMulti
            placeholder="Select cities where you offer services"
            isLoading={cities.length === 0}
            className="mt-1"
            classNamePrefix="select"
          />
          {errors.serviceLocations && (
            <p className="text-red-500 text-sm mt-1">{errors.serviceLocations}</p>
          )}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="mt-6 w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        {isSaving ? (
          "Saving..."
        ) : (
          <>
            <Save size={18} /> Save
          </>
        )}
      </button>
    </div>
  );
};

export default EditProfilePage;