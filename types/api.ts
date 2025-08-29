export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  access_token: string;
  user: {
    uid: string;
    email: string;
    displayName?: string;
  };
  token_type: string;
}

export interface UserProfile {
  firebase_uid: string;
  firebase_email: string;
  firebase_name: string;
}
