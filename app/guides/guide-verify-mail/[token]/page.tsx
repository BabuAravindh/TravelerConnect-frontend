"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const storeToken = (token: string) => {
  ("Storing token in localStorage under 'token':", token);
  localStorage.setItem("token", token); // Using "token" as the key
};

const VerifyGuideEmailPage = () => {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string | undefined;

  const [message, setMessage] = useState("Verifying your guide account...");
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    ("Extracted Token:", token);

    // Clear any existing tokens to avoid conflicts
    localStorage.removeItem("authToken");
    localStorage.removeItem("token"); // Clear the "token" key to remove any invalid token

    if (!token || typeof token !== "string") {
      setError("Invalid verification link.");
      return;
    }

    (`Fetching: ${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email/${token}`);

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email/${token}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = await response.json();
        ("API Response:", JSON.stringify(data, null, 2));

        if (response.ok) {
          setMessage(data.message || "Guide account verified successfully!");
          setIsVerified(true);

          // Validate and store the JWT token
          if (data.token && typeof data.token === "string" && data.token.split(".").length === 3) {
            ("Valid JWT token received:", data.token);
            storeToken(data.token);
          } else {
            console.error("Invalid or missing token in response:", data.token);
            setError("Authentication token is invalid. Please try again.");
          }

          // Redirect based on requiresIdUpload or redirectUrl
          const redirectUrl = data.redirectUrl || "/guides/upload-id";
          setTimeout(() => router.push(redirectUrl), 3000);
        } else {
          setError(data.message || "Guide verification failed.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Something went wrong. Please try again.");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#4a7c8a] to-[#1b374c] text-white text-center p-6">
      <div className="bg-white shadow-xl rounded-lg p-6 max-w-md w-full transform transition-all hover:scale-[1.02]">
        <div className="flex justify-center mb-4">
          {isVerified ? (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ) : error ? (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          ) : (
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          )}
        </div>

        <h2 className={`text-2xl font-bold ${error ? "text-red-500" : "text-[#1b374c]"}`}>
          {error ? "Guide Verification Failed" : isVerified ? "Verification Complete!" : "Guide Email Verification"}
        </h2>
        <p className="mt-4 text-gray-700">{error || message}</p>

        {isVerified && (
          <div className="mt-6 p-4 bg-blue-50 rounded-md text-left">
            <h3 className="font-semibold text-blue-800">Next Steps:</h3>
            <p className="text-sm text-blue-600 mt-1">
              You will be redirected to upload your government ID for verification.
              This is required to activate your guide account.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 space-y-3">
            <button
              className="w-full bg-[#1b374c] text-white px-4 py-3 rounded-md hover:bg-opacity-90 transition font-medium"
              onClick={() => router.push("/guide-signup")}
            >
              Try Signing Up Again
            </button>
            <button
              className="w-full bg-gray-200 text-gray-800 px-4 py-3 rounded-md hover:bg-gray-300 transition font-medium"
              onClick={() => router.push("/contact-support")}
            >
              Contact Support
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyGuideEmailPage;