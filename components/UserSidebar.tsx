"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X, Home, Calendar, MessageSquare, User, ArrowLeft } from "lucide-react";
import { roleBasedNavItems } from "@/data/data";
import { useAuth } from "@/context/AuthContext";

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  Home,
  Calendar,
  MessageSquare,
  User,
};

const UserSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth(); // Using AuthContext for authentication

  const navItems = user?.role ? roleBasedNavItems[user.role] || [] : [];

  // Close sidebar when route changes (for better mobile UX)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-5 left-5 z-50 bg-button text-white p-2 rounded-md shadow-md md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
  className={`fixed top-0 left-0 h-screen w-64 bg-button text-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
    isOpen ? "translate-x-0" : "-translate-x-full"
  } md:relative z-50`} // Add z-50 here
>
        {/* Header */}
        <div className="flex flex-col items-center justify-center p-5 border-b border-gray-700">
          <h1 className="text-lg font-bold text-gray-200 text-center">TravelerConnect</h1>
          {user?.name && <p className="text-sm text-gray-300">Welcome, {user.name} 👋</p>}
        </div>

        {/* Home Button */}
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-white bg-primary mt-4 mx-4"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Go Back</span>
        </Link>

        {/* Navigation */}
        <nav className="mt-6 space-y-2 px-4">
          {navItems.map(({ href, label, icon }) => {
            const isActive = pathname === href;
            const IconComponent = iconMap[icon] || User;

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <IconComponent size={20} className={isActive ? "text-white" : "text-gray-400"} />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            );
          })}

          {/* Logout Button */}
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-red-400 hover:bg-red-600 hover:text-white mt-6"
            onClick={() => logout(router)}
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Overlay (for mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default UserSidebar;
