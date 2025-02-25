"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit, Calendar, Mail, Phone, MapPin, ShieldCheck, Info } from "lucide-react";
import Image from "next/image";

const UserDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      const userData = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          phone: "123-456-7890",
          location: "New York, USA",
          dob: "1990-06-15",
          role: "User",
          avatar: "/avatars/john.jpg",
          status: "Active",
          membership: "Gold",
          bio: "Passionate traveler and adventure enthusiast. Loves to explore new cultures and try local cuisines.",
        },
        {
          id: 2,
          name: "Alice Smith",
          email: "alice@example.com",
          phone: "987-654-3210",
          location: "Los Angeles, USA",
          dob: "1988-12-22",
          role: "Admin",
          avatar: "/avatars/alice.jpg",
          status: "Active",
          membership: "Platinum",
          bio: "Tech-savvy and data-driven. Managing digital strategies with precision.",
        },
      ];

      const foundUser = userData.find((u) => u.id === parseInt(id));
      setUser(foundUser || null);
    }, 1000);
  }, [id]);

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center text-gray-500 text-lg">Loading user details...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 to-gray-300 p-12 w-full">
      <button onClick={() => router.back()} className="text-gray-700 hover:text-gray-900 flex items-center mb-8 text-lg font-medium">
        <ArrowLeft size={28} className="mr-3" /> Back
      </button>

      <div className="p-8 bg-blue-50 rounded-lg shadow-lg">
        <h3 className="text-3xl font-bold flex items-center text-blue-600">
          <Info size={30} className="mr-3" /> About User Management
        </h3>
        <p className="text-lg text-gray-700 mt-3 leading-relaxed">
          This section provides a comprehensive view of user details, including their role, membership, and personal information. 
          Admins can efficiently manage users by accessing profiles and modifying information when necessary.
        </p>
      </div>

      <div className="mt-10 flex items-center gap-8 bg-white p-10 rounded-lg shadow-xl w-full">
        <div className="relative">
          <Image src={user.avatar} alt={user.name} width={160} height={160} className="rounded-full shadow-md border-4 border-gray-300" />
          <span className={`absolute bottom-2 right-2 w-6 h-6 rounded-full ${user.status === "Active" ? "bg-green-500" : "bg-red-500"} border-2 border-white`}></span>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-lg text-gray-700 mt-3">{user.bio}</p>
          <span className={`mt-4 inline-block text-lg font-medium px-6 py-2 rounded-full ${user.role === "Admin" ? "bg-purple-600 text-white" : "bg-blue-600 text-white"}`}>
            {user.role}
          </span>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6 text-gray-900 text-lg">
        <div className="flex items-center gap-4"><Mail size={28} className="text-blue-600" /><p>{user.email}</p></div>
        <div className="flex items-center gap-4"><Phone size={28} className="text-green-600" /><p>{user.phone}</p></div>
        <div className="flex items-center gap-4"><MapPin size={28} className="text-red-600" /><p>{user.location}</p></div>
        <div className="flex items-center gap-4"><Calendar size={28} className="text-yellow-600" /><p>Born on {user.dob}</p></div>
        <div className="flex items-center gap-4"><ShieldCheck size={28} className="text-teal-600" /><p>Membership: <span className="font-semibold">{user.membership}</span></p></div>
      </div>

      <div className="mt-12 p-10 bg-white rounded-lg shadow-md">
        <h3 className="text-2xl font-bold">How the User Management System Works</h3>
        <ul className="mt-4 text-lg text-gray-700 list-disc pl-8 leading-relaxed">
          <li>Admins can view, update, and manage user information seamlessly.</li>
          <li>Role-based permissions ensure secure and efficient access control.</li>
          <li>Users' membership status determines their access level and privileges.</li>
          <li>The system provides a centralized view of all users for streamlined management.</li>
        </ul>
      </div>

      <button className="mt-12 w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 flex items-center justify-center shadow-lg transition text-xl font-semibold">
        <Edit size={26} className="mr-3" /> Edit User
      </button>
    </div>
  );
};

export default UserDetailPage;