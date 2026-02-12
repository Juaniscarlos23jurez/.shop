"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import * as Lucide from 'lucide-react';
const { Mail, ArrowLeft, Dumbbell } = Lucide as any;
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
                router.push(`/gym/${companySlug}/${locationId}`);
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

                router.push(`/gym/${companySlug}/${locationId}`);
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
        <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-zinc-900 border-2 border-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                        <Dumbbell className="h-8 w-8 text-blue-400" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-4xl font-black text-white uppercase tracking-tighter">
                    GYM ACCESS
                </h2>
                <p className="mt-2 text-center text-sm text-zinc-400 font-medium uppercase tracking-widest">
                    Entrena hoy, conquista mañana
                </p>
                {error && (
                    <div className="mt-4 bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm text-center font-bold">
                        {error}
                    </div>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
                <Card className="bg-zinc-900 border-zinc-800 shadow-2xl rounded-2xl overflow-hidden">
                    <CardContent className="pt-8 px-4 sm:px-10">
                        <form className="space-y-6" onSubmit={handleEmailLogin}>
                            <div>
                                <Label htmlFor="email" className="text-zinc-300 font-bold uppercase text-xs tracking-widest">Email de Atleta</Label>
                                <div className="mt-1">
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 focus:ring-blue-500 focus:border-blue-500 rounded-xl py-6"
                                        placeholder="atleta@gym.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="password" title="Contraseña" className="text-zinc-300 font-bold uppercase text-xs tracking-widest">Contraseña</Label>
                                <div className="mt-1">
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 focus:ring-blue-500 focus:border-blue-500 rounded-xl py-6"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-700 rounded bg-zinc-800"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-400 font-medium">
                                        Recordarme
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                </div>
                            </div>

                            <div>
                                <Button
                                    type="submit"
                                    className="w-full flex justify-center py-6 px-4 border border-transparent rounded-xl shadow-xl text-base font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 uppercase tracking-widest transition-all hover:scale-[1.02]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'CONECTANDO...' : 'ENTRAR AL GYM'}
                                </Button>
                            </div>
                        </form>

                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-800" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                                    <span className="px-4 bg-zinc-900 text-zinc-500 font-bold">O ACCEDE CON</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Button
                                    variant="outline"
                                    className="w-full inline-flex justify-center py-6 px-4 border border-zinc-800 rounded-xl shadow-sm bg-zinc-800 text-sm font-bold text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all border-2"
                                    onClick={handleGoogleLogin}
                                    disabled={isGoogleLoading}
                                >
                                    <svg className="w-5 h-5 mr-3" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                                    </svg>
                                    {isGoogleLoading ? 'SINCRONIZANDO...' : 'GOOGLE ATHLETE'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-zinc-800/50 px-4 py-6 sm:px-10 flex justify-center border-t border-zinc-800">
                        <p className="text-sm text-zinc-400 font-medium">
                            ¿Aún no eres parte?{' '}
                            <Link href={`/gym/${companySlug}/${locationId}/auth/register`} className="font-black text-blue-400 hover:text-blue-300 underline underline-offset-4">
                                ÚNETE AL EQUIPO
                            </Link>
                        </p>
                    </CardFooter>
                </Card>

                <div className="mt-8 text-center">
                    <Link href={`/gym/${companySlug}/${locationId}`} className="inline-flex items-center justify-center text-sm font-bold text-zinc-500 hover:text-blue-400 transition-colors group">
                        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        VOLVER A LA RECEPCIÓN
                    </Link>
                </div>
            </div>
        </div>
    );
}
