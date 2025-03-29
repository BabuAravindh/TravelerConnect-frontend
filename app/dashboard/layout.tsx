"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar"; // You'll need to create this component
import UserSidebar from "@/components/UserSidebar";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, hasRole, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering before checking auth state
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && isClient) {
      if (!user) {
        router.push("/login");
      } else if (!hasRole("admin")) {
        router.push("/403");
      }
    }
  }, [user, router, hasRole, loading, isClient]);

  // Show loading message while auth state is being verified
  if (!isClient || loading) return <p className="text-center text-gray-600 mt-10">Loading...</p>;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Admin Sidebar - Different from user/guide sidebar */}
      <aside className="w-64 bg-indigo-800 text-white shadow-lg">
        <UserSidebar/> {/* Replace with your AdminSidebar component */}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
            <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
              Admin Privileges
            </span>
            {/* Add admin notification bell or other admin-specific UI elements here */}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>

        {/* Admin Footer */}
        <footer className="bg-white text-center py-3 text-sm text-gray-500 border-t">
          © 2025 TravelerConnect - Admin Dashboard v1.0
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;