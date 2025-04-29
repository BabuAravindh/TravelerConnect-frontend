// services/User.service.ts
import { toast } from 'react-hot-toast';
import { User, UserRole } from './UserTypes';

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/profile/users`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please login again');
      }
      if (response.status === 403) {
        throw new Error('Forbidden - Insufficient permissions');
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch users');
    }

    return response.json();
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to fetch users');
    throw error;
  }
};

export const updateUserRole = async (
  userId: string,
  role: UserRole,
): Promise<User> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/profile/${userId}/role`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ role }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Update failed');
    }

    return response.json();
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Update failed');
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/profile/${userId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Delete failed');
    }
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Delete failed');
    throw error;
  }
};