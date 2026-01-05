"use client";

import { PricingSection } from "@/components/pricing-section";
import { Badge } from "@/components/ui/badge";
import { useCompany } from "@/contexts/CompanyContext";

export default function ConfiguracionPage() {
  const { company, loading, getPlanName } = useCompany();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const activePlanId = company?.company_plan_id || company?.plan?.plan_id;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Configuración de suscripción</h1>
            <p className="text-gray-500 text-sm">Administra tu plan y facturación</p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-100">
            <span className="text-sm font-medium text-green-800">Usando el plan:</span>
            <Badge className="bg-green-600 hover:bg-green-700 text-white border-none px-3">
              {getPlanName()}
            </Badge>
          </div>
        </div>
      </div>
      <PricingSection activePlanId={activePlanId} />
    </div>
  );
}
