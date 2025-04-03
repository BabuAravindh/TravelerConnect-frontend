"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Select = dynamic(() => import("react-select"), { ssr: false });

const BecomeAGuide = () => {
  const [languages, setLanguages] = useState<{ value: string; label: string }[]>([]);
  const { user } = useAuth();
  const [states, setStates] = useState<{ value: string; label: string }[]>([]);
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);
  const [countries, setCountries] = useState<{ value: string; label: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aadharPreview, setAadharPreview] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
    cities: [] as string[], // Changed from cityId to cities
    aadharCardPhoto: null as File | null,
    bankAccountNumber: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [langRes, stateRes, countryRes, cityRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predefine/languages`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predefine/states`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predefine/countries`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predefine/cities`),
        ]);

        const languagesData = await langRes.json();
        const statesData = await stateRes.json();
        const countriesData = await countryRes.json();
        const citiesData = await cityRes.json();

        setLanguages(
          languagesData
            .filter((lang: any) => lang.languageStatus === "active")
            .map((lang: any) => ({ value: lang._id, label: lang.languageName }))
        );
        setStates(statesData.map((state: any) => ({ value: state._id, label: state.stateName })));
        setCountries(countriesData.map((country: any) => ({ value: country._id, label: country.countryName })));
        setCities(
          citiesData.success && citiesData.data
            ? citiesData.data.map((city: any) => ({
                value: city._id,
                label: city.cityName,
              }))
            : []
        );
      } catch (error) {
        console.error("Error fetching predefined data:", error);
        toast.error("Failed to load form data. Please refresh the page.");
        setCities([]); // Ensure cities is always an array
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, aadharCardPhoto: "Please upload an image file" }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, aadharCardPhoto: "File size should be less than 5MB" }));
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: file }));
      setAadharPreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, aadharCardPhoto: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (formData.languages.length < 2) newErrors.languages = "At least two languages are required";
    if (!formData.activities.length) newErrors.activities = "At least one activity is required";
    if (!formData.countryId) newErrors.countryId = "Country is required";
    if (!formData.stateId) newErrors.stateId = "State is required";
    if (!formData.cities.length) newErrors.cities = "At least one city is required"; // Updated
    if (!formData.aadharCardPhoto) newErrors.aadharCardPhoto = "Aadhaar Card is required";
    if (!formData.bankAccountNumber) newErrors.bankAccountNumber = "Bank Account Number is required";
    if (!formData.bio) newErrors.bio = "Bio is required";
    if (formData.bio.length < 50) newErrors.bio = "Bio must be at least 50 characters";
    if (formData.bio.length > 1000) newErrors.bio = "Bio must be less than 1000 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("userId", user?.id || "");
      formData.languages.forEach((lang) => formDataToSend.append("languages", lang));
      formData.activities.forEach((activity) => formDataToSend.append("activities", activity));
      formDataToSend.append("serviceLocations", formData.stateId);
      formData.cities.forEach((city) => formDataToSend.append("cities", city)); // Updated to send array
      formDataToSend.append("bankAccountNumber", formData.bankAccountNumber);
      formDataToSend.append("bio", formData.bio);

      if (formData.aadharCardPhoto) {
        formDataToSend.append("aadharCardPhoto", formData.aadharCardPhoto);
      }

      // Debug FormData contents
      console.log("FormData contents:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
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
      setFormData({
        languages: [],
        activities: [],
        bio: "",
        countryId: "",
        stateId: "",
        cities: [] as string[], 
        aadharCardPhoto: null,
        bankAccountNumber: "",
      });
      setAadharPreview("");
      setErrors({});
    } catch (error: any) {
      console.error("Error submitting guide request:", error);
      toast.error(error.message || "Failed to submit guide request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="spinner border-4 border-t-4 border-gray-200 rounded-full w-12 h-12 animate-spin mx-auto"></div>
            <p className="mt-4 text-lg">Loading form data...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow">
          <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-200 mb-10">
            <h2 className="text-2xl font-bold mb-6 text-center text-button">Become a Guide</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Language Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Languages (Select at least 2)
                </label>
                <Select
                  options={languages}
                  isMulti
                  name="languages"
                  placeholder="Select Languages"
                  value={languages.filter((l) => formData.languages.includes(l.value))}
                  onChange={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      languages: selected?.map((s) => s.value) || [],
                    }))
                  }
                  className="w-full"
                  classNamePrefix="select"
                />
                {errors.languages && (
                  <p className="text-red-500 text-sm mt-1">{errors.languages}</p>
                )}
              </div>

              {/* Activities Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activities
                </label>
                <Select
                  options={activities}
                  isMulti
                  name="activities"
                  placeholder="Select Activities"
                  value={activities.filter((a) => formData.activities.includes(a.value))}
                  onChange={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      activities: selected?.map((s) => s.value) || [],
                    }))
                  }
                  className="w-full"
                  classNamePrefix="select"
                />
                {errors.activities && (
                  <p className="text-red-500 text-sm mt-1">{errors.activities}</p>
                )}
              </div>

              {/* Country Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <Select
                  options={countries}
                  name="countryId"
                  placeholder="Select Country"
                  value={countries.find((c) => c.value === formData.countryId) || null}
                  onChange={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      countryId: selected?.value || "",
                      stateId: "",
                      cities: [], // Reset cities when country changes
                    }))
                  }
                  className="w-full"
                  classNamePrefix="select"
                />
                {errors.countryId && (
                  <p className="text-red-500 text-sm mt-1">{errors.countryId}</p>
                )}
              </div>

              {/* State Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <Select
                  options={states}
                  name="stateId"
                  placeholder="Select State"
                  value={states.find((s) => s.value === formData.stateId) || null}
                  onChange={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      stateId: selected?.value || "",
                      cities: [], // Reset cities when state changes
                    }))
                  }
                  className="w-full"
                  classNamePrefix="select"
                  isDisabled={!formData.countryId}
                />
                {errors.stateId && (
                  <p className="text-red-500 text-sm mt-1">{errors.stateId}</p>
                )}
              </div>

              {/* City Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cities (Select at least one)
                </label>
                <Select
  options={cities}
  isMulti
  name="cities"
  placeholder="Select Cities"
  value={cities.filter((c) => formData.cities.includes(c.value))}
  onChange={(selected) =>
    setFormData((prev) => ({
      ...prev,
      cities: selected?.map((s) => s.value) || [],
    }))}
  />
                {errors.cities && (
                  <p className="text-red-500 text-sm mt-1">{errors.cities}</p>
                )}
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
                {errors.aadharCardPhoto && (
                  <p className="text-red-500 text-sm mt-1">{errors.aadharCardPhoto}</p>
                )}
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
                {errors.bankAccountNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.bankAccountNumber}</p>
                )}
              </div>

              {/* Bio Input */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio (50-1000 characters)
                </label>
                <textarea
                  name="bio"
                  id="bio"
                  placeholder="Tell us about yourself and your guiding experience"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.bio.length}/1000 characters
                </div>
                {errors.bio && (
                  <p className="text-red-500 text-sm mt-1">{errors.bio}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-button text-white py-3 rounded-lg hover:bg-primary transition duration-200 ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Request"
                )}
              </button>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default BecomeAGuide;