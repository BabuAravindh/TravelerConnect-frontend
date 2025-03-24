"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UserSidebar from "@/components/UserSidebar";

const GuideLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, hasRole, loading } = useAuth(); // Add `isLoading`
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
      } else if (!hasRole("guide")) {
        router.push("/403");
      }
    }
  }, [user, router, hasRole, loading, isClient]);

  // Show loading message while auth state is being verified
  if (!isClient || loading) return <p className="text-center text-gray-600 mt-10">Loading...</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="  text-white">
        <UserSidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-primary shadow px-6 py-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-semibold text-gray-800">Welcome, {user?.name}</h2>
          <span className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-md">
            Role: {user?.role}
          </span>
        </header>

        {/* Content */}
        <main className="flex-1  overflow-auto">{children}</main>

        {/* Footer */}
        <footer className="bg-primary text-center py-3 text-sm text-gray-500 border-t">
          © 2025 TravelerConnect - Guide Dashboard
        </footer>
      </div>
    </div>
  );
};

export default GuideLayout;
