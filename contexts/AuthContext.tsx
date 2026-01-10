'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api/api';
import { ApiResponse, LoginResponse, UserProfile } from '@/types/api';
import { getFcmBrowserToken, auth, isFirebaseConfigured } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { notificationService } from '@/lib/notifications';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (email: string, password: string, isEmployee?: boolean) => Promise<{ user: any; access_token: string } | void>;
  loginWithGoogle: () => Promise<{ user: any; access_token: string } | void>;
  registerWithGoogle: () => Promise<{ user: any; access_token: string } | void>;
  register: (name: string, email: string, password: string, password_confirmation: string, phone?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isEmployee: boolean;
  userRole?: string;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [isEmployee, setIsEmployee] = useState(false);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadUser = async () => {
      // Always attempt to fetch user if a token exists
      if (token) {
        try {
          const response = await api.auth.getProfile(token);
          console.log('getProfile response on load:', response); // Debug log
          if (response.success && response.data?.user) {
            const { user: profileUser, company_id: profileCompanyId } = response.data;
            // Derive role and employee flag
            const role = (profileUser as any)?.role as string | undefined;
            setUserRole(role);
            setIsEmployee(Boolean(role && role.startsWith('employee_')));

            let derivedCompanyId: number | string | undefined = profileCompanyId;

            // Fallback: fetch company if company_id is missing
            if (!derivedCompanyId) {
              try {
                console.log('[Auth] company_id missing from profile, fetching /auth/profile/company');
                const companyRes = await api.userCompanies.get(token);
                console.log('[Auth] /auth/profile/company response:', companyRes);
                // Try common shapes
                const cData = companyRes.data;
                if (cData) {
                  // Typical shape: { status, data: { id, ... } }
                  if (cData.data && typeof cData.data.id !== 'undefined') derivedCompanyId = cData.data.id;
                  else if (typeof cData.id !== 'undefined') derivedCompanyId = cData.id;
                  else if (cData.company && typeof cData.company.id !== 'undefined') derivedCompanyId = cData.company.id;
                }
                console.log('[Auth] derivedCompanyId:', derivedCompanyId);
              } catch (e) {
                console.warn('[Auth] Failed to fetch company profile for company_id', e);
              }
            }

            setUser({
              firebase_uid: profileUser.firebase_uid || profileUser.id.toString(),
              firebase_email: profileUser.email,
              firebase_name: profileUser.name,
              company_id: derivedCompanyId !== undefined && derivedCompanyId !== null
                ? String(derivedCompanyId)
                : undefined,
            });

            // Initialize notifications after successful authentication
            if (typeof window !== 'undefined') {
              notificationService.initialize().catch(error => {
                console.warn('Failed to initialize notification service:', error);
              });
            }
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
      const role = userData?.role as string | undefined;
      setUserRole(role);
      setIsEmployee(Boolean(role && role.startsWith('employee_')));
      setUser({
        firebase_uid: userData.id.toString(),
        firebase_email: userData.email,
        firebase_name: userData.name || userData.email.split('@')[0],
        company_id: userData.company_id || undefined,
      });
    }

    // Initialize notifications after successful login
    if (typeof window !== 'undefined') {
      notificationService.initialize().catch(error => {
        console.warn('Failed to initialize notification service:', error);
      });
    }
  };

  const registerWithGoogle = async () => {
    try {
      if (!isFirebaseConfigured() || !auth) {
        throw new Error('Firebase no está configurado para registro social');
      }

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      let fcmToken: string | null = null;
      if (typeof window !== 'undefined') {
        try {
          fcmToken = await getFcmBrowserToken();
        } catch {
          fcmToken = null;
        }
      }

      const response = await api.auth.socialRegister(idToken, 'google.com', fcmToken);

      if (response.success && response.data) {
        const { access_token, user } = response.data;
        handleAuthSuccess(access_token, user);
        return { user, access_token };
      }

      throw new Error(response.message || 'Failed to register with Google');
    } catch (error) {
      console.error('Google register error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      if (!isFirebaseConfigured() || !auth) {
        throw new Error('Firebase no está configurado para login social');
      }

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      let fcmToken: string | null = null;
      if (typeof window !== 'undefined') {
        try {
          fcmToken = await getFcmBrowserToken();
        } catch {
          fcmToken = null;
        }
      }

      const response = await api.auth.socialLogin(idToken, 'google.com', fcmToken);

      if (response.success && response.data) {
        const { access_token, user } = response.data;
        handleAuthSuccess(access_token, user);
        return { user, access_token };
      }

      throw new Error(response.message || 'Failed to login with Google');
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string, _isEmployeeLogin: boolean = false) => {
    try {
      // Always use general login endpoint. Role is derived from response.
      let response: ApiResponse<LoginResponse> = await api.auth.login(email, password);

      console.log('Login response:', response);

      if (response.success && response.data) {
        const { access_token, user } = response.data;
        handleAuthSuccess(access_token, user);

        // Fire-and-forget: intentar registrar el token FCM del navegador
        if (typeof window !== 'undefined') {
          (async () => {
            try {
              console.log('[FCM] Iniciando flujo para obtener token FCM después de login');
              const fcmToken = await getFcmBrowserToken();
              console.log('[FCM] Token obtenido desde getFcmBrowserToken:', fcmToken);
              if (fcmToken) {
                const putResponse = await api.auth.updateFcmToken(access_token, fcmToken);
              } else {
                console.warn('[FCM] No se obtuvo token FCM (puede que el usuario haya negado permisos o haya fallado algo).');
              }
            } catch (err) {
              console.error('[FCM] Error actualizando token FCM después de login:', err);
            }
          })();
        } else {
          console.log('[FCM] window no está definido, no se ejecuta flujo FCM (esto es normal en el servidor).');
        }

        return { user, access_token };
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
      loginWithGoogle,
      registerWithGoogle,
      register,
      logout,
      loading,
      isAuthenticated: !!token && !!user,
      isEmployee,
      userRole,
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
