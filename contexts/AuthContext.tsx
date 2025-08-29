'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api/api';
import { ApiResponse, LoginResponse, UserProfile } from '@/types/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
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

  const login = async (email: string, password: string) => {
    try {
      const response = await api.auth.login(email, password);
      console.log('Login response:', response); // Debug log
      
      if (response.success && response.data) {
        const { id_token, user } = response.data;
        
        if (!id_token) {
          throw new Error('No access token received');
        }
        
        localStorage.setItem('token', id_token);
        setToken(id_token);
        
        if (user) {
          setUser({
            firebase_uid: user.uid,
            firebase_email: user.email,
            firebase_name: user.displayName || user.email.split('@')[0],
            company_id: user.company_id || undefined, // Assuming company_id might be directly in user object from login
          });
        } else {
          // If user data is not in the response, fetch it
          const profileResponse = await api.auth.getProfile(id_token);
          if (profileResponse.success && profileResponse.data?.user) {
            const { user: profileUser, company_id: profileCompanyId } = profileResponse.data;
            setUser({
              id: profileUser.id,
              name: profileUser.name,
              email: profileUser.email,
              phone: profileUser.phone,
              is_active: profileUser.is_active,
              created_at: profileUser.created_at,
              updated_at: profileUser.updated_at,
              firebase_uid: profileUser.firebase_uid || profileUser.id.toString(),
              company_id: profileCompanyId || undefined,
            });
          }
        }
      } else {
        throw new Error(response.message || 'Failed to login');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw to be caught by the login page
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
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated }}>
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
