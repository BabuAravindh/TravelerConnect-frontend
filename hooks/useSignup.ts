"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handleSignup = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    setValidationErrors({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
        {
          name: data.name,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }
      );
      console.log("Signup response:", response.data);
      const { token, user } = response.data;
      if (user?.id && token) {
        localStorage.setItem("token", token);
        setIsSubmitted(true);
        toast.success("Account created successfully! Please verify your email.");

      }
    } catch (error: any) {
      console.error("Signup error:", error);

      // Check if error response is related to conflict (email or name already taken)
      if (error.response?.data?.error) {
        const errorMessage = error.response?.data?.message;

        // Set validation errors based on message
        setValidationErrors({
          name: errorMessage.includes("name") ? errorMessage : "",
          email: errorMessage.includes("email") ? errorMessage : "",
          password: "",
          confirmPassword: "",
        });

        toast.error(errorMessage || "An error occurred. Please try again.");
        return;
      }

      // Handle other server-side validation errors
      const serverErrors = error.response?.data?.errors || [];
      if (serverErrors.length > 0) {
        const newErrors = serverErrors.reduce((acc: ValidationErrors, err: { field: string; message: string }) => {
          if (err.field && acc.hasOwnProperty(err.field)) {
            acc[err.field as keyof ValidationErrors] = err.message;
          }
          return acc;
        }, { name: "", email: "", password: "", confirmPassword: "" });

        setValidationErrors(newErrors);
      } else {
        toast.error(error.response?.data?.message || "Signup failed. Please try again later.");
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
  };
};

export default useSignup;
