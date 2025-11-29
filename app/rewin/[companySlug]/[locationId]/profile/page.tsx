"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as Lucide from 'lucide-react';
const { User, Calendar, Heart, MapPin, ArrowLeft, Store, Gift, Loader2, Phone } = Lucide as any;
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
        router.push(`/rewin/${targetSlug}`);
    };

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('customer_token');
            if (!token) {
                router.push(`/${companySlug}/${locationId}/auth/login`);
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
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Link href={`/rewin/${companySlug}/${locationId}`}>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="font-bold text-lg">Mi Perfil</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
                {/* User Info Card */}
                <Card className="border-none shadow-md overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
                    <CardContent className="relative pt-0 pb-8 px-6">
                        <div className="-mt-12 mb-4 flex justify-between items-end">
                            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                                <AvatarImage src={user.profile_photo_path || user.avatar_url || user.photo_url} />
                                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl">
                                    {user.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                                </AvatarFallback>
                            </Avatar>

                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                            <p className="text-gray-500 flex items-center gap-2 mt-1">
                                <User className="h-4 w-4" />
                                {user.email}
                            </p>
                            {user.phone && (
                                <p className="text-gray-500 flex items-center gap-2 mt-1">
                                    <Phone className="h-4 w-4" />
                                    {user.phone}
                                </p>
                            )}
                            {(user.city || user.state || user.country) && (
                                <p className="text-gray-500 flex items-center gap-2 mt-1">
                                    <MapPin className="h-4 w-4" />
                                    {[
                                        user.city?.name,
                                        user.state?.name,
                                        user.country?.name
                                    ].filter(Boolean).join(', ')}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Important Dates Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Gift className="h-5 w-5 text-pink-500" />
                                Cumpleaños
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="birthday">Fecha de nacimiento</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="birthday"
                                        type="date"
                                        value={birthday}
                                        onChange={(e) => setBirthday(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button size="sm" variant="secondary">Guardar</Button>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Te enviaremos regalos especiales en tu día.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Calendar className="h-5 w-5 text-purple-500" />
                                Fecha Importante
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <Heart className="h-5 w-5 text-red-500" />
                                        <div>
                                            <p className="font-medium text-sm">Aniversario</p>
                                            <p className="text-xs text-gray-500">Sin fecha definida</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-emerald-600">Agregar</Button>
                                </div>
                                <Button variant="outline" className="w-full border-dashed text-gray-500 hover:text-gray-700">
                                    + Agregar otra fecha
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Followed Stores Section */}
                <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Store className="h-6 w-6 text-emerald-600" />
                        Tiendas Seguidas
                    </h3>

                    {followedCompanies.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {followedCompanies.map((company) => (
                                <Card
                                    key={company.id}
                                    className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border-emerald-100/50"
                                    onClick={() => handleOpenCompany(company)}
                                >
                                    <div className="h-24 bg-gray-100 relative">
                                        {company.banner_url ? (
                                            <img src={company.banner_url} alt="Banner" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200" />
                                        )}
                                        <div className="absolute -bottom-6 left-4">
                                            <Avatar className="h-16 w-16 border-4 border-white shadow-md">
                                                <AvatarImage src={company.logo_url} />
                                                <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                                                    {company.name?.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </div>
                                    <CardContent className="pt-8 pb-4 px-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-lg leading-tight mb-1 group-hover:text-emerald-600 transition-colors">
                                                    {company.name}
                                                </h4>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {company.city || 'Ubicación desconocida'}
                                                </p>
                                            </div>
                                            {company.points_balance !== undefined && (
                                                <div className="text-right">
                                                    <span className="block text-sm font-bold text-emerald-600">
                                                        {company.points_balance} pts
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
                                            <span className="text-xs text-gray-400">
                                                Miembro desde {new Date(company.following_since || Date.now()).getFullYear()}
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="h-7 text-xs"
                                            >
                                                Ver Tienda
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-dashed">
                            <CardContent className="p-12 text-center text-gray-500">
                                <Store className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Aún no sigues a ninguna tienda.</p>
                                <Button variant="link" className="mt-2 text-emerald-600">
                                    Explorar tiendas cercanas
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
