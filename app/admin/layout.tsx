"use client";

import UserSidebar from "@/components/UserSidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, hasRole } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);

  // Ensure client-side rendering before checking auth state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check admin access when auth state is ready
  useEffect(() => {
    if (!loading && isClient) {
      if (!user) {
        router.push("/login");
      } else if (!hasRole("admin")) {
        router.push("/403");
      } else {
        setAccessChecked(true);
      }
    }
  }, [user, router, loading, isClient, hasRole]);

  // Show loading message while auth state is being verified
  if (!isClient || loading || !accessChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        
        <span className="ml-2 text-gray-600">Verifying admin access...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <aside className=" text-white shadow-lg">
      <UserSidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
            <p className="text-sm text-gray-500">
              Welcome back, {user?.name} ({user?.role})
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
              Admin Privileges
            </span>
            {/* Admin-specific UI elements */}
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>

        {/* Admin Footer */}
        <footer className="bg-white text-center py-3 text-sm text-gray-500 border-t">
          © {new Date().getFullYear()} TravelerConnect - Admin Dashboard v1.0
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;