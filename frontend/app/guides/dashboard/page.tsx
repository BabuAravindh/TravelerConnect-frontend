"use client";

import { usePathname } from "next/navigation";
import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import Sidebar from "@/components/SideBar";

const MapChart = dynamic(() => import("@/components/MapChart"), { ssr: false });

const GuideDashboard = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole !== "guide") {
      router.push("/"); // Redirect if not a guide
    } else {
      setRole(storedRole);
    }
  }, []);

  if (!role) return <p>Loading...</p>;
  const pathname = usePathname();
  const isOverviewPage = pathname === "/guides/dashboard";

  const bookingData = [
    { month: "Jan", bookings: 10 },
    { month: "Feb", bookings: 15 },
    { month: "Mar", bookings: 7 },
    { month: "Apr", bookings: 12 },
    { month: "May", bookings: 20 },
  ];

  const earningData = [
    { month: "Jan", earnings: 500 },
    { month: "Feb", earnings: 750 },
    { month: "Mar", earnings: 400 },
    { month: "Apr", earnings: 900 },
    { month: "May", earnings: 1100 },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6">
          <h1 className="text-2xl font-semibold text-center mb-6">📊 Guide Dashboard</h1>
          {isOverviewPage ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DashboardCard title="📅 Booking Trends">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={bookingData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </DashboardCard>

              <DashboardCard title="💰 Earnings History">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={earningData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="earnings" stroke="#22C55E" />
                  </LineChart>
                </ResponsiveContainer>
              </DashboardCard>
            </div>
          ) : (
            <div>{children}</div>
          )}
        </div>
      </main>
    </div>
  );
};

const DashboardCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-gray-50 p-4 rounded-lg shadow-md">
    <h2 className="text-lg font-semibold mb-3">{title}</h2>
    {children}
  </div>
);

export default GuideDashboard;
