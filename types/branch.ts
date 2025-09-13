export interface Branch {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastActive: string;
}

export const ROLES = [
  'admin',
  'manager',
  'employee'
] as const;

export type Role = typeof ROLES[number];
