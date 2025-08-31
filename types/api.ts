export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string | any;
  raw?: any; // Raw response from the API
  [key: string]: any;
}

export interface BusinessHour {
  id: string;
  company_id: string;
  day_of_week: string;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessHoursResponse {
  hours: BusinessHour[];
}

export interface LoginResponse {
  user: {
    uid: string;
    email: string;
    displayName?: string;
  };
  id_token: string;
  token_type: string;
}

export interface UserProfile {
  firebase_uid: string;
  firebase_email: string;
  firebase_name: string;
  company_id?: string;
}

export interface ProfileApiUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  firebase_uid?: string; // Add firebase_uid as it might be useful
}

export interface Benefit {
  text: string;
  type: string;
  description: string;
  sort_order?: number;
}

export interface Membership {
  id: number;
  company_id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  duration_unit: 'months' | 'years';
  is_recurring: boolean;
  welcome_gift: boolean;
  birthday_gift: boolean;
  early_renewal_discount: number | null;
  max_users: number | null;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  benefits: Benefit[];
  created_at: string;
  updated_at: string;
}
