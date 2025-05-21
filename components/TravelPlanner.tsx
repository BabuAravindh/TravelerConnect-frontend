'use client';
import { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';

interface City {
  _id: string;
  cityName: string;
  order: number;
  createdAt: string;
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
  } | null;
  status: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  type: 'text' | 'options' | 'number' | 'date' | 'common';
  options?: string[];
}

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  options?: string[];
  type?: 'text' | 'options' | 'number' | 'date' | 'common';
  isError?: boolean;
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

interface ApiError extends Error {
  status?: number;
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/predefine`;
const TRAVEL_PLAN_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/travelPlan`;

const handleApiError = async (response: Response): Promise<never> => {
  let errorData: any;
  try {
    errorData = await response.json();
  } catch {
    errorData = {};
  }

  const errorMessage = errorData.error || errorData.message || 'Request failed';
  const error: ApiError = new Error(errorMessage);
  error.status = response.status;
  throw error;
};

const apiService = {
  getCities: async (): Promise<City[]> => {
    const response = await fetch(`${API_BASE_URL}/cities`);
    if (!response.ok) await handleApiError(response);
    const result = await response.json();
    return result.data || [];
  },

  getQuestionsByCity: async (cityId: string): Promise<Question[]> => {
    const response = await fetch(`${API_BASE_URL}/questions/city/${cityId}`);
    if (!response.ok) await handleApiError(response);
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch questions');
    }
    
    return result.data
      .filter((q: Question) => q.status.toLowerCase() === 'active')
      .sort((a: Question, b: Question) => a.order - b.order);
  },

  createTravelPlan: async (cityName: string, questions: Question[], answers: { response: string }[]): Promise<TravelPlanResponse> => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found. Please log in again.");
    }

    const response = await fetch(TRAVEL_PLAN_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        cityName,
        questions,
        answers,
      }),
    });

    if (!response.ok) await handleApiError(response);
    
    const result = await response.json();
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

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/credit/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
      }),
    });

    if (!response.ok) await handleApiError(response);
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to request credits');
    }
  },
};

const AIRecommendation = ({ city }: { city?: string }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cities, setCities] = useState<City[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creditRequestStatus, setCreditRequestStatus] = useState<'idle' | 'requesting' | 'success' | 'error'>('idle');
  const [planId, setPlanId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const addMessage = (message: ChatMessage) => {
    console.log('Adding message:', message); // Debug: Log message content
    setMessages(prev => [...prev, message]);
  };

  const addErrorMessage = (text: string) => {
    addMessage({
      sender: 'bot',
      text,
      isError: true
    });
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentStep(0);
    setUserResponses([]);
    setUserInput('');
    setQuestions([]);
    setError(null);
    setPlanId(null);
    setCreditRequestStatus('idle');
  };

  useEffect(() => {
    const initChat = async () => {
      try {
        setIsLoading(true);
        
        const citiesData = await apiService.getCities();
        console.log('Loaded cities:', citiesData);
        if (!citiesData.length) {
          addErrorMessage('No cities are available. Please contact support.');
          setError('No cities available');
          return;
        }
        setCities(citiesData);
        
        if (!city) {
          addMessage({
            sender: 'bot',
            text: `Please select a city to start planning your trip. Available cities: ${citiesData.map(c => c.cityName).join(', ')}.`,
            type: 'options',
            options: citiesData.map(c => c.cityName),
          });
        } else {
          const selectedCity = citiesData.find(c => c.cityName.toLowerCase() === city.toLowerCase());
          if (!selectedCity) {
            addErrorMessage(`City "${city}" is not available. Available cities: ${citiesData.map(c => c.cityName).join(', ')}.`);
            addMessage({
              sender: 'bot',
              text: `Please select a valid city. Available cities: ${citiesData.map(c => c.cityName).join(', ')}.`,
              type: 'options',
              options: citiesData.map(c => c.cityName),
            });
            return;
          }
          setUserResponses([{
            questionId: 'initial-city-selection',
            response: selectedCity.cityName
          }]);
          setCurrentStep(0);
        }
      } catch (err) {
        const error = err as ApiError;
        const errorMessage = error.status === 401 
          ? 'Your session has expired. Please log in again.'
          : `Failed to load cities: ${error.message || 'Unknown error'}.`;
        addErrorMessage(errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
  }, [city]);

  useEffect(() => {
    const loadQuestions = async () => {
      if ((city || userResponses.some(res => res.questionId === 'initial-city-selection')) && questions.length === 0) {
        try {
          setIsLoading(true);
          const cityResponse = city 
            ? { questionId: 'initial-city-selection', response: city }
            : userResponses.find(res => res.questionId === 'initial-city-selection');
            
          if (!cityResponse) return;

          const selectedCity = cities.find(c => c.cityName.toLowerCase() === cityResponse.response.toLowerCase());
          const cityId = selectedCity?._id || (await apiService.getCities())
            .find(c => c.cityName.toLowerCase() === cityResponse.response.toLowerCase())?._id;
            
          if (!cityId) throw new Error(`City "${cityResponse.response}" not found`);

          const questionsData = await apiService.getQuestionsByCity(cityId);
          console.log('Loaded questions:', questionsData);
          if (questionsData.some(q => !q.cityId)) {
            addMessage({
              sender: 'bot',
              text: 'Using common questions to plan your trip, as no specific questions are available for this city.',
            });
          }
          setQuestions(questionsData);
          setCurrentStep(0);

          if (questionsData.length > 0) {
            const firstQuestion = questionsData[0];
            console.log('Displaying first question:', {
              _id: firstQuestion._id,
              questionText: firstQuestion.questionText,
              type: firstQuestion.type,
              options: firstQuestion.options
            });
            if (firstQuestion.type === 'options' || firstQuestion.type === 'common') {
              if (!firstQuestion.options || !firstQuestion.options.length) {
                addErrorMessage(`No options available for question: "${firstQuestion.questionText}". Proceeding with default itinerary.`);
                generateItinerary();
                return;
              }
            }
            addMessage({
              sender: 'bot',
              text: firstQuestion.questionText,
              type: firstQuestion.type === 'common' ? 'options' : firstQuestion.type,
              options: firstQuestion.options || [],
            });
          } else {
            addErrorMessage('No questions available. Generating a basic itinerary...');
            generateItinerary();
          }
        } catch (err) {
          const error = err as ApiError;
          const errorMessage = error.message || 'Failed to load questions.';
          addErrorMessage(errorMessage);
          setError(errorMessage);
          generateItinerary();
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadQuestions();
  }, [city, userResponses, cities, questions.length]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    addMessage({ sender: 'user', text: userInput });
    setUserInput('');

    try {
      setIsLoading(true);
      
      if (!city && currentStep === 0 && messages[0]?.text.includes('Please select a city to start planning your trip')) {
        const normalizedInput = userInput.trim().toLowerCase();
        console.log('City selection:', { userInput, normalizedInput, cities });
        const selectedCity = cities.find(c => c.cityName.toLowerCase() === normalizedInput);
        if (!selectedCity) {
          addErrorMessage(`"${userInput}" is not a valid city. Available cities: ${cities.map(c => c.cityName).join(', ')}.`);
          addMessage({
            sender: 'bot',
            text: `Please select a valid city. Available cities: ${cities.map(c => c.cityName).join(', ')}.`,
            type: 'options',
            options: cities.map(c => c.cityName),
          });
          return;
        }

        setUserResponses([{ questionId: 'initial-city-selection', response: selectedCity.cityName }]);
        setCurrentStep(0);
        return;
      }

      if (currentStep < questions.length) {
        const currentQuestion = questions[currentStep];
        if (!currentQuestion) {
          throw new Error('No question available at current step.');
        }
        console.log('Validating question:', { 
          currentStep, 
          questionId: currentQuestion._id, 
          questionText: currentQuestion.questionText,
          type: currentQuestion.type,
          options: currentQuestion.options
        });
        
        const effectiveType = currentQuestion.type === 'common' ? 'options' : currentQuestion.type;
        
        if (effectiveType === 'options' && currentQuestion.options) {
          const normalizedInput = userInput.trim().toLowerCase();
          const normalizedOptions = currentQuestion.options.map(opt => opt.trim().toLowerCase());
          
          console.log('Validation details:', {
            userInput,
            normalizedInput,
            currentQuestionOptions: currentQuestion.options,
            normalizedOptions,
            isValidOption: normalizedOptions.includes(normalizedInput)
          });
          
          if (!normalizedOptions.includes(normalizedInput)) {
            addErrorMessage('Please select a valid option from the provided choices.');
            addMessage({
              sender: 'bot',
              text: currentQuestion.questionText,
              type: effectiveType,
              options: currentQuestion.options,
            });
            return;
          }
        } else if (effectiveType === 'number' && isNaN(Number(userInput))) {
          addErrorMessage('Please enter a valid number.');
          addMessage({
            sender: 'bot',
            text: currentQuestion.questionText,
            type: effectiveType,
          });
          return;
        } else if (effectiveType === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(userInput)) {
          addErrorMessage('Please enter a valid date in YYYY-MM-DD format.');
          addMessage({
            sender: 'bot',
            text: currentQuestion.questionText,
            type: effectiveType,
          });
          return;
        }

        setUserResponses(prev => [
          ...prev,
          { questionId: currentQuestion._id, response: userInput }
        ]);

        if (currentStep + 1 < questions.length) {
          const nextQuestion = questions[currentStep + 1];
          console.log('Displaying next question:', {
            _id: nextQuestion._id,
            questionText: nextQuestion.questionText,
            type: nextQuestion.type,
            options: nextQuestion.options
          });
          if (nextQuestion.type === 'options' || nextQuestion.type === 'common') {
            if (!nextQuestion.options || !nextQuestion.options.length) {
              addErrorMessage(`No options available for question: "${nextQuestion.questionText}". Proceeding with default itinerary.`);
              generateItinerary();
              return;
            }
          }
          addMessage({
            sender: 'bot',
            text: nextQuestion.questionText,
            type: nextQuestion.type === 'common' ? 'options' : nextQuestion.type,
            options: nextQuestion.options || [],
          });
          setCurrentStep(currentStep + 1);
        } else {
          await generateItinerary();
        }
      } else {
        addMessage({
          sender: 'bot',
          text: 'You’ve answered all questions. Would you like to generate a new itinerary or modify your preferences?',
          type: 'options',
          options: ['Generate New Itinerary', 'Modify Preferences'],
        });
        setCurrentStep(questions.length);
      }
    } catch (err) {
      const error = err as Error;
      addErrorMessage(error.message || 'An error occurred while processing your response.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateItinerary = async () => {
    try {
      setIsLoading(true);
      setError(null);
      addMessage({
        sender: 'bot',
        text: "Great! I'm creating your personalized itinerary...",
      });

      const cityResponse = userResponses.find(res => res.questionId === 'initial-city-selection');
      const cityName = cityResponse?.response || city || 'your selected city';

      const { itinerary, planId: generatedPlanId } = await apiService.createTravelPlan(
        cityName,
        questions,
        questions.map(q => {
          const response = userResponses.find(res => res.questionId === q._id);
          return { response: response?.response || 'Not provided' };
        })
      );

      setPlanId(generatedPlanId);
      
      const isMinimalInput = questions.length === 0 || userResponses.length <= 1;
      const disclaimer = isMinimalInput 
        ? "\n\nNote: This itinerary is based on limited preferences. For a more tailored plan, please provide additional details or contact support."
        : "";
      
      const formattedItinerary = `This itinerary was generated by AI to help you plan your trip to ${cityName}.\n\n${itinerary}${disclaimer}\n\nYour travel plan ID is: ${generatedPlanId}. Save this ID to retrieve your plan later.`;

      addMessage({
        sender: 'bot',
        text: formattedItinerary,
      });
    } catch (err) {
      const error = err as ApiError;
      let errorMessage = error.message || 'Failed to generate itinerary. Please try again.';
      
      if (error.status === 403 && error.message.toLowerCase().includes('insufficient credits')) {
        errorMessage = 'You do not have sufficient credits to generate an itinerary. Please request credits from the admin.';
      } else if (error.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.status === 429) {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.status && error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      setError(errorMessage);
      addErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestCredits = async () => {
    try {
      setCreditRequestStatus('requesting');
      await apiService.requestCredits();
      setCreditRequestStatus('success');
      setError(null);
      addMessage({
        sender: 'bot',
        text: 'Credit request submitted successfully. Please wait for admin approval.',
      });
    } catch (err) {
      const error = err as ApiError;
      setCreditRequestStatus('error');
      setError(error.message || 'Failed to request credits.');
    }
  };

  const handleOptionSelect = (option: string) => {
    console.log('Option selected:', option); // Debug: Log selected option
    setUserInput(option);
    handleSendMessage();
  };

  const handlePostItineraryAction = (option: string) => {
    if (option === 'Generate New Itinerary') {
      generateItinerary();
    } else if (option === 'Modify Preferences') {
      resetChat();
      if (city) {
        setUserResponses([{ questionId: 'initial-city-selection', response: city }]);
      } else {
        addMessage({
          sender: 'bot',
          text: `Please select a city to start planning your trip. Available cities: ${cities.map(c => c.cityName).join(', ')}.`,
          type: 'options',
          options: cities.map(c => c.cityName),
        });
      }
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="max-w-full mx-auto p-4">
      <div className="flex items-center justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 512"
          className="w-10 h-10 mr-3 text-primary"
          fill="currentColor"
        >
          <path d="M320 96a96 96 0 1 0 0 192 96 96 0 1 0 0-192zM128 256c0-106 86-192 192-192s192 86 192 192c0 81.5-50.7 151.4-122.4 179.7l-1.2 4.5c-2.4 9-.7 18.4 4.5 25.9s14.3 11.9 23.7 11.9H448c8.8 0 16 7.2 16 16s-7.2 16-16 16H391.7c-22.4 0-43.8-7.7-60.6-21.6l-9.2-7.4c-5.9-4.7-9.4-11.9-9.4-19.4c0-13.3 10.7-24 24-24h72.5l1.4-5.1C378.7 376.3 416 320.4 416 256c0-53-43-96-96-96s-96 43-96 96c0 35.1 18.9 65.8 47 82.9v45.4c-28.2-14.1-47-44.6-47-82.9c0-11.4 2-22.3 5.6-32.3c-12.9-4.6-26.5-7.1-40.8-7.1c-5.3 0-10.6 .3-15.8 .9c-1.5-10.6-2.4-21.4-2.4-32.4C128 150 214 64 320 64s192 86 192 192c0 87.4-117 243-168.3 307.2c-12.3 15.3-35.1 15.3-47.4 0C165 499 48 343.4 48 256c0-17.7 14.3-32 32-32s32 14.3 32 32z" />
        </svg>
        <h1 className="text-3xl font-bold text-button">TripPlanner AI</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="bg-primary px-6 py-4 flex items-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Travel Planning Assistant</h2>
            <p className="text-green-100 text-sm">
              {city ? `Planning your trip to ${city}` : "Let's plan your perfect trip"}
            </p>
          </div>
        </div>

        <div
          ref={chatContainerRef}
          className="h-[32rem] p-6 overflow-y-auto bg-gray-50 flex flex-col space-y-4"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs md:max-w-md rounded-lg px-4 py-3 ${
                  message.sender === 'bot'
                    ? message.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                    : 'bg-primary text-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.options && (message.type === 'options' || message.type === 'common') && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          if (message.text.includes('Would you like to generate')) {
                            handlePostItineraryAction(option);
                          } else {
                            handleOptionSelect(option);
                          }
                        }}
                        disabled={isLoading}
                        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                          userInput === option
                            ? 'bg-primary text-white'
                            : 'bg-white text-green-600 border border-green-200 hover:bg-green-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        aria-label={`Select ${option}`}
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
              <div className="bg-white text-gray-800 rounded-lg px-4 py-3 border border-gray-200 shadow-sm flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-3"></div>
                <span className="text-gray-600">Processing your request...</span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 bg-white">
          {error && error.toLowerCase().includes("insufficient credits") && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-100 flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm text-red-800">{error}</p>
                <div className="mt-2">
                  {creditRequestStatus === 'idle' ? (
                    <button
                      onClick={handleRequestCredits}
                      disabled={isLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center disabled:opacity-50"
                      aria-label="Request credits"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Request Credits
                    </button>
                  ) : creditRequestStatus === 'requesting' ? (
                    <div className="flex items-center text-gray-600">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-2"></div>
                      Processing request...
                    </div>
                  ) : creditRequestStatus === 'success' ? (
                    <div className="flex items-center text-green-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Request sent successfully!
                    </div>
                  ) : (
                    <p className="text-red-600">Failed to request credits. Please try again.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {(!questions.length || currentStep < questions.length) && !isLoading && (
            <div className="flex gap-3">
              <input
                type={questions[currentStep]?.type === 'date' ? 'date' : 'text'}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={
                  questions[currentStep]?.type === 'options' || questions[currentStep]?.type === 'common' 
                    ? 'Select an option above or type here' :
                  questions[currentStep]?.type === 'date' ? 'Enter date (YYYY-MM-DD)' :
                  questions[currentStep]?.type === 'number' ? 'Enter a number' :
                  'Type your response...'
                }
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
                aria-label="Enter your response"
              />
              <button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isLoading}
                className="bg-primary hover:bg-opacity-90 text-white px-5 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                aria-label="Send response"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Send
              </button>
            </div>
          )}

          {planId && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100 flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm text-green-800">
                  <span className="font-medium">Your Trip ID:</span> {planId}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Save this ID to retrieve your travel plan later.
                </p>
                <button
                  onClick={resetChat}
                  className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition"
                  aria-label="Start a new trip plan"
                >
                  Start New Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIRecommendation;