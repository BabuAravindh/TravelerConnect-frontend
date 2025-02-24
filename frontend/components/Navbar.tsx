"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username"); // Clear username
    localStorage.removeItem("userRole"); // Clear role if stored
    setUsername(""); // Update UI
    window.location.href = "/login"; // Redirect to login page
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
          <div className="flex items-center space-x-4">
            <span className="text-white font-semibold">{username}</span>
            <button 
              onClick={handleLogout} 
              className="py-2 px-4 text-white border rounded-xl hover:bg-opacity-90"
            >
              Logout
            </button>
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
