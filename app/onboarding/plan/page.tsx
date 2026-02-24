'use client';

import { PricingSection } from "@/components/pricing-section";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function OnboardingPlanPage() {
    const { isAuthenticated, loading: authLoading, logout } = useAuth();
    const { company, loading: companyLoading } = useCompany();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, authLoading, router]);

    // If they already have an active plan, they shouldn't be here during onboarding
    useEffect(() => {
        if (company && (company.company_plan_status === 'active' || company.is_active)) {
            router.push('/dashboard');
        }
    }, [company, router]);

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
