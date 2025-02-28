"use client";

import { useState } from "react";
import axios from "axios";

const useSignup = () => {
  const [serverMessage, setServerMessage] = useState("");

  const handleSignup = async (data: { name: string; email: string; password: string }) => {
    setServerMessage("");

    try {
      const response = await axios.post("http://localhost:5000/auth/signup", data);
      
      const { token, user } = response.data;

      // ✅ Save user details to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user._id);  // ✅ Store user ID
      localStorage.setItem("name", user.name);
      localStorage.setItem("role", user.role);

      setServerMessage("✅ Signup successful! Redirecting...");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (error: any) {
      setServerMessage(error.response?.data?.message || "Signup failed");
    }
  };

  return { serverMessage, handleSignup };
};

export default useSignup;
