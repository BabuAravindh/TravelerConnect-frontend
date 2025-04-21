"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import UserSidebar from "@/components/UserSidebar";
import { FiMenu } from "react-icons/fi";

const UserLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { user, hasRole, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (hasRole && !hasRole("user")) {
        router.push("/403");
      }
    }
  }, [user, loading, router, hasRole]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-gray-700">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* ✅ Sidebar */}
      <aside
        className={`fixed lg:relative lg:translate-x-0 w-64 bg-white shadow-md border-r transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:block z-50`}
      >
        <UserSidebar />
      </aside>

      {/* ✅ Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-primary shadow px-6 py-4 flex justify-between items-center border-b">
          <button
            className="lg:hidden text-gray-800 text-2xl"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <FiMenu />
          </button>
          <h1 className="text-xl font-semibold text-white">User Dashboard</h1>
          <p className="text-sm text-gray-200">TravelerConnect</p>
        </header>

        <main className="flex-1 bg-gray-50 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default UserLayout;
