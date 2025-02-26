"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ✅ Define fetchUser outside useEffect so it can be reused
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/auth/user", {
        method: "GET",
        credentials: "include", // ✅ Ensures session cookies are sent
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch user: ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ User fetched:", data.user);
      setUser(data.user || null);
    } catch (error) {
      console.error("❌ Error fetching user:", error);
      setUser(null); // Ensure user state is cleared if there's an error
    }
  }, []);

  // 🔄 Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // ✅ Handle logout and re-fetch user state
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/auth/logout", {
        method: "GET",
        credentials: "include",
      });
  
      setUser(null);
      window.location.href = "/login"; // ✅ Redirect to login after logout
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
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
        {user === null ? (
          <p>Loading...</p>
        ) : user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 py-2 px-4 text-white border rounded-xl hover:bg-opacity-90"
            >
              <span className="font-semibold">
                {user.givenName ? `${user.givenName} ${user.familyName}` : user.name}
              </span>
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

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-lg lg:hidden">
          <ul className="flex flex-col space-y-2 p-4">
            <li><Link href="/" className="block py-2 text-gray-600" onClick={() => setIsOpen(false)}>Home</Link></li>
            <li><Link href="/about" className="block py-2 text-gray-600" onClick={() => setIsOpen(false)}>About Us</Link></li>
            <li><Link href="/services" className="block py-2 text-gray-600" onClick={() => setIsOpen(false)}>Services</Link></li>
            <li><Link href="/contact" className="block py-2 text-gray-600" onClick={() => setIsOpen(false)}>Contact</Link></li>
            {user ? (
              <>
                <li><Link href={getDashboardPath()} className="block py-2 text-gray-600" onClick={() => setIsOpen(false)}>Dashboard</Link></li>
                <li>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full text-left py-2 text-gray-600 hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li><Link href="/login" className="block py-2 text-gray-600" onClick={() => setIsOpen(false)}>Log in</Link></li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
