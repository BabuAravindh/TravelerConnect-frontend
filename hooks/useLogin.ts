"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const useLogin = () => {
  const [error, setError] = useState("");
  const [isUnverified, setIsUnverified] = useState(false); // Track unverified status
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    setError("");
    setIsUnverified(false);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Please verify your email before logging in") {
          setIsUnverified(true);
        }
        setError(data.error || "Invalid credentials");
        return;
      }

      // Store the token securely
      localStorage.setItem("token", data.token);
      router.push("/");
    } catch (error: any) {
      setError("Something went wrong. Please try again.");
    }
  };

  return { error, isUnverified, handleLogin };
};

export default useLogin;
