"use client";

import { useState } from "react";
import useSignup from "@/hooks/useSignup";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { Footer } from "@/components/Footer";
import Navbar from "@/components/Navbar";

const SignupPage = () => {
  const { handleSignup, loading, validateField, validationErrors, setValidationErrors } = useSignup();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    } else {
      const password = formData.password;
      const strongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!strongPasswordRegex.test(password)) {
        newErrors.password =
          "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (e.g., @$!%*?&).";
        isValid = false;
      }
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password.";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }

    setValidationErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleFieldBlur = async (field: "name" | "email", value: string) => {
    if (value.trim() && (field === "name" || field === "email")) {
      await validateField(field === "name" ? "name" : "email", value);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validateForm()) {
      handleSignup({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-primary flex justify-center items-center">
        <div className="max-w-screen-xl bg-white shadow-lg rounded-lg flex w-full overflow-hidden justify-center gap-12">
          {/* Left Section - Sign Up Form */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Sign Up</h1>
              <p className="text-gray-600 mt-2">Create your TravelerConnect account</p>
            </div>

            <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    validationErrors.fullName ? "border-red-500 focus:ring-red-400" : "focus:ring-indigo-400"
                  }`}
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={() => handleFieldBlur("name", formData.fullName)}
                />
                {validationErrors.fullName && <p className="text-red-500 text-sm mt-1">{validationErrors.fullName}</p>}
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    validationErrors.email ? "border-red-500 focus:ring-red-400" : "focus:ring-indigo-400"
                  }`}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleFieldBlur("email", formData.email)}
                />
                {validationErrors.email && <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>}
              </div>

              {/* Password Field with Eye Icon */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    validationErrors.password ? "border-red-500 focus:ring-red-400" : "focus:ring-indigo-400"
                  }`}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center"
                >
                  {showPassword ? <EyeOff size={20} className="text-gray-500" /> : <Eye size={20} className="text-gray-500" />}
                </button>
                {validationErrors.password && <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>}
              </div>

              {/* Confirm Password Field with Eye Icon */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    validationErrors.confirmPassword ? "border-red-500 focus:ring-red-400" : "focus:ring-indigo-400"
                  }`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3 flex items-center"
                >
                  {showConfirmPassword ? <EyeOff size={20} className="text-gray-500" /> : <Eye size={20} className="text-gray-500" />}
                </button>
                {validationErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword}</p>
                )}
              </div>

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
      <Footer />
    </>
  );
};

export default SignupPage;