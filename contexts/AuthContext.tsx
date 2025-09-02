'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api/api';
import { ApiResponse, LoginResponse, UserProfile } from '@/types/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string, phone?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      // Always attempt to fetch user if a token exists
      if (token) {
        try {
          const response = await api.auth.getProfile(token);
          console.log('getProfile response on load:', response); // Debug log
          if (response.success && response.data?.user) {
            const { user: profileUser, company_id: profileCompanyId } = response.data;
            setUser({
              firebase_uid: profileUser.firebase_uid || profileUser.id.toString(),
              firebase_email: profileUser.email,
              firebase_name: profileUser.name,
              company_id: profileCompanyId || undefined,
            });
          } else {
            // If we can't get user data with the token, clear it
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Failed to load user', error);
          localStorage.removeItem('token');
          setToken(null);
        } finally {
          setLoading(false);
        }
      } else {
        // If no token, we're not logged in
        setLoading(false);
      }
    };

    loadUser();
  }, [token]); // Removed user from dependency array

  const handleAuthSuccess = (access_token: string, userData: any) => {
    if (!access_token) {
      throw new Error('No access token received');
    }
    
    localStorage.setItem('token', access_token);
    setToken(access_token);
    
    if (userData) {
      setUser({
        firebase_uid: userData.id.toString(),
        firebase_email: userData.email,
        firebase_name: userData.name || userData.email.split('@')[0],
        company_id: userData.company_id || undefined,
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.auth.login(email, password);
      console.log('Login response:', response);
      
      if (response.success && response.data) {
        const { access_token, user } = response.data;
        handleAuthSuccess(access_token, user);
      } else {
        throw new Error(response.message || 'Failed to login');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, password_confirmation: string, phone?: string) => {
    try {
      const response = await api.auth.register(name, email, password, password_confirmation, phone);
      console.log('Register response:', response);
      
      if (response.success && response.data) {
        const { access_token, user } = response.data;
        handleAuthSuccess(access_token, user);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    if (token) {
      api.auth.logout(token).finally(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      });
    }
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      loading,
      isAuthenticated: !!token && !!user,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
