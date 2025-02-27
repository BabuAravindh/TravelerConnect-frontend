"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserSidebar from "@/components/UserSidebar";
import { Users, ClipboardList, CreditCard, Star, UserCheck, TrendingUp, Clock } from "lucide-react";
import dynamic from "next/dynamic";
import { dashboardData as data, recentActivities as activities, topGuides as guides } from "@/data/data";

// Dynamically Import Chart Components
const Chart = dynamic(() => import("@/components/Charts"), { ssr: false });
const UserGrowthChart = dynamic(() => import("@/components/UserGrowthChart"), { ssr: false });

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [topGuides, setTopGuides] = useState([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("userRole");

    // Redirect to login if no role is found
    if (!role) {
      router.push("/login");
      return;
    }

    setUserRole(role);

    setTimeout(() => {
      setDashboardData(data);
      setRecentActivities(activities);
      setTopGuides(guides);
    }, 1000);
  }, []);

  // Show loading while checking the role
  if (!userRole) {
    return <p className="text-center text-white text-2xl">Loading...</p>;
  }

  // Redirect unauthorized users
  if (userRole !== "admin") {
    router.push("/notfound");
    return null;
  }

  return (
    <div className="flex bg-[#6999aa] min-h-screen">
      {/* Sidebar */}
      <UserSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Admin Dashboard</h1>

        {/* Grid Layout for Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={dashboardData.totalUsers} icon={<Users size={24} />} />
          <StatCard title="Active Users" value={dashboardData.activeUsers} icon={<UserCheck size={24} />} />
          <StatCard title="Total Guides" value={dashboardData.totalGuides} icon={<Users size={24} />} />
          <StatCard title="Total Bookings" value={dashboardData.totalBookings} icon={<ClipboardList size={24} />} />
          <StatCard title="Pending Bookings" value={dashboardData.pendingBookings} icon={<Clock size={24} />} />
          <StatCard title="Total Payments" value={`$${dashboardData.totalPayments}`} icon={<CreditCard size={24} />} />
          <StatCard title="Avg Rating" value={dashboardData.avgRating} icon={<Star size={24} />} />
          <StatCard title="Revenue Growth" value={`${dashboardData.revenueGrowth}%`} icon={<TrendingUp size={24} />} />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card title="Booking & Revenue Trends">
            <div className="h-64 flex items-center justify-center">
              <Chart />
            </div>
          </Card>
          <Card title="User Growth">
            <div className="h-64 flex items-center justify-center">
              <UserGrowthChart />
            </div>
          </Card>
        </div>

        {/* Recent Activity & Top Guides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card title="Recent Activities">
            <ul className="text-sm space-y-3">
              {recentActivities.map((activity, index) => (
                <li key={index} className="border-b last:border-none py-3 px-4 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 transition duration-300">
                  <p className="text-black font-semibold">{activity.user}</p>
                  <p className="text-gray-600 text-xs">{activity.action} - {activity.time}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Top Performing Guides">
            <ul className="text-sm space-y-3">
              {topGuides.map((guide, index) => (
                <li key={index} className="border-b last:border-none py-3 px-4 bg-gray-100 rounded-lg shadow-sm flex justify-between items-center hover:bg-gray-200 transition duration-300">
                  <div>
                    <p className="text-black font-semibold">{guide.name}</p>
                    <p className="text-gray-600 text-xs">⭐ {guide.rating} | {guide.tours} tours</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component with Glassmorphism Effect
const StatCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white/20 backdrop-blur-md shadow-lg rounded-xl p-4 flex items-center gap-4 transition-transform transform hover:scale-105">
      <div className="p-3 rounded-full bg-white/30">{icon}</div>
      <div>
        <h3 className="text-sm font-medium text-white">{title}</h3>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

// Reusable Card Component for Sections
const Card = ({ title, children }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-5">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">{title}</h2>
      {children}
    </div>
  );
};

export default DashboardPage;
