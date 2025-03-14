"use client";

import { useEffect,useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

import UserSidebar from "@/components/UserSidebar";
import useAuth from "@/hooks/useAuth"; // Use the custom auth hook

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

export default function GuideDashboard() {
  const { userRole } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole !== null) {
      setLoading(false);
    }
  }, [userRole]);
  const router = useRouter();
  const pathname = usePathname();
  const isOverviewPage = pathname === "/guides/dashboard";

  // Redirect if not a guide
  useEffect(() => {
    if (!loading && userRole !== "guide") {
      router.push("/");
    }
  }, [userRole, loading, router]);

  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (userRole !== "guide") return null; // Prevent flashing wrong content

  return (
      <div className="flex min-h-screen">
        <UserSidebar />
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
              <p className="text-center text-gray-600">No additional content</p>
            )}
          </div>
        </main>
      </div>
    
  );
}

// Dashboard Card Component
const DashboardCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-gray-50 p-4 rounded-lg shadow-md">
    <h2 className="text-lg font-semibold mb-3">{title}</h2>
    {children}
  </div>
);
