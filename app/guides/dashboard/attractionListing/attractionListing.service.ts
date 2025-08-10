import { City, Attraction, Feedback } from './AttractionListingTypes';
import type { FormData } from './AttractionListingTypes';

export const attractionService = {
  async getCities(): Promise<City[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predefine/cities`);
    if (!response.ok) throw new Error('Failed to fetch cities');
    const data = await response.json();
    return data.data || [];
  },

  async getAttractions(guideId: string, token?: string): Promise<Attraction[]> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/attractions/guide/${guideId}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    if (!response.ok) throw new Error('Failed to fetch attractions');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  async getFeedback(token: string): Promise<Feedback[]> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/attractions/feedback/guide`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch feedback');
    const data = await response.json();
    (data)
    return data.feedback || [];

  },

  async createAttraction(formData: FormData, files: File[], guideId: string, token?: string): Promise<void> {
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    formDataToSend.append('guideId', guideId);
    files.forEach(file => {
      formDataToSend.append('images', file);
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attractions`, {
      method: 'POST',
      body: formDataToSend,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to create attraction');
    }
  },

  async updateAttraction(
    id: string,
    formData: FormData,
    files: File[],
    existingImages: string[],
    token?: string
  ): Promise<void> {
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    existingImages.forEach(image => {
      formDataToSend.append('existingImages', image);
    });
    files.forEach(file => {
      formDataToSend.append('images', file);
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attractions/${id}`, {
      method: 'PUT',
      body: formDataToSend,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to update attraction');
    }
  },

  async deleteAttraction(id: string, token?: string): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attractions/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete attraction');
    }
  },
};