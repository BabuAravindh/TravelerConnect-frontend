"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const VerifyEmailPage = () => {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string | undefined;

  const [message, setMessage] = useState("Verifying your email...");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || typeof token !== "string") {
      setError("Invalid verification link.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email/${token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        console.log("API Response:", data);

        if (response.ok) {
          setMessage(data.message || "Email verified successfully!");

          // Save token to localStorage
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          // Redirect to dashboard after 3 seconds
          setTimeout(() => router.push("/dashboard"), 3000);
        } else {
          setError(data.message || "Verification failed.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Something went wrong. Please try again.");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#6999aa] text-white text-center p-6">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full">
        <h2 className={`text-xl font-bold ${error ? "text-red-500" : "text-[#1b374c]"}`}>
          {error ? "Verification Failed" : "Email Verification"}
        </h2>
        <p className="mt-2 text-gray-700">{error || message}</p>

        {error && (
          <button
            className="mt-4 bg-[#1b374c] text-white px-4 py-2 rounded-md hover:bg-opacity-80 transition"
            onClick={() => router.push("/signup")}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
