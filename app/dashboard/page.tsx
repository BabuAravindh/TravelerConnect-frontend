"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function GuideDashboard() {
  const [feedbackStats, setFeedbackStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbackStats = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/feedback/admin/stats`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch feedback stats');
        }
        const data = await response.json();
        setFeedbackStats(data);
      } catch (error) {
        console.error("Error fetching feedback stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbackStats();
  }, []);

  const feedbackStatusData = feedbackStats ? [
    { name: 'Approved', value: feedbackStats.approvedFeedback },
    { name: 'Rejected', value: feedbackStats.rejectedFeedback },
    { name: 'Pending', value: feedbackStats.pendingFeedback },
  ] : [];

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6">
          <h1 className="text-2xl font-semibold text-center mb-6">📊 Guide Dashboard</h1>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

              {feedbackStats && (
                <>
                  <DashboardCard title="⭐ Rating Summary">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Average Rating:</span>
                        <span className="font-semibold">
                          {feedbackStats.ratingStats?.averageRating?.toFixed(1) || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Feedback:</span>
                        <span className="font-semibold">{feedbackStats.totalFeedback}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Highest Rating:</span>
                        <span className="font-semibold">{feedbackStats.ratingStats?.maxRating || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lowest Rating:</span>
                        <span className="font-semibold">{feedbackStats.ratingStats?.minRating || 0}</span>
                      </div>
                    </div>
                  </DashboardCard>

                  <DashboardCard title="📊 Feedback Status">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={feedbackStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {feedbackStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </DashboardCard>
                </>
              )}
            </div>
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