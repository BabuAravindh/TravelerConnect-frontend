export interface Language {
    _id: string;
    languageName: string;
    languageStatus: 'active' | 'inactive';
    order: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }
  
  export interface Country {
    _id: string;
    countryName: string;
    order?: number;
    createdAt: string;
    __v: number;
  }
  
  export interface State {
    _id: string;
    stateName: string;
    order?: number;
    createdAt: string;
    __v: number;
  }
  
  interface City {
    _id: string;
    cityName: string;
    order: number;
    createdAt: string;
  }
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
  }
  interface Activity {
    _id: string;
    activityName: string;
    order: number;
    createdAt: string;
    updatedAt: string;
    __v?: number;
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

  // Activities API Methods
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

}