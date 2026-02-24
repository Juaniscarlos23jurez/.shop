'use client';

import { RegisterForm, RegisterFormValues } from "@/components/auth/register-form";
import { routes } from "@/lib/routes/web";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api/api";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, registerWithGoogle, loading } = useAuth();

  const handleRegister = async ({ name, email, password, password_confirmation, phone }: RegisterFormValues) => {
    setError(null);
    try {
      await register(name, email, password, password_confirmation, phone);
      const accessToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (accessToken) {
        try {
          const companyRes = await api.userCompanies.get(accessToken);
          const hasCompany = Boolean((companyRes as any)?.data?.data?.id);
          router.push(hasCompany ? '/onboarding/plan' : '/onboarding/compania');
        } catch {
          router.push('/onboarding/compania');
        }
      } else {
        router.push('/onboarding/compania');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(`No se pudo registrar: ${errorMessage}`);
    }
  };

  const handleGoogleRegister = async () => {
    setError(null);

    try {
      const result = await registerWithGoogle();
      const accessToken = result?.access_token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      if (accessToken) {
        try {
          const companyRes = await api.userCompanies.get(accessToken);
          const hasCompany = Boolean((companyRes as any)?.data?.data?.id);
          router.push(hasCompany ? '/onboarding/plan' : '/onboarding/compania');
        } catch {
          router.push('/onboarding/compania');
        }
      } else {
        router.push('/onboarding/compania');
      }
      router.refresh();
    } catch (error) {
      console.error('Google register error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(`No se pudo registrar con Google: ${errorMessage}`);
    }
  };

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
                <span className="text-xl font-bold text-gray-900">Fynlink+</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-600">¿Ya tienes cuenta?</p>
              <Link href="/auth/login">
                <Button variant="outline" className="border-gray-300">Iniciar sesión</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="relative">
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#22c55e]">
                Bienvenido
              </p>
              <h2 className="text-3xl font-black text-gray-900">
                Crea tu cuenta
              </h2>
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link href="/auth/login" className="font-semibold text-[#22c55e] hover:text-green-600">
                  Inicia sesión
                </Link>
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-gray-300 text-gray-700 font-medium flex items-center justify-center gap-3 hover:bg-gray-50"
                onClick={handleGoogleRegister}
              >
                <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
                Registrarse con Google
              </Button>

              <div className="flex items-center gap-3 text-xs uppercase text-gray-400 tracking-[0.3em]">
                <span className="h-px w-full bg-gray-200" />
                <span className="whitespace-nowrap">O Email</span>
                <span className="h-px w-full bg-gray-200" />
              </div>
            </div>

            <RegisterForm onSubmit={handleRegister} isLoading={loading} />
          </div>
        </div>
      </main>
    </div>
  );
}
