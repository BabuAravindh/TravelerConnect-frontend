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
  iconName: string; // Now passing string instead of component
}

const ActiveLink = ({ href, label, iconName }: ActiveLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  const Icon = iconMap[iconName]; // Retrieve icon component

  return (
    <Link href={href} className="flex" aria-label={label}>
      <div
        className={`p-3 rounded-full transition duration-300 cursor-pointer text-white ${
          isActive ? " bg-primary hover:text-white shadow-lg" : "hover:bg-white/20"
        }`}
      >
        {Icon && <Icon className="w-6 h-6" />} {/* Render the icon dynamically */}
      </div>
    </Link>
  );
};

export default ActiveLink;
