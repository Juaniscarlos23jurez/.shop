'use client';

import { AuthForm } from "@/components/auth/auth-form";
import { routes } from "@/lib/routes/web";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { login, loading, isAuthenticated } = useAuth();
  const [isEmployeeLogin, setIsEmployeeLogin] = useState(true);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      router.push(routes.dashboard);
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    
    try {
      await login(email, password, true); // Pass true to indicate employee login
      router.push(routes.dashboard);
      router.refresh();
    } catch (error) {
      console.error('Employee login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(`No se pudo iniciar sesión: ${errorMessage}`);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="absolute inset-0 bg-grid-gray-100 [mask-image:linear-gradient(0deg,white,transparent)]"></div>
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">Fideliza+ Empleados</span>
              </div>
            </Link>
            
          </div>
        </div>
      </header>

      <main className="relative">
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-black text-gray-900">
                Acceso Empleados
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Ingresa con tus credenciales de empleado
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
              buttonText={loading ? 'Iniciando sesión...' : 'Acceder como empleado'} 
              isLoading={loading}
              isEmployeeLogin={true}
            />

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-500">
                ¿Problemas para acceder?{' '}
                <a href="mailto:soporte@fidelizamas.com" className="font-medium text-blue-600 hover:text-blue-500">
                  Contactar soporte
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
