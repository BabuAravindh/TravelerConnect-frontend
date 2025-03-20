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
        const response = await axios.get(`http://localhost:5000/api/guide/profile/${user.id}`);
        const fetchedProfile = response.data;
  
        setProfile({
          firstName: fetchedProfile.firstName || "sakthi",
          lastName: fetchedProfile.lastName || "ganesh",
          email: fetchedProfile.email || "babuaravindh2@gmail.com",
          role: fetchedProfile.role || "guide",
          isVerified: fetchedProfile.isVerified ?? true,
          phoneNumber: fetchedProfile.phoneNumber || "91069513",
          gender: fetchedProfile.gender || "male",
          dateJoined: fetchedProfile.dateJoined || "2025-02-28T00:00:00.000Z",
          state: fetchedProfile.state || "Tamil Nadu",
          country: fetchedProfile.country || "India",
          bio: fetchedProfile.bio || "Experienced guide with expertise in mountain hiking and city tours.",
          activities: Array.isArray(fetchedProfile.activities) ? fetchedProfile.activities : [],
          languages: Array.isArray(fetchedProfile.languages) ? fetchedProfile.languages : ["Hindi", "Tamil"],
         
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to fetch profile.");
      }
    };
  
    if (user?.id) fetchProfile();
  }, [user?.id]);
  
  // Fetch Countries, States, and Activities
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, statesRes, activitiesRes,languagesRes] = await Promise.all([
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
  
        setActivitiesList(activitiesRes.data.map((activity: any) => ({ label: activity.activityName, value: activity.activityName })));
        setLanguagesList(languagesRes.data.map((lang: any) => ({ label: lang.languageName, value: lang.languageName })));

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
      setProfile((prev) => prev ? { ...prev, profilePic: URL.createObjectURL(file) } : prev);
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
      console.log(profile)
      await axios.put(`http://localhost:5000/api/guide/profile/${user.id}`, profile, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };
  

  if (!profile || countries.length === 0 || states.length === 0 || activitiesList.length === 0)
    return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Guide Profile</h2>

      {/* Profile Picture */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <Image
            src={profile.profilePic || "https://picsum.photos/300/300?grayscale"}
            alt="Profile Picture"
            width={120}
            height={120}
            className="rounded-full shadow-md border"
          />
          <label htmlFor="profilePicUpload" className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full cursor-pointer">
            <Camera size={18} />
          </label>
          <input type="file" id="profilePicUpload" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {[ 
          { label: "First Name", key: "firstName" },
          { label: "Last Name", key: "lastName" },
          { label: "Phone Number", key: "phoneNumber" },
          { label: "Bio", key: "bio" },
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

        {/* Gender */}
        <div>
          <label className="font-medium">Gender</label>
          <Select
            options={genderOptions}
            value={genderOptions.find((option) => option.value === profile.gender)}
            onChange={(selected) => handleInputChange("gender", selected?.value)}
          />
        </div>

        {/* Languages */}
        <div>
          <label className="font-medium">Languages</label>
          <Select
          options={languagesList}
          value={languagesList.filter((option) => profile.languages?.includes(option.value))}
          isMulti
          onChange={(selected) => setProfile((prev) => prev ? { ...prev, languages: selected.map((item) => item.value) } : prev)}
        />
        </div>

        {/* Activities Offered */}
        <div>
          <label className="font-medium">Activities Offered</label>
          <Select
  options={activitiesList}
  value={activitiesList.filter((option) => profile.activities?.includes(option.value))}
  isMulti
  onChange={(selected) => handleInputChange("activities", selected.map((item) => item.value))}
/>

        </div>

        {/* Country */}
        <div>
          <label className="font-medium">Country</label>
          <Select
            options={countries}
            value={countries.find((option) => option.value === profile.country)}
            onChange={(selected) => handleInputChange("country", selected?.value)}
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
      <button onClick={handleSave} disabled={isSaving} className="mt-6 px-4 py-2 bg-button text-white rounded-lg flex items-center gap-2">
        {isSaving ? "Saving..." : <><Save size={18} /> Save</>}
      </button>
    </div>
  );
};

export default EditProfilePage;
