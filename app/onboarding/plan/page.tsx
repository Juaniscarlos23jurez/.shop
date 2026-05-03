'use client';

import { PricingSection } from "@/components/pricing-section";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function OnboardingPlanPage() {
    const { isAuthenticated, loading: authLoading, logout, user } = useAuth();
    const { company, loading: companyLoading } = useCompany();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, authLoading, router]);

    // If they already have an active plan (or trial), they shouldn't be here during onboarding
    useEffect(() => {
        if (!companyLoading && company?.id && (company.company_plan_status === 'active' || company.company_plan_status === 'trialing' || company.plan_is_active === true)) {
            router.push('/dashboard');
        }
    }, [company, companyLoading, router]);

    // If no company found after loading, go back to step 1
    useEffect(() => {
        if (!companyLoading && !company?.id && !authLoading && isAuthenticated) {
            router.push('/onboarding/compania');
        }
    }, [company, companyLoading, authLoading, isAuthenticated, router]);

    if (authLoading || companyLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-lg bg-[#22c55e] flex items-center justify-center">
                                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-900">Fynlink+</span>
                        </div>
                        <Button variant="ghost" onClick={logout} className="text-gray-600 flex items-center gap-2">
                            <LogOut className="w-4 h-4" />
                            Cerrar sesión
                        </Button>
                    </div>
                </div>
            </header>

            <main>
                <div className="py-12 bg-green-50/50">
                    <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
                        <div className="flex flex-col items-center gap-2 mb-6">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-green-100 text-sm font-medium text-gray-700 animate-in fade-in slide-in-from-top-4 duration-700">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="opacity-70">Sesión de</span>
                                <span className="font-bold text-slate-900">{user?.firebase_name || user?.firebase_email}</span>
                                <span className="text-gray-300 mx-1">|</span>
                                <span className="font-bold text-emerald-600 uppercase tracking-tight">{company?.name || 'Cargando empresa...'}</span>
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900">¡Casi listo! Elige tu plan</h1>
                        <p className="text-gray-600">
                            Para comenzar a usar tu dashboard y todas las herramientas de Fynlink+, selecciona el plan que mejor se adapte a tu negocio.
                        </p>
                    </div>
                </div>

                <PricingSection activePlanId={company?.company_plan_id} />

                <div className="pb-20 text-center">
                    <p className="text-sm text-gray-400">
                        ¿Necesitas ayuda? <a href="mailto:soporte@fynlink.shop" className="underline font-medium">Contacta a soporte</a>
                    </p>
                </div>
            </main>
        </div>
    );
}
