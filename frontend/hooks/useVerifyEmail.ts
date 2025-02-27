"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const useVerifyEmail = (email: string) => {
  const [code, setCode] = useState<string[]>(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const router = useRouter();

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < code.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const otp = code.join("");
    if (otp.length !== 6) {
      setError("Please enter the full OTP code.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/verify/verify_mail/confirm_password");
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResendDisabled(true);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) setError(data.message || "Failed to resend OTP.");
    } catch (error) {
      setError("Error resending OTP.");
    } finally {
      setLoading(false);
      setTimeout(() => setResendDisabled(false), 30000); // Re-enable after 30s
    }
  };

  return {
    code,
    error,
    loading,
    resendDisabled,
    inputRefs,
    handleChange,
    handleKeyDown,
    handleSubmit,
    handleResend,
  };
};

export default useVerifyEmail;
