"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Pusher from "pusher-js";
import { useAuth } from "@/context/AuthContext";

// Types
export enum NotificationType {
  NewMessage = "new_message",
  BudgetMessage = "budget_message",
  BookingUpdate = "booking_update",
  PaymentUpdate = "payment_update",
}

export interface Notification {
  _id: string;
  type: NotificationType;
  senderId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  message: string;
  isRead: boolean;
  conversationId?: string;
  timestamp?: string;
}

// Context Type
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationIds: string[]) => void;
  clearAll: () => void;
  isLoading: boolean;
}

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId = user?.id;
  const userRole = user?.role; // Assuming useAuth provides role

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Ask permission for Web Notifications on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Initialize Pusher only if not admin
  useEffect(() => {
    if (authLoading || !userId || !token || userRole === "admin") return;

    if (process.env.NODE_ENV === "development") {
      Pusher.logToConsole = true;
    }

    const pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/api/chats/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      enabledTransports: ["ws"],
      forceTLS: true,
    });

    setPusher(pusherInstance);

    return () => {
      pusherInstance.disconnect();
    };
  }, [authLoading, token, userId, userRole]);

  // Subscribe to Pusher channel only if not admin
  useEffect(() => {
    if (authLoading || !pusher || !userId || userRole === "admin") return;

    const channel = pusher.subscribe(`private-notifications-${userId}`);

    channel.bind("new-notification", (data: Notification) => {
      setNotifications((prev) => [data, ...prev]);
      if (!data.isRead) {
        setUnreadCount((prev) => prev + 1);
        showNotificationToast(data);
      }
    });

    channel.bind("notifications-read", (data: { notificationIds: string[] }) => {
      setNotifications((prev) =>
        prev.map((n) => (data.notificationIds.includes(n._id) ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - data.notificationIds.length));
    });

    channel.bind("notifications-cleared", () => {
      setNotifications([]);
      setUnreadCount(0);
    });

    return () => {
      pusher.unsubscribe(`private-notifications-${userId}`);
    };
  }, [pusher, userId, authLoading, userRole]);

  // Fetch notifications only if not admin
  useEffect(() => {
    if (authLoading || !userId || !token || userRole === "admin") return;

    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/unread/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();

        if (data.success) {
          setNotifications(data.data);
          setUnreadCount(data.data.filter((n: Notification) => !n.isRead).length);
        } else {
          toast.error(`Failed to load notifications: ${data.error || "Unknown error"}`);
        }
      } catch (err: any) {
        console.error(err);
        toast.error(`Failed to load notifications: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [userId, token, authLoading, userRole]);

  const markAsRead = async (notificationIds: string[]) => {
    if (!token || !userId || userRole === "admin") return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notificationIds }),
        }
      );

      if (!res.ok) throw new Error("Failed to mark notifications as read");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark notifications as read");
    }
  };

  const clearAll = async () => {
    if (!token || !userId || userRole === "admin") return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/clear/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to clear notifications");
    } catch (err) {
      console.error(err);
      toast.error("Failed to clear notifications");
    }
  };

  const showNotificationToast = (notification: Notification) => {
    let message = "";
    let icon = "🔔";

    switch (notification.type) {
      case NotificationType.NewMessage:
        message = `New message from ${notification.senderId.name}`;
        icon = "💬";
        break;
      case NotificationType.BudgetMessage:
        message = `${notification.senderId.name} sent a budget proposal`;
        icon = "💰";
        break;
      case NotificationType.BookingUpdate:
        message = `${notification.senderId.name} updated a booking: ${notification.message}`;
        icon = "📅";
        break;
      case NotificationType.PaymentUpdate:
        message = `${notification.senderId.name} updated a payment: ${notification.message}`;
        icon = "💸";
        break;
      default:
        message = `New notification from ${notification.senderId.name}`;
    }

    // In-app toast
    toast(
      <div className="flex items-start">
        <span className="mr-2 text-xl">{icon}</span>
        <div>
          <p className="font-medium">{message}</p>
          <p className="text-sm text-gray-600">{notification.message}</p>
        </div>
      </div>,
      {
        position: "top-right",
        duration: 5000,
      }
    );

    // Browser notification when browser is minimized or not active
    if (document.visibilityState !== "visible") {
      if ("Notification" in window) {
        const iconUrl = notification.senderId.avatar || "/default-avatar.png";
        const body = notification.message;

        if (Notification.permission === "granted") {
          new Notification(`${icon} ${message}`, { body, icon: iconUrl });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification(`${icon} ${message}`, { body, icon: iconUrl });
            }
          });
        }
      }
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        clearAll,
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Hook
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};