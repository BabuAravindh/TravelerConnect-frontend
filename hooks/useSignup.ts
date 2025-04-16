"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast"; // Ensure correct import

const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [validationStep, setValidationStep] = useState<"name" | "email" | "password" | "complete" | null>(null);
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const validateField = useCallback(async (field: "name" | "email" | "password", value: string, confirmPassword?: string) => {
    setValidationStep(field);
    setLoading(true);

    try {
      let response;
      if (field === "name") {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/validateName`,
          { name: value }
        );
      } else if (field === "email") {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/validateEmail`,
          { email: value }
        );
      }

      if (response && response.status !== 200) {
        setValidationErrors(prev => ({ ...prev, [field]: response.data.message }));
        return false;
      }

      if (field === "name" || field === "email") {
        toast.success(response.data.message || "Validation successful!");
      }
      return true;
    } catch (error: any) {
      console.error(`Validation error for ${field}:`, error);
      if (error.response?.status === 400) {
        setValidationErrors(prev => ({ ...prev, [field]: error.response.data.message }));
      } else {
        setValidationErrors(prev => ({ ...prev, [field]: "An unexpected error occurred. Please try again later." }));
      }
      return false;
    } finally {
      setLoading(false);
    }

    if (field === "password" && confirmPassword && value !== confirmPassword) {
      setValidationErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
      return false;
    }
    setValidationErrors(prev => ({ ...prev, confirmPassword: "" }));
    return true;
  }, []);

  const handleSignup = async (data: { 
    name: string; 
    email: string; 
    password: string;
    confirmPassword: string;
  }) => {
    setValidationErrors({ name: "", email: "", password: "", confirmPassword: "" });
    const isNameValid = await validateField("name", data.name);
    if (!isNameValid) return;

    const isEmailValid = await validateField("email", data.email);
    if (!isEmailValid) return;

    const isPasswordValid = await validateField("password", data.password, data.confirmPassword);
    if (!isPasswordValid) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
        {
          name: data.name,
          email: data.email,
          password: data.password
        }
      );

      const { token, user } = response.data;
      if (user?.id && token) {
        localStorage.setItem("token", token);
        setValidationStep("complete");
        toast.success("Account created successfully! Please verify your email.");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.response?.data?.message || "Signup failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return { 
    handleSignup, 
    loading, 
    validateField,
    validationStep,
    validationErrors,
    setValidationErrors
  };
};

export default useSignup;