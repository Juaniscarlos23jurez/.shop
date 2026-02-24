'use client';

import { api } from "@/lib/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useState } from "react";
import { routes } from "@/lib/routes/web";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await api.auth.forgotPassword(email);
            if (response.success) {
                setSuccess(true);
            } else {
                setError(response.message || 'Ocurrió un error al procesar tu solicitud.');
            }
        } catch (err) {
            console.error('Forgot password error:', err);
            setError('No se pudo enviar el correo de recuperación. Por favor, intenta de nuevo más tarde.');
        } finally {
            setIsLoading(false);
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
                    </div>
                </div>
            </header>

            <main className="relative">
                <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md space-y-8">
                        <div className="text-center space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#22c55e]">
                                Recuperar acceso
                            </p>
                            <h2 className="text-3xl font-black text-gray-900">
                                ¿Olvidaste tu contraseña?
                            </h2>
                            <p className="text-sm text-gray-600">
                                Ingresa tu correo electrónico y te enviaremos un link para restablecerla.
                            </p>
                        </div>

                        {error && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success ? (
                            <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10 space-y-6 text-center">
                                <div className="flex justify-center">
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-900">Correo enviado</h3>
                                    <p className="text-sm text-gray-600">
                                        Si el correo <strong>{email}</strong> está registrado, recibirás un enlace para cambiar tu contraseña en unos minutos.
                                    </p>
                                </div>
                                <Link href={routes.login}>
                                    <Button className="w-full bg-[#22c55e] hover:bg-green-700 text-white mt-4">
                                        Volver al inicio de sesión
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Correo electrónico
                                        </Label>
                                        <div className="mt-1">
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                required
                                                placeholder="tu@ejemplo.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#22c55e] focus:border-[#22c55e] sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#22c55e] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Enviando...
                                                </>
                                            ) : (
                                                'Enviar instrucciones'
                                            )}
                                        </Button>
                                    </div>

                                    <div className="text-center">
                                        <Link href={routes.login} className="text-sm font-semibold text-[#22c55e] hover:text-green-600">
                                            O vuelve al inicio de sesión
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
