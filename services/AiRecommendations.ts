'use client';
import { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';

interface City {
  _id: string;
  cityName: string;
  order: number;
  createdAt?: string;
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
  type: 'specific' | 'common' | 'options' | 'number' | 'date' | 'guidePrompt';
  options?: string[];
}

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  options?: string[];
  type?: 'text' | 'options' | 'number' | 'date' | 'common' | 'guideList' | 'itinerary';
  isError?: boolean;
  guides?: Guide[];
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

interface Guide {
  _id: string;
  userId: string;
  languages: string[];
  bio: string;
  activities: string[];
  bankAccountNumber: string;
  serviceLocations: string[];
  updatedAt: string;
  active: boolean;
  maskedBankAccount?: string;
  bankName?: string;
  ifscCode?: string;
  name?: string;
  profilePic?: {
    public_id: string;
    url: string;
    secure_url: string;
    uploadedAt: string;
  };
  aadharCardPhoto?: {
    public_id: string;
    url: string;
    secure_url: string;
    uploadedAt: string;
    _id?: string;
    id?: string;
  };
  rejectionReason?: string;
  verificationStatus?: string;
  name?: string; // Optional, as not provided in API response
  email?: string;
  role?: string;
  verificationToken?: string | null;
  isVerified?: boolean;
  credits?: number;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  gender?: string;
  dateJoined?: string;
  address?: {
    stateId?: {
      _id: string;
      stateName: string;
    };
    countryId?: string;
  };
  state?: string;
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
    const response = await fetch(`${API_BASE_URL}/cities`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` },
    });
    if (!response.ok) await handleApiError(response);
    const result = await response.json();
    return result.data || [];
  },

  getQuestionsByCity: async (cityId: string): Promise<Question[]> => {
    const response = await fetch(`${API_BASE_URL}/questions/city/${cityId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` },
    });
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
    return { itinerary: result.data.itinerary, planId: result.data.planId };
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
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) await handleApiError(response);
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to request credits');
    }
  },

  getGuidesByCity: async (cityName: string): Promise<Guide[]> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }
  console.log((`http://localhost:5000/api/search/guides?destination=${encodeURIComponent(cityName)}`))
  const response = await fetch(`http://localhost:5000/api/search/guides/city?city=${encodeURIComponent(cityName)}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) await handleApiError(response);
  const result = await response.json();
   
  const guides = Array.isArray(result.data) ? result.data : [];
  console.log('Fetched guides:', guides);
  return guides
    .filter((guide: Guide) => guide.active)
    .sort((a: Guide, b: Guide) => (a.name || '').localeCompare(b.name || '')); // ✅ Sort by name
},

};

const AIRecommendation = ({ city }: { city?: string }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(city || null);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cities, setCities] = useState<City[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creditRequestStatus, setCreditRequestStatus] = useState<'idle' | 'requesting' | 'success' | 'error'>('idle');
  const [planId, setPlanId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const addErrorMessage = (text: string) => {
    addMessage({ sender: 'bot', text, isError: true });
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentStep(0);
    setUserResponses([]);
    setSelectedCity(null);
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
        if (!citiesData.length) {
          addErrorMessage('No cities are available. Please contact support.');
          setError('No cities available');
          return;
        }
        setCities(citiesData);

        if (!city) {
          addMessage({
            sender: 'bot',
            text: `Please select a city to start planning your trip.`,
            type: 'options',
            options: citiesData.map(c => c.cityName),
          });
        } else {
          const selectedCity = citiesData.find(c => c.cityName.toLowerCase() === city.toLowerCase());
          if (!selectedCity) {
            addErrorMessage(`City "${city}" is not available.`);
            addMessage({
              sender: 'bot',
              text: `Please select a valid city.`,
              type: 'options',
              options: citiesData.map(c => c.cityName),
            });
            return;
          }
          setSelectedCity(selectedCity.cityName);
          setUserResponses([{ questionId: 'initial-city-selection', response: selectedCity.cityName }]);
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
      if ((city || selectedCity) && questions.length === 0) {
        try {
          setIsLoading(true);
          const cityResponse = city 
            ? { questionId: 'initial-city-selection', response: city }
            : userResponses.find(res => res.questionId === 'initial-city-selection');

          if (!cityResponse) return;

          const selectedCityData = cities.find(c => c.cityName.toLowerCase() === cityResponse.response.toLowerCase());
          const cityId = selectedCityData?._id || (await apiService.getCities())
            .find(c => c.cityName.toLowerCase() === cityResponse.response.toLowerCase())?._id;

          if (!cityId) {
            throw new Error(`City "${cityResponse.response}" not found`);
          }

          const questionsData = await apiService.getQuestionsByCity(cityId);
          setQuestions(questionsData || []); // Ensure questions is always an array
          setCurrentStep(0);

          if (questionsData?.length > 0) {
            const firstQuestion = questionsData[0];
            addMessage({
              sender: 'bot',
              text: firstQuestion.questionText,
              type: firstQuestion.type === 'common' ? 'options' : firstQuestion.type,
              options: firstQuestion.type === 'common' || firstQuestion.type === 'options' ? firstQuestion.options || [] : [],
            });
          } else {
            addErrorMessage('No questions available. Generating a basic itinerary...');
            await generateItinerary(userResponses);
          }
        } catch (err) {
          const error = err as ApiError;
          const errorMessage = error.message || 'Failed to load questions.';
          addErrorMessage(errorMessage);
          setError(errorMessage);
          await generateItinerary(userResponses);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadQuestions();
  }, [city, selectedCity, cities, questions.length]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    addMessage({ sender: 'user', text: userInput });
    setUserInput('');

    try {
      setIsLoading(true);

      const isCitySelectionPhase = !selectedCity && currentStep === 0;
      if (isCitySelectionPhase) {
        const normalizedInput = userInput.trim().toLowerCase();
        const selectedCityData = cities.find(c => c.cityName.toLowerCase() === normalizedInput);
        if (!selectedCityData) {
          addErrorMessage(`"${userInput}" is not a valid city.`);
          addMessage({
            sender: 'bot',
            text: `Please select a valid city.`,
            type: 'options',
            options: cities.map(c => c.cityName),
          });
          return;
        }

        setSelectedCity(selectedCityData.cityName);
        setUserResponses([{ questionId: 'initial-city-selection', response: selectedCityData.cityName }]);
        setCurrentStep(0);
        return;
      }

      if (currentStep < questions.length && questions[currentStep]) {
        const currentQuestion = questions[currentStep];
        if (!currentQuestion) {
          throw new Error('No question available at current step.');
        }

        if ((currentQuestion.type === 'common' || currentQuestion.type === 'options' || currentQuestion.type === 'guidePrompt') && currentQuestion.options) {
          const normalizedInput = userInput.trim().toLowerCase();
          const normalizedOptions = currentQuestion.options.map(opt => opt.trim().toLowerCase());
          if (!normalizedOptions.includes(normalizedInput)) {
            addErrorMessage('Please select a valid option from the provided choices.');
            addMessage({
              sender: 'bot',
              text: currentQuestion.questionText,
              type: 'options',
              options: currentQuestion.options,
            });
            return;
          }

          const newResponses = [...userResponses, { questionId: currentQuestion._id, response: userInput }];
          setUserResponses(newResponses);

          if (currentQuestion.type === 'guidePrompt') {
            if (normalizedInput === 'yes') {
              await fetchAndDisplayGuides();
              addMessage({
                sender: 'bot',
                text: 'You’ve viewed the guide list. Would you like to generate a new itinerary or modify your preferences?',
                type: 'options',
                options: ['Generate New Itinerary', 'Modify Preferences'],
              });
              setCurrentStep(questions.length);
            } else if (normalizedInput === 'no') {
              addMessage({
                sender: 'bot',
                text: 'You’ve answered all questions. Would you like to generate a new itinerary or modify your preferences?',
                type: 'options',
                options: ['Generate New Itinerary', 'Modify Preferences'],
              });
              setCurrentStep(questions.length);
            }
            return;
          }

          if (currentStep + 1 < questions.length) {
            const nextQuestion = questions[currentStep + 1];
            addMessage({
              sender: 'bot',
              text: nextQuestion.questionText,
              type: nextQuestion.type === 'common' ? 'options' : nextQuestion.type,
              options: nextQuestion.type === 'common' || nextQuestion.type === 'options' || nextQuestion.type === 'guidePrompt' ? nextQuestion.options || [] : [],
            });
            setCurrentStep(currentStep + 1);
          } else {
            const answeredQuestionIds = newResponses
              .filter(res => res.questionId !== 'initial-city-selection')
              .map(res => res.questionId);
            const questionIds = questions.map(q => q._id);
            const unansweredQuestions = questionIds.filter(qId => !answeredQuestionIds.includes(qId));

            if (unansweredQuestions.length > 0) {
              const firstUnansweredQuestion = questions.find(q => q._id === unansweredQuestions[0]);
              addErrorMessage('It looks like you missed some questions. Let’s go back and answer them.');
              addMessage({
                sender: 'bot',
                text: firstUnansweredQuestion!.questionText,
                type: firstUnansweredQuestion!.type === 'common' ? 'options' : firstUnansweredQuestion!.type,
                options: firstUnansweredQuestion!.type === 'common' || firstUnansweredQuestion!.type === 'options' || firstUnansweredQuestion!.type === 'guidePrompt' ? firstUnansweredQuestion!.options || [] : [],
              });
              setCurrentStep(questions.findIndex(q => q._id === unansweredQuestions[0]));
              return;
            }

            await generateItinerary(newResponses);
          }
        } else if (currentQuestion.type === 'number' && isNaN(Number(userInput))) {
          addErrorMessage('Please enter a valid number.');
          addMessage({
            sender: 'bot',
            text: currentQuestion.questionText,
            type: currentQuestion.type,
          });
          return;
        } else if (currentQuestion.type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(userInput)) {
          addErrorMessage('Please enter a valid date in YYYY-MM-DD format.');
          addMessage({
            sender: 'bot',
            text: currentQuestion.questionText,
            type: currentQuestion.type,
          });
          return;
        } else {
          const newResponses = [...userResponses, { questionId: currentQuestion._id, response: userInput }];
          setUserResponses(newResponses);

          if (currentStep + 1 < questions.length) {
            const nextQuestion = questions[currentStep + 1];
            addMessage({
              sender: 'bot',
              text: nextQuestion.questionText,
              type: nextQuestion.type === 'common' ? 'options' : nextQuestion.type,
              options: nextQuestion.type === 'common' || nextQuestion.type === 'options' || nextQuestion.type === 'guidePrompt' ? nextQuestion.options || [] : [],
            });
            setCurrentStep(currentStep + 1);
          } else {
            await generateItinerary(newResponses);
          }
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

  const fetchAndDisplayGuides = async () => {
    try {
      setIsLoading(true);
      const cityName = selectedCity || city || 'your selected city';
      const guides = await apiService.getGuidesByCity(cityName);
      if (guides.length === 0) {
        addMessage({
          sender: 'bot',
          text: `No guides available for ${cityName}.`,
        });
      } else {
        addMessage({
          sender: 'bot',
          text: `Here are the available guides for ${cityName}:`,
          type: 'guideList',
          guides,
        });
      }
    } catch (err) {
      const error = err as ApiError;
      addErrorMessage(error.message || 'Failed to fetch guides.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateItinerary = async (currentResponses: UserResponse[]) => {
    try {
      setIsLoading(true);
      setError(null);
      addMessage({
        sender: 'bot',
        text: "Great! I'm creating your personalized itinerary...",
      });

      const cityResponse = currentResponses.find(res => res.questionId === 'initial-city-selection');
      const cityName = cityResponse?.response || selectedCity || 'your selected city';

      const responseMap = currentResponses.reduce((map, response) => {
        map[response.questionId] = response.response;
        return map;
      }, {} as Record<string, string>);

      const validQuestions = questions?.filter(q => q.type !== 'guidePrompt') || [];
      const answers = validQuestions.map(q => ({
        response: responseMap[q._id] || 'Not provided'
      }));

      const { itinerary, planId: generatedPlanId } = await apiService.createTravelPlan(
        cityName,
        validQuestions,
        answers
      );

      setPlanId(generatedPlanId);

      const isMinimalInput = validQuestions.length === 0 || answers.length <= 1;
      const disclaimer = isMinimalInput 
        ? "\n\nNote: This itinerary is based on limited preferences. For a more tailored plan, please provide additional details."
        : "";
      
      const formattedItinerary = itinerary + disclaimer + `\n\nYour travel plan ID is: ${generatedPlanId}. Save this ID to retrieve your plan later.`;

      addMessage({
        sender: 'bot',
        text: formattedItinerary,
        type: 'itinerary',
      });

      const guidePromptQuestion: Question = {
        _id: 'guide-prompt',
        questionText: `Would you like to see a list of guides for ${cityName}?`,
        cityId: null,
        status: 'active',
        order: questions.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0,
        type: 'guidePrompt',
        options: ['Yes', 'No'],
      };

      setQuestions([...(questions || []), guidePromptQuestion]);
      setCurrentStep((questions || []).length);
      addMessage({
        sender: 'bot',
        text: guidePromptQuestion.questionText,
        type: 'options',
        options: guidePromptQuestion.options,
      });
    } catch (err) {
      const error = err as ApiError;
      let errorMessage = error.message || 'Failed to generate itinerary';
      
      if (error.status === 403 && error.message.toLowerCase().includes('insufficient credits')) {
        errorMessage = 'You do not have enough credits to generate an itinerary. Please request credits.';
      } else if (error.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.status === 429) {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error occurred.';
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
        text: 'Credit request submitted successfully.',
      });
    } catch (err) {
      setCreditRequestStatus('error');
      setError(err.message || 'Failed to request credits.');
    }
  };

  const handleOptionSelect = (option: string) => {
    setUserInput(option);
    handleSendMessage();
  };

  const handlePostItineraryAction = (option: string) => {
    if (option === 'Generate New Itinerary') {
      generateItinerary(userResponses);
    } else if (option === 'Modify Preferences') {
      resetChat();
      if (city) {
        setSelectedCity(city);
        setUserResponses([{ questionId: 'initial-city-selection', response: city }]);
      } else {
        addMessage({
          sender: 'bot',
          text: `Please select a city to start planning your trip.`,
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

  return {
    messages,
    userInput,
    setUserInput,
    isLoading,
    questions,
    currentStep,
    error,
    creditRequestStatus,
    planId,
    chatContainerRef,
    handleSendMessage,
    handleOptionSelect,
    handlePostItineraryAction,
    handleRequestCredits,
    resetChat,
    selectedCity,
  };
};

export default AIRecommendation;