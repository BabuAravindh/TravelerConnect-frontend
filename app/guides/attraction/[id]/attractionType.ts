export interface Attraction {
    _id: string;
    name: string;
    description: string;
    city: string;
    guideId: string | null;
    images: string[];
    category: string;
    price?: number | null;
    rating?: number | null;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }