"use client";
import UserSidebar from "@/components/UserSidebar";
import { useState } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const dummyGuides = [
  { id: 1, name: "John Doe", email: "john@example.com", location: "New York" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", location: "Los Angeles" },
  { id: 3, name: "Robert Brown", email: "robert@example.com", location: "Chicago" },
];

const GuidesPage = () => {
  const [guides, setGuides] = useState(dummyGuides);

  return (
    <div className="flex">
      {/* Sidebar */}
      <UserSidebar />

      {/* Main Content */}
      <div className="p-6 flex-1">
        <h1 className="text-3xl font-semibold mb-6">Guides Management</h1>

        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guides.map((guide, index) => (
                <tr
                  key={guide.id}
                  className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition`}
                >
                  <td className="p-3">{guide.name}</td>
                  <td className="p-3">{guide.email}</td>
                  <td className="p-3">{guide.location}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-3">
                      <button className="text-blue-500 hover:text-blue-700">
                        <FaEye />
                      </button>
                      <button className="text-green-500 hover:text-green-700">
                        <FaEdit />
                      </button>
                      <button className="text-red-500 hover:text-red-700">
                        <FaTrash />
                      </button>
                    </div>
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

export default GuidesPage;
