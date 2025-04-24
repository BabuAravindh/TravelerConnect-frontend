import { City, Route, Feedback, RouteFormData } from './destinationRoutesTypes';

export const routeService = {
  async getCities(): Promise<City[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predefine/cities`);
    if (!response.ok) throw new Error('Failed to fetch cities');
    const data = await response.json();
    return data.success ? data.data : [];
  },

  async getRoutes(guideId: string, token: string): Promise<Route[]> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/routes/guide/${guideId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch routes');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  async getFeedback(token: string): Promise<Feedback[]> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/routes/feedback/guide`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch feedback');
    }
    const data = await response.json();
    return data.success ? data.feedback || [] : [];
  },

  async createRoute(formData: RouteFormData, guideId: string, token: string): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/routes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...formData,
        guideId,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create route');
    }
  },

  async updateRoute(id: string, formData: RouteFormData, token: string): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/routes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update route');
    }
  },

  async deleteRoute(id: string, token: string): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/routes/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete route');
    }
  },
};