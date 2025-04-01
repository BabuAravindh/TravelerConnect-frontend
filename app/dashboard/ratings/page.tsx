"use client";
import { useEffect, useState } from 'react';

interface Feedback {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  guideId: {
    _id: string;
    title?: string;
    name: string;
    email: string;
  };
  rating: number;
  comments: string;
  status: string;
  submittedAt: string;
}

const RatingsPage = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFeedback, setTotalFeedback] = useState(0);

  useEffect(() => {
    fetchFeedback();
  }, [currentPage]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/feedback/admin/all?page=${currentPage}&limit=10`
      );
      const data = await response.json();
      setFeedback(data.feedback);
      setTotalPages(data.totalPages);
      setTotalFeedback(data.totalFeedback);
    } catch (error) {
      alert('Failed to fetch feedback');
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (feedbackId: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/feedback/admin/${feedbackId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        alert('Feedback deleted successfully');
        fetchFeedback(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete feedback');
      }
    } catch (error) {
      alert('An error occurred while deleting feedback');
      console.error('Error deleting feedback:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Ratings Management</h1>
      <p className="mb-6">Total feedback: {totalFeedback}</p>

      {loading ? (
        <p>Loading feedback...</p>
      ) : feedback.length === 0 ? (
        <p>No feedback found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">User</th>
                <th className="border p-2 text-left">Guide ID</th>
                <th className="border p-2 text-left">Rating</th>
                <th className="border p-2 text-left">Comments</th>
                <th className="border p-2 text-left">Date</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="border p-2">
                    <div>
                      <p className="font-medium">{item.userId.name}</p>
                      <p className="text-sm text-gray-500">{item.userId.email}</p>
                    </div>
                  </td>
                  <td className="border p-2 text-sm text-gray-500">
                 < div>
                      <p className="font-medium">{item.guideId.name}</p>
                      <p className="text-sm text-gray-500">{item.guideId.email}</p>
                    </div>
                    
                  </td>
                  <td className="border p-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`${i < item.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="border p-2 max-w-xs truncate">
                    {item.comments}
                  </td>
                  <td className="border p-2">
                    {new Date(item.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="border p-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'submitted'
                          ? 'bg-blue-100 text-blue-800'
                          : item.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default RatingsPage;