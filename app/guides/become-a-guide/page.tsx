"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

const Select = dynamic(() => import("react-select"), { ssr: false });

const BecomeAGuide = () => {
  const [languages, setLanguages] = useState<{ value: string; label: string }[]>([]);
  const { user } = useAuth();
  const [states, setStates] = useState<{ value: string; label: string }[]>([]);
  const [countries, setCountries] = useState<{ value: string; label: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aadharPreview, setAadharPreview] = useState("");

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
      const file = files[0];
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, aadharCardPhoto: "Please upload an image file" }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setErrors(prev => ({ ...prev, aadharCardPhoto: "File size should be less than 5MB" }));
        return;
      }
      setFormData({ ...formData, [name]: file });
      setAadharPreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, aadharCardPhoto: "" }));
    }
  };

  const validateForm = () => {
    let errors: Record<string, string> = {};
    if (formData.languages.length < 2) errors.languages = "At least two languages are required";
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
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('userId', user?.id || '');
      formData.languages.forEach(lang => formDataToSend.append('languages', lang));
      formData.activities.forEach(activity => formDataToSend.append('activities', activity));
      formDataToSend.append('serviceLocations', formData.stateId);
      formDataToSend.append('bankAccountNumber', formData.bankAccountNumber);
      formDataToSend.append('bio', formData.bio);
      if (formData.aadharCardPhoto) {
        formDataToSend.append('aadharCardPhoto', formData.aadharCardPhoto);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/guide/become-guide`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit guide request");
      }

      toast.success("Guide request submitted successfully!");
      // Reset form after successful submission
      setFormData({
        languages: [],
        activities: [],
        bio: "",
        countryId: "",
        stateId: "",
        aadharCardPhoto: null,
        bankAccountNumber: "",
      });
      setAadharPreview("");
    } catch (error: any) {
      console.error("Error submitting guide request:", error);
      toast.error(error.message || "Failed to submit guide request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-center text-button">Become a Guide</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Languages (Select at least 2)</label>
          <Select
            options={languages}
            isMulti
            name="languages"
            placeholder="Select Languages"
            onChange={(selected) => setFormData({ ...formData, languages: selected?.map((s) => s.value) || [] })}
            className="w-full"
          />
          {errors.languages && <p className="text-red-500 text-sm mt-1">{errors.languages}</p>}
        </div>

        {/* Activities Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Activities</label>
          <Select
            options={activities}
            isMulti
            name="activities"
            placeholder="Select Activities"
            onChange={(selected) => setFormData({ ...formData, activities: selected?.map((s) => s.value) || [] })}
            className="w-full"
          />
          {errors.activities && <p className="text-red-500 text-sm mt-1">{errors.activities}</p>}
        </div>

        {/* Country Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <Select
            options={countries}
            name="countryId"
            placeholder="Select Country"
            onChange={(selected) => setFormData({ ...formData, countryId: selected?.value || "" })}
            className="w-full"
          />
          {errors.countryId && <p className="text-red-500 text-sm mt-1">{errors.countryId}</p>}
        </div>

        {/* State Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <Select
            options={states}
            name="stateId"
            placeholder="Select State"
            onChange={(selected) => setFormData({ ...formData, stateId: selected?.value || "" })}
            className="w-full"
          />
          {errors.stateId && <p className="text-red-500 text-sm mt-1">{errors.stateId}</p>}
        </div>

        {/* Aadhaar Card Upload */}
        <div>
          <label htmlFor="aadharCardPhoto" className="block text-sm font-medium text-gray-700 mb-1">
            Upload Aadhaar Card Photo
          </label>
          <input
            type="file"
            name="aadharCardPhoto"
            id="aadharCardPhoto"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full mt-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {aadharPreview && (
            <div className="mt-2">
              <img 
                src={aadharPreview} 
                alt="Aadhaar preview" 
                className="h-20 w-auto rounded-md border"
              />
            </div>
          )}
          {errors.aadharCardPhoto && <p className="text-red-500 text-sm mt-1">{errors.aadharCardPhoto}</p>}
        </div>

        {/* Bank Account Number */}
        <div>
          <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Bank Account Number
          </label>
          <input
            type="text"
            name="bankAccountNumber"
            id="bankAccountNumber"
            placeholder="Enter your bank account number"
            value={formData.bankAccountNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.bankAccountNumber && <p className="text-red-500 text-sm mt-1">{errors.bankAccountNumber}</p>}
        </div>

        {/* Bio Input */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            name="bio"
            id="bio"
            placeholder="Tell us about yourself and your guiding experience"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          ></textarea>
          {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-button text-white py-2 rounded-lg hover:bg-primary transition duration-200 ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

export default BecomeAGuide;