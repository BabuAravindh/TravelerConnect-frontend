"use client";

import { useState, useEffect } from "react";
import { Search, Edit, Trash, UserCheck, UserX, Users, ShieldCheck, Lock, Settings } from "lucide-react";
import Link from "next/link";
import UserSidebar from "@/components/UserSidebar";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    setTimeout(() => {
      setUsers([
        { id: 1, name: "John Doe", email: "john@example.com", role: "User" },
        { id: 2, name: "Alice Smith", email: "alice@example.com", role: "Admin" },
        { id: 3, name: "Mark Lee", email: "mark@example.com", role: "User" },
      ]);
    }, 1000);
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />

      <div className="p-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <span className="text-gray-500">🔹 Manage & Control All Users</span>
        </div>

        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 shadow-md rounded-lg flex items-center gap-4">
            <Users size={32} className="text-blue-600" />
            <div>
              <p className="text-xl font-semibold">Total Users</p>
              <p className="text-gray-500">3 Registered</p>
            </div>
          </div>
          <div className="bg-white p-6 shadow-md rounded-lg flex items-center gap-4">
            <ShieldCheck size={32} className="text-green-600" />
            <div>
              <p className="text-xl font-semibold">Admins</p>
              <p className="text-gray-500">1 Admin</p>
            </div>
          </div>
          <div className="bg-white p-6 shadow-md rounded-lg flex items-center gap-4">
            <Lock size={32} className="text-red-600" />
            <div>
              <p className="text-xl font-semibold">Restricted Users</p>
              <p className="text-gray-500">0 Blocked</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex items-center bg-white p-4 rounded-lg shadow-md">
          <Search className="text-gray-400 mr-3" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full border-none outline-none bg-transparent text-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Users Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th
                  className="p-4 cursor-pointer text-gray-700"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  Name {sortOrder === "asc" ? "▲" : "▼"}
                </th>
                <th className="p-4 text-gray-700">Email</th>
                <th className="p-4 text-gray-700">Role</th>
                <th className="p-4 text-center text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                 <td className="p-4">
  <Link href={`/dashboard/users/${user.id}`} className="text-blue-600 hover:underline">
    {user.name}
  </Link>
</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold 
                      ${user.role === "Admin" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-blue-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Settings size={24} className="text-blue-600" /> How User Management Works?
            </h2>
            <ul className="text-gray-700 space-y-3">
              <li>✅ **Registration & Roles:** Users sign up and get assigned roles.</li>
              <li>✅ **Data Management:** Admins can update or delete user info.</li>
              <li>✅ **Security:** Inactive or restricted users can be removed.</li>
            </ul>
          </div>

          <div className="bg-green-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ShieldCheck size={24} className="text-green-600" /> Why User Management Matters?
            </h2>
            <ul className="text-gray-700 space-y-3">
              <li>🔹 **Improved Security:** Prevents unauthorized access.</li>
              <li>🔹 **Efficient Operations:** Streamlines user interactions.</li>
              <li>🔹 **Role-Based Control:** Ensures proper access levels.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
