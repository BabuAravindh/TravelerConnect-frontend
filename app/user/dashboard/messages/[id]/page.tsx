"use client";

import React, { useEffect, useState } from "react";
import DesktopChat from "@/components/DesktopChat";
import useChat from "@/hooks/useChat";
import { useParams, useRouter } from "next/navigation";

const MessageDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { 
    fetchOrCreateConversation, 
    setSelectedConversation,
    selectedConversation,
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    markNotificationsAsRead,
    notifications
  } = useChat();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No conversation ID provided");
      setIsLoading(false);
      return;
    }

    const loadConversation = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching conversation with participant id:", id);
        const result = await fetchOrCreateConversation(id);
        
        if (!result) {
          throw new Error("Failed to load or create conversation");
        }

        console.log("API Response:", result);
        
        // Mark notifications as read for this conversation
        const unreadNotifications = notifications
          .filter(n => n.conversationId === result._id && !n.isRead)
          .map(n => n._id);
        
        if (unreadNotifications.length > 0) {
          await markNotificationsAsRead(unreadNotifications);
        }

        setSelectedConversation(result);
      } catch (err) {
        console.error("Error loading conversation:", err);
        setError(err instanceof Error ? err.message : "Failed to load conversation");
        router.push("/user/dashboard/messages");
      } finally {
        setIsLoading(false);
      }
    };



    return () => {
      setSelectedConversation(null);
    };
  }, [id, fetchOrCreateConversation, setSelectedConversation]);

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md bg-red-900/30 border border-red-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 text-white"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="font-medium text-white">Error Loading Conversation</h3>
          </div>
          <p className="text-red-200 mb-4">{error}</p>
          <button
            onClick={() => router.push("/user/dashboard/messages")}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
          >
            Return to Messages
          </button>
        </div>
      </div>
    );
  }

  if (!selectedConversation) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="font-medium text-white mb-3">No Conversation Found</h3>
          <p className="text-gray-300 mb-4">
            The requested conversation could not be loaded.
          </p>
          <button
            onClick={() => router.push("/user/dashboard/messages")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
          >
            Return to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white">
      <DesktopChat 
        conversation={selectedConversation}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default MessageDetailsPage;