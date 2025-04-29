export type UserRole = 'user' | 'guide' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  bankAccountNumber?: string;
}

export interface SortConfig {
  key: keyof User;
  direction: 'asc' | 'desc';
}