'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, MessageSquare, CreditCard } from 'lucide-react';
import ActiveLink from './ActiveLink';

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/bookings", label: "Bookings", icon: Calendar },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-black/30 backdrop-blur-md shadow-lg rounded-full flex gap-4 px-6 py-3">
      {navItems.map(({ href, label, icon: Icon }) => (
        <ActiveLink key={href} href={href} label={label} icon={<Icon className="w-5 h-5" />} />
      ))}
    </nav>
  );
};

export default Sidebar;
