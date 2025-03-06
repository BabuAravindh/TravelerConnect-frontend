"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const handleSignup = async (data: { name: string; email: string; password: string }) => {
    setLoading(true);
    setServerMessage("");
    console.log("🔍 Sending Signup Request:", data);

    try {
      const response = await axios.post(
        `http://localhost:5000/auth/signup`,
        data,
        {
          headers: {
            "Content-Type": "application/json", // ✅ Ensure JSON format
          },
        }
      );

      console.log("✅ Signup Response:", response.data);
      const { token, user } = response.data;

      if (user?.id && user?.name && user?.role && token) {
        // ✅ Store user data securely
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("userName", user.name);
        localStorage.setItem("userRole", user.role);

        setServerMessage("✅ Signup successful! Redirecting...");
        toast.success("✅ Signup successful! Check your email to verify your account.");
;
      } else {
        throw new Error("Invalid response data");
      }
    } catch (error: any) {
      console.error("❌ Signup Error:", error);

      if (error.response) {
        console.error("🚨 Server Response:", error.response.data);
        setServerMessage(error.response.data.message || "Signup failed");
      } else if (error.request) {
        console.error("🚫 No Response from Server");
        setServerMessage("Server is not responding. Please try again later.");
      } else {
        console.error("❌ Unknown Error:", error.message);
        setServerMessage("An unexpected error occurred. Please try again.");
      }

      toast.error(error.response?.data?.message || "❌ Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { handleSignup, loading, serverMessage };
};

export default useSignup;
