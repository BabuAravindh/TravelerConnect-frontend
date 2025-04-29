
  
  // services/api.ts
  import { CreditRecord, CreditRequest, AIInteraction } from './AiTypes';
  
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  export const fetchCreditRecords = async (userId: string): Promise<CreditRecord[]> => {
    const response = await fetch(`${BASE_URL}/api/credit/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch credit records');
    const data = await response.json();
    // Extract the history array, default to empty array if invalid
    return Array.isArray(data.history) ? data.history : [];
  };
  
  export const fetchCreditRequests = async (): Promise<CreditRequest[]> => {
    const response = await fetch(`${BASE_URL}/api/credit/requests`);
    if (!response.ok) throw new Error('Failed to fetch credit requests');
    const data = await response.json();
    return data.requests;
  };
  
  export const approveCreditRequest = async (requestId: string) => {
    const response = await fetch(`${BASE_URL}/api/credit/approve/${requestId}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to approve credit request');
    return response.json();
  };
  
  export const fetchAIInteractions = async (): Promise<AIInteraction[]> => {
    const response = await fetch(`${BASE_URL}/api/ai/`);
    if (!response.ok) throw new Error('Failed to fetch AI interactions');
    const data = await response.json();
    console.log('API response:', data);
    return Array.isArray(data.interactions) ? data.interactions : [];
  };