"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"; // Re-import to explicitly dismiss toasts

type ValidationErrors = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(""); // Kept but not used for toasts
  const router = useRouter();

  const handleSignup = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    setError(""); // Reset error to avoid any toast triggers
    setValidationErrors({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    toast.dismiss(); // Clear any existing toasts

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
        {
          name: data.name,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
        toast.success("Account created verification mail is sent")
      
    } catch (error: any) {
      console.error("Signup error:", error);

      if (axios.isAxiosError(error)) {
        if (!error.response) {
          setValidationErrors(prev => ({
            ...prev,
            email: "Network error. Please check your connection and try again.",
          }));
          return;
        }

        const status = error.response?.status;
        const serverErrors = error.response?.data?.errors || [];

        if (status === 400 && serverErrors.length > 0) {
          const newErrors = serverErrors.reduce((acc: ValidationErrors, err: { field: string; message: string }) => {
            if (err.field && acc.hasOwnProperty(err.field)) {
              acc[err.field as keyof ValidationErrors] = err.message;
            }
            return acc;
          }, { name: "", email: "", password: "", confirmPassword: "" });
          setValidationErrors(newErrors);
        } else {
          // Fallback for other status codes (e.g., 429, 500)
          setValidationErrors(prev => ({
            ...prev,
            email: "An unexpected error occurred. Please try again.",
          }));
        }
      } else {
        setValidationErrors(prev => ({
          ...prev,
          email: "An unexpected error occurred. Please try again.",
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    handleSignup,
    loading,
    validationErrors,
    setValidationErrors,
    isSubmitted,
    error,
  };
};

export default useSignup;