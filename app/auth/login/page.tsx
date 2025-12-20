'use client';

import { AuthForm } from "@/components/auth/auth-form";
import { routes } from "@/lib/routes/web";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api/api";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { login, loginWithGoogle, loading, isAuthenticated, userRole } = useAuth();
  const [isEmployee, setIsEmployee] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      if (userRole && userRole.startsWith('employee_')) {
        router.push('/dashboard/pos');
      } else {
        router.push(routes.dashboard);
      }
    }
  }, [isAuthenticated, userRole, router]);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    
    try {
      // Always use general login; decide redirect by returned role
      const result = await login(email, password, isEmployee);
      const role = result && (result.user as any)?.role as string | undefined;
      if (role && role.startsWith('employee_')) {
        router.push('/dashboard/pos');
      } else {
        const accessToken = result?.access_token;
        if (accessToken) {
          try {
            const companyRes = await api.userCompanies.get(accessToken);
            const hasCompany = Boolean((companyRes as any)?.data?.data?.id);
            router.push(hasCompany ? routes.dashboard : '/onboarding/compania');
          } catch {
            router.push('/onboarding/compania');
          }
        } else {
          router.push('/onboarding/compania');
        }
      }
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(`No se pudo iniciar sesión: ${errorMessage}`);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);

    try {
      const result = await loginWithGoogle();
      const role = result && (result.user as any)?.role as string | undefined;
      if (role && role.startsWith('employee_')) {
        router.push('/dashboard/pos');
      } else {
        const accessToken = result?.access_token;
        if (accessToken) {
          try {
            const companyRes = await api.userCompanies.get(accessToken);
            const hasCompany = Boolean((companyRes as any)?.data?.data?.id);
            router.push(hasCompany ? routes.dashboard : '/onboarding/compania');
          } catch {
            router.push('/onboarding/compania');
          }
        } else {
          router.push('/onboarding/compania');
        }
      }
      router.refresh();
    } catch (error) {
      console.error('Google login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(`No se pudo iniciar sesión con Google: ${errorMessage}`);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="absolute inset-0 bg-grid-gray-100 [mask-image:linear-gradient(0deg,white,transparent)]"></div>
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#22c55e] flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">Fideliza+</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-600">¿No tienes una cuenta?</p>
              <Link href="/auth/register">
                <Button variant="outline" className="border-gray-300">Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="relative">
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-black text-gray-900">
                Iniciar sesión
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                O{' '}
                <Link href="/auth/register" className="font-medium text-[#22c55e] hover:text-green-600">
                  crea una cuenta
                </Link>
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <AuthForm 
              onSubmit={handleLogin} 
              title="Iniciar sesión" 
              buttonText={loading ? 'Iniciando sesión...' : 'Iniciar sesión'} 
              isLoading={loading} 
              isEmployeeLogin={isEmployee}
            />

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">O continúa con</span>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleGoogleLogin();
                  }}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Iniciar con Google</span>
                  <svg className="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                  Iniciar con Google
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
