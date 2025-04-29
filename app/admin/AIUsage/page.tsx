// app/admin/page.tsx
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
          fetchCreditRecords('67c945e7298a73d4f38254c7'),
          fetchCreditRequests(),
          fetchAIInteractions(),
        ]);
        setCreditRecords(records);
        setCreditRequests(requests);
        setAIInteractions(interactions);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data');
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
      alert(result.message);
    } catch (err) {
      console.error('Failed to approve request:', err);
      alert('Failed to approve request');
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Credit Requests Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Credit Requests</h2>
        <div className="bg-white shadow rounded-lg p-6">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created At</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {creditRequests.map((request) => (
                <tr key={request._id} className="border-b">
                  <td className="px-4 py-2">{request.userId.name} ({request.userId.email})</td>
                  <td className="px-4 py-2">{request.status}</td>
                  <td className="px-4 py-2">{new Date(request.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    {request.status === 'pending' && (
                      <button
                        onClick={() => handleApproveRequest(request._id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Credit Records Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Credit Records</h2>
        <div className="bg-white shadow rounded-lg p-6">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">User ID</th>
                <th className="px-4 py-2 text-left">Credits Before</th>
                <th className="px-4 py-2 text-left">Credits Used</th>
                <th className="px-4 py-2 text-left">Credits After</th>
              </tr>
            </thead>
            <tbody>
              {creditRecords.map((record) => (
                <tr key={record._id} className="border-b">
                  <td className="px-4 py-2">
                    {record.userId && typeof record.userId === 'object' ? (
                      `${record.userId.name ?? 'Unknown'} (${record.userId.email ?? 'No Email'})`
                    ) : (
                      'Anonymous'
                    )}
                  </td>
                  <td className="px-4 py-2">{record.creditBefore}</td>
                  <td className="px-4 py-2">{record.creditsUsed}</td>
                  <td className="px-4 py-2">{record.creditsAfter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* AI Interactions Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">AI Interactions</h2>
        <div className="bg-white shadow rounded-lg p-6">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">User ID</th>
                <th className="px-4 py-2 text-left">Query</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created At</th>
              </tr>
            </thead>
            <tbody>
              {aiInteractions.map((interaction) => (
                <tr key={interaction._id} className="border-b">
                  <td className="px-4 py-2">
                    {interaction.userId && typeof interaction.userId === 'object' ? (
                      `${interaction.userId.name ?? 'Unknown'} (${interaction.userId.email ?? 'No Email'})`
                    ) : (
                      'Anonymous'
                    )}
                  </td>
                  <td className="px-4 py-2">{interaction.query}</td>
                  <td className="px-4 py-2">{interaction.responseStatus}</td>
                  <td className="px-4 py-2">
                    {interaction.createdAt
                      ? new Date(interaction.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}