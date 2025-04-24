export interface Booking {
    id: string;
    userName: string;
    email: string;
    phoneNumber: number | string;
    startDate: string;
    endDate: string;
    activities: string[];
    duration: string | number;
    budget?: number;
    paymentStatus: string;
    status: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    specialRequests?: string;
    bookingDate?: string;
  }
  
  export interface Payment {
    id: string;
    amount: number;
    type: string;
    status: string;
    paymentType: string;
    method: string;
    installmentNumber?: number;
    isPartial?: boolean;
    details?: {
      notes?: string;
      [key: string]: any;
    };
    transactionId?: string;
    date?: string;
    transactionDetails?: {
      screenshotUrl?: string | null;
      [key: string]: any;
    };
  }
  
  export interface PaymentHistoryResponse {
    success: boolean;
    payments: Payment[];
    summary: {
      totalBudget: number;
      totalPaid: number;
      remainingBalance: number;
      paymentStatus: string;
      nextPaymentDue?: string;
    };
  }