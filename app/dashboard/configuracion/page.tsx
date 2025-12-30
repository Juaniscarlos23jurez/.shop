"use client";

import { useState, useEffect } from "react";
import { PricingSection } from "@/components/pricing-section";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api/api";
import { Badge } from "@/components/ui/badge";

export default function ConfiguracionPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState<any>(null);

  useEffect(() => {
    async function fetchCompany() {
      if (!token) return;
      try {
        const response = await api.userCompanies.get(token);
        if (response.success && response.data) {
          // Adjust based on the structure provided in USER_REQUEST
          // result shape: { status: "success", data: { ... } }
          setCompanyData(response.data.data || response.data);
        }
      } catch (error) {
        console.error("Error fetching company:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCompany();
  }, [token]);

  const getPlanName = (planId: number | string | null) => {
    if (planId === null || planId === undefined) return "Básico";
    if (String(planId) === "1") return "Premium";
    if (String(planId) === "2") return "Business";
    return "Personalizado";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const activePlanId = companyData?.company_plan_id || companyData?.plan?.plan_id;

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
              {getPlanName(activePlanId)}
            </Badge>
          </div>
        </div>
      </div>
      <PricingSection activePlanId={activePlanId} />
    </div>
  );
}
