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
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

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

                {/* Facturación y Pagos */}
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-blue-500" />
                            Facturación y Pagos
                        </CardTitle>
                        <CardDescription>Portal seguro de autoservicio</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                Cambiar de tarjeta y métodos de pago.
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                Ver historial de cobros realizados.
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                Descargar facturas en formato PDF.
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-blue-700 dark:text-blue-300 leading-tight">
                                Serás redirigido al portal de Stripe para gestionar tus datos de forma privada.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-6 text-lg font-semibold transition-all shadow-lg shadow-blue-200 dark:shadow-none"
                            onClick={handleManageSubscription}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    Gestionar en Stripe
                                    <ExternalLink className="w-5 h-5" />
                                </>
                            )}
                        </Button>

                        <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-medium mt-2">
                            Seguridad de nivel bancario por Stripe
                        </p>
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
                        <Button
                            variant="link"
                            className="text-red-500 p-0 flex items-center gap-2 font-semibold"
                            onClick={() => window.location.href = 'mailto:soporte@tuapp.com'}
                        >
                            <MessageCircle className="w-4 h-4" />
                            Solicitar Reembolso por Correo
                        </Button>
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
