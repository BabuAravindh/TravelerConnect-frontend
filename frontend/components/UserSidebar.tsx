import { Calendar, CreditCard, Home, MessageSquare, User } from "lucide-react";
import ActiveLink from "./ActiveLink"; // Import the client component

const navItems = [
  { href: "/user/dashboard/", label: "Home", icon: "Home" },
  { href: "/user/dashboard/bookings", label: "Bookings", icon: "Calendar" },
  { href: "/user/dashboard/messages", label: "Messages", icon: "MessageSquare" },
  { href: "/user/dashboard/payments", label: "Payment", icon: "CreditCard" },

];

const UserSidebar = () => {
  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-black/30 backdrop-blur-md shadow-lg rounded-full flex gap-4 px-6 py-3">
      {navItems.map(({ href, label, icon }) => (
        <ActiveLink key={href} href={href} label={label} iconName={icon} />
      ))}
    </nav>
  );
};

export default UserSidebar;
