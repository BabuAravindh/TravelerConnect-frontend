
// Updated apiService to include getCityDetails
export interface Language {
  _id: string;
  name: string;
  code: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface Country {
  _id: string;
  countryName: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface State {
  _id: string;
  stateName: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface City {
  _id: string;
  cityName: string;
  order?: number;
  latitude?: number;
  longitude?: number;
  country?: string;
  population?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface Question {
  _id: string;
  questionText: string;
  cityId: string | { _id: string; cityName: string };
  type: 'specific' | 'common';
  options?: string[];
  status: 'active' | 'inactive';
  order: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface Activity {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

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
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Request failed');
  }
  return response.json() as Promise<T>;
};

export const apiService = {
  getLanguages: async (): Promise<Language[]> => {
    const response = await fetch(`${API_BASE_URL}/predefine/languages`);
    return handleResponse<Language[]>(response);
  },

  createLanguage: async (data: Omit<Language, '_id' | 'createdAt' | 'updatedAt' | '__v'>): Promise<Language> => {
    const response = await fetch(`${API_BASE_URL}/predefine/languages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Language>(response);
  },

  updateLanguage: async (id: string, data: Partial<Language>): Promise<Language> => {
    const response = await fetch(`${API_BASE_URL}/predefine/languages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Language>(response);
  },

  deleteLanguage: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/predefine/languages/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(response);
  },

  getCountries: async (): Promise<Country[]> => {
    const response = await fetch(`${API_BASE_URL}/predefine/countries`);
    return handleResponse<Country[]>(response);
  },

  createCountry: async (data: Omit<Country, '_id' | 'createdAt' | 'updatedAt' | '__v'>): Promise<Country> => {
    const response = await fetch(`${API_BASE_URL}/predefine/countries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Country>(response);
  },

  updateCountry: async (id: string, data: Partial<Country>): Promise<Country> => {
    const response = await fetch(`${API_BASE_URL}/predefine/countries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Country>(response);
  },

  deleteCountry: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/predefine/countries/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(response);
  },

  getStates: async (): Promise<State[]> => {
    const response = await fetch(`${API_BASE_URL}/predefine/states`);
    return handleResponse<State[]>(response);
  },

  createState: async (data: Omit<State, '_id' | 'createdAt' | 'updatedAt' | '__v'>): Promise<State> => {
    const response = await fetch(`${API_BASE_URL}/predefine/states`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<State>(response);
  },

  updateState: async (id: string, data: Partial<State>): Promise<State> => {
    const response = await fetch(`${API_BASE_URL}/predefine/states/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<State>(response);
  },

  deleteState: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/predefine/states/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(response);
  },

  getCities: async (): Promise<City[]> => {
    const response = await fetch(`${API_BASE_URL}/predefine/cities`);
    const result = await handleResponse<{ success: boolean; data: City[] }>(response);
    return result.data;
  },

  createCity: async (data: Omit<City, '_id' | 'createdAt' | 'updatedAt' | '__v'>): Promise<City> => {
    const response = await fetch(`${API_BASE_URL}/predefine/cities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ success: boolean; data: City }>(response);
    return result.data;
  },

  updateCity: async (id: string, data: Partial<City>): Promise<City> => {
    const response = await fetch(`${API_BASE_URL}/predefine/cities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ success: boolean; data: City }>(response);
    return result.data;
  },

  deleteCity: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/predefine/cities/${id}`, {
      method: 'DELETE',
    });
    const result = await handleResponse<{ success: boolean; message: string }>(response);
    return { message: result.message };
  },

  // New method to fetch city details and items
  getCityDetails: async (cityName: string): Promise<{ cityDetails: CityProfile; items: Item[] }> => {
    const response = await fetch(`${API_BASE_URL}/attractions?cityName=${encodeURIComponent(cityName)}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const result = await handleResponse<{ cityDetails: CityProfile; items: Item[] }>(response);
    return result;
  },

  getQuestions: async (): Promise<Question[]> => {
    const response = await fetch(`${API_BASE_URL}/predefine/questions`);
    const result = await handleResponse<{ success: boolean; data: Question[] }>(response);
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch questions');
    }
    return result.data;
  },

  getQuestionsByCity: async (cityId: string): Promise<Question[]> => {
    const response = await fetch(`${API_BASE_URL}/predefine/questions/city/${cityId}`);
    const result = await handleResponse<{ success: boolean; data: Question[] }>(response);
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch questions');
    }
    return result.data;
  },

  createQuestion: async (data: Omit<Question, '_id' | 'createdAt' | 'updatedAt' | '__v'>): Promise<Question> => {
    const response = await fetch(`${API_BASE_URL}/predefine/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ success: boolean; data: Question }>(response);
    return result.data;
  },

  updateQuestion: async (id: string, data: Partial<Question>): Promise<Question> => {
    const response = await fetch(`${API_BASE_URL}/predefine/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ success: boolean; data: Question }>(response);
    return result.data;
  },

  deleteQuestion: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/predefine/questions/${id}`, {
      method: 'DELETE',
    });
    const result = await handleResponse<{ success: boolean; message: string }>(response);
    return { message: result.message };
  },

  getActivities: async (): Promise<Activity[]> => {
    const response = await fetch(`${API_BASE_URL}/activities`);
    return handleResponse<Activity[]>(response);
  },

  createActivity: async (data: Omit<Activity, '_id' | 'createdAt' | 'updatedAt' | '__v'>): Promise<Activity> => {
    const response = await fetch(`${API_BASE_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Activity>(response);
  },

  updateActivity: async (id: string, data: Partial<Activity>): Promise<Activity> => {
    const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Activity>(response);
  },

  deleteActivity: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(response);
  },
};