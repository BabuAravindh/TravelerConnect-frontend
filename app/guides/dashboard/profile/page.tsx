"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Camera, Save } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Select from "react-select";

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Others", value: "others" },
];

const languagesList = [
  { label: "English", value: "English" },
  { label: "Spanish", value: "Spanish" },
  { label: "French", value: "French" },
  { label: "German", value: "German" },
];

const EditProfilePage = () => {
  const [profile, setProfile] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [activitiesList, setActivitiesList] = useState<any[]>([]);
  const [languagesList, setLanguagesList] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  // Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/guide/profile/${user.id}`
        );

        // If the profile exists, set it
        if (response.data) {
          setProfile({
            firstName: response.data.firstName || "",
            lastName: response.data.lastName || "",
            email: response.data.email || "",
            role: response.data.role || "guide",
            isVerified: response.data.isVerified ?? false,
            phoneNumber: response.data.phoneNumber || "",
            gender: response.data.gender || "",
            dateJoined: response.data.dateJoined || new Date().toISOString(),
            state: response.data.state || "",
            country: response.data.country || "",
            bio: response.data.bio || "",
            activities: Array.isArray(response.data.activities)
              ? response.data.activities
              : [],
            languages: Array.isArray(response.data.languages)
              ? response.data.languages
              : [],
            bankAccountNumber: response.data.bankAccountNumber || "",
            aadharCardPhoto: response.data.aadharCardPhoto || "https://picsum.photos/300/300?grayscale", // Fallback image
            profilePic: response.data.profilePic || "https://picsum.photos/300/300?grayscale", // Fallback image
          });
        } else {
          // If no profile exists, initialize a default profile
          setProfile({
            firstName: "",
            lastName: "",
            email: user.email || "",
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
            aadharCardPhoto: "https://picsum.photos/300/300?grayscale", // Fallback image
            profilePic: "https://picsum.photos/300/300?grayscale", // Fallback image
          });
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // If the profile is not found, initialize a default profile
          setProfile({
            firstName: "",
            lastName: "",
            email: user.email || "",
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
            aadharCardPhoto: "https://picsum.photos/300/300?grayscale", // Fallback image
            profilePic: "https://picsum.photos/300/300?grayscale", // Fallback image
          });
        } else {
          console.error("Error fetching profile:", error);
          toast.error("Failed to fetch profile.");
        }
      }
    };

    if (user?.id) fetchProfile();
  }, [user?.id]);

  // Fetch Countries, States, and Activities
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, statesRes, activitiesRes, languagesRes] =
          await Promise.all([
            axios.get("http://localhost:5000/api/predefine/countries"),
            axios.get("http://localhost:5000/api/predefine/states"),
            axios.get("http://localhost:5000/api/activities"),
            axios.get("http://localhost:5000/api/predefine/languages"),
          ]);

        setCountries(
          countriesRes.data.map((c: { countryName: string }) => ({
            label: c.countryName,
            value: c.countryName,
          }))
        );

        setStates(
          statesRes.data.map((s: { stateName: string }) => ({
            label: s.stateName,
            value: s.stateName,
          }))
        );

        setActivitiesList(
          activitiesRes.data.map((activity: any) => ({
            label: activity.activityName,
            value: activity.activityName,
          }))
        );
        setLanguagesList(
          languagesRes.data.map((lang: any) => ({
            label: lang.languageName,
            value: lang.languageName,
          }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch required data.");
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setProfile((prev) =>
        prev ? { ...prev, profilePic: URL.createObjectURL(file) } : prev
      );
    }
  };

  const handleInputChange = (key: string, value: string | string[] | null) => {
    setProfile((prev) =>
      prev ? { ...prev, [key]: Array.isArray(value) ? value : value } : prev
    );
  };

  const validateProfile = (profile: any) => {
    const errors: { [key: string]: string } = {};

    if (!profile.firstName.trim()) errors.firstName = "First Name is required.";
    if (!profile.lastName.trim()) errors.lastName = "Last Name is required.";
    if (!profile.phoneNumber.trim()) {
      errors.phoneNumber = "Phone Number is required.";
    } else if (!/^\d{10,15}$/.test(profile.phoneNumber)) {
      errors.phoneNumber = "Phone Number must be 10-15 digits.";
    }
    if (!profile.bio.trim()) errors.bio = "Bio is required.";
    if (!profile.gender) errors.gender = "Gender is required.";
    if (!profile.languages || profile.languages.length === 0)
      errors.languages = "At least one language must be selected.";
    if (!profile.activities || profile.activities.length === 0)
      errors.activities = "At least one activity must be selected.";
    if (!profile.country) errors.country = "Country is required.";
    if (!profile.state) errors.state = "State is required.";
    if (!profile.bankAccountNumber.trim())
      errors.bankAccountNumber = "Bank Account Number is required.";

    return errors;
  };

  const handleSave = async () => {
    const errors = validateProfile(profile);
    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach((error) => toast.error(error));
      return;
    }

    setIsSaving(true);
    try {
      // Convert files to Base64
      const profilePicBase64 = selectedFile ? await fileToBase64(selectedFile) : null;

      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        gender: profile.gender,
        dateJoined: profile.dateJoined,
        state: profile.state,
        country: profile.country,
        bio: profile.bio,
        activities: JSON.stringify(profile.activities),
        languages: JSON.stringify(profile.languages),
        bankAccountNumber: profile.bankAccountNumber,
        profilePic: profilePicBase64, // Send as Base64
        aadharCardPhoto: profile.aadharCardPhoto || "https://picsum.photos/300/300?grayscale",
      };

      await axios.put(
        `http://localhost:5000/api/guide/profile/${user.id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to convert file to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  if (
    !profile ||
    countries.length === 0 ||
    states.length === 0 ||
    activitiesList.length === 0
  )
    return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Guide Profile</h2>

      {/* Profile Picture */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <Image
            src={profile.profilePic || "https://picsum.photos/300/300?grayscale"} // Fallback image
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
              value={profile[key] || ""}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg"
              readOnly={readOnly}
            />
          </div>
        ))}
        {/* Bio */}
        <div className="col-span-1 md:col-span-2">
          <label className="font-medium">Bio</label>
          <textarea
            value={profile.bio || ""}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            className="w-full mt-1 p-2 border rounded-lg resize-none h-24"
          />
        </div>

        {/* Date Joined */}
        <div>
          <label className="font-medium">Date Joined</label>
          <input
            type="date"
            value={profile.dateJoined ? profile.dateJoined.split("T")[0] : ""}
            onChange={(e) => handleInputChange("dateJoined", e.target.value)}
            className="w-full mt-1 p-2 border rounded-lg"
          />
        </div>

        {/* Bank Account Number */}
        <div>
          <label className="font-medium">Bank Account Number</label>
          <input
            type="text"
            value={profile.bankAccountNumber || ""}
            onChange={(e) => handleInputChange("bankAccountNumber", e.target.value)}
            className="w-full mt-1 p-2 border rounded-lg"
          />
        </div>

        {/* Aadhar Card Photo */}
        <div className="col-span-1 md:col-span-2">
          <label className="font-medium">Aadhar Card Photo</label>
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setProfile((prev) => ({
                  ...prev,
                  aadharCardPhoto: URL.createObjectURL(file),
                }));
              }
            }}
            className="w-full mt-1 p-2 border rounded-lg"
          />
          {profile.aadharCardPhoto && (
            <Image
              src={profile.aadharCardPhoto}
              alt="Aadhar Card Photo"
              width={100}
              height={100}
              className="mt-2 rounded-lg"
            />
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="font-medium">Gender</label>
          <Select
            options={genderOptions}
            value={genderOptions.find(
              (option) => option.value === profile.gender
            )}
            onChange={(selected) =>
              handleInputChange("gender", selected?.value)
            }
          />
        </div>

        {/* Languages */}
        <div>
          <label className="font-medium">Languages</label>
          <Select
            options={languagesList}
            value={languagesList.filter((option) =>
              profile.languages?.includes(option.value)
            )}
            isMulti
            onChange={(selected) =>
              setProfile((prev) =>
                prev
                  ? { ...prev, languages: selected.map((item) => item.value) }
                  : prev
              )
            }
          />
        </div>

        {/* Activities Offered */}
        <div>
          <label className="font-medium">Activities Offered</label>
          <Select
            options={activitiesList}
            value={activitiesList.filter((option) =>
              profile.activities?.includes(option.value)
            )}
            isMulti
            onChange={(selected) =>
              handleInputChange(
                "activities",
                selected.map((item) => item.value)
              )
            }
          />
        </div>

        {/* Country */}
        <div>
          <label className="font-medium">Country</label>
          <Select
            options={countries}
            value={countries.find((option) => option.value === profile.country)}
            onChange={(selected) =>
              handleInputChange("country", selected?.value)
            }
          />
        </div>

        {/* State */}
        <div>
          <label className="font-medium">State</label>
          <Select
            options={states}
            value={states.find((option) => option.value === profile.state)}
            onChange={(selected) => handleInputChange("state", selected?.value)}
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="mt-6 w-full md:w-auto px-4 py-2 bg-button text-white rounded-lg flex items-center justify-center gap-2"
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