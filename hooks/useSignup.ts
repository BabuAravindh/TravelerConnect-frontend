"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSignup = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    setValidationErrors({ name: "", email: "", password: "", confirmPassword: "" }); // Clear previous errors

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
        {
          name: data.name,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword, // Include confirmPassword
        }
      );

      const { token, user } = response.data;
      if (user?.id && token) {
        localStorage.setItem("token", token);
        toast.success("Account created successfully! Please verify your email.");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      const serverErrors = error.response?.data?.errors || [];
      const newErrors = { name: "", email: "", password: "", confirmPassword: "" };

      serverErrors.forEach((err: { field: string; message: string }) => {
        if (err.field && newErrors.hasOwnProperty(err.field)) {
          newErrors[err.field as keyof typeof newErrors] = err.message;
        } else {
          toast.error(err.message || "Signup failed. Please try again later.");
        }
      });

      if (error.response?.data?.isNameTaken) {
        newErrors.name = error.response.data.errors?.[0]?.message || "This name is already taken.";
      }
      if (error.response?.data?.isEmailTaken) {
        newErrors.email = error.response.data.errors?.[0]?.message || "This email is already registered.";
      }

      setValidationErrors(newErrors);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleSignup,
    loading,
    validationErrors,
    setValidationErrors,
  };
};

export default useSignup;