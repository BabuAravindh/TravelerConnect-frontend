export interface Item {
  _id?: string;
  name?: string;
  description?: string;
  city: string;
  cityId: string;
  images?: string[];
  category?: string;
  rating?: number;
  from?: string;
  to?: string;
  transports?: { mode: string; duration: string; details: string }[];
  guideId?: string;
  type: 'attractions' | 'events' | 'adventures' | 'cuisines' | 'travelRoutes';
  imageFound?: boolean;
}

export interface CityProfile {
  city: string;
  coordinates: { latitude: number | null; longitude: number | null };
  country: string | null;
  population: number | null;
  description: string | null;
  capital?: string;
  cityMap?: string;
  topAttractions?: {
    name: string;
    description: string;
    category: string;
    images: string[];
    rating: number;
  }[];
  politicalContext?: {
    MLA: { name: string; constituency: string; party: string }[];
    MP: { name: string; constituency: string; party: string };
  };
  historicalImportance?: string;
  topPersonalities?: { name: string; role: string; description: string }[];
  popularFor?: {
    business: { name: string; description: string }[];
    craft: { name: string; description: string }[];
    events: { name: string; description: string }[];
  };
}

export interface Language {
  _id: string;
  name: string;
  languageStatus: 'active' | 'inactive';
  order?: number;
  createdAt: string;
}

export interface Country {
  _id: string;
  countryName: string;
  order?: number;
  createdAt: string;
}

export interface State {
  _id: string;
  stateName: string;
  order?: number;
  createdAt: string;
}

export interface City {
  _id: string;
  cityName: string;
  order?: number;
  createdAt: string;
}

export interface Question {
  _id: string;
  questionText: string;
  cityId: City | string | null; // Allow null for common questions
  status: 'active' | 'inactive';
  order: number;
  type: 'specific' | 'common';
  options?: string[];
  createdAt: string;
}

export interface Activity {
  _id: string;
  name: string;
  order?: number;
  createdAt: string;
}

export interface Institution {
  _id?: string;
  name: string;
  description?: string;
  type: 'hospital' | 'school' | 'college' | 'university' | 'research_center';
  address: string;
  contact?: string;
  website?: string;
}
