'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface ReviewFormProps {
  guideId: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ guideId }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setMessage('You must be logged in to submit a review.');
      return;
    }
    if (!rating || !review) {
      setMessage('Please provide a rating and a review.');
      return;
    }

    const requestData = {
      userId,
      guideId,
      rating,
      comments: review,
      status: 'submitted',
    };

    console.log('Sending review data:', requestData);

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Ensure token is included
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (response.ok) {
        setMessage('Review submitted successfully!');
        setRating(null);
        setReview('');
      } else {
        setMessage(data.message || 'Failed to submit review.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setMessage('An error occurred while submitting your review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 mx-auto bg-primary rounded-lg shadow-md max-w-full sm:p-6 grid grid-cols-1 lg:grid-cols-6 gap-6">
      <div className="lg:col-span-4 col-span-1">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-semibold text-white mb-4">Write a review</h2>
          <div className="flex justify-start items-center space-x-1 mb-4">
          <div className="flex justify-start items-center space-x-1 mb-4">
  {[1, 2, 3, 4, 5].map((value) => (
    <label key={value} className="text-yellow-400 text-2xl cursor-pointer hover:scale-110">
      <input
        type="radio"
        name="rating"
        value={value}
        className="hidden"
        onChange={() => {
          console.log(`Selected rating: ${value}`); // Debugging
          setRating(value);
        }}
        checked={rating === value}
      />
      ★
    </label>
  ))}
</div>

          </div>
          <textarea
            id="review"
            name="review"
            rows={4}
            required
            className="block w-full p-3 text-sm text-gray-900 bg-gray-50 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Write your review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          ></textarea>
          {message && <p className="text-sm text-red-400">{message}</p>}
          <div className="text-right py-4">
            {userId ? (
              <button
                type="submit"
                disabled={loading}
                className="text-white bg-button hover:bg-opacity-90 focus:ring-4 focus:outline-none focus:ring-blue-300 font-semibold rounded-lg text-sm px-5 py-3 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Post Review'}
              </button>
            ) : (
              <Link href="/login">
                <span className="text-white bg-button hover:bg-opacity-90 focus:ring-4 focus:outline-none focus:ring-blue-300 font-semibold rounded-lg text-sm px-5 py-3 cursor-pointer">
                  Login to Post Review
                </span>
              </Link>
            )}
          </div>
        </form>
      </div>
      <div className="lg:col-span-2 hidden lg:flex flex-col space-y-4">
        <div className="flex items-center">
          <span className="text-yellow-400 text-xl">★★★★★</span>
          <p className="ml-2 text-sm font-medium text-white">0 out of 0</p>
        </div>
        <p className="text-sm font-medium text-white">0 global ratings</p>
        {[5, 4, 3, 2, 1].map((value) => (
          <div key={value} className="flex items-center">
            <span className="text-sm font-medium text-white hover:underline shrink-0">{value} star</span>
            <div className="w-3/4 h-4 mx-2 bg-gray-200 rounded">
              <div className="h-4 bg-button rounded" style={{ width: '20%' }}></div>
            </div>
            <span className="text-sm font-medium text-white">0%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewForm;
