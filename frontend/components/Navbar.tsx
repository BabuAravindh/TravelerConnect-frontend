"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("userRole");

    if (storedUsername) setUsername(storedUsername);
    if (storedRole) setUserRole(storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    setUsername("");
    setUserRole("");
    window.location.href = "/login";
  };

  const getDashboardPath = () => {
    if (userRole === "admin") return "/dashboard";
    if (userRole === "guide") return "/guides/dashboard";
    return "/user/dashboard"; // Default to user dashboard
  };

  return (
    <nav className="relative px-4 py-4 flex justify-between items-center bg-[#6899ab] text-white">
      <Link href="/" className="text-xl font-bold">TravelerConnect</Link>

      {/* Mobile Menu Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-3 text-white">
        <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
        </svg>
      </button>

      {/* Desktop Menu */}
      <ul className="hidden lg:flex lg:space-x-6">
        <li><Link href="/" className="text-white">Home</Link></li>
        <li><Link href="/about" className="text-white">About Us</Link></li>
        <li><Link href="/services" className="text-white">Services</Link></li>
        <li><Link href="/contact" className="text-white">Contact</Link></li>
      </ul>

      {/* User Info & Auth Buttons */}
      <div className="hidden lg:flex space-x-3">
        {username ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 py-2 px-4 text-white border rounded-xl hover:bg-opacity-90"
            >
              <span className="font-semibold">{username}</span>
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-700 rounded-lg shadow-lg">
                <Link href={getDashboardPath()} className="block px-4 py-2 hover:bg-gray-200">
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="py-2 px-4 text-white border rounded-xl hover:bg-opacity-90">
            Log in
          </Link>
        )}
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-lg lg:hidden">
          <ul className="flex flex-col space-y-2 p-4">
            <li><Link href="/" className="block py-2 text-gray-600">Home</Link></li>
            <li><Link href="/about" className="block py-2 text-gray-600">About Us</Link></li>
            <li><Link href="/services" className="block py-2 text-gray-600">Services</Link></li>
            <li><Link href="/contact" className="block py-2 text-gray-600">Contact</Link></li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
