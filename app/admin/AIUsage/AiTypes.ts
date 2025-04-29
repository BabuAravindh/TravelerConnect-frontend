// types/index.ts
export interface User {
    _id: string;
    name: string;
    email: string;
  }
  
  export interface CreditRecord {
    _id: string;
    creditBefore: number;
    creditsUsed: number;
    creditsAfter: number;
    userId: {
      name?: string;
      email?: string;
    } | null;
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
    userId: { name?: string; email?: string } | null; // Explicitly define the type
    query: string;
    responseStatus: string;
    createdAt: string;
  }
  
   export interface User {
    _id: string;
    name: string;
    email: string;
  }