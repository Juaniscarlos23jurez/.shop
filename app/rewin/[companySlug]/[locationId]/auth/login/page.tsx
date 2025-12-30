"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import * as Lucide from 'lucide-react';
const { Mail, ArrowLeft } = Lucide as any;
import Link from 'next/link';

import { clientAuthApi } from '@/lib/api/client-auth';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, getFcmBrowserToken, isFirebaseConfigured } from '@/lib/firebase';

export default function CustomerLoginPage() {
    const params = useParams();
    const router = useRouter();
    const companySlug = params.companySlug as string;
    const locationId = params.locationId as string;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await clientAuthApi.login({
                email,
                password,
                device_platform: 'web'
            });

            if (response.success && response.data) {
                // Store token if available
                const token = response.data.token || response.data.data?.token;
                if (token) {
                    localStorage.setItem('customer_token', token);
                    // Also store user info if needed
                    if (response.data.data?.client) {
                        localStorage.setItem('customer_info', JSON.stringify(response.data.data.client));
                    }
                }

                // Redirect to store
                router.push(`/rewin/${companySlug}/${locationId}`);
            } else {
                setError(response.error || 'Error al iniciar sesión');
            }
        } catch (err) {
            setError('Ocurrió un error inesperado');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setIsGoogleLoading(true);

        try {
            if (!isFirebaseConfigured() || !auth) {
                throw new Error('Firebase no está configurado para login con Google');
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

            const response = await clientAuthApi.login({
                idToken,
                provider: 'google.com',
                device_platform: 'web',
                fcm_token: fcmToken ?? undefined,
            });

            if (response.success && response.data) {
                const token = response.data.token || response.data.data?.token;
                if (token) {
                    localStorage.setItem('customer_token', token);
                }
                if (response.data.data?.client) {
                    localStorage.setItem('customer_info', JSON.stringify(response.data.data.client));
                }

                router.push(`/rewin/${companySlug}/${locationId}`);
                return;
            }

            throw new Error(response.error || response.message || 'No se pudo iniciar sesión con Google');
        } catch (err: any) {
            if (err?.code === 'auth/popup-closed-by-user') {
                console.warn('Google login popup cerrado por el usuario');
                return;
            }
            console.error('Google login error:', err);
            const message = err?.message || 'Ocurrió un error al iniciar sesión con Google';
            setError(message);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    {/* Placeholder for logo if available, or just an icon */}
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Mail className="h-6 w-6 text-emerald-600" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Iniciar sesión
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Accede a tu cuenta para ver tus pedidos y cupones
                </p>
                {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm text-center">
                        {error}
                    </div>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Card className="shadow-xl border-0 ring-1 ring-gray-200">
                    <CardContent className="pt-8 px-4 sm:px-10">
                        <form className="space-y-6" onSubmit={handleEmailLogin}>
                            <div>
                                <Label htmlFor="email">Correo electrónico</Label>
                                <div className="mt-1">
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="password">Contraseña</Label>
                                <div className="mt-1">
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                        Recordarme
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500">
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                </div>
                            </div>

                            <div>
                                <Button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                                </Button>
                            </div>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">O continúa con</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Button
                                    variant="outline"
                                    className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    onClick={handleGoogleLogin}
                                    disabled={isGoogleLoading}
                                >
                                    <svg className="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                                    </svg>
                                    {isGoogleLoading ? 'Conectando...' : 'Continuar con Google'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 px-4 py-4 sm:px-10 flex justify-center border-t border-gray-200 rounded-b-lg">
                        <p className="text-xs text-gray-500">
                            ¿No tienes una cuenta?{' '}
                            <Link href={`/rewin/${companySlug}/${locationId}/auth/register`} className="font-medium text-emerald-600 hover:text-emerald-500">
                                Regístrate
                            </Link>
                        </p>
                    </CardFooter>
                </Card>

                <div className="mt-6 text-center">
                    <Link href={`/rewin/${companySlug}/${locationId}`} className="flex items-center justify-center text-sm font-medium text-emerald-600 hover:text-emerald-500">
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Volver a la tienda
                    </Link>
                </div>
            </div>
        </div>
    );
}
