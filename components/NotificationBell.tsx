"use client";

import React, { memo, useCallback } from "react";
import { Bell, X } from "lucide-react";
import { useNotifications, NotificationType } from "@/context/NotificationContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface Notification {
  _id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  senderId?: { name: string };
  conversationId?: string;
  timestamp?: string;
}

const NotificationBellComponent: React.FC = () => {
  const { notifications, unreadCount, markAsRead, clearAll, isLoading } = useNotifications();
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const userRole = user?.role;

  const handleMarkAsRead = useCallback((notificationId: string) => {
    markAsRead([notificationId]);
  }, [markAsRead]);

  const handleClearAll = useCallback(() => {
    clearAll();
    setIsOpen(false);
  }, [clearAll]);

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!userRole) return;

      let basePath = "";
      if (notification.conversationId) {
        basePath = userRole === "guide" ? "/guides/dashboard/messages" : "/user/dashboard/messages";
      } else if (notification.type === NotificationType.BookingUpdate) {
        basePath = userRole === "guide" ? "/guides/dashboard/bookings" : "/user/dashboard/bookings";
      } else if (notification.type === NotificationType.PaymentUpdate) {
        basePath = userRole === "guide" ? "/guides/dashboard/payments" : "/user/dashboard/payments";
      }

      if (basePath) {
        router.push(basePath);
        if (!notification.isRead) {
          handleMarkAsRead(notification._id);
        }
      }
      setIsOpen(false);
    },
    [userRole, router, handleMarkAsRead]
  );

  if (authLoading || userRole === "admin") {
    return null;
  }

  return (
    <div className="relative ml-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 transition-colors duration-200 hover:bg-gray-100"
        aria-label="Toggle notifications"
        aria-expanded={isOpen}
        type="button"
      >
        <Bell className="h-6 w-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 origin-top-right transform rounded-lg border border-gray-200 bg-white shadow-xl transition-all duration-200 z-50"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <div className="flex space-x-3">
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-blue-600 transition-colors hover:text-blue-800"
                  title="Mark all as read"
                  type="button"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 transition-colors hover:text-gray-700"
                title="Close notifications"
                aria-label="Close notifications"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                <p className="text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                <p className="text-gray-500">No new notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  className={`block w-full border-b border-gray-100 p-4 text-left transition-colors hover:bg-gray-50 ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  type="button"
                >
                  <div className="flex items-start">
                    <div className="mr-3 flex-shrink-0">
                      {notification.type === NotificationType.BudgetMessage ? (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                          <span className="text-lg text-green-600">💰</span>
                        </div>
                      ) : notification.type === NotificationType.BookingUpdate ? (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100">
                          <span className="text-lg text-yellow-800">📅</span>
                        </div>
                      ) : notification.type === NotificationType.PaymentUpdate ? (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                          <span className="text-lg text-purple-800">💸</span>
                        </div>
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-lg text-blue-600">💬</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {notification.senderId?.name ?? "Unknown Sender"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {notification.message.length > 50
                          ? `${notification.message.substring(0, 50)}...`
                          : notification.message}
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          {notification.timestamp
                            ? new Date(notification.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Unknown time"}
                        </p>
                        {!notification.isRead && (
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="rounded-b-lg border-t border-gray-200 bg-gray-50 p-3 text-center">
              <Link
                href="/notifications"
                className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
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

const NotificationBell = memo(NotificationBellComponent);
NotificationBell.displayName = "NotificationBell";

export default NotificationBell;
