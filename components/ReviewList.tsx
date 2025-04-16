"use client";
import { useState, useEffect } from "react";

const REVIEWS_PER_PAGE = 3;

type ReviewEntityType = 'guide' | 'attraction' | 'route';

interface ReviewListProps {
  entityId: string;
  entityType: ReviewEntityType;
}

interface User {
  _id: string;
  name: string;
}

interface Feedback {
  _id: string;
  userId: User;
  rating: number;
  comments: string;
  status: string;
  submittedAt: string;
  __v: number;
  guideId?: string;
  attractionId?: string;
  routeId?: string;
}

interface ApiResponse {
  totalFeedback: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  feedback: Feedback[];
}

const ReviewList = ({ entityId, entityType }: ReviewListProps) => {
  const [reviews, setReviews] = useState<Feedback[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);


  
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <span 
        key={i} 
        className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
      >
        ★
      </span>
    ));
  };

  const getApiEndpoint = () => {
    switch (entityType) {
      case 'guide': return `api/feedback/${entityId}`;
      case 'attraction': return `api/feedback/attraction/${entityId}`;
      case 'route': return `api/feedback/route/${entityId}`;
      default: return `api/feedback/${entityId}`;
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      if (!entityId) return;

      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const endpoint = getApiEndpoint();
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${endpoint}`;
        
        console.log('Fetching reviews from:', apiUrl); // Debug log

        const response = await fetch(apiUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch ${entityType} reviews: ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();
        console.log('Received data:', data); // Debug log
        
        setReviews(data.feedback || []);
        setTotalPages(data.totalPages || 1);
        setTotalReviews(data.totalFeedback || 0);
        setCurrentPage(data.currentPage || 1);
      } catch (error) {
        console.error('Error fetching reviews:', error); // Debug log
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [entityId, entityType]);

  // Debug logs to track state changes
  useEffect(() => {
    console.log('Loading state:', loading);
    console.log('Reviews:', reviews);
  }, [loading, reviews]);

  return (
    <div className="lg:col-span-2 flex flex-col space-y-6 p-6 max-w-full mx-auto">
      <div className="flex justify-between items-center border-b pb-3">
        <h3 className="text-2xl font-semibold text-gray-800">
          Guide Reviews
        </h3>
        <span className="text-sm text-gray-500">
          {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            Try Again
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No reviews yet. Be the first to review this guide!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="p-5 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-sm text-gray-600">
                      {review.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <p className="text-gray-800 text-lg font-medium">{review.comments}</p>
                <p className="text-sm text-gray-600 mt-2">
                  - {review.userId?.name || "Anonymous"}
                </p>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewList;