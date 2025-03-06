"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", users: 200 },
  { month: "Feb", users: 250 },
  { month: "Mar", users: 400 },
  { month: "Apr", users: 450 },
  { month: "May", users: 600 },
];

const UserGrowthChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="month" stroke="#8884d8" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="users" fill="#8884d8" barSize={50} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default UserGrowthChart;
