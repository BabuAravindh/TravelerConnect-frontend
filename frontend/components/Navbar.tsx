"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const Navbar = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch user details from localStorage on mount
  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedRole = localStorage.getItem("userRole");

    if (storedName && storedRole) {
      setUserName(storedName);
      setUserRole(storedRole);
    }
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");

    setUserName(null);
    setUserRole(null);

    window.location.href = "/login"; // Redirect to login
  };

  // Generate dashboard path based on role
  const getDashboardPath = () => {
    if (userRole === "admin") return "/dashboard/admin";
    if (userRole === "user") return "user/dashboard";
    if (userRole === "guide") return "/dashboard/guide";
    return "/dashboard";
  };

  return (
    <nav className="relative px-4 py-4 flex justify-between items-center bg-[#6899ab] text-white">
      <Link href="/" className="text-xl font-bold">TravelerConnect</Link>

      {/* Desktop Menu */}
      <ul className="hidden lg:flex lg:space-x-6">
        <li><Link href="/" className="text-white">Home</Link></li>
        <li><Link href="/about" className="text-white">About Us</Link></li>
        <li><Link href="/services" className="text-white">Services</Link></li>
        <li><Link href="/contact" className="text-white">Contact</Link></li>
      </ul>

      {/* User Info & Auth Buttons */}
      <div className="hidden lg:flex space-x-3">
        {userName ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 py-2 px-4 text-white border rounded-xl hover:bg-opacity-90"
            >
              <span className="font-semibold">{userName}</span>
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-700 rounded-lg shadow-lg">
                <Link href={getDashboardPath()} className="block px-4 py-2 hover:bg-gray-200">
                  Dashboard
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
    </nav>
  );
};

export default Navbar;
