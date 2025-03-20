"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const Select = dynamic(() => import("react-select"), { ssr: false });

const BecomeAGuide = () => {
  const [languages, setLanguages] = useState<{ value: string; label: string }[]>([]);
  const [states, setStates] = useState<{ value: string; label: string }[]>([]);
  const [countries, setCountries] = useState<{ value: string; label: string }[]>([]);

  const activities = [
    { value: "Hiking", label: "Hiking" },
    { value: "Camping", label: "Camping" },
    { value: "City Tours", label: "City Tours" },
    { value: "Wildlife Safaris", label: "Wildlife Safaris" },
    { value: "Cultural Tours", label: "Cultural Tours" },
  ];

  const [formData, setFormData] = useState({
    languages: [] as string[],
    activities: [] as string[],
    bio: "",
    countryId: "",
    stateId: "",
    aadharCardPhoto: null as File | null,
    bankAccountNumber: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [langRes, stateRes, countryRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predefine/languages`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predefine/states`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predefine/countries`),
        ]);

        const languagesData = await langRes.json();
        const statesData = await stateRes.json();
        const countriesData = await countryRes.json();

        setLanguages(
          languagesData
            .filter((lang: any) => lang.languageStatus === "active")
            .map((lang: any) => ({ value: lang._id, label: lang.languageName }))
        );

        setStates(statesData.map((state: any) => ({ value: state._id, label: state.stateName })));

        setCountries(countriesData.map((country: any) => ({ value: country._id, label: country.countryName })));
      } catch (error) {
        console.error("Error fetching predefined data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData({ ...formData, [name]: files[0] });
    }
  };

  const validateForm = () => {
    let errors: Record<string, string> = {};
    if (!formData.languages.length) errors.languages = "At least one language is required";
    if (!formData.activities.length) errors.activities = "At least one activity is required";
    if (!formData.countryId) errors.countryId = "Country is required";
    if (!formData.stateId) errors.stateId = "State is required";
    if (!formData.aadharCardPhoto) errors.aadharCardPhoto = "Aadhaar Card is required";
    if (!formData.bankAccountNumber) errors.bankAccountNumber = "Bank Account Number is required";
    if (!formData.bio) errors.bio = "Bio is required";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill all required fields.");
      return;
    }
    toast.success("Request submitted successfully.");
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-center text-button">Become a Guide</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Language Selection */}
        <Select
          options={languages}
          isMulti
          name="languages"
          placeholder="Select Languages"
          onChange={(selected) => setFormData({ ...formData, languages: selected.map((s) => s.value) })}
          className="w-full"
        />
        {errors.languages && <p className="text-red-500 text-sm">{errors.languages}</p>}

        {/* Activities Selection */}
        <Select
          options={activities}
          isMulti
          name="activities"
          placeholder="Select Activities"
          onChange={(selected) => setFormData({ ...formData, activities: selected.map((s) => s.value) })}
          className="w-full"
        />
        {errors.activities && <p className="text-red-500 text-sm">{errors.activities}</p>}

        {/* State Selection */}
        <Select
          options={states}
          name="stateId"
          placeholder="Select State"
          onChange={(selected) => setFormData({ ...formData, stateId: selected?.value })}
          className="w-full"
        />
        {errors.stateId && <p className="text-red-500 text-sm">{errors.stateId}</p>}

        {/* Country Selection */}
        <Select
          options={countries}
          name="countryId"
          placeholder="Select Country"
          onChange={(selected) => setFormData({ ...formData, countryId: selected?.value })}
          className="w-full"
        />
        {errors.countryId && <p className="text-red-500 text-sm">{errors.countryId}</p>}

        {/* Aadhaar Card Upload */}
        <div>
          <label htmlFor="aadharCardPhoto" className="text-gray-700">
            Upload Aadhaar Card Photo
          </label>
          <input
            type="file"
            name="aadharCardPhoto"
            id="aadharCardPhoto"
            onChange={handleFileChange}
            className="w-full mt-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.aadharCardPhoto && <p className="text-red-500 text-sm">{errors.aadharCardPhoto}</p>}
        </div>

        {/* Bank Account Number */}
        <input
          type="text"
          name="bankAccountNumber"
          placeholder="Bank Account Number"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.bankAccountNumber && <p className="text-red-500 text-sm">{errors.bankAccountNumber}</p>}

        {/* Bio Input */}
        <textarea
          name="bio"
          placeholder="Short Bio"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        ></textarea>
        {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-button text-white py-2 rounded-lg hover:bg-primary transition duration-200"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default BecomeAGuide;
