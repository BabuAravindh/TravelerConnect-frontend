"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";
import useAuth from "@/hooks/useAuth";

interface AdminStats {
  users: {
    total: number;
    guides: number;
    customers: number;
  };
  bookings: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    paid: number;
  };
  payments: {
    totalTransactions: number;
    totalRevenue: number;
    totalRefunds: number;
    totalRefundAmount: number;
    monthlyRevenue: { month: string; total: number }[];
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminDashboard() {
  const { userRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isOverviewPage = pathname === "/admin/dashboard";
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect if the user is not an admin
  useEffect(() => {
    if (userRole && userRole !== "admin") {
      router.push("/");
    }
  }, [userRole, router]);

  // Fetch admin stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch admin stats");
        }

        const { data } = await response.json();
        setStats(data);
        
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Generate chart data from monthly revenue
  const revenueData = stats?.payments.monthlyRevenue.map(item => ({
    name: item.month.split(' ')[0], // Just show month name
    value: item.total
  })) || [];

  const bookingStatusData = [
    { name: 'Completed', value: stats?.bookings.completed || 0 },
    { name: 'Pending', value: stats?.bookings.pending || 0 },
    { name: 'Cancelled', value: stats?.bookings.cancelled || 0 },
    { name: 'Paid', value: stats?.bookings.paid || 0 }
  ];

  const userDistributionData = [
    { name: 'Guides', value: stats?.users.guides || 0 },
    { name: 'Customers', value: stats?.users.customers || 0 }
  ];

  const paymentData = [
    { name: 'Revenue', value: stats?.payments.totalRevenue || 0 },
    { name: 'Refunds', value: stats?.payments.totalRefundAmount || 0 }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (!userRole) return <p className="text-center py-10">Loading...</p>;
  if (userRole !== "admin") return null;

  if (loading) return <p className="text-center py-10">Loading dashboard...</p>;
  if (error) return <p className="text-center py-10 text-red-500">{error}</p>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
          
          {/* Stats Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Users" 
              value={stats?.users.total || 0} 
              icon="👥"
              trend="up"
              change="12%"
              color="bg-blue-50 text-blue-600"
            />
            <StatCard 
              title="Guides" 
              value={stats?.users.guides || 0} 
              icon="🧭"
              trend="up"
              change="8%"
              color="bg-green-50 text-green-600"
            />
            <StatCard 
              title="Customers" 
              value={stats?.users.customers || 0} 
              icon="👤"
              trend="up"
              change="15%"
              color="bg-purple-50 text-purple-600"
            />
            <StatCard 
              title="Total Bookings" 
              value={stats?.bookings.total || 0} 
              icon="📅"
              trend="up"
              change="22%"
              color="bg-yellow-50 text-yellow-600"
            />
            <StatCard 
              title="Total Revenue" 
              value={formatCurrency(stats?.payments.totalRevenue || 0)} 
              icon="💰"
              trend="up"
              change="18%"
              color="bg-indigo-50 text-indigo-600"
            />
            <StatCard 
              title="Total Refunds" 
              value={formatCurrency(stats?.payments.totalRefundAmount || 0)} 
              icon="🔄"
              trend="down"
              change="5%"
              color="bg-red-50 text-red-600"
            />
            <StatCard 
              title="Completed Bookings" 
              value={stats?.bookings.completed || 0} 
              icon="✅"
              trend="up"
              change="10%"
              color="bg-teal-50 text-teal-600"
            />
            <StatCard 
              title="Cancelled Bookings" 
              value={stats?.bookings.cancelled || 0} 
              icon="❌"
              trend="down"
              change="3%"
              color="bg-rose-50 text-rose-600"
            />
          </div>

          {isOverviewPage ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trends */}
              <DashboardCard title="Monthly Revenue Trends">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => `₹${value}`}
                        width={80}
                      />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#4F46E5" 
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                        name="Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </DashboardCard>

              {/* Booking Status */}
              <DashboardCard title="Booking Status Distribution">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bookingStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {bookingStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [value, "Bookings"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </DashboardCard>

              {/* User Distribution */}
              <DashboardCard title="User Distribution">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {userDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </DashboardCard>

              {/* Payment Overview */}
              <DashboardCard title="Payment Overview">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={paymentData}
                      layout="vertical"
                    >
                      <XAxis type="number" tickFormatter={(value) => `₹${value}`} />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(Number(value)), "Amount"]}
                      />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Amount">
                        {paymentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
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

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: 'up' | 'down';
  change?: string;
}

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color,
  trend,
  change
}: StatCardProps) => (
  <div className={`p-6 rounded-xl shadow-sm ${color.split(' ')[0]} border border-gray-100`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <span className="text-2xl">{icon}</span>
    </div>
    {trend && change && (
      <div className={`mt-2 flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {trend === 'up' ? (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        ) : (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )}
        {change} from last month
      </div>
    )}
  </div>
);

const DashboardCard = ({ 
  title, 
  children 
}: { 
  title: string; 
  children: React.ReactNode 
}) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
    {children}
  </div>
);