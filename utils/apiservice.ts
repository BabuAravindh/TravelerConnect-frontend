// Add type definitions or import them from your models/types file
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
  name: string;
  code: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface State {
  _id: string;
  name: string;
  countryId: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface City {
  _id: string;
  name: string;
  stateId: string;
  countryId: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface Question {
  _id: string;
  text: string;
  cityId: string;
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/predefine`;

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Request failed');
  }
  return response.json() as Promise<T>;
};

export const apiService = {
  // ==================== LANGUAGES ====================
  getLanguages: async (): Promise<Language[]> => {
    const response = await fetch(`${API_BASE_URL}/languages`);
    return handleResponse<Language[]>(response);
  },

  createLanguage: async (data: Omit<Language, '_id' | 'createdAt' | 'updatedAt' | '__v'>): Promise<Language> => {
    const response = await fetch(`${API_BASE_URL}/languages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Language>(response);
  },

  updateLanguage: async (id: string, data: Partial<Language>): Promise<Language> => {
    const response = await fetch(`${API_BASE_URL}/languages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Language>(response);
  },

  deleteLanguage: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/languages/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(response);
  },

  // ==================== COUNTRIES ====================
  getCountries: async (): Promise<Country[]> => {
    const response = await fetch(`${API_BASE_URL}/countries`);
    return handleResponse<Country[]>(response);
  },

  createCountry: async (data: Omit<Country, '_id' | 'createdAt' | '__v'>): Promise<Country> => {
    const response = await fetch(`${API_BASE_URL}/countries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Country>(response);
  },

  updateCountry: async (id: string, data: Partial<Country>): Promise<Country> => {
    const response = await fetch(`${API_BASE_URL}/countries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Country>(response);
  },

  deleteCountry: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/countries/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(response);
  },

  // ==================== STATES ====================
  getStates: async (): Promise<State[]> => {
    const response = await fetch(`${API_BASE_URL}/states`);
    return handleResponse<State[]>(response);
  },

  createState: async (data: Omit<State, '_id' | 'createdAt' | '__v'>): Promise<State> => {
    const response = await fetch(`${API_BASE_URL}/states`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<State>(response);
  },

  updateState: async (id: string, data: Partial<State>): Promise<State> => {
    const response = await fetch(`${API_BASE_URL}/states/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<State>(response);
  },

  deleteState: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/states/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(response);
  },

  // ==================== CITIES ====================
  getCities: async (): Promise<City[]> => {
    const response = await fetch(`${API_BASE_URL}/cities`);
    const result = await handleResponse<{ success: boolean; data: City[] }>(response);
    return result.data; // Extract the data array
  },

  createCity: async (data: Omit<City, '_id' | 'createdAt' | '__v'>): Promise<City> => {
    const response = await fetch(`${API_BASE_URL}/cities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<City>(response);
  },

  updateCity: async (id: string, data: Partial<City>): Promise<City> => {
    const response = await fetch(`${API_BASE_URL}/cities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<City>(response);
  },

  deleteCity: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/cities/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(response);
  },

  // ==================== QUESTIONS ====================
  getQuestions: async (): Promise<Question[]> => {
    const response = await fetch(`${API_BASE_URL}/questions`);
    const result = await handleResponse<ApiResponse<Question[]>>(response);
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch questions');
    }
    return result.data; // Return the data array directly
  },

  getQuestionsByCity: async (cityId: string): Promise<Question[]> => {
    const response = await fetch(`${API_BASE_URL}/questions/city/${cityId}`);
    const result = await handleResponse<ApiResponse<Question[]>>(response);
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch questions');
    }
    return result.data; // Return the data array directly
  },

  createQuestion: async (data: Omit<Question, '_id' | 'createdAt' | 'updatedAt' | '__v'>): Promise<Question> => {
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Question>(response);
  },

  updateQuestion: async (id: string, data: Partial<Question>): Promise<Question> => {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Question>(response);
  },

  deleteQuestion: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(response);
  },

  // ==================== ACTIVITIES ====================
  getActivities: async (): Promise<Activity[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities`);
    return handleResponse<Activity[]>(response);
  },

  createActivity: async (data: Omit<Activity, '_id' | 'createdAt' | 'updatedAt' | '__v'>): Promise<Activity> => {
    const response = await fetch(`${API_BASE_URL}/api/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Activity>(response);
  },

  updateActivity: async (id: string, data: Partial<Activity>): Promise<Activity> => {
    const response = await fetch(`${API_BASE_URL}/api/activities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Activity>(response);
  },

  deleteActivity: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/activities/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(response);
  },
};