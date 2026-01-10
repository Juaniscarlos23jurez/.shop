"use client";

import { PricingSection } from "@/components/pricing-section";
import { useCompany } from "@/contexts/CompanyContext";

export default function PlanesPage() {
    const { company, loading } = useCompany();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    const activePlanId = company?.company_plan_id || company?.plan?.plan_id;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
                <h1 className="text-3xl font-black text-gray-900 mb-2">Planes de Suscripción</h1>
                <p className="text-gray-500 font-medium">Elige el plan que mejor se adapte a tu crecimiento.</p>
            </div>
            <PricingSection activePlanId={activePlanId} />
        </div>
    );
}
