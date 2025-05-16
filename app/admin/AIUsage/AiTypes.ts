export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface CreditRecord {
  _id: string;
  userId: Partial<User> | null;
  creditBefore: number;
  creditsUsed: number;
  creditsAfter: number;
}

export interface CreditRequest {
  _id: string;
  userId: User;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface AIInteraction {
  _id: string;
  userId: Partial<User> | null;
  query: string;
  response: string;
  responseStatus: string;
  createdAt: string;
}