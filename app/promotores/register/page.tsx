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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import Image from "next/image";

export default function PromoterRegisterPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const { register, registerWithGoogle, loading } = useAuth();
    const [promoterData, setPromoterData] = useState<any>(null); // Store promoter API response
    const [isSuccess, setIsSuccess] = useState(false);

    const handleRegister = async ({ name, email, password, password_confirmation, phone }: RegisterFormValues) => {
        setError(null);
        try {
            // 1. Standard Registration
            await register(name, email, password, password_confirmation, phone);

            // 2. Get Token (stored by register function)
            const accessToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

            if (accessToken) {
                // 3. Become a Promoter
                try {
                    const response = await api.promoters.join(accessToken);
                    if (response.success && response.data) {
                        setPromoterData(response.data.promoter);
                        setIsSuccess(true);
                    } else {
                        // Fallback if promoter join fails but registration succeeded
                        // Maybe just redirect to dashboard? or show error?
                        // User wants specific flow, so show error specific to promoter part
                        setError("Te registraste correctamente, pero hubo un error al activar tu cuenta de promotor. Contacta a soporte.");
                        // Ideally still redirect after delay?
                    }
                } catch (promoError) {
                    console.error('Error activating promoter:', promoError);
                    setError("Te registraste, pero falló la activación de promotor.");
                }
            } else {
                setError("Error al obtener token de acceso post-registro.");
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
                // 3. Become a Promoter
                try {
                    const response = await api.promoters.join(accessToken);
                    if (response.success && response.data) {
                        setPromoterData(response.data.promoter);
                        setIsSuccess(true);
                    } else {
                        setError("Te registraste correctamente, pero hubo un error al activar tu cuenta de promotor.");
                    }
                } catch (promoError) {
                    console.error('Error activating promoter:', promoError);
                    setError("Te registraste, pero falló la activación de promotor.");
                }
            } else {
                setError("Error al obtener token de acceso post-registro Google.");
            }
            router.refresh();
        } catch (error) {
            console.error('Google register error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            setError(`No se pudo registrar con Google: ${errorMessage}`);
        }
    };

    if (isSuccess && promoterData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg shadow-2xl border-0 overflow-hidden">
                    <div className="bg-[#22c55e] p-8 text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2">¡Felicidades!</h2>
                        <p className="text-green-100 font-medium text-lg">Ahora eres un Promotor Oficial</p>
                    </div>
                    <CardContent className="p-8 text-center space-y-8">
                        <div className="space-y-2">
                            <p className="text-gray-500 font-medium">Tu código de referido único es:</p>
                            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-6 relative group cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors" onClick={() => { navigator.clipboard.writeText(promoterData.referral_code) }}>
                                <p className="text-4xl font-black text-gray-900 tracking-wider font-mono">{promoterData.referral_code}</p>
                                <span className="absolute bottom-2 right-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">Click para copiar</span>
                            </div>
                            <p className="text-sm text-gray-400">Comparte este código con negocios para ganar comisiones.</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-left bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div>
                                <p className="text-xs text-blue-500 font-bold uppercase">Comisión</p>
                                <p className="font-bold text-gray-900">{promoterData.commission_value}%</p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-500 font-bold uppercase">Tipo</p>
                                <p className="font-bold text-gray-900 capitalize">{promoterData.commission_type}</p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-500 font-bold uppercase">Estado</p>
                                <p className="font-bold text-green-600 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Activo
                                </p>
                            </div>
                        </div>

                        <Link href="/promotores/dashboard" className="block">
                            <Button size="lg" className="w-full h-14 text-lg font-bold bg-gray-900 hover:bg-gray-800 shadow-xl">
                                Ir a mi Panel de Control
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
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
                                <div className="w-8 h-8 relative">
                                    <Image src="/logorewa.png" alt="logo" fill className="object-contain" />
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
                            <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-green-100">
                                <span>🚀 Únete al equipo</span>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900">
                                Registro de Promotor
                            </h2>
                            <p className="text-sm text-gray-600">
                                Crea tu cuenta para empezar a ganar comisiones.
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
