export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string | any;
  raw?: any; // Raw response from the API
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
