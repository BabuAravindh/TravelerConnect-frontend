'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

type ReviewEntityType = 'guide' | 'attraction' | 'route';

interface ReviewFormProps {
  entityId: string;
  entityType: ReviewEntityType;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ entityId, entityType }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Get API endpoint based on entity type
  const getApiEndpoint = () => {
    switch (entityType) {
      case 'guide': return 'api/feedback'; // Existing guide endpoint
      case 'attraction': return 'api/attractions/feedback';
      case 'route': return `api/routes/feedback/routes/${entityId}`;
      default: return 'api/feedback';
    }
  };

  // Get entity display name for UI
  const getEntityName = () => {
    switch (entityType) {
      case 'guide': return 'Guide';
      case 'attraction': return 'Attraction';
      case 'route': return 'Route';
      default: return 'Item';
    }
  };

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      setMessage({ text: 'You must be logged in to submit a review.', type: 'error' });
      return;
    }
    
    if (!rating || !review) {
      setMessage({ text: 'Please provide both a rating and a review.', type: 'error' });
      return;
    }

    const requestData = {
      userId,
      rating,
      comments: review,
      status: 'submitted',
      // Include the appropriate ID field based on entity type
      ...(entityType === 'guide' && { guideId: entityId }),
      ...(entityType === 'attraction' && { attractionId: entityId }),
      ...(entityType === 'route' && { routeId: entityId }),
    };

    setLoading(true);
    setMessage(null);
    (requestData)
    try {
      const endpoint = getApiEndpoint();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          text: `Your review for this ${getEntityName().toLowerCase()} has been submitted!`, 
          type: 'success' 
        });
        setRating(null);
        setReview('');
      } else {
        setMessage({ 
          text: data.message || 'Failed to submit review. Please try again.', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setMessage({ 
        text: 'An error occurred while submitting your review.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 mx-auto bg-white rounded-lg shadow-md border border-gray-200 max-w-full sm:p-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Review this {getEntityName()}
        </h2>
        
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Your Rating
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`text-2xl ${rating && value <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 focus:outline-none`}
                onClick={() => setRating(value)}
                aria-label={`Rate ${value} out of 5`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-500">
              {rating ? `${rating} out of 5` : 'Select a rating'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="review" className="text-sm font-medium text-gray-700">
            Your Review
          </label>
          <textarea
            id="review"
            name="review"
            rows={4}
            required
            className="block w-full p-3 text-sm text-gray-900 bg-gray-50 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder={`Share your experience with this ${getEntityName().toLowerCase()}...`}
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </div>

        {message && (
          <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}

        <div className="flex justify-end pt-2">
          {userId ? (
            <button
              type="submit"
              disabled={loading || !rating || !review}
              className={`px-5 py-2.5 rounded-lg font-medium text-white ${loading || !rating || !review ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                `Submit ${getEntityName()} Review`
              )}
            </button>
          ) : (
            <Link href="/login" className="px-5 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              Login to Post Review
            </Link>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;