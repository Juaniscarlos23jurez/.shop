'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { subscriptionApi } from '@/lib/api/api';
import {
    Settings,
    CreditCard,
    Trash2,
    ExternalLink,
    MessageCircle,
    ShieldCheck,
    AlertCircle,
    Receipt,
    XCircle,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';

export default function GestionSuscripcionPage() {
    const { token } = useAuth();
    const { company, getPlanName } = useCompany();
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState<any[]>([]);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                // Now using correctly exported subscriptionApi
                const response = await subscriptionApi.getPlans(token || undefined);
                if (response.success) {
                    const plansData = Array.isArray(response.data)
                        ? response.data
                        : (response.data?.data || []);
                    setPlans(Array.isArray(plansData) ? plansData : []);
                }
            } catch (error) {
                console.error('Error fetching plans:', error);
            }
        };
        if (token) fetchPlans();
    }, [token]);

    const handleManageSubscription = async () => {
        if (!token || !company?.id) {
            toast.error('No se pudo identificar la compañía o sesión');
            return;
        }

        setLoading(true);
        try {
            // pass current window.location.href as return_url for a better UX
            const response = await subscriptionApi.getPortalUrl(company.id, token, window.location.href);

            // The API returns portal_url or url depending on version
            const redirectUrl = response.data?.portal_url || response.data?.url;

            if (response.success && redirectUrl) {
                // Use window.location.href for absolute external redirect
                window.location.href = redirectUrl;
            } else {
                toast.error(response.message || 'No se pudo generar el enlace de facturación');
            }
        } catch (error) {
            console.error('Portal error:', error);
            toast.error('Ocurrió un error al intentar acceder al portal');
        } finally {
            setLoading(false);
        }
    };

    // Robust plan name detection
    const activePlanId = company?.company_plan_id || company?.plan?.plan_id;
    const activePlanFromList = plans.find(p => String(p.id) === String(activePlanId));
    const displayPlanName = activePlanFromList?.name || getPlanName();

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Settings className="w-8 h-8 text-green-500" />
                    Mi Suscripción
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Gestiona tu plan actual, métodos de pago y facturación.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan Actual */}
                <Card className="border-t-4 border-t-green-500 shadow-md">
                    <CardHeader>
                        <CardTitle>Plan Actual</CardTitle>
                        <CardDescription>Detalles de tu suscripción activa</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">Estado</p>
                                <p className="text-xl font-bold text-green-700 dark:text-green-300">
                                    {(company?.company_plan_status === 'active' || company?.is_active) ? 'Activo' : 'Inactivo'}
                                </p>
                            </div>
                            <ShieldCheck className="w-10 h-10 text-green-500" />
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Plan</p>
                            <p className="text-lg font-semibold">{displayPlanName || 'Cargando...'}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Próximo pago / Vencimiento</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                {company?.company_plan_expires_at
                                    ? new Date(company.company_plan_expires_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
                                    : (company?.company_plan_status === 'active' ? 'Suscripción activa' : 'N/A')}
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            variant="outline"
                            className="w-full flex items-center gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all"
                            onClick={() => window.location.href = '/dashboard/suscripcion/planes'}
                        >
                            Cambiar de Plan
                        </Button>
                    </CardFooter>
                </Card>

                {/* Administrar Mi Suscripción */}
                <Card className="shadow-lg border-blue-50 dark:border-blue-900/20 overflow-hidden flex flex-col">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-100 dark:border-blue-900/30">
                        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                            <CreditCard className="w-5 h-5" />
                            Pagos y Facturación
                        </CardTitle>
                        <CardDescription className="text-blue-700/70 dark:text-blue-300/70 font-medium">
                            Portal seguro para gestionar tu cuenta
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6 flex-grow">
                        <div className="grid grid-cols-1 gap-4">
                            {/* Bajar Facturas */}
                            <div className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all group">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">Bajar facturas PDF</p>
                                    <p className="text-xs text-slate-500">Historial completo de tus pagos</p>
                                </div>
                            </div>

                            {/* Cambiar Tarjeta */}
                            <div className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all group">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">Cambiar tarjeta</p>
                                    <p className="text-xs text-slate-500">Actualiza tu método de pago</p>
                                </div>
                            </div>

                            {/* Cancelar Suscripción */}
                            <div className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-red-100 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-all group">
                                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                                    <XCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-red-700 dark:text-red-400 leading-tight">Cancelar Plan</p>
                                    <p className="text-xs text-red-600/70">Cancela tu suscripción al instante</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <ShieldCheck className="w-3 h-3" />
                                Seguridad Garantizada
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                Usamos la tecnología de <span className="font-bold text-slate-900 dark:text-slate-200">Stripe</span> (líder mundial en pagos) para que tus datos bancarios estén siempre protegidos y nunca toquen nuestros servidores.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                        <Button
                            className="w-full bg-[#635BFF] hover:bg-[#5851e5] text-white flex items-center justify-center gap-3 py-8 text-lg font-black transition-all shadow-[0_20px_40px_-12px_rgba(99,91,255,0.4)] hover:shadow-[0_20px_40px_-12px_rgba(99,91,255,0.5)] hover:-translate-y-1 rounded-2xl"
                            onClick={handleManageSubscription}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    Abrir Portal de Pagos
                                    <ExternalLink className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Reembolsos */}
            <Card className="bg-gray-50 dark:bg-gray-900/20 border-dashed">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        Política de Reembolsos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        ¿Cometiste un error o no estás satisfecho? Si solicitas tu reembolso dentro de los primeros 7 días de tu suscripción, procesaremos la devolución total sin preguntas.
                    </p>
                    <div className="mt-4 flex flex-col md:flex-row items-center gap-4">
                        <FeedbackButton
                            variant="custom"
                            initialType="general"
                            initialSubject="Reembolso"
                            hideTypeSelect={true}
                            customTitle="Solicitar Reembolso"
                            customDescription="Cuéntanos por qué solicitas el reembolso. Procesaremos tu solicitud en menos de 24 horas."
                        >
                            <Button
                                variant="link"
                                className="text-red-500 p-0 flex items-center gap-2 font-semibold"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Solicitar Reembolso por Ticket
                            </Button>
                        </FeedbackButton>
                        <span className="hidden md:inline text-gray-300">|</span>
                        <p className="text-xs text-gray-500 italic">
                            Tiempo estimado de respuesta: Menos de 24 horas.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
