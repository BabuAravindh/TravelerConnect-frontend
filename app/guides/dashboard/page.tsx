"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import useAuth from "@/hooks/useAuth";


interface GuideStats {
  guideId: string;
  totalBookings: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
}

interface BookingTrend {
  month: string;
  bookings: number;
}

interface EarningTrend {
  month: string;
  earnings: number;
}

export default function GuideDashboard() {
  const { userRole, userId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isOverviewPage = pathname === "/guides/dashboard";
  
  const [stats, setStats] = useState<GuideStats | null>(null);
  const [bookingData, setBookingData] = useState<BookingTrend[]>([]);
  const [earningData, setEarningData] = useState<EarningTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect if the user is not a guide
  useEffect(() => {
    if (userRole && userRole !== "guide") {
      router.push("/");
    }
  }, [userRole, router]);

  // Fetch guide stats
  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/guide/${userId}/stats`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch guide stats");
        }

        const data = await response.json();
        setStats(data);

        // Generate chart data based on stats (you might want to fetch real historical data)
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",];
        const generatedBookings = months.map((month, index) => ({
          month,
          bookings: Math.floor(data.totalBookings * (index + 1) / 6)
        }));
        
        const generatedEarnings = months.map((month, index) => ({
          month,
          earnings: Math.floor(data.totalEarnings * (index + 1) / 6)
        }));

        setBookingData(generatedBookings);
        setEarningData(generatedEarnings);
        
      } catch (err) {
        console.error("Error fetching guide stats:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (!userRole) return <p className="text-center py-10">Loading...</p>;
  if (userRole !== "guide") return null;

  if (loading) return <p className="text-center py-10">Loading dashboard...</p>;
  if (error) return <p className="text-center py-10 text-red-500">{error}</p>;

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto g rounded-xl p-6">
          <h1 className="text-2xl font-semibold text-center mb-6">📊 Guide Dashboard</h1>
          
          {/* Stats Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard 
              title="Total Bookings" 
              value={stats?.totalBookings || 0} 
              icon="📅"
              color="bg-blue-100 text-blue-600"
            />
            <StatCard 
              title="Total Earnings" 
              value={`₹${stats?.totalEarnings || 0}`} 
              icon="💰"
              color="bg-green-100 text-green-600"
            />
            <StatCard 
              title="Average Rating" 
              value={stats?.averageRating ? stats.averageRating.toFixed(1) : "0.0"} 
              icon="⭐"
              color="bg-yellow-100 text-yellow-600"
            />
            <StatCard 
              title="Total Reviews" 
              value={stats?.totalReviews || 0} 
              icon="✍️"
              color="bg-purple-100 text-purple-600"
            />
          </div>

          {isOverviewPage ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DashboardCard title="📅 Booking Trends">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bookingData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </DashboardCard>

              <DashboardCard title="💰 Earnings History">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={earningData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="earnings" 
                      stroke="#22C55E" 
                      strokeWidth={2}
                    />
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

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: string | number; 
  icon: string;
  color: string;
}) => (
  <div className={`p-4 rounded-lg shadow-sm ${color.split(' ')[0]}`}>
    <div className="flex items-center">
      <span className="text-2xl mr-3">{icon}</span>
      <div>
        <p className="text-sm font-medium opacity-80">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

// Dashboard Card Component
const DashboardCard = ({ 
  title, 
  children 
}: { 
  title: string; 
  children: React.ReactNode 
}) => (
  <div className="bg-gray-50 p-4 rounded-lg shadow-md">
    <h2 className="text-lg font-semibold mb-3">{title}</h2>
    {children}
  </div>
);