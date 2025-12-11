import { api } from './api';
import type { ProfileApiUser } from '@/types/api';
import { getFcmBrowserToken } from '@/lib/firebase';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  // Add other user properties as needed
}

interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

export const loginUser = async (email: string, password: string) => {
  try {
    console.log('Attempting login with:', { email });
    const response = await api.auth.login(email, password);
    console.log('Login API response:', response);
    
    if (response.success && response.data?.user && response.data?.access_token) {
      // Fire-and-forget: intentar registrar el token FCM del navegador
      if (typeof window !== 'undefined') {
        (async () => {
          try {
            const fcmToken = await getFcmBrowserToken();
            if (fcmToken) {
              await api.auth.updateFcmToken(response.data!.access_token, fcmToken);
            }
          } catch (err) {
            console.error('Error updating FCM token after login:', err);
          }
        })();
      }

      return { 
        user: response.data.user, 
        token: response.data.access_token,
        error: null 
      };
    }
    
    const errorMessage = response.message || 'Login failed';
    console.error('Login failed with response:', response);
    return { 
      user: null, 
      token: null, 
      error: errorMessage 
    };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      user: null, 
      token: null, 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  password_confirmation: string,
  phone?: string
) => {
  try {
    const response = await api.auth.register(
      name,
      email,
      password,
      password_confirmation,
      phone
    );
    if (response.success && response.data) {
      return { 
        user: response.data.user, 
        token: response.data.access_token,
        error: null 
      };
    }
    return { user: null, token: null, error: response.error || 'Registration failed' };
  } catch (error) {
    return { 
      user: null, 
      token: null, 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};

export const logoutUser = async (token: string) => {
  try {
    await api.auth.logout(token);
    return { error: null };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Failed to logout'
    };
  }
};

export const getCurrentUser = async (token: string): Promise<ProfileApiUser | null> => {
  try {
    const response = await api.auth.getProfile(token);
    return response.success ? response.data?.user || null : null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};
