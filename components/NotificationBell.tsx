"use client";

import React, { useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { useNotifications, NotificationType } from "@/context/NotificationContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, clearAll, isLoading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const userRole = user?.role;

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead([notificationId]);
  };

  const handleClearAll = () => {
    clearAll();
    setIsOpen(false);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.conversationId && userRole) {
      const basePath = userRole === "guide" ? "/guides/dashboard/messages" : "/user/dashboard/messages";
      router.push(`${basePath}/`);
      if (!notification.isRead) {
        handleMarkAsRead(notification._id);
      }
    } else if (notification.type === NotificationType.BookingUpdate && userRole) {
      const basePath = userRole === "guide" ? "/guides/dashboard/bookings" : "/user/dashboard/bookings";
      router.push(`${basePath}/`); // Adjust route as needed
      if (!notification.isRead) {
        handleMarkAsRead(notification._id);
      }
    } else if (notification.type === NotificationType.PaymentUpdate && userRole) {
      const basePath = userRole === "guide" ? "/guides/dashboard/payments" : "/user/dashboard/payments";
      router.push(`${basePath}/`); // Adjust route as needed
      if (!notification.isRead) {
        handleMarkAsRead(notification._id);
      }
    }
    setIsOpen(false);
  };

  if (authLoading || userRole === "admin") {
    return null;
  }

  return (
    <div className="relative ml-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 relative transition-colors duration-200"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-6 w-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200 transform origin-top-right transition-all duration-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <div className="flex space-x-3">
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  title="Mark all as read"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p className="text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No new notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {notification.type === NotificationType.BudgetMessage ? (
                        <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 text-lg">💰</span>
                        </div>
                      ) : notification.type === NotificationType.BookingUpdate ? (
                        <div className="h-9 w-9 rounded-full bg-yellow-100 flex items-center justify-center">
                          <span className="text-yellow-800 text-lg">📅</span>
                        </div>
                      ) : notification.type === NotificationType.PaymentUpdate ? (
                        <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-800 text-lg">💸</span>
                        </div>
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 text-lg">💬</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.senderId?.name || "Unknown Sender"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {notification.message.length > 50
                          ? `${notification.message.substring(0, 50)}...`
                          : notification.message}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-400">
                          {new Date(notification.timestamp || "").toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {!notification.isRead && (
                          <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center bg-gray-50 rounded-b-lg">
              <Link
                href="/notifications"
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;