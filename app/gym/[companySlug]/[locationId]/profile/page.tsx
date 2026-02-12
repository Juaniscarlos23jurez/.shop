"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as Lucide from 'lucide-react';
const { User, Calendar, Heart, MapPin, ArrowLeft, Dumbbell, Gift, Loader2, Phone, Activity, Mail } = Lucide as any;
import { clientAuthApi } from '@/lib/api/client-auth';
import Link from 'next/link';

// Simple localStorage cache helpers with TTL
function getCache<T = any>(key: string): { data: T; ts: number } | null {
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function setCache<T = any>(key: string, data: T) {
    try {
        if (typeof window === 'undefined') return;
        const payload = JSON.stringify({ data, ts: Date.now() });
        window.localStorage.setItem(key, payload);
    } catch {
        // ignore
    }
}

function isFresh(entry: { ts: number } | null, ttlMs: number) {
    if (!entry) return false;
    return Date.now() - entry.ts < ttlMs;
}

const PROFILE_TTL = 15 * 60 * 1000; // 15 minutes
const FOLLOWED_TTL = 15 * 60 * 1000; // 15 minutes


export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const companySlug = params.companySlug as string;
    const locationId = params.locationId as string;

    const [user, setUser] = useState<any>(null);
    const [followedCompanies, setFollowedCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [birthday, setBirthday] = useState('');

    const handleOpenCompany = (company: any) => {
        const targetSlug = company?.slug || company?.slug_url || company?.company_slug || companySlug;
        // Navegar solo por slug, sin el segmento de locationId
        router.push(`/gym/${targetSlug}`);
    };

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('customer_token');
            if (!token) {
                router.push(`/gym/${companySlug}/${locationId}/auth/login`);
                return;
            }

            try {
                // 1. Get Profile
                const cachedProfile = getCache('user_profile_full');
                let userData = null;

                if (isFresh(cachedProfile, PROFILE_TTL) && cachedProfile?.data) {
                    userData = cachedProfile.data;
                    setUser(userData);
                    if (userData.birthday) setBirthday(userData.birthday);
                } else {
                    const profileRes = await clientAuthApi.getProfile(token);
                    if (profileRes.success && profileRes.data) {
                        userData = (profileRes.data as any).data || profileRes.data;
                        setUser(userData);
                        setCache('user_profile_full', userData);
                        // Pre-fill birthday if available (assuming it might be in the user object)
                        if (userData.birthday) setBirthday(userData.birthday);
                    }
                }

                // 2. Get Followed Companies
                const cachedFollowed = getCache('followed_companies_list');
                if (isFresh(cachedFollowed, FOLLOWED_TTL) && Array.isArray(cachedFollowed?.data)) {
                    setFollowedCompanies(cachedFollowed.data);
                } else {
                    const followedRes = await clientAuthApi.getFollowedCompanies(token);
                    if (followedRes.success && Array.isArray(followedRes.data)) {
                        setFollowedCompanies(followedRes.data);
                        setCache('followed_companies_list', followedRes.data);
                    }
                }
            } catch (e) {
                console.error("Error fetching profile data", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [companySlug, locationId, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex justify-center items-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-zinc-950 pb-20 text-white">
            {/* Header */}
            <div className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10 shadow-2xl">
                <div className="max-w-3xl mx-auto px-4 h-20 flex items-center gap-4">
                    <Link href={`/gym/${companySlug}/${locationId}`}>
                        <Button variant="ghost" size="icon" className="rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <h1 className="font-black text-2xl uppercase tracking-tighter">Mi Perfil Atleta</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
                {/* User Info Card */}
                <Card className="bg-zinc-900 border-zinc-800 shadow-2xl overflow-hidden rounded-3xl">
                    <div className="h-40 bg-gradient-to-br from-blue-600 via-blue-700 to-zinc-900 relative">
                        <Activity className="absolute right-6 top-6 h-24 w-24 text-white/10" />
                    </div>
                    <CardContent className="relative pt-0 pb-10 px-8">
                        <div className="-mt-16 mb-6 flex justify-between items-end">
                            <Avatar className="h-32 w-32 border-4 border-zinc-900 shadow-2xl">
                                <AvatarImage src={user.profile_photo_path || user.avatar_url || user.photo_url} />
                                <AvatarFallback className="bg-zinc-800 text-blue-400 text-3xl font-black">
                                    {user.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight">{user.name}</h2>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <p className="text-zinc-400 flex items-center gap-3 font-medium">
                                    <Mail className="h-5 w-5 text-blue-500" />
                                    {user.email}
                                </p>
                                {user.phone && (
                                    <p className="text-zinc-400 flex items-center gap-3 font-medium">
                                        <Phone className="h-5 w-5 text-blue-500" />
                                        {user.phone}
                                    </p>
                                )}
                                {(user.city || user.state || user.country) && (
                                    <p className="text-zinc-400 flex items-center gap-3 font-medium col-span-full">
                                        <MapPin className="h-5 w-5 text-blue-500" />
                                        {[
                                            user.city?.name,
                                            user.state?.name,
                                            user.country?.name
                                        ].filter(Boolean).join(', ')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Important Dates Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="bg-zinc-900 border-zinc-800 rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl font-bold uppercase tracking-tight text-white">
                                <Gift className="h-6 w-6 text-pink-500" />
                                Cumpleaños
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Label htmlFor="birthday" className="text-zinc-400 uppercase text-xs font-bold tracking-widest">Día de Celebración</Label>
                                <div className="flex gap-3">
                                    <Input
                                        id="birthday"
                                        type="date"
                                        value={birthday}
                                        onChange={(e) => setBirthday(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-12"
                                    />
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-6 rounded-xl">OK</Button>
                                </div>
                                <p className="text-xs text-zinc-500 font-medium italic">
                                    Recibirás sorpresas épicas por tu progreso anual.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800 rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl font-bold uppercase tracking-tight text-white">
                                <Calendar className="h-6 w-6 text-purple-500" />
                                Meta Personal
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-2xl border border-zinc-800">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-6 w-6 text-blue-500" />
                                        <div>
                                            <p className="font-bold text-white text-sm uppercase tracking-tight">PRÓXIMO HIT</p>
                                            <p className="text-xs text-zinc-500">Define tu objetivo</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-blue-400 font-black hover:bg-blue-500/10">SET</Button>
                                </div>
                                <Button variant="outline" className="w-full border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 h-12 rounded-xl text-sm font-bold uppercase tracking-widest">
                                    + AÑADIR RECORDATORIO
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Followed Stores Section */}
                <div>
                    <h3 className="text-2xl font-black mb-6 flex items-center gap-3 uppercase tracking-tight text-white">
                        <Dumbbell className="h-8 w-8 text-blue-500" />
                        Centros de Entrenamiento
                    </h3>

                    {followedCompanies.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
                            {followedCompanies.map((company) => (
                                <Card
                                    key={company.id}
                                    className="bg-zinc-900 border-zinc-800 overflow-hidden hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500 group cursor-pointer rounded-3xl border-2"
                                    onClick={() => handleOpenCompany(company)}
                                >
                                    <div className="h-32 bg-zinc-800 relative">
                                        {company.banner_url ? (
                                            <img src={company.banner_url} alt="Banner" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
                                        )}
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                        <div className="absolute -bottom-8 left-6">
                                            <Avatar className="h-20 w-20 border-4 border-zinc-900 shadow-2xl">
                                                <AvatarImage src={company.logo_url} />
                                                <AvatarFallback className="bg-zinc-800 text-blue-400 font-black text-xl">
                                                    {company.name?.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </div>
                                    <CardContent className="pt-12 pb-6 px-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-black text-xl leading-tight mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-tight text-white">
                                                    {company.name}
                                                </h4>
                                                <p className="text-xs text-zinc-500 font-bold flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-zinc-600" />
                                                    {company.city || 'Ubicación Pro'}
                                                </p>
                                            </div>
                                            {company.points_balance !== undefined && (
                                                <div className="text-right">
                                                    <span className="block text-lg font-black text-blue-500 tracking-tighter shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                                                        {company.points_balance} PTS
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center">
                                            <span className="text-xs text-zinc-600 font-bold uppercase tracking-widest">
                                                Desde {new Date(company.following_since || Date.now()).getFullYear()}
                                            </span>
                                            <Button
                                                size="sm"
                                                className="bg-zinc-800 hover:bg-blue-600 text-white font-bold px-4 rounded-full h-8 text-xs transition-colors uppercase tracking-widest"
                                            >
                                                ENTRAR
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="bg-zinc-900/50 border-dashed border-zinc-800 rounded-3xl py-12">
                            <CardContent className="text-center">
                                <Activity className="h-20 w-20 mx-auto mb-4 text-zinc-800 animate-pulse" />
                                <p className="text-zinc-500 text-xl font-black uppercase tracking-widest">Sin Actividad Aún</p>
                                <Button variant="link" className="mt-4 text-blue-500 font-bold text-lg hover:text-blue-400">
                                    EXPLORAR NUEVOS RETOS
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
