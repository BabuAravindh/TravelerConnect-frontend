"use client";

import { useState, useCallback } from "react";
import useSignup from "@/hooks/useSignup";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { Footer } from "@/components/Footer";
import Navbar from "@/components/Navbar";

const SignupPage = () => {
  const { handleSignup, loading, validationErrors, setValidationErrors } = useSignup();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    let newErrors = { name: "", email: "", password: "", confirmPassword: "" };
    let isValid = true;

    console.log("Validating confirmPassword:", formData.confirmPassword);

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
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

    setValidationErrors((prev) => ({ ...prev, ...newErrors }));
    console.log("Validation result - isValid:", isValid, "Errors:", newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to:`, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      console.log("Form Data before validation:", formData);
      if (!formData.confirmPassword.trim()) {
        setValidationErrors((prev) => ({
          ...prev,
          confirmPassword: "Please confirm your password.",
        }));
        return;
      }
      if (validateForm()) {
        console.log("Validation passed, submitting:", formData);
        handleSignup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        });
      } else {
        console.log("Validation failed, errors:", validationErrors);
      }
    },
    [formData, validateForm, handleSignup, validationErrors]
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-primary flex justify-center items-center">
        <div className="max-w-screen-xl bg-white shadow-lg rounded-lg flex w-full overflow-hidden justify-center gap-12">
          <div className="w-full lg:w-1/2 p-8 lg:p-12">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Sign Up</h1>
              <p className="text-gray-600 mt-2">Create your TravelerConnect account</p>
            </div>

            <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    validationErrors.name ? "border-red-500 focus:ring-red-400" : "focus:ring-indigo-400"
                  }`}
                  value={formData.name}
                  onChange={handleChange}
                />
                {validationErrors.name && <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>}
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
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.email}{" "}
                    {validationErrors.email.includes("already registered") && (
                      <a href="/login" className="text-indigo-500 underline">
                        Login instead
                      </a>
                    )}
                  </p>
                )}
              </div>

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
                disabled={loading || !formData.confirmPassword.trim()}
                className={`w-full py-3 bg-button text-white font-semibold rounded-lg transition ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-80"
                }`}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-4 text-sm text-center text-gray-600">
              By signing up, you agree to our{" "}
              <a href="#" className="text-indigo-500">
                Terms & Privacy Policy
              </a>
              .
            </p>

            <p className="mt-4 text-sm text-center">
              Already have an account?{" "}
              <a href="/login" className="text-indigo-500 font-medium">
                Log in
              </a>
            </p>
          </div>

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