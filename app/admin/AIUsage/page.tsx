'use client';

import { useState, useEffect } from 'react';
import { CreditRecord, CreditRequest, AIInteraction } from './AiTypes';
import { fetchCreditRecords, fetchCreditRequests, approveCreditRequest, fetchAIInteractions } from './Ai.service';

export default function AdminPage() {
  const [creditRecords, setCreditRecords] = useState<CreditRecord[]>([]);
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
  const [aiInteractions, setAIInteractions] = useState<AIInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [records, requests, interactions] = await Promise.all([
          fetchCreditRecords(),
          fetchCreditRequests(),
          fetchAIInteractions(),
        ]);
        setCreditRecords(records);
        setCreditRequests(requests);
        setAIInteractions(interactions);
      } catch (err: any) {
        console.error('Failed to load data:', err);
        const errorMessage =
          err.message === 'Forbidden: Admin access required' || err.message === 'Unauthorized'
            ? 'You do not have permission to access this page. Please log in as an admin.'
            : err.message || 'Failed to load data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleApproveRequest = async (requestId: string) => {
    try {
      const result = await approveCreditRequest(requestId);
      setCreditRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: 'approved', updatedAt: new Date().toISOString() } : req
        )
      );
      alert(result.data.message || 'Credit request approved successfully');
    } catch (err: any) {
      console.error('Failed to approve request:', err);
      alert(err.message || 'Failed to approve credit request');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-lg text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

      {/* Credit Requests Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Credit Requests</h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {creditRequests.length === 0 ? (
            <p className="p-6 text-gray-500">No credit requests found.</p>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">User</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Created At</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {creditRequests.map((request) => (
                  <tr key={request._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{request.userId.name} ({request.userId.email})</td>
                    <td className="px-6 py-4 capitalize">{request.status}</td>
                    <td className="px-6 py-4">
                      {new Date(request.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {request.status === 'pending' && (
                        <button
                          onClick={() => handleApproveRequest(request._id)}
                          className="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Credit Records Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Credit Records</h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {creditRecords.length === 0 ? (
            <p className="p-6 text-gray-500">No credit records found.</p>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">User</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Credits Before</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Credits Used</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Credits After</th>
                </tr>
              </thead>
              <tbody>
                {creditRecords.map((record) => (
                  <tr key={record._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {record.userId && typeof record.userId === 'object' ? (
                        `${record.userId.name ?? 'Unknown'} (${record.userId.email ?? 'No Email'})`
                      ) : (
                        'Anonymous'
                      )}
                    </td>
                    <td className="px-6 py-4">{record.creditBefore}</td>
                    <td className="px-6 py-4">{record.creditsUsed}</td>
                    <td className="px-6 py-4">{record.creditsAfter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* AI Interactions Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">AI Interactions</h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {aiInteractions.length === 0 ? (
            <p className="p-6 text-gray-500">No AI interactions found.</p>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">User</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Query</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Created At</th>
                </tr>
              </thead>
              <tbody>
                {aiInteractions.map((interaction) => (
                  <tr key={interaction._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {interaction.userId && typeof interaction.userId === 'object' ? (
                        `${interaction.userId.name ?? 'Unknown'} (${interaction.userId.email ?? 'No Email'})`
                      ) : (
                        'Anonymous'
                      )}
                    </td>
                    <td className="px-6 py-4 truncate max-w-xs">{interaction.query}</td>
                    <td className="px-6 py-4 capitalize">{interaction.responseStatus}</td>
                    <td className="px-6 py-4">
                      {interaction.createdAt
                        ? new Date(interaction.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}