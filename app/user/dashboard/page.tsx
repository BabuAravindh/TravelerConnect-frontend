"use client";

import Image from "next/image";
import { Pencil, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const userId = "6602e6b1c7e0a5b5a8a7b7c5"; // Replace with actual logged-in user ID

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
  }, []);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!profile) return;
    const { name, value } = e.target;

    setProfile((prev) => {
      if (!prev) return prev;

      if (name === "countryId") {
        return {
          ...prev,
          address: {
            ...prev.address,
            countryId: value,
            countryName: countries.find((c) => c._id === value)?.countryName || "",
          },
        };
      }

      if (name === "stateId") {
        return {
          ...prev,
          address: {
            ...prev.address,
            stateId: value,
            stateName: states.find((s) => s._id === value)?.stateName || "",
          },
        };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const res = await fetch(`http://localhost:5000/api/profile/${userId}`, {
        method: profile._id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      toast.success("Profile saved successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to save profile");
    }
  };

  if (profile === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-xl">No profile found. Please create one.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#6999aa] to-[#527a8c]">
      <div className="flex-grow flex justify-center items-center px-6 py-10">
        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8">
          <div className="bg-white/20 p-6 rounded-xl w-full md:w-1/3 flex flex-col items-center">
            <h2 className="text-xl font-bold text-white mb-4">Profile Picture</h2>
            <div className="relative w-28 h-28">
              <Image src={profile.profilePic || "https://via.placeholder.com/144"} alt="Profile" width={144} height={144} className="rounded-full" />
            </div>
          </div>

          <div className="bg-white/20 p-6 rounded-xl w-full md:w-2/3">
            <h2 className="text-xl font-bold text-white text-center">Profile Details</h2>
            {!isEditing ? (
              <div className="mt-6 space-y-4 text-white">
                <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
                <p><strong>Phone:</strong> {profile.phoneNumber}</p>
                <p><strong>Date of Birth:</strong> {profile.dateOfBirth}</p>
                <p><strong>Country:</strong> {profile.address.countryName || "N/A"}</p>
                <p><strong>State:</strong> {profile.address.stateName || "N/A"}</p>
                <p><strong>Gender:</strong> {profile.gender}</p>
                <button onClick={handleEdit} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2">
                  <Pencil size={16} /> Edit Profile
                </button>
              </div>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={handleSave}>
                {['firstName', 'lastName', 'phoneNumber'].map(field => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-200">{field.replace(/([A-Z])/g, ' $1')}</label>
                    <input
                      type="text"
                      name={field}
                      value={profile[field as keyof Profile] || ""}
                      onChange={handleChange}
                      className="mt-1 w-full p-2 border rounded-lg bg-white/30 text-white"
                      required
                    />
                  </div>
                ))}
                <label className="block text-sm font-medium text-gray-200">Date of Birth</label>
<input
  type="date"
  name="dateOfBirth"
  value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split("T")[0] : ""}
  onChange={handleChange}
  className="mt-1 w-full p-2 border rounded-lg bg-white/30 text-white"
/>


                <label className="block text-sm font-medium text-gray-200">Country</label>
                <select name="countryId" value={profile.address.countryId} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg bg-white/30 text-white" required>
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country._id} value={country._id} className="text-black">{country.countryName}</option>
                  ))}
                </select>

                <label className="block text-sm font-medium text-gray-200">State</label>
                <select name="stateId" value={profile.address.stateId} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg bg-white/30 text-white" required>
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state._id} value={state._id} className="text-black">{state.stateName}</option>
                  ))}
                </select>

                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg">Save</button>
                <button onClick={handleCancel} className="ml-4 px-6 py-2 bg-red-600 text-white rounded-lg">Cancel</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
