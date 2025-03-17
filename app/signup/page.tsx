"use client";

import { useState } from "react";
import useSignup from "@/hooks/useSignup";
import Image from "next/image";

const SignupPage = () => {
  const { handleSignup, loading } = useSignup();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    let newErrors = { fullName: "", email: "", password: "", confirmPassword: "" };
    let isValid = true;

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
      isValid = false;
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password.";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validateForm()) {
      handleSignup({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear error on input change
  };

  return (
    <div className="min-h-screen bg-primary flex justify-center items-center">
      <div className="max-w-screen-xl bg-white shadow-lg rounded-lg flex w-full overflow-hidden">
        {/* Left Section - Sign Up Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Sign Up</h1>
            <p className="text-gray-600 mt-2">Create your TravelerConnect account</p>
          </div>

          {/* Sign Up Form */}
          <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.fullName ? "border-red-500 focus:ring-red-400" : "focus:ring-indigo-400"
                }`}
                value={formData.fullName}
                onChange={handleChange}
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email ? "border-red-500 focus:ring-red-400" : "focus:ring-indigo-400"
                }`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.password ? "border-red-500 focus:ring-red-400" : "focus:ring-indigo-400"
                }`}
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.confirmPassword ? "border-red-500 focus:ring-red-400" : "focus:ring-indigo-400"
                }`}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-button text-white font-semibold rounded-lg transition ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-80"
              }`}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-4 text-sm text-center text-gray-600">
            By signing up, you agree to our{" "}
            <a href="#" className="text-indigo-500">Terms & Privacy Policy</a>.
          </p>

          <p className="mt-4 text-sm text-center">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-500 font-medium">Log in</a>
          </p>
        </div>

        {/* Right Section - Illustration */}
        <Image
          src="https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg"
          alt="Traveler Illustration"
          width={300}
          height={300}
          className="max-w-xs"
        />
      </div>
    </div>
  );
};

export default SignupPage;
