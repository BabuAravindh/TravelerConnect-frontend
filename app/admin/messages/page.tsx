"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Participant {
  _id: string;
  name: string;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  messages: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Message {
  _id: string;
  conversationId: string;
  senderId: Participant;
  receiverId: Participant;
  message: string;
  messageType: string;
  status: string;
  timestamp: string;
  __v: number;
}

const MessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chats/admin/conversations`);
      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      } else {
        setError('Failed to fetch conversations');
      }
    } catch (err) {
      setError('Error fetching conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chats/admin/conversations/${conversationId}`
      );
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
        // Find and set the selected conversation
        const conv = conversations.find(c => c._id === conversationId);
        if (conv) setSelectedConversation(conv);
      } else {
        setError('Failed to fetch messages');
      }
    } catch (err) {
      setError('Error fetching messages');
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chats/admin/conversations/${conversationId}`,
        {
          method: 'DELETE',
        }
      );
      const data = await response.json();
      if (data.success) {
        setConversations(conversations.filter(c => c._id !== conversationId));
        if (selectedConversation?._id === conversationId) {
          setSelectedConversation(null);
          setMessages([]);
        }
      } else {
        setError('Failed to delete conversation');
      }
    } catch (err) {
      setError('Error deleting conversation');
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chats/admin/messages/${messageId}`,
        {
          method: 'DELETE',
        }
      );
      const data = await response.json();
      if (data.success) {
        setMessages(messages.filter(m => m._id !== messageId));
      } else {
        setError('Failed to delete message');
      }
    } catch (err) {
      setError('Error deleting message');
    }
  };

  const updateMessage = async (messageId: string, newMessage: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chats/admin/messages/${messageId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: newMessage }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setMessages(messages.map(m => (m._id === messageId ? data.data : m)));
      } else {
        setError('Failed to update message');
      }
    } catch (err) {
      setError('Error updating message');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Messages Management</h1>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <div className="flex gap-6">
        {/* Conversations list */}
        <div className="w-1/3 bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Conversations</h2>
          {loading ? (
            <div>Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div>No conversations found</div>
          ) : (
            <ul className="space-y-2">
              {conversations.map(conversation => (
                <li
                  key={conversation._id}
                  className={`p-3 rounded cursor-pointer hover:bg-gray-100 ${
                    selectedConversation?._id === conversation._id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => fetchMessages(conversation._id)}
                >
                  <div className="font-medium">
                    {conversation.participants.map(p => p.name).join(' & ')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(conversation.createdAt)}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation._id);
                    }}
                    className="mt-1 text-xs text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Messages panel */}
        <div className="flex-1 bg-white rounded-lg shadow p-4">
          {selectedConversation ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Conversation between {selectedConversation.participants.map(p => p.name).join(' & ')}
                </h2>
                <button
                  onClick={() => {
                    setSelectedConversation(null);
                    setMessages([]);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>

              {loading ? (
                <div>Loading messages...</div>
              ) : messages.length === 0 ? (
                <div>No messages in this conversation</div>
              ) : (
                <div className="space-y-4">
                  {messages.map(message => (
                    <div key={message._id} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between">
                        <div className="font-medium">
                          {message.senderId.name} → {message.receiverId.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(message.timestamp)}
                        </div>
                      </div>
                      <div className="mt-1">
                        <span className={`px-2 py-1 rounded ${
                          message.messageType === 'budget' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'
                        }`}>
                          {message.message}
                        </span>
                      </div>
                     
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500">Select a conversation to view messages</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;