"use client";
import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

interface Message { 
  id: number | string;
  text: string;
  fullText?: string;
  sender: 'user' | 'bot';
  animated?: boolean;
  timestamp: Date;
  userQuery?: string;
  creditsUsed?: number;
  remainingCredits?: number;
}

interface Interaction {
  _id: string;
  userId: string;
  query: string;
  response: string;
  responseStatus: string;
  createdAt: string;
}

const CityInsights: React.FC<{ cityName?: string }> = ({ cityName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id || null;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [currentTypingIndex, setCurrentTypingIndex] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const [insufficientCredits, setInsufficientCredits] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);
  const hasFetchedInitial = useRef(false);

  // Get token from localStorage
  const getAuthData = useCallback(() => {
    const token = localStorage.getItem('token');
    return { token };
  }, []);

  // Fetch previous responses
  const fetchPreviousResponses = useCallback(async (): Promise<void> => {
    const { token } = getAuthData();
    console.log('fetchPreviousResponses called with userId:', userId, 'token status:', token ? 'Present' : 'Missing');

    if (!userId || !token) {
      console.log('Aborting fetch: Missing userId or token');
      toast.error('Please log in to view previous messages');
      return;
    }

    try {
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.message || 'Failed to fetch previous responses');
      }

      const interactions: Interaction[] = await response.json();
      console.log('Fetched interactions:', interactions);

      if (!Array.isArray(interactions)) {
        console.error('Invalid API response: Expected an array, got:', interactions);
        throw new Error('Invalid API response: Expected an array');
      }

      const interactionMessages = interactions
        .filter((int) => int.responseStatus === 'success')
        .flatMap((int) => [
          {
            id: `${int._id}-query`,
            text: int.query,
            sender: 'user' as const,
            animated: false,
            timestamp: new Date(int.createdAt),
          },
          {
            id: int._id,
            text: int.response,
            fullText: int.response,
            sender: 'bot' as const,
            animated: false,
            timestamp: new Date(int.createdAt),
            userQuery: int.query,
          },
        ]);

      console.log('Mapped interaction messages:', interactionMessages);

      setMessages((prev) => {
        const existingIds = new Set(prev.map((msg) => msg.id));
        const newMessages = interactionMessages.filter((msg) => !existingIds.has(msg.id));
        const updatedMessages = [...prev, ...newMessages].sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );
        console.log('Updated messages state:', updatedMessages);
        return updatedMessages;
      });
    } catch (error) {
      console.error('Error fetching previous responses:', error);
      toast.error(error instanceof Error ? error.message : 'Could not load previous responses');
    }
  }, [getAuthData, userId]);

  // Fetch response (generalized for any query)
  const fetchResponse = useCallback(async (userQuery: string): Promise<void> => {
    const { token } = getAuthData();
    if (!userId || !token) {
      toast.error('Please login to get AI insights');
      return;
    }

    setLoading(true);
    setInsufficientCredits(false);

    // Add user query to messages
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: userQuery,
        sender: 'user' as const,
        animated: false,
        timestamp: new Date(),
      },
    ]);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/city-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          city: cityName || '', // Optional city, can be empty for general queries
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          setInsufficientCredits(true);
          toast.error(data.message || 'You need more credits to get insights');
        } else {
          toast.error(data.error || 'Failed to get insights');
        }
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: '',
          fullText: data.insights,
          sender: 'bot' as const,
          creditsUsed: 1,
          remainingCredits: data.remainingCredits,
          animated: true,
          timestamp: new Date(),
          userQuery,
        },
      ]);

      setTyping(true);
      setCurrentTypingIndex(0);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [getAuthData, cityName, userId]);

  // Request credits
  const requestCredits = async (): Promise<void> => {
    const { token } = getAuthData();
    if (!userId || !token) {
      toast.error('Please login to request credits');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/credit/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to request credits');
      }

      toast.success(data.message || 'Credit request submitted successfully');
      setInsufficientCredits(false);
    } catch (error) {
      console.error('Error requesting credits:', error);
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  // Initial effect to load messages and fetch previous responses automatically
  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    console.log('Running initial useEffect, authLoading:', authLoading, 'userId:', userId);

    if (authLoading) return; // Wait for auth to load

    setMessages([
      {
        id: 1,
        text: `Hello! I'm your travel assistant${cityName ? ` for ${cityName}` : ''}. Ask me anything!`,
        sender: 'bot',
        animated: false,
        timestamp: new Date(),
      },
    ]);

    if (userId) {
      fetchPreviousResponses(); // Fetch previous responses automatically on mount
      hasFetchedInitial.current = true; // Mark as fetched to avoid re-fetching
    }

    setInitialLoad(false);
    setIsOpen(true); // Open chat automatically if user is logged in
  }, [fetchPreviousResponses, userId, authLoading, cityName]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Typing animation effect
  useEffect(() => {
    if (typing) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.animated && lastMessage.fullText && currentTypingIndex < lastMessage.fullText.length) {
        const batchSize = 5;
        const timer = setTimeout(() => {
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              ...newMessages[newMessages.length - 1],
              text: (lastMessage.fullText ?? '').substring(0, currentTypingIndex + batchSize),
            };
            return newMessages;
          });
          setCurrentTypingIndex(currentTypingIndex + batchSize);
        }, 100);
        return () => clearTimeout(timer);
      } else {
        setTyping(false);
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            animated: false,
          };
          return newMessages;
        });
      }
    }
  }, [typing, currentTypingIndex, messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      fetchResponse(input);
      setInput('');
    }
  };

  return (
    <>
      <button
        className={`fixed bottom-4 right-4 inline-flex items-center justify-center text-sm font-medium disabled:pointer-events-none disabled:opacity-50 border rounded-full w-16 h-16 bg-primary hover:bg-gray-700 m-0 cursor-pointer border-gray-200 p-0 normal-case leading-5 hover:text-gray-900 ${
          initialLoad ? '' : 'animate-pulse'
        }`}
        onClick={() => setIsOpen(!isOpen)} // Toggle chat visibility only
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white block border-gray-200 align-middle"
        >
          <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed bottom-[calc(4rem+1.5rem)] right-0 mr-4 bg-white p-6 rounded-lg border border-[#e5e7eb] w-full max-w-[440px] h-[80vh] max-h-[634px] shadow-lg animate-slide-up">
          <div className="flex flex-col space-y-1.5 pb-6">
            <h2 className="font-semibold text-lg tracking-tight">Travel Assistant</h2>
            <p className="text-sm text-[#6b7280] leading-3">Ask me anything!</p>
          </div>

          <div className="pr-4 h-[calc(100%-120px)] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500">No messages yet</div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-lg ${
                      message.sender === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'
                    } max-w-[80%] break-words`}
                  >
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </div>
                  {message.userQuery && message.sender === 'bot' && (
                    <div className="text-xs text-gray-500 mt-1">
                      Response to: {message.userQuery}
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex mt-4">
            <input
              type="text"
              placeholder="Ask something..."
              className="flex-1 rounded-l-lg border border-gray-300 p-2 focus:outline-none focus:ring focus:border-blue-300"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button

              type="submit"
              className="bg-button text-white p-2 rounded-r-lg disabled:opacity-90"
              disabled={loading || input.trim() === ''}
            >
              Send
            </button>
          </form>

          {insufficientCredits && (
            <div className="mt-2 text-center text-red-500 text-sm">
              <p>Not enough credits.</p>
              <button
                onClick={requestCredits}
                className="mt-1 underline text-button"
              >
                Request More Credits
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CityInsights;