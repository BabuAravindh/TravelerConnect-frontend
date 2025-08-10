import { CreditRecord, CreditRequest, AIInteraction } from './AiTypes';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const fetchCreditRecords = async (): Promise<CreditRecord[]> => {
  ((`${BASE_URL}/api/admin/credit-records`))
  const response = await fetch(`${BASE_URL}/api/admin/credit-records`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Forbidden: Admin access required');
    if (response.status === 401) throw new Error('Unauthorized');
    throw new Error('Failed to fetch credit records');
  }
  const data = await response.json();
  if (!data.success || !Array.isArray(data.data.records)) {
    throw new Error('Invalid response format');
  }
  return data.data.records;
};

export const fetchCreditRequests = async (): Promise<CreditRequest[]> => {
  const response = await fetch(`${BASE_URL}/api/admin/credit-requests`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Forbidden: Admin access required');
    if (response.status === 401) throw new Error('Unauthorized');
    throw new Error('Failed to fetch credit requests');
  }
  const data = await response.json();
  if (!data.success || !Array.isArray(data.data.requests)) {
    throw new Error('Invalid response format');
  }
  return data.data.requests;
};

export const approveCreditRequest = async (requestId: string) => {
  const response = await fetch(`${BASE_URL}/api/admin/credit-requests/approve/${requestId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Forbidden: Admin access required');
    if (response.status === 401) throw new Error('Unauthorized');
    if (response.status === 404) throw new Error('Credit request not found');
    throw new Error('Failed to approve credit request');
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to approve credit request');
  }
  return data;
};

export const fetchAIInteractions = async (): Promise<AIInteraction[]> => {
  const response = await fetch(`${BASE_URL}/api/admin/ai-interactions`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Forbidden: Admin access required');
    if (response.status === 401) throw new Error('Unauthorized');
    throw new Error('Failed to fetch AI interactions');
  }
  const data = await response.json();
  if (!data.success || !Array.isArray(data.data.interactions)) {
    throw new Error('Invalid response format');
  }
  return data.data.interactions;
};