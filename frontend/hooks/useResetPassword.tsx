"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const useResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const resetPassword = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword: password }),
      });

      const contentType = response.headers.get("content-type");
      const data = contentType?.includes("application/json") ? await response.json() : null;

      if (!response.ok) {
        throw new Error(data?.message || "Failed to reset password");
      }

      alert("Password reset successfully!");
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return {
    password,
    confirmPassword,
    setPassword,
    setConfirmPassword,
    error,
    loading,
    resetPassword,
  };
};

export default useResetPassword;
