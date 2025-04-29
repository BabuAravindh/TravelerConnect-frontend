import { usePathname } from "next/navigation";
import { Home, Calendar, MessageSquare, CreditCard, User, Users, ClipboardList, Star, Info, UserPlus, RotateCcw, Brain, FileText, LucideIcon } from "lucide-react";
import Link from "next/link";

const iconMap: Record<string, LucideIcon> = {
  Home,
  Calendar,
  MessageSquare,
  CreditCard,
  User,
  Users,
  ClipboardList,
  Star,
  Info,
  UserPlus,
  RotateCcw,
  Brain,
  FileText,
};

interface ActiveLinkProps {
  href: string;
  label: string;
  iconName: string;
}

const ActiveLink = ({ href, label, iconName }: ActiveLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  const Icon = iconMap[iconName] || User;

  return (
    <Link href={href} className="flex items-center gap-3" aria-label={label}>
      <div
        className={`p-3 rounded-lg transition duration-300 cursor-pointer flex items-center gap-3 
          ${isActive ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-gray-700"}`}
      >
        <Icon className="w-6 h-6" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
};

export default ActiveLink;