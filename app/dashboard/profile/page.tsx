"use client";

import { useCompany } from "@/contexts/CompanyContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, Settings, User } from "lucide-react";
import { PaymentHistory } from "@/components/company/payment-history";
import GestionContent from "@/app/dashboard/suscripcion/gestion/page";

export default function ProfilePage() {
    const { company, loading } = useCompany();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 pb-12 pt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-100 p-3 rounded-xl">
                        <User className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Profile</h1>
                        <p className="text-gray-500 font-medium">Gestiona tus facturas y la configuración de tu cuenta.</p>
                    </div>
                </div>

                <Tabs defaultValue="facturas" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8 bg-white border border-slate-200 h-14 rounded-xl p-1">
                        <TabsTrigger 
                            value="facturas" 
                            className="flex items-center gap-2 h-full rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all"
                        >
                            <Receipt className="w-4 h-4" />
                            Facturas
                        </TabsTrigger>
                        <TabsTrigger 
                            value="gestion" 
                            className="flex items-center gap-2 h-full rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all"
                        >
                            <Settings className="w-4 h-4" />
                            Gestionar
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="facturas" className="mt-0 outline-none">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Historial de Facturación</h2>
                                <p className="text-gray-500">Consulta y descarga tus recibos anteriores.</p>
                            </div>
                            {company && <PaymentHistory companyId={company.id} />}
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="gestion" className="mt-0 outline-none">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <GestionContent />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
