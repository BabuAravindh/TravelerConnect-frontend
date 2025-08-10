"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, LogOut, CreditCard, Home, Info, Mail, Settings } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { toast } from "sonner";

const Navbar = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const navLinks = [
    { href: "/", label: "Home", icon: <Home className="h-4 w-4" /> },
    { href: "/about", label: "About Us", icon: <Info className="h-4 w-4" /> },
    { href: "/services", label: "Services", icon: <Settings className="h-4 w-4" /> },
    { href: "/contact", label: "Contact", icon: <Mail className="h-4 w-4" /> },
  ];

  const getDashboardPath = () => {
    if (!user) return "/dashboard";
    switch (user.role) {
      case "admin": return "/admin/";
      case "user": return "/user/dashboard";
      case "guide": return "/guides/dashboard";
      default: return "/dashboard";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full  bg-primary backdrop-blur supports-[backdrop-filter]:bg-primary">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="text-xl text-white">TravelerConnect</span>
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-6">
          <ul className="flex items-center gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 text-sm font-medium transition-colors hover:text-black ${
                    pathname === link.href ? "text-white" : "text-white"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {user ? (
            <div className="flex items-center gap-2">
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardPath()} className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Request Credits
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Navigation - Hidden on desktop */}
        <div className="flex md:hidden">
          {user && <NotificationBell />}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu - Only shows when toggled */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t">
          <div className="container px-4 py-2">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === link.href ? "bg-accent" : "hover:bg-accent"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}

              {user && (
                <>
                  <Link
                    href={getDashboardPath()}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === getDashboardPath() ? "bg-accent" : "hover:bg-accent"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent w-full text-left"
                    onClick={() => {
                      // Handle request credits
                      setMobileMenuOpen(false);
                    }}
                  >
                    <CreditCard className="h-4 w-4" />
                    Request Credits
                  </button>
                  <button
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent w-full text-left text-destructive"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              )}

              {!user && (
                <div className="flex flex-col gap-2 mt-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;