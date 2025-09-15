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
  phone?: string;
  position?: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  hire_date?: string | Date;
  salary?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: string;
  location_assignment?: {
    role: string;
    is_primary: boolean;
    start_date: string | Date;
    location_id?: string;
  };
}

export const ROLES = [
  'admin',
  'manager',
  'employee'
] as const;

export type Role = typeof ROLES[number];
