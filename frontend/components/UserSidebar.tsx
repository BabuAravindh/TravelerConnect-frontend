"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { roleBasedNavItems } from "@/data/data"; // Import the nav items

const UserSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    window.location.href = "/login";
  };

  const navItems = roleBasedNavItems[userRole] || [];

  return (
    <>
      {/* Sidebar Toggle Button (Mobile) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-5 left-5 z-50 bg-button text-white p-2 rounded-md shadow-md md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 min-h-screen z-20 w-64 bg-button text-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-center p-5 border-b border-gray-700">
          <h1 className="text-lg font-bold text-gray-200 text-center">TravelerConnect</h1>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 space-y-2 px-4 h-screen">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive ? "bg-opacity-90 text-white" : "hover:bg-opacity-90 hover:text-white text-gray-300"
                }`}
              >
                <Icon size={20} className={isActive ? "text-white" : "text-gray-400"} />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            );
          })}

          {/* Logout */}
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-red-400 hover:bg-red-600 hover:text-white mt-6"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </nav>
      </aside>
    </>
  );
};

export default UserSidebar;
