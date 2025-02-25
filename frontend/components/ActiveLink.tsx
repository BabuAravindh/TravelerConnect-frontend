"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, MessageSquare, CreditCard, User, LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Home,
  Calendar,
  MessageSquare,
  CreditCard,
  User,
};

interface ActiveLinkProps {
  href: string;
  label: string;
  iconName: string; // Pass icon name as string
}

const ActiveLink = ({ href, label, iconName }: ActiveLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  const Icon = iconMap[iconName]; // Retrieve the icon component

  return (
    <Link href={href} className="flex items-center gap-3" aria-label={label}>
      <div
        className={`p-3 rounded-lg transition duration-300 cursor-pointer flex items-center gap-3 
          ${isActive ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-gray-700"}
        `}
      >
        {Icon && <Icon className="w-6 h-6" />} {/* Render icon dynamically */}
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
};

export default ActiveLink;
