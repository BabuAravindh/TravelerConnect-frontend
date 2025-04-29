import { Route } from "./routesType";

export const fetchRoute = async (id: string): Promise<Route> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/routes/${id}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch route');
    }
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
  }
};

export const sendChatRequest = async (
  userId: string,
  guideId: { name: string; email: string } | undefined,
  token: string
): Promise<void> => {
  if (!guideId) {
    throw new Error('No guide assigned to this route');
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        customerId: userId,
        guideId: guideId,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to send request');
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
  }
};