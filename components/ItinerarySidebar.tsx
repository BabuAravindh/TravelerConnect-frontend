'use client';

import { useState } from 'react';

interface Place {
  id: number;
  name: string;
  type: string;
  description: string;
  rating: number;
}

const mockPlaces: Place[] = [
  { id: 1, name: 'Eiffel Tower', type: 'Attraction', description: 'Iconic Paris landmark', rating: 4.8 },
  { id: 2, name: 'Louvre Museum', type: 'Attraction', description: 'World-famous art museum', rating: 4.7 },
  { id: 3, name: 'Le Marais Restaurant', type: 'Restaurant', description: 'Cozy French dining', rating: 4.5 },
  { id: 4, name: 'Hotel Paris', type: 'Hotel', description: 'Luxury stay in Paris', rating: 4.6 },
  { id: 5, name: 'Seine River Cruise', type: 'Activity', description: 'Scenic boat tour', rating: 4.4 },
];

const AIRecommendation: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [duration, setDuration] = useState(1);
  const [recommendations, setRecommendations] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const interestOptions = ['Sightseeing', 'Food', 'Culture', 'Adventure', 'Relaxation'];

  const handleInterestToggle = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const generateRecommendations = () => {
    setIsLoading(true);
    // Simulate AI processing with a delay
    setTimeout(() => {
      // Simple recommendation logic: filter places based on interests and duration
      const interestToTypeMap: { [key: string]: string[] } = {
        Sightseeing: ['Attraction'],
        Food: ['Restaurant'],
        Culture: ['Attraction'],
        Adventure: ['Activity'],
        Relaxation: ['Hotel'],
      };

      const relevantTypes = interests.flatMap((interest) => interestToTypeMap[interest] || []);
      let filteredPlaces = mockPlaces.filter(
        (place) => relevantTypes.length === 0 || relevantTypes.includes(place.type)
      );

      // Adjust number of recommendations based on duration (1-3 places per day)
      const maxPlaces = Math.min(duration * 3, filteredPlaces.length);
      filteredPlaces = filteredPlaces
        .sort((a, b) => b.rating - a.rating) // Prioritize higher-rated places
        .slice(0, maxPlaces);

      setRecommendations(filteredPlaces);
      setIsLoading(false);
    }, 1000); // Simulate API call delay
  };

  return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Travel Planner</h1>
        <p className="text-gray-600">Get personalized recommendations for your next trip</p>
      </div>

      {/* Input Section */}
      <div className="bg-blue-50 p-6 rounded-lg mb-6">
        {/* Destination Input */}
        <div className="mb-5">
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
            Where are you going?
          </label>
          <div className="relative">
            <input
              id="destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Paris, Tokyo, New York"
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        {/* Interests Selector */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What are you interested in?
          </label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((interest) => (
              <button
                key={interest}
                onClick={() => handleInterestToggle(interest)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  interests.includes(interest)
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Duration Input */}
        <div className="mb-5">
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
            Trip Duration (days)
          </label>
          <div className="relative">
            <input
              id="duration"
              type="number"
              min="1"
              max="14"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateRecommendations}
          disabled={isLoading || !destination}
          className={`w-full py-3 rounded-lg font-medium text-white transition-all ${
            isLoading
              ? 'bg-blue-400 cursor-not-allowed'
              : !destination
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Recommendations...
            </span>
          ) : (
            'Get My Travel Plan'
          )}
        </button>
      </div>

      {/* Recommendations Output */}
      {recommendations.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            <svg className="inline-block h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recommended for {destination}
          </h2>
          <div className="space-y-4">
            {recommendations.map((place) => (
              <div key={place.id} className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  {place.type === 'Attraction' && (
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  )}
                  {place.type === 'Restaurant' && (
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {place.type === 'Hotel' && (
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  )}
                  {place.type === 'Activity' && (
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">{place.name}</h3>
                  <p className="text-gray-600 mb-2">{place.description}</p>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {'★'.repeat(Math.round(place.rating))}
                      {'☆'.repeat(5 - Math.round(place.rating))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">{place.rating.toFixed(1)} rating</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRecommendation;