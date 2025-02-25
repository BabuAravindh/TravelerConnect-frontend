"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", bookings: 400, revenue: 2400 },
  { name: "Feb", bookings: 300, revenue: 2210 },
  { name: "Mar", bookings: 200, revenue: 2290 },
  { name: "Apr", bookings: 278, revenue: 2000 },
  { name: "May", bookings: 189, revenue: 2181 },
];

const Chart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="name" stroke="#8884d8" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="bookings" stroke="#8884d8" strokeWidth={2} />
        <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Chart;
