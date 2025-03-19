import { useState } from "react";
import axios from "axios";

interface CreateProfileFormProps {
  userId: string;
  onProfileCreated: (profile: any) => void;
}

const CreateProfileForm: React.FC<CreateProfileFormProps> = ({ userId, onProfileCreated }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "others",
    phoneNumber: "",
    dateOfBirth: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
        userId,
        ...formData,
      });
      onProfileCreated(response.data.profile);
    } catch (error) {
      console.error("❌ Error creating profile:", error);
      setError("Failed to create profile. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 p-4 border rounded bg-gray-50">
      <h3 className="text-xl font-semibold">Create Your Profile</h3>
      {error && <p className="text-red-500">{error}</p>}

      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        value={formData.firstName}
        onChange={handleChange}
        required
        className="w-full px-3 py-2 border rounded"
      />

      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={handleChange}
        required
        className="w-full px-3 py-2 border rounded"
      />

      <select
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded"
      >
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="others">Others</option>
      </select>

      <input
        type="tel"
        name="phoneNumber"
        placeholder="Phone Number"
        value={formData.phoneNumber}
        onChange={handleChange}
        required
        className="w-full px-3 py-2 border rounded"
      />

      <input
        type="date"
        name="dateOfBirth"
        value={formData.dateOfBirth}
        onChange={handleChange}
        required
        className="w-full px-3 py-2 border rounded"
      />

      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create Profile
      </button>
    </form>
  );
};

export default CreateProfileForm;
