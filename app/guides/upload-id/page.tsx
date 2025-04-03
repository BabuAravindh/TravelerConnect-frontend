"use client";
import { useState, useRef, useContext } from "react";
import { useAuth } from "@/context/AuthContext"; // Adjust the import path as needed

const GuideIDUpload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useAuth(); // Get user and token from your auth context

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Please upload a JPG, PNG, or PDF file");
      return;
    }

    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file first");
      return;
    }

    if (!user ) {
      alert("You must be logged in to submit verification");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("governmentId", file);
    formData.append("userId", user.id); // Include user ID in the form data

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verifyId`, {
        method: "POST",
        body: formData,
      
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message || "ID verified successfully!");
      } else {
        alert(data.message || "Verification failed");
      }
    } catch (error) {
      alert("Failed to connect to server");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Government ID Verification</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
          onClick={() => fileInputRef.current.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="hidden"
          />
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            {file ? file.name : "Click to upload or drag and drop"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG, or PDF (max 5MB)
          </p>
        </div>

        {file && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm truncate">{file.name}</span>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || isUploading || !user}
          className={`w-full py-2 px-4 rounded-md text-white ${
            !file || isUploading || !user 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {!user ? "Login Required" : isUploading ? "Uploading..." : "Submit Verification"}
        </button>
      </form>
    </div>
  );
};

export default GuideIDUpload;