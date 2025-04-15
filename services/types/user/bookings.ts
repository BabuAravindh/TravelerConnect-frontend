export type Booking = {
    id: string;
    guideName: string;
    guideLanguages: string[];
    startDate: string;
    endDate: string;
    budget: number;
    status: string;
    duration: string;
    guideEmail: string;
    guidePhoneNumber: string;
    paymentStatus?: string;
    totalPaid?: number;
    remainingBalance?: number;
    activities: string[];
  };
  
  export type PaymentHistory = {
    id: string;
    amount: number;
    paymentType: string;
    status: string;
    method: string;
    date: Date;
    installmentNumber: number;
    receiptId: string;
    screenshotUrl?: string;
  };