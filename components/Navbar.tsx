"use client";
import { useState, Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Dialog, Transition } from "@headlessui/react";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isUploadIdPage = pathname === "/guides/upload-id";

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const getDashboardPath = () => {
    switch (user?.role) {
      case "admin": return "/admin/";
      case "user": return "/user/dashboard";
      case "guide": return "/guides/dashboard";
      default: return "/dashboard";
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="bg-primary shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <span className="text-xl font-bold text-gray-900">TravelerConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Navigation Links - hide on upload ID page */}
            {!isUploadIdPage && (
              <div className="flex space-x-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "text-white"
                        : "text-black hover:text-opacity-90"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {user && !isUploadIdPage && (
                <>
                  <NotificationBell />
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center space-x-1 text-gray-700 hover:text-button focus:outline-none transition-colors"
                      aria-expanded={dropdownOpen}
                    >
                      <span className="font-medium">{user.name}</span>
                      <ChevronDownIcon
                        className={`h-4 w-4 transition-transform ${
                          dropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    <Transition
                      show={dropdownOpen}
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="py-1">
                          <Link
                            href={getDashboardPath()}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setDropdownOpen(false)}
                          >
                            Dashboard
                          </Link>
                         
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    </Transition>
                  </div>
                </>
              )}

              {!user && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-button hover:bg-opacity-90 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden flex items-center">
            {user ? (
              <div className="flex items-center space-x-3">
                <NotificationBell />
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center text-gray-700 focus:outline-none"
                >
                  <span className="mr-1">{user.name}</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-gray-700 focus:outline-none"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {dropdownOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === link.href
                    ? "text-whhite bg-blue-50"
                    : "text-gray-600 hover:text-opacity-90 hover:bg-gray-50"
                }`}
                onClick={() => setDropdownOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <>
                <Link
                  href={getDashboardPath()}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === getDashboardPath()
                      ? "text-button-600 bg-blue-50"
                      : "text-gray-600 hover:text-opacity-90 hover:bg-gray-50"
                  }`}
                  onClick={() => setDropdownOpen(false)}
                >
                  Dashboard
                </Link>
              
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-black hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sign In Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center">
                    <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                      Sign In Options
                    </Dialog.Title>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <Link
                      href="/login"
                      className="block w-full px-4 py-3 text-center text-white bg-primary hover:bg-opacity-90 rounded-lg transition-colors"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Sign in as Traveler
                    </Link>
                    <Link
                      href="/guides/signin"
                      className="block w-full px-4 py-3 text-center text-white bg-button hover:bg-opacity-90 rounded-lg transition-colors"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Sign in as Guide
                    </Link>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Don't have an account?{' '}
                      <Link 
                        href="/signup" 
                        className="text-opacity-90 font-medium transition-colors"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Sign up
                      </Link>
                    </p>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </nav>
  );
};

export default Navbar;