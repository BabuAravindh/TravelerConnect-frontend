"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const CreateProfileForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    phoneNumber: '',
    dateOfBirth: '',
    countryId: '',
    stateId: '',
    profilePic: null,
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const { user } = useAuth(); // Extract logged-in user

  // Fetch countries and states from the API
  useEffect(() => {
    // Fetch countries
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/predefine/countries`)
      .then((response) => {
        setCountries(response.data);
      })
      .catch((error) => {
        console.error('Error fetching countries:', error);
      });

    // Fetch states
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/predefine/states`)
      .then((response) => {
        setStates(response.data);
      })
      .catch((error) => {
        console.error('Error fetching states:', error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      profilePic: e.target.files[0], // Assuming only one file is selected
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check if user is logged in and has an ID
    if (!user?.id) {
      alert('User is not logged in or user ID is missing');
      console.log('User object:', user); // Debug the user object
      return;
    }
  
    // Log the userId to confirm it's available
    console.log('Sending userId:', user.id);
  
    // Create FormData object to send the data
    const formDataToSend = new FormData();
    formDataToSend.append('userId', user.id); // Explicitly append userId
    formDataToSend.append('firstName', formData.firstName);
    formDataToSend.append('lastName', formData.lastName);
    formDataToSend.append('gender', formData.gender);
    formDataToSend.append('phoneNumber', formData.phoneNumber);
    formDataToSend.append('dateOfBirth', formData.dateOfBirth);
    formDataToSend.append('countryId', formData.countryId);
    formDataToSend.append('stateId', formData.stateId);
  
    // Append profilePic if it exists
    if (formData.profilePic) {
      formDataToSend.append('profilePic', formData.profilePic);
      console.log('Profile picture added:', formData.profilePic.name); // Debug file name
    }
  
    // Log all FormData entries for verification
    console.log('FormData to send:');
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`${key}: ${value}`);
    }
  
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data', // Ensure correct content type
          },
        }
      );
      console.log('API response:', response.data); // Log the response
      alert('Profile created successfully!');
    } catch (error) {
      console.error('Error creating profile:', error.response || error); // Log detailed error
      alert('There was an error creating the profile.');
    }
  };
  

  return (
    <div className="create-profile-form">
      <h2>Create Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>First Name:</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />

        <label>Last Name:</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />

        <label>Gender:</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="others">Others</option>
        </select>

        <label>Phone Number:</label>
        <input
          type="text"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />

        <label>Date of Birth:</label>
        <input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          required
        />

        <label>Country:</label>
        <select
          name="countryId"
          value={formData.countryId}
          onChange={handleChange}
          required
        >
          <option value="">Select Country</option>
          {countries.map((country) => (
            <option key={country._id} value={country._id}>
              {country.countryName}
            </option>
          ))}
        </select>

        <label>State:</label>
        <select
          name="stateId"
          value={formData.stateId}
          onChange={handleChange}
          required
        >
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state._id} value={state._id}>
              {state.stateName}
            </option>
          ))}
        </select>

        <label>Profile Picture (Optional):</label>
        <input
          type="file"
          name="profilePic"
          onChange={handleFileChange}
        />

        <button type="submit">Create Profile</button>
      </form>
    </div>
  );
};

export default CreateProfileForm;
