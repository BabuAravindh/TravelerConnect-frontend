"use client";

import { useState } from "react";

const BecomeAGuide = () => {
  const languagesList = [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Hindi",
    "Arabic",
  ];

  const countriesList = [
    { id: "US", name: "United States" },
    { id: "IN", name: "India" },
    { id: "UK", name: "United Kingdom" },
    { id: "CA", name: "Canada" },
    // Add more countries
  ];

  const statesList = [
    { id: "NY", name: "New York" },
    { id: "CA", name: "California" },
    { id: "TX", name: "Texas" },
    // Add more states
  ];

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    experience: "",
    expertise: "",
    languages: "",
    certifications: "",
    locations: "",
    bio: "",
    availability: "",
    pricing: "",
    countryId: "",
    stateId: "",
    govId: null as File | null,
    profilePicture: null as File | null,
  });

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, [e.target.name]: file });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Valid Email is required";
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone)) newErrors.phone = "Enter a valid 10-digit phone number";
    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    if (!formData.experience.trim() || isNaN(Number(formData.experience)) || Number(formData.experience) < 0) 
      newErrors.experience = "Enter valid years of experience";
    if (!formData.expertise.trim()) newErrors.expertise = "Expertise is required";
    const languagesListArr = formData.languages.split(",").map(lang => lang.trim());
    if (languagesListArr.length < 2) newErrors.languages = "You must speak at least two languages";
    if (!formData.locations.trim()) newErrors.locations = "At least one location is required";
    if (!formData.bio.trim() || formData.bio.length < 50) newErrors.bio = "Bio must be at least 50 characters long";
    if (!formData.availability) newErrors.availability = "Availability status is required";
    if (!formData.pricing.trim() || isNaN(Number(formData.pricing))) newErrors.pricing = "Enter valid pricing amount";
    if (!formData.govId) newErrors.govId = "Government ID is required";
    if (!formData.profilePicture) newErrors.profilePicture = "Profile Picture is required";
    if (!formData.countryId) newErrors.countryId = "Country is required";
    if (!formData.stateId) newErrors.stateId = "State is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) formDataToSend.append(key, value as Blob);
    });

    try {
      const response = await fetch("/api/become-a-guide", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        setMessage("Your request has been sent successfully. Admin will review it.");
        setFormData({
          fullName: "", email: "", phone: "", dob: "", gender: "",
          experience: "", expertise: "", languages: "", certifications: "",
          locations: "", bio: "", availability: "", pricing: "",
          govId: null, profilePicture: null
        });
        setErrors({});
      } else {
        setMessage("Failed to send request. Please try again.");
      }
    } catch (error: unknown) {
      console.error(error);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Become a Guide</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} className="w-full p-2 border rounded" required />
        {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}

        <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border rounded" required />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

        <input type="tel" name="phone" placeholder="Phone Number" onChange={handleChange} className="w-full p-2 border rounded" required />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

        <input type="date" name="dob" onChange={handleChange} className="w-full p-2 border rounded" required />
        {errors.dob && <p className="text-red-500 text-sm">{errors.dob}</p>}

        <select name="gender" onChange={handleChange} className="w-full p-2 border rounded">
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <select name="languages" onChange={handleChange} className="w-full p-2 border rounded" required>
          <option value="">Select Languages</option>
          {languagesList.map((language) => (
            <option key={language} value={language}>{language}</option>
          ))}
        </select>
        {errors.languages && <p className="text-red-500 text-sm">{errors.languages}</p>}

        <textarea name="bio" placeholder="Bio (at least 50 characters)" onChange={handleChange} className="w-full p-2 border rounded" required />
        {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}

        <select name="countryId" onChange={handleChange} className="w-full p-2 border rounded" required>
          <option value="">Select Country</option>
          {countriesList.map((country) => (
            <option key={country.id} value={country.id}>{country.name}</option>
          ))}
        </select>
        {errors.countryId && <p className="text-red-500 text-sm">{errors.countryId}</p>}

        <select name="stateId" onChange={handleChange} className="w-full p-2 border rounded" required>
          <option value="">Select State</option>
          {statesList.map((state) => (
            <option key={state.id} value={state.id}>{state.name}</option>
          ))}
        </select>
        {errors.stateId && <p className="text-red-500 text-sm">{errors.stateId}</p>}

        <input type="file" name="profilePicture" onChange={handleFileChange} className="w-full p-2 border rounded" required />
        {errors.profilePicture && <p className="text-red-500 text-sm">{errors.profilePicture}</p>}

        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Submit Request</button>
      </form>
      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
  );
};

export default BecomeAGuide;
