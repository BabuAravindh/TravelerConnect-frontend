export interface Review {
    _id: string;
    userId?: {
      name: string;
    };
    rating: number;
    comments: string;
  }