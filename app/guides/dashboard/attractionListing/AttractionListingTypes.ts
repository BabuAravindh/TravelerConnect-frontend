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
    createdAt: string;
    _id: string;
    user: string;
    userEmail: string;
    rating: number;
    comments: string;
    status: string;
    submittedAt: string;
    attraction: {
      id: string;
      name: string;
      category: string;
    };
  }
  
  export interface FormData {
    name: string;
    description: string;
    cityName: string;
    category: string;
  }