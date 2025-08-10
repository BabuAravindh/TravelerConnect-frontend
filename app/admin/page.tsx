"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  BarChart, 
  LineChart,
  PieChart,
  Bar,
  Line,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar,
  AreaChart,
  Area,
  CartesianGrid
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/Skeleton";
import useAuth from "@/hooks/useAuth"
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Users, MapPin, Calendar, Wallet, RefreshCw, Check, X } from "lucide-react";

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

// Enhanced color palette
const COLORS = {
  blue: '#3b82f6',
  teal: '#14b8a6',
  amber: '#f59e0b',
  rose: '#f43f5e',
  indigo: '#6366f1',
  emerald: '#10b981',
  violet: '#8b5cf6',
  cyan: '#06b6d4'
};

const GRADIENT_COLORS = [
  { start: '#3b82f6', end: '#6366f6' },
  { start: '#14b8a6', end: '#10b981' },
  { start: '#f59e0b', end: '#f97316' },
  { start: '#f43f5e', end: '#ec4899' }
];

export default function AdminDashboard() {
  const { userRole } = useAuth();
  const router = useRouter();
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

  // Generate chart data
  const revenueData = stats?.payments.monthlyRevenue.map(item => ({
    name: item.month.split(' ')[0],
    revenue: item.total
  })) || [];

  const bookingStatusData = [
    { name: 'Completed', value: stats?.bookings.completed || 0, color: COLORS.emerald },
    { name: 'Pending', value: stats?.bookings.pending || 0, color: COLORS.amber },
    { name: 'Cancelled', value: stats?.bookings.cancelled || 0, color: COLORS.rose }
  ];

  const userDistributionData = [
    { name: 'Guides', value: stats?.users.guides || 0, color: COLORS.blue },
    { name: 'Customers', value: stats?.users.customers || 0, color: COLORS.teal }
  ];

  const revenueVsRefundsData = [
    { 
      name: 'Revenue', 
      value: stats?.payments.totalRevenue || 0,
      fill: `url(#revenueGradient)`
    },
    { 
      name: 'Refunds', 
      value: stats?.payments.totalRefundAmount || 0,
      fill: COLORS.rose
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatShortCurrency = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value}`;
  };

  if (!userRole) return <LoadingState />;
  if (userRole !== "admin") return null;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Users" 
          value={stats?.users.total || 0} 
          change={12}
          icon={<Users className="h-5 w-5" />}
          color={COLORS.blue}
        />
        <StatCard 
          title="Guides" 
          value={stats?.users.guides || 0} 
          change={8}
          icon={<MapPin className="h-5 w-5" />}
          color={COLORS.teal}
        />
        <StatCard 
          title="Customers" 
          value={stats?.users.customers || 0} 
          change={15}
          icon={<Users className="h-5 w-5" />}
          color={COLORS.indigo}
        />
        <StatCard 
          title="Total Bookings" 
          value={stats?.bookings.total || 0} 
          change={22}
          icon={<Calendar className="h-5 w-5" />}
          color={COLORS.violet}
        />
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(stats?.payments.totalRevenue || 0)} 
          change={18}
          icon={<Wallet className="h-5 w-5" />}
          color={COLORS.emerald}
        />
        <StatCard 
          title="Total Refunds" 
          value={formatCurrency(stats?.payments.totalRefundAmount || 0)} 
          change={-5}
          icon={<RefreshCw className="h-5 w-5" />}
          color={COLORS.rose}
        />
        <StatCard 
          title="Completed" 
          value={stats?.bookings.completed || 0} 
          change={10}
          icon={<Check className="h-5 w-5" />}
          color={COLORS.emerald}
        />
        <StatCard 
          title="Cancelled" 
          value={stats?.bookings.cancelled || 0} 
          change={-3}
          icon={<X className="h-5 w-5" />}
          color={COLORS.rose}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Monthly Revenue Trend">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => formatShortCurrency(value)}
                  width={80}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={COLORS.blue}
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#revenueGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        <DashboardCard title="Booking Status Distribution">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                innerRadius="20%" 
                outerRadius="90%" 
                data={bookingStatusData}
                startAngle={180}
                endAngle={-180}
              >
                <RadialBar
                  minAngle={15}
                  label={{ 
                    position: 'insideStart',
                    fill: '#fff',
                    formatter: (value) => `${value}`
                  }}
                  background
                  clockWise
                  dataKey="value"
                >
                  {bookingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RadialBar>
                <Legend 
                  iconSize={10}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{
                    paddingLeft: '20px'
                  }}
                />
                <Tooltip 
                  formatter={(value) => [value, "Bookings"]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none'
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        <DashboardCard title="User Composition">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {userDistributionData.map((entry, index) => (
                    <linearGradient 
                      key={`gradient-${index}`} 
                      id={`gradient-${index}`} 
                      x1="0" 
                      y1="0" 
                      x2="0" 
                      y2="1"
                    >
                      <stop offset="5%" stopColor={entry.color} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={entry.color} stopOpacity={0.2}/>
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={userDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {userDistributionData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#gradient-${index})`} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [value, "Users"]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none'
                  }}
                />
                <Legend 
                  iconType="circle"
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        <DashboardCard title="Revenue vs Refunds">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueVsRefundsData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => formatShortCurrency(value)}
                  width={80}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), "Amount"]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  barSize={60}
                >
                  {revenueVsRefundsData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  color?: string;
}

const StatCard = ({ title, value, icon, change = 0, color = '#3b82f6' }: StatCardProps) => {
  const isPositive = change >= 0;
  
  return (
    <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div 
          className="p-2 rounded-lg" 
          style={{ backgroundColor: `${color}20`, color: color }}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" style={{ color: color }}>{value}</div>
        {change !== 0 && (
          <p className={`text-xs mt-1 flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? (
              <ArrowUp className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDown className="h-3 w-3 mr-1" />
            )}
            {Math.abs(change)}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const DashboardCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow">
    <CardHeader>
      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const LoadingState = () => (
  <div className="p-6 space-y-4">
    <Skeleton className="h-8 w-[200px]" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} className="h-[100px] rounded-lg" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-[300px] rounded-lg" />
      ))}
    </div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="p-6 text-center">
    <div className="bg-red-100 text-red-700 p-4 rounded-lg inline-block max-w-md">
      <p className="font-medium">{message}</p>
    </div>
    <Button 
      variant="outline" 
      className="mt-4"
      onClick={() => window.location.reload()}
    >
      Retry
    </Button>
  </div>
);