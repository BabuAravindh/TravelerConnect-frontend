"use client";

import { useState, useEffect } from "react";
import { Search, Edit, Trash} from "lucide-react";
import Link from "next/link";
import UserSidebar from "@/components/UserSidebar";

// Define a type for User
interface User {
  id: number;
  name: string;
  email: string;
  role: "User" | "Admin";
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <span className="text-gray-500">🔹 Manage & Control All Users</span>
        </div>

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
      </div>
    </div>
  );
};

export default UsersPage;
