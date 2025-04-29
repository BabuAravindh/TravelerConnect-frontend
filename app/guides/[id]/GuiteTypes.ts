export interface Guide {
  _id: string;
  name: string;

    firstName: string;
    lastName: string;
    role: string;
    profilePicture?: string;
    bio: string;
    isVerified: boolean;
    gender: string;
    dateJoined: string;
    state: string;
    country: string;
    activities: string[];
    languages: string[];
    rating?: number;
    reviewCount?: number;
    email: string;
    userId: string;
    phoneNumber: string;
  }