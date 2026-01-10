"use client";

import { useCompany } from "@/contexts/CompanyContext";
import { PaymentHistory } from "@/components/company/payment-history";

export default function FacturasPage() {
    const { company, loading } = useCompany();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 pb-12 pt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <h1 className="text-3xl font-black text-gray-900 mb-2">Historial de Facturación</h1>
                <p className="text-gray-500 font-medium mb-8">Consulta y descarga tus recibos anteriores.</p>

                {company && <PaymentHistory companyId={company.id} />}
            </div>
        </div>
    );
}
