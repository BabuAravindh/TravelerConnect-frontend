'use client';

import { FC } from 'react';
import { Home, Calendar, MessageSquare, CreditCard, LucideIcon } from 'lucide-react';
import ActiveLink from './ActiveLink';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/bookings", label: "Bookings", icon: Calendar },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
];

const Sidebar: FC = () => {
  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-black/30 backdrop-blur-md shadow-lg rounded-full flex gap-4 px-6 py-3">
      {navItems.map(({ href, label, icon: Icon }) => (
      <ActiveLink key={href} href={href} label={label} iconName={Icon.name} />

      ))}
    </nav>
  );
};

export default Sidebar;
