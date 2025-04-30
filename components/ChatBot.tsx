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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [noResponsesFound, setNoResponsesFound] = useState(false);
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
    if (!userId || !token) {
      toast.error('Please log in to view previous messages');
      return;
    }

    try {
      setLoading(true);
      setFetchError(null);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch previous responses');
      }

      const interactions: Interaction[] = await response.json();
      if (!Array.isArray(interactions)) {
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

      // Set flag for no responses found
      setNoResponsesFound(interactionMessages.length === 0);

      setMessages((prev) => {
        if (interactionMessages.length === 0 && prev.length === 0) {
          return [
            {
              id: 1,
              text: `Hello! I'm your travel assistant${cityName ? ` for ${cityName}` : ''}. No previous conversations found. Ask me something to get started!`,
              sender: 'bot',
              animated: false,
              timestamp: new Date(),
            },
          ];
        }
        const existingIds = new Set(prev.map((msg) => msg.id));
        const newMessages = interactionMessages.filter((msg) => !existingIds.has(msg.id));
        const updatedMessages = [...prev, ...newMessages].sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );
        return updatedMessages;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Could not load previous responses';
      setFetchError(errorMessage);
      toast.error(errorMessage);
      
      // Show a friendly message when fetch fails
      setMessages([
        {
          id: 1,
          text: `Hello! I'm your travel assistant${cityName ? ` for ${cityName}` : ''}. I couldn't retrieve your previous conversations. Feel free to start a new one!`,
          sender: 'bot',
          animated: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [getAuthData, userId, cityName]);

  // Fetch response (supports both general and city-specific queries)
  const fetchResponse = useCallback(async (userQuery: string): Promise<void> => {
    const { token } = getAuthData();
    if (!userId || !token) {
      toast.error('Please login to get AI insights');
      return;
    }

    setLoading(true);
    setInsufficientCredits(false);
    setFetchError(null);

    // Add user query to messages (skip if empty for city-insights auto-call)
    if (userQuery) {
      const queryMessage: Message = {
        id: Date.now(),
        text: userQuery,
        sender: 'user' as const,
        animated: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, queryMessage]);
    }

    try {
      // Determine which API to use based on cityName
      const isCityQuery = cityName !== undefined;

      const apiUrl = isCityQuery
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/ai/city-insights`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/ai`;

      const requestBody = isCityQuery
        ? { userId, city: cityName }
        : { userId, query: userQuery };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          setInsufficientCredits(true);
          toast.error(data.message || 'You need more credits to get insights');
        } else {
          toast.error(data.error || 'Failed to get insights');
          setFetchError(data.error || 'Failed to get insights');
        }
        return;
      }

      const botMessage: Message = {
        id: Date.now() + 1,
        text: '',
        fullText: isCityQuery ? data.insights : data.response,
        sender: 'bot' as const,
        animated: true,
        timestamp: new Date(),
        userQuery: userQuery || `Insights for ${cityName}`,
        creditsUsed: isCityQuery ? 1 : undefined,
        remainingCredits: isCityQuery ? data.remainingCredits : undefined,
      };

      setMessages((prev) => [...prev, botMessage]);
      setTyping(true);
      setCurrentTypingIndex(0);
      
      // If this is the first successful response, clear the noResponsesFound flag
      if (noResponsesFound) {
        setNoResponsesFound(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setFetchError(errorMessage);
      toast.error(errorMessage);
      
      // Add error message to the chat
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: "I'm sorry, I couldn't process your request. Please try again later.",
        sender: 'bot',
        animated: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [getAuthData, cityName, userId, noResponsesFound]);

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
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  // Retry fetching responses
  const retryFetch = () => {
    setFetchError(null);
    fetchPreviousResponses();
  };

  // Initial effect to load messages and fetch previous responses automatically
  useEffect(() => {
    if (authLoading) return;

    if (!userId) {
      setMessages([
        {
          id: 1,
          text: `Hello! I'm your travel assistant${cityName ? ` for ${cityName}` : ''}. Please log in to view previous messages.`,
          sender: 'bot',
          animated: false,
          timestamp: new Date(),
        },
      ]);
      setInitialLoad(false);
      setIsOpen(true);
      return;
    }

    if (!hasMounted.current) {
      hasMounted.current = true;
      setInitialLoad(false);
      setIsOpen(true);
    }

    if (userId && !hasFetchedInitial.current) {
      // Fetch previous responses
      fetchPreviousResponses();

      // Automatically call city-insights API if cityName exists
      if (cityName) {
        fetchResponse(''); // Empty query to trigger city-insights API
      }

      hasFetchedInitial.current = true;
    }
  }, [fetchPreviousResponses, userId, authLoading, cityName, fetchResponse]);

  // Scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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
        onClick={() => setIsOpen(!isOpen)}
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
            <p className="text-sm text-[#6b7280] leading-3">
              {cityName ? `Insights for ${cityName}` : 'Ask me anything!'}
            </p>
          </div>

          <div className="pr-4 h-[calc(100%-120px)] overflow-y-auto chat-container" aria-live="polite">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500">Loading conversations...</div>
            ) : (
              <>
                {noResponsesFound && messages.length === 1 && (
                  <div className="text-center text-gray-500 mb-4 p-2 bg-gray-100 rounded-lg">
                    <p>No previous conversations found</p>
                    <p className="text-sm">Start a new chat below!</p>
                  </div>
                )}
                
                {fetchError && (
                  <div className="text-center text-red-500 mb-4 p-2 bg-red-50 rounded-lg">
                    <p>Error retrieving conversations</p>
                    <button 
                      onClick={retryFetch}
                      className="text-sm text-blue-500 underline mt-1"
                    >
                      Retry
                    </button>
                  </div>
                )}
                
                {messages.map((message) => (
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
                    {message.creditsUsed && message.remainingCredits !== undefined && (
                      <div className="text-xs text-gray-500 mt-1">
                        Credits used: {message.creditsUsed}, Remaining: {message.remainingCredits}
                      </div>
                    )}
                  </div>
                ))}
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
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex mt-4">
            <label htmlFor="chat-input" className="sr-only">
              Ask a question
            </label>
            <input
              id="chat-input"
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


        </div>
      )}
    </>
  );
};

export default CityInsights;