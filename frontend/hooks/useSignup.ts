"use client";

import { useState } from "react";
import axios from "axios";

const useSignup = () => {
  const [serverMessage, setServerMessage] = useState("");

  const handleSignup = async (data: { name: string; email: string; password: string }) => {
    setServerMessage("");

    try {
      const response = await axios.post("http://localhost:5000/auth/signup", data);
      
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("name", response.data.user.name);
      localStorage.setItem("role", response.data.user.role);

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
