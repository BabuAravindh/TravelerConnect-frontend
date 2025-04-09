"use client"
import React, { useState, useEffect } from 'react';
import { Footer } from '@/components/Footer';
import Navbar from '@/components/Navbar';

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'pending' | 'resolved';
  createdAt: string;
  adminNotes?: string;
}

const AdminSupportPage = () => {
  // State management
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'pending' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [statusUpdate, setStatusUpdate] = useState<'open' | 'pending' | 'resolved'>('open');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [error, setError] = useState('');

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    // Safely handle potentially undefined/null values
    const subject = ticket.subject || '';
    const message = ticket.message || '';
    const email = ticket.email || '';
    const name = ticket.name || '';
    const query = searchQuery || '';
  
    const matchesSearch = 
      subject.toLowerCase().includes(query.toLowerCase()) || 
      message.toLowerCase().includes(query.toLowerCase()) ||
      email.toLowerCase().includes(query.toLowerCase()) ||
      name.toLowerCase().includes(query.toLowerCase());
  
    return matchesStatus && matchesSearch;
  });

  // Fetch tickets from API
  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/`);
        if (!response.ok) {
          throw new Error('Failed to fetch tickets');
        }
        const data = await response.json();
        setTickets(data.map(ticket => ({
          ...ticket,
          id: ticket._id // Map _id to id
        })));
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load tickets. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setStatusUpdate(ticket.status);
    setReplyText(ticket.adminNotes || '');
    setUpdateSuccess(false);
    setError('');
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket || !selectedTicket.id) {
      setError('No ticket selected or ticket ID missing');
      return;
    }
    
    setIsUpdating(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/${selectedTicket.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: statusUpdate,
          adminNotes: replyText,
          _id:selectedTicket.id,
          sendEmailResponse: true 
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update ticket');
      }
  
      const updatedTicket = await response.json();
      
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === selectedTicket.id ? updatedTicket : ticket
        )
      );
      
      setSelectedTicket(updatedTicket);
      setUpdateSuccess(true);
      
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating ticket:', err);
      setError('Failed to update ticket. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'open': return 'bg-red-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'resolved': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <>
      
      <section className="bg-gray-50 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-4">
            <div className="mb-6 max-w-3xl text-center sm:text-center md:mx-auto md:mb-12">
              <p className="text-base font-semibold uppercase tracking-wide text-primary">
                Admin Dashboard
              </p>
              <h2 className="font-heading mb-4 font-bold tracking-tight text-gray-900 text-3xl sm:text-5xl">
                Customer Support Tickets
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-xl text-gray-600">
                Manage customer inquiries and provide support
              </p>
            </div>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Tickets List */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path fillRule="evenodd" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Search tickets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <select
                    className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Support Tickets</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'} found
                  </p>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <ul className="space-y-3 max-h-[600px] overflow-y-auto">
                      {filteredTickets.length > 0 ? (
                        filteredTickets.map((ticket,index) => (
                          <li 
                            key={ticket.id || index} 
                            className={`p-4 rounded-lg cursor-pointer transition-all ${selectedTicket?.id === ticket.id ? 'bg-primary bg-opacity-10 border-l-4 border-primary' : 'bg-gray-50 hover:bg-gray-100'}`}
                            onClick={() => handleSelectTicket(ticket)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">{ticket.subject}</h4>
                                <p className="text-sm text-gray-500 mt-1">{ticket.name}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                              </span>
                            </div>
                            <div className="mt-2 flex justify-between items-center">
                              <p className="text-xs text-gray-400">
                                {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {ticket.adminNotes && (
                                <span className="text-xs text-gray-400 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Notes
                                </span>
                              )}
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="py-6 text-center text-gray-500">
                          No tickets found matching your criteria
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Ticket Detail */}
            <div className="lg:w-2/3">
              {selectedTicket ? (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          From: {selectedTicket.name} &lt;{selectedTicket.email}&gt;
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Received: {new Date(selectedTicket.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedTicket.status)}`}>
                        {selectedTicket.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {updateSuccess && (
                      <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
                        Ticket updated successfully!
                      </div>
                    )}
                    
                    <div className="mb-8">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">CUSTOMER MESSAGE</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-line">{selectedTicket.message}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                          UPDATE STATUS
                        </label>
                        <select
                          id="status"
                          className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          value={statusUpdate}
                          onChange={(e) => setStatusUpdate(e.target.value as any)}
                        >
                          <option value="open">Open</option>
                          <option value="pending">Pending</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="reply" className="block text-sm font-medium text-gray-700 mb-2">
                          ADMIN RESPONSE
                        </label>
                        <textarea
                          id="reply"
                          rows={6}
                          className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your response or internal notes here..."
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          This response will be saved as internal notes.
                        </p>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleUpdateTicket}
                          disabled={isUpdating}
                          className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isUpdating ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                          {isUpdating ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Updating...
                            </>
                          ) : 'Update Ticket'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-12 text-center h-full flex flex-col justify-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No ticket selected</h3>
                  <p className="mt-2 text-sm text-gray-500">Please select a ticket from the list to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
 
    </>
  );
};

export default AdminSupportPage;