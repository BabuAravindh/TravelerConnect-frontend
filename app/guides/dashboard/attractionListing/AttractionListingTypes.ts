export interface City {
    _id: string;
    cityName: string;
  }
  
  export interface Attraction {
    _id: string;
    name: string;
    description: string;
    city?: City;
    category: string;
    images?: string[];
  }
  
  export interface Feedback {
    _id: string;
    attractionId?: { name: string };
    comments?: string;
    rating?: number;
    submittedAt?: string;
    createdAt: string;
  }
  
  export interface FormData {
    name: string;
    description: string;
    cityName: string;
    category: string;
  }