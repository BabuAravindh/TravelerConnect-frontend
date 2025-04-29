"use client";
import { useState, useEffect, useCallback } from "react";

type ReviewEntityType = 'guide' | 'attraction' | 'route';

interface ReviewListProps {
  entityId: string;
  entityType: ReviewEntityType;
}

interface User {
  _id: string;
  name: string;
}

interface Review {
  _id: string;
  userId: User;
  rating: number;
  comments: string;
  status: string;
  submittedAt: string;
  __v: number;
}

interface ApiResponse {
  success: boolean;
  reviews?: Review[];
  feedback?: Review[]; // Some endpoints use 'feedback' instead of 'reviews'
  totalFeedback?: number;
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
}

const ReviewList = ({ entityId, entityType }: ReviewListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
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

  const getApiEndpoint = useCallback(() => {
    switch (entityType) {
      case 'guide': return `api/feedback/${entityId}`;
      case 'attraction': return `api/attractions/feedback/${entityId}`;
      case 'route': return `api/routes/guide/${entityId}`;
      default: return `api/feedback/${entityId}`;
    }
  }, [entityId, entityType]);

  const fetchReviews = useCallback(async () => {
    if (!entityId) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const endpoint = getApiEndpoint();
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${endpoint}`;
      
      const response = await fetch(apiUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${entityType} reviews: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      
      // Handle different response structures
      const reviewsData = data.reviews || data.feedback || [];
      setReviews(reviewsData);
      setTotalPages(data.totalPages || 1);
      setTotalReviews(data.totalFeedback || reviewsData.length);
      setCurrentPage(data.currentPage || 1);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType, getApiEndpoint]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchReviews();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="lg:col-span-2 flex flex-col space-y-6 p-6 max-w-full mx-auto">
      <div className="flex justify-between items-center border-b pb-3">
        <h3 className="text-2xl font-semibold text-gray-800">
          {entityType.charAt(0).toUpperCase() + entityType.slice(1)} Reviews
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
            onClick={fetchReviews}
            className="mt-2 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No reviews yet. Be the first to review this {entityType}!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="p-5 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-sm text-gray-600">
                      {review.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(review.submittedAt)}
                  </span>
                </div>
                <p className="text-gray-800 text-lg font-medium">{review.comments}</p>
                <p className="text-sm text-gray-600 mt-2">
                  - {review.userId?.name || "Anonymous"}
                </p>
                {review.status && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {review.status}
                  </span>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = currentPage <= 3 
                    ? i + 1 
                    : currentPage >= totalPages - 2 
                      ? totalPages - 4 + i 
                      : currentPage - 2 + i;
                  
                  if (pageNumber > 0 && pageNumber <= totalPages) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-1 mx-1 rounded ${currentPage === pageNumber ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  return null;
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="mx-1">...</span>
                )}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="px-3 py-1 mx-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    {totalPages}
                  </button>
                )}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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