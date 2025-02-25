"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, MessageSquare, CreditCard, Bookmark, LogOut, Menu, X } from "lucide-react";

const navItems = [
  { href: "/user/dashboard/", label: "Home", icon: Home },
  { href: "/user/dashboard/bookings", label: "Bookings", icon: Calendar },
  { href: "/user/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/user/dashboard/payments", label: "Payments", icon: CreditCard },

];

const UserSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar Toggle Button (Mobile) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-5 left-5 z-50 bg-gray-900 text-white p-2 rounded-md shadow-md md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-20 w-64 bg-button text-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-center p-5 border-b border-gray-700">
          <h1 className="text-lg font-bold text-gray-200 text-center ">TravelerConnect</h1>
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
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-red-400 hover:bg-red-600 hover:text-white mt-6">
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </nav>
      </aside>
    </>
  );
};

export default UserSidebar;
