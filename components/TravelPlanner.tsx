
'use client';

import { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';

// Interfaces
interface City {
  _id: string;
  cityName: string;
  order: number;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface Question {
  _id: string;
  questionText: string;
  cityId: {
    _id: string;
    cityName: string;
    order: number;
    createdAt: string;
    __v: number;
  };
  status: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  type?: 'text' | 'options' | 'number' | 'date';
  options?: string[];
}

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  options?: string[];
  type?: 'text' | 'options' | 'number' | 'date';
}

interface UserResponse {
  questionId: string;
  response: string;
}

interface TravelPlanResponse {
  itinerary: string;
  planId: string;
}

interface DecodedToken {
  id: string;
  [key: string]: any;
}

// API Service
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/predefine`;

const handleResponse = async <T,>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || errorData.message || 'Request failed';
    const error = new Error(errorMessage) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return response.json() as Promise<T>;
};

const apiService = {
  getCities: async (): Promise<City[]> => {
    const response = await fetch(`${API_BASE_URL}/cities`);
    const result = await handleResponse<{ success: boolean; data: City[] }>(response);
    return result.data;
  },

  getQuestionsByCity: async (cityId: string): Promise<Question[]> => {
    const response = await fetch(`${API_BASE_URL}/questions/city/${cityId}`);
    const result = await handleResponse<ApiResponse<Question[]>>(response);
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch questions');
    }
    return result.data;
  },

  createTravelPlan: async (cityName: string, questions: Question[], answers: { response: string }[]): Promise<TravelPlanResponse> => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found. Please log in again.");
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/travelPlan`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        cityName,
        questions,
        answers,
      }),
    });
    const result = await handleResponse<{ success: boolean; data: TravelPlanResponse; message?: string }>(response);
    if (!result.success || !result.data?.itinerary) {
      throw new Error(result.message || 'Failed to generate itinerary');
    }
    return result.data;
  },

  requestCredits: async (): Promise<void> => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found. Please log in again.");
    }

    const decoded: DecodedToken = jwtDecode(token);
    const userId = decoded.id;

    const response = await fetch(`http://localhost:5000/api/credit/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
      }),
    });

    await handleResponse<{ success: boolean; message?: string }>(response);
  },
};

// AIRecommendation Component
interface AIRecommendationProps {
  city?: string;
}

const AIRecommendation: React.FC<AIRecommendationProps> = ({ city }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cities, setCities] = useState<City[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creditRequestStatus, setCreditRequestStatus] = useState<'idle' | 'requesting' | 'success' | 'error'>('idle');
  const [creditRequestError, setCreditRequestError] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Fetch cities on mount if no city is provided
  useEffect(() => {
    if (!city) {
      const fetchCities = async () => {
        setIsLoading(true);
        try {
          const citiesData = await apiService.getCities();
          setCities(Array.isArray(citiesData) ? citiesData : []);
          setError(null);
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Failed to load cities. Please try again.');
          setCities([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCities();
    }
  }, [city]);

  // Prompt user to select a city if no city is provided
  useEffect(() => {
    if (!city && cities.length > 0 && messages.length === 0) {
      setMessages([
        {
          sender: 'bot',
          text: 'Please select a city to start planning your trip.',
          type: 'options',
          options: cities.map((c: City) => c.cityName),
        },
      ]);
    }
  }, [cities, messages.length, city]);

  // Handle pre-selected city or fetch questions after city selection
  useEffect(() => {
    if ((city && messages.length === 0) || (currentStep > 0 && questions.length === 0)) {
      const cityResponse = city
        ? { questionId: 'initial-city-selection', response: city }
        : userResponses.find((res: UserResponse) => res.questionId === 'initial-city-selection');
      if (cityResponse) {
        const selectedCity = cities.find((c: City) => c.cityName.toLowerCase() === cityResponse.response.toLowerCase());
        if (selectedCity || city) {
          const fetchQuestions = async () => {
            setIsLoading(true);
            try {
              const cityId = selectedCity?._id || (await apiService.getCities()).find(c => c.cityName.toLowerCase() === city?.toLowerCase())?._id;
              if (!cityId) throw new Error('City not found');
              const questionsData = await apiService.getQuestionsByCity(cityId);
              const filteredQuestions = questionsData
                .filter((q: Question) => q.status.toLowerCase() === 'active')
                .sort((a: Question, b: Question) => a.order - b.order);
              setQuestions(filteredQuestions);
              if (filteredQuestions.length > 0) {
                const firstNonCityQuestion = filteredQuestions.find(
                  (q: Question) => !q.questionText.toLowerCase().includes('city')
                );
                const startIndex = filteredQuestions.findIndex(
                  (q: Question) => q._id === firstNonCityQuestion?._id
                );
                setCurrentStep(startIndex >= 0 ? startIndex : 0);
                if (firstNonCityQuestion) {
                  setMessages((prev: ChatMessage[]) => [
                    ...prev,
                    {
                      sender: 'bot',
                      text: firstNonCityQuestion.questionText,
                      type: firstNonCityQuestion.type || 'text',
                      options: firstNonCityQuestion.options,
                    },
                  ]);
                } else {
                  addBotMessage({
                    sender: 'bot',
                    text: 'No further questions available. Generating your itinerary...',
                    type: 'text',
                  });
                  setTimeout(() => generateItinerary(), 1000);
                }
              } else {
                addBotMessage({
                  sender: 'bot',
                  text: 'No questions available for this city. Generating your itinerary...',
                  type: 'text',
                });
                setTimeout(() => generateItinerary(), 1000);
              }
              setError(null);
            } catch (err: unknown) {
              setError(err instanceof Error ? err.message : 'Failed to load questions for this city.');
              setQuestions([]);
              addBotMessage({
                sender: 'bot',
                text: 'Unable to load questions for this city. Generating itinerary anyway...',
                type: 'text',
              });
              setTimeout(() => generateItinerary(), 1000);
            } finally {
              setIsLoading(false);
            }
          };
          fetchQuestions();
        }
      }
    }
  }, [userResponses, cities, currentStep, questions.length, city, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Reset creditRequestStatus when error changes
  useEffect(() => {
    if (error && error.toLowerCase().includes("insufficient credits")) {
      console.log("Insufficient credits error detected, resetting creditRequestStatus to 'idle'");
      setCreditRequestStatus('idle');
      setCreditRequestError(null);
    }
  }, [error]);

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');

    processUserResponse(userInput);
  };

  const processUserResponse = (response: string) => {
    setIsLoading(true);

    setTimeout(() => {
      if (!city && currentStep === 0 && messages[0].text === 'Please select a city to start planning your trip.') {
        const selectedCity = cities.find((c: City) => c.cityName.toLowerCase() === response.toLowerCase());
        if (selectedCity) {
          setUserResponses([{ questionId: 'initial-city-selection', response: selectedCity.cityName }]);
          setCurrentStep(1);
        } else {
          addBotMessage({
            sender: 'bot',
            text: 'Please select a valid city from the options provided.',
            type: 'options',
            options: cities.map((c: City) => c.cityName),
          });
          setIsLoading(false);
        }
      } else if (currentStep < questions.length) {
        const currentQuestion = questions[currentStep];
        if (currentQuestion.type === 'options' && currentQuestion.options && !currentQuestion.options.includes(response)) {
          addBotMessage({
            sender: 'bot',
            text: 'Please select a valid option.',
            type: 'options',
            options: currentQuestion.options,
          });
        } else {
          setUserResponses((prev: UserResponse[]) => [
            ...prev,
            { questionId: currentQuestion._id, response },
          ]);
          setCurrentStep(currentStep + 1);
          if (currentStep + 1 < questions.length) {
            const nextQuestion = questions[currentStep + 1];
            addBotMessage({
              sender: 'bot',
              text: nextQuestion.questionText,
              type: nextQuestion.type || 'text',
              options: nextQuestion.options,
            });
          } else {
            generateItinerary();
          }
        }
      } else {
        generateItinerary();
      }

      setIsLoading(false);
    }, 500);
  };

  const addBotMessage = (message: ChatMessage) => {
    setMessages((prev: ChatMessage[]) => [...prev, message]);
  };

  const handleRequestCredits = async () => {
    setCreditRequestStatus('requesting');
    setCreditRequestError(null);

    try {
      await apiService.requestCredits();
      setCreditRequestStatus('success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to request credits.';
      setCreditRequestStatus('error');
      setCreditRequestError(message);
    }
  };

  const generateItinerary = async () => {
    setIsLoading(true);
    setCreditRequestStatus('idle');
    setCreditRequestError(null);
    addBotMessage({
      sender: 'bot',
      text: "Great! I'm creating your personalized itinerary...",
      type: 'text',
    });

    try {
      const cityResponse = userResponses.find((res: UserResponse) => res.questionId === 'initial-city-selection');
      const cityName = cityResponse ? cityResponse.response : city || 'your selected city';

      const questionsToSend = questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        cityId: q.cityId,
        status: q.status,
        order: q.order,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
        __v: q.__v,
        type: q.type,
        options: q.options,
      }));

      const answersToSend = questionsToSend.map((q) => {
        const response = userResponses.find((res) => res.questionId === q._id);
        return { response: response ? response.response : 'Not provided' };
      });

      const { itinerary, planId: generatedPlanId } = await apiService.createTravelPlan(cityName, questionsToSend, answersToSend);
      setPlanId(generatedPlanId);

      // Strip markdown asterisks for plain text display
      const cleanedItinerary = itinerary.replace(/\*\*(.*?)\*\*/g, '$1');

      // Add AI-generated notice
      const finalItinerary = `This itinerary was generated by AI to help you plan your trip to ${cityName}.\n\n${cleanedItinerary}\n\nYour travel plan ID is: ${generatedPlanId}. Save this ID to retrieve your plan later.`;

      setError(null); // Clear any previous errors
      addBotMessage({
        sender: 'bot',
        text: finalItinerary,
        type: 'text',
      });
    } catch (err: unknown) {
      const error = err as Error & { status?: number };
      let errorMessage = error.message || 'Failed to generate itinerary. Please try again.';
      if (error.status === 403 && error.message.toLowerCase().includes('insufficient credits')) {
        errorMessage = 'You do not have sufficient credits to generate an itinerary. Please request credits from the admin.';
        console.log('Setting error for insufficient credits:', errorMessage);
      } else if (error.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.status === 429) {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.status && error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      console.log('Error occurred:', errorMessage, 'Status:', error.status);
      setError(errorMessage);
      addBotMessage({
        sender: 'bot',
        text: errorMessage,
        type: 'text',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    setUserInput(option);
    handleSendMessage();
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-primary">Travel Planning Assistant</h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          {error.toLowerCase().includes("insufficient credits") ? (
            <div className="mt-4">
              {creditRequestStatus === 'idle' ? (
                <button
                  onClick={handleRequestCredits}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Request Credits from Admin
                </button>
              ) : creditRequestStatus === 'requesting' ? (
                <p className="text-gray-600">Requesting credits...</p>
              ) : creditRequestStatus === 'success' ? (
                <p className="text-green-600">Credit request sent to admin successfully. Please wait for approval.</p>
              ) : (
                <p className="text-red-600 mt-2">{creditRequestError}</p>
              )}
            </div>
          ) : null}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div 
          ref={chatContainerRef} 
          className="h-[32rem] p-4 overflow-y-auto bg-gray-50 flex flex-col space-y-4"
          aria-live="polite"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                  message.sender === 'bot' 
                    ? 'bg-white text-gray-800 border border-primary/20' 
                    : 'bg-primary text-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.options && message.type === 'options' && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleOptionSelect(option)}
                        disabled={isLoading}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          userInput === option
                            ? 'bg-button text-white'
                            : 'bg-white text-button border border-primary/30 hover:bg-primary/10'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 rounded-lg px-4 py-2 border border-primary/20">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Thinking...
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-4 bg-white">
          {(!questions.length || currentStep < questions.length) && !isLoading && (
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your response..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
                aria-label="Type your response"
              />
              <button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isLoading}
                className="bg-button text-white px-4 py-2 rounded-lg hover:bg-button/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                aria-label="Send response"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIRecommendation;
