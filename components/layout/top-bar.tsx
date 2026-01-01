"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, Search, MessageSquarePlus, ChevronLeft, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api/api";

interface TopBarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

export function TopBar({ isCollapsed, setIsCollapsed }: TopBarProps) {
    const { user, logout, token } = useAuth();
    const router = useRouter();
    const [companySlug, setCompanySlug] = useState<string | null>(null);

    const slugifyCompanyName = (name: string) => {
        return name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    useEffect(() => {
        const fetchCompanySlug = async () => {
            try {
                if (!token) return;
                const response = await api.userCompanies.get(token);
                if (response.success && response.data?.data?.name) {
                    const name = response.data.data.name;
                    setCompanySlug(slugifyCompanyName(name));
                }
            } catch (error) {
                console.error('[TopBar] Error fetching company slug', error);
            }
        };
        fetchCompanySlug();
    }, [token]);

    const getUserInitials = (name?: string, email?: string) => {
        if (name) {
            return name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
        }
        if (email) {
            return email.substring(0, 2).toUpperCase();
        }
        return 'US';
    };

    return (
        <header className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-6 z-50 shrink-0 shadow-sm transition-all duration-300">
            {/* Left side: Logo, Title, Toggle */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-slate-500 hover:bg-slate-100 rounded-xl"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        <ChevronLeft className={`h-6 w-6 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                    </Button>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex-shrink-0 bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center p-0.5">
                            <img
                                src="/logorewa.png"
                                alt="Logo"
                                className="w-full h-full object-contain rounded-lg"
                            />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold text-slate-900 leading-tight">Dashboard</h1>
                            {companySlug && (
                                <Link
                                    href={`https://fynlink.shop/rewin/${companySlug}`}
                                    target="_blank"
                                    className="text-[10px] font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 uppercase tracking-wider"
                                >
                                    Abrir tienda <ExternalLink className="h-2 w-2" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>


            </div>

            {/* Right side: Feedback, Profile, Logout */}
            <div className="flex items-center space-x-2 md:space-x-4">
                {/* Feedback Button */}
                <FeedbackButton variant="navbar" />

                <div className="h-10 w-[1px] bg-slate-100 mx-1 hidden md:block" />

                <div className="flex items-center space-x-3 group cursor-pointer">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">
                            {user?.firebase_name || 'Usuario'}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                            {user?.firebase_email || 'usuario@ejemplo.com'}
                        </p>
                    </div>

                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                        <AvatarImage src="/placeholder-user.jpg" alt={user?.firebase_name || 'User'} />
                        <AvatarFallback className="bg-emerald-50 text-emerald-600 font-bold">
                            {getUserInitials(user?.firebase_name, user?.firebase_email)}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 h-10 w-10 rounded-xl transition-all"
                    onClick={async () => {
                        await logout();
                        router.push('/auth/login');
                    }}
                    title="Cerrar sesión"
                >
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}
