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
  // Optional geo identifiers and coordinates
  country_id?: number | string;
  state_id?: number | string;
  city_id?: number | string;
  latitude?: number;
  longitude?: number;
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
  // Account information
  account?: EmployeeAccount;
}

export interface EmployeeAccount {
  id: number;
  user_id: number;
  employee_id: number;
  email: string;
  role: string; // 'employee_sales', 'employee_cashier', 'employee_supervisor', 'employee_manager'
  role_type: EmployeeRoleType;
  role_display: string;
  is_active: boolean;
  company_id: number;
  location_id?: number;
  created_at: string;
  updated_at: string;
}

export const EMPLOYEE_ROLE_TYPES = [
  'sales',
  'cashier',
  'supervisor',
  'manager'
] as const;

export type EmployeeRoleType = typeof EMPLOYEE_ROLE_TYPES[number];

export const EMPLOYEE_ROLE_DISPLAY: Record<EmployeeRoleType, string> = {
  sales: 'Ventas',
  cashier: 'Cajero',
  supervisor: 'Supervisor',
  manager: 'Gerente'
};

export const ROLES = [
  'admin',
  'manager',
  'employee'
] as const;

export type Role = typeof ROLES[number];
