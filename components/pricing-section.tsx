"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/contexts/AuthContext";
import { CompanyContext } from "@/contexts/CompanyContext";
import { api } from "@/lib/api/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ContactModal } from "@/components/contact-modal";

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/juancarlosjuarez26/30min';
const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/522381638747';
const SALES_EMAIL = process.env.NEXT_PUBLIC_SALES_EMAIL || 'info@fynlink.shop';

export function PricingSection({
    activePlanId,
    showHeaders = true,
    showBackground = true,
    companyId: manualCompanyId,
    companyPlanTrialUsed: manualTrialUsed
}: {
    activePlanId?: number | string | null,
    showHeaders?: boolean,
    showBackground?: boolean,
    companyId?: string | number | null,
    companyPlanTrialUsed?: boolean
}) {
    const [loadingPlan, setLoadingPlan] = useState<number | string | null>(null);
    const [fetchedPlans, setFetchedPlans] = useState<any[] | null>(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const authContext = useContext(AuthContext);
    const companyContext = useContext(CompanyContext);

    const token = authContext?.token;
    const companyFromContext = companyContext?.company;
    const companyId = manualCompanyId || companyFromContext?.id;
    const trialUsed = manualTrialUsed ?? companyFromContext?.company_plan_trial_used ?? false;

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await api.subscriptions.getPlans(token || undefined);
                if (response.success && Array.isArray(response.data) && response.data.length > 0) {
                    setFetchedPlans(response.data);
                }
            } catch (error) {
                console.error("Error fetching plans:", error);
            }
        };
        fetchPlans();
    }, [token]);

    const handleSubscribe = async (planId: number | string | null) => {
        console.log('handleSubscribe called with planId:', planId);

        // Enterprise plans (Pro/Empresa) - open contact modal instead
        // Plan 3 (Pro) and 4 (Empresa) are COTIZACIÓN
        if (planId === 3 || planId === 4) {
            console.log('Opening contact modal for Enterprise/Pro plan');
            setIsContactModalOpen(true);
            return;
        }

        if (!token || !companyId) {
            toast.error("Datos de empresa no encontrados. Por favor, reintenta.");
            console.error('Missing data:', { token: !!token, companyId });
            return;
        }

        if (planId === null) {
            toast.error("Plan no válido");
            return;
        }

        setLoadingPlan(planId);
        try {
            const response = await api.subscriptions.subscribe({
                company_id: companyId,
                plan_id: planId,
                interval: 'month', // Changed to month to match recurrente UI and backend types
                trial_days: trialUsed ? 0 : 7, // Give 7 days trial if not used
                success_url: window.location.origin + '/dashboard',
                cancel_url: window.location.origin + '/onboarding/compania'
            }, token);

            if (response.success && response.data?.checkout_url) {
                window.location.href = response.data.checkout_url;
            } else {
                toast.error(response.message || "Error al iniciar el proceso de pago");
            }
        } catch (error) {
            console.error("Subscription error:", error);
            toast.error("Ocurrió un error inesperado");
        } finally {
            setLoadingPlan(null);
        }
    };

    const plans = [
        {
            id: 2,
            name: 'Plan Básico',
            subtitle: 'Ideal para emprendedores y pequeños negocios',
            price: '200',
            period: '1er mes',
            description: 'Comienza a fidelizar a tus clientes hoy:',
            features: [
                'Programa de lealtad básico',
                'Hasta 500 clientes registrados',
                'Catálogo digital básico',
                'Pedidos por WhatsApp',
                '1 sucursal',
                'Cupones digitales (hasta 10)',
                'Soporte por email/WhatsApp'
            ],
            cta: 'Empezar ahora',
            popular: false,
            badge: 'PROMOCIÓN APERTURA',
            promo: 'Luego $200/mes'
        },
        {
            id: 3,
            name: 'Plan Pro',
            subtitle: 'Ecosistema completo y marca propia',
            price: 'COTIZACIÓN',
            period: 'personalizado',
            description: 'Lleva tu negocio al siguiente nivel:',
            features: [
                'Todo en el Plan Básico',
                'TU PROPIA APP NATIVA (Android & iOS)',
                'WhatsApp Business API con IA',
                'Clientes y productos ilimitados',
                'Hasta 10 sucursales',
                'Punto de venta (POS) avanzado',
                'Notificaciones push ilimitadas',
                'Analíticas avanzadas y SEO',
                'Soporte prioritario 24/7'
            ],
            cta: 'Cotizar Plan Pro',
            popular: true,
            badge: 'EL MÁS RECOMENDADO',
            promo: '¡Potencia tu marca al máximo!'
        },
        {
            id: 4,
            name: 'Plan Empresa',
            subtitle: 'Para cadenas y franquicias multinacionales',
            price: 'COTIZACIÓN',
            period: 'personalizado',
            description: 'Soluciones a medida para grandes escalas:',
            features: [
                'Todo lo de Pro sin límites',
                'Multi-marca y multi-empresa',
                'Integración con ERP / SAP',
                'Instalación en servidor propio (Opcional)',
                'Capacitación presencial',
                'Desarrollo de funciones a medida',
                'Gerente de cuenta dedicado',
                'API & Webhooks ilimitados'
            ],
            cta: 'Consultar con Ventas',
            popular: false,
            badge: 'MÁXIMA POTENCIA'
        }
    ];

    return (
        <>
            <div className="space-y-0 w-full">
                <section id="pricing" className={`${showHeaders ? 'py-24' : 'py-6'} relative overflow-hidden bg-transparent`}>
                    {/* Background Atmosphere */}
                    {showBackground && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
                            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
                            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-50 rounded-full blur-[120px] opacity-60"></div>
                        </div>
                    )}

                    <div className="max-w-7xl mx-auto px-0">
                        {showHeaders && (
                            <div className="text-center mb-20">
                                <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 text-xs font-black px-3 py-1 rounded-full mb-6 uppercase tracking-[0.2em] border border-green-100">
                                    <span>Planes Flexibles</span>
                                </div>
                                <h2 className="text-5xl md:text-6xl font-black text-[#0f172a] mb-6 tracking-tight">
                                    Impulsa tu crecimiento <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">con el plan perfecto</span>
                                </h2>

                                <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
                                    Elige la solución que mejor se adapte a tu etapa actual y escala sin límites con nuestra tecnología.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-full mx-auto items-stretch">
                            {plans.map((plan, index) => {
                                const isActive = activePlanId !== null &&
                                    activePlanId !== undefined &&
                                    String(plan.id) === String(activePlanId);

                                const isDisabled = loadingPlan !== null;

                                const getButtonText = () => {
                                    if (isActive) return 'PLAN ACTUAL';
                                    return plan.cta.toUpperCase();
                                };

                                return (
                                    <div
                                        key={index}
                                        id={plan.id === 3 ? "custom-plan" : undefined}
                                        className={`group relative bg-white rounded-[2.5rem] p-8 transition-all duration-500 flex flex-col h-full border ${plan.popular
                                            ? 'border-blue-200 shadow-[0_32px_64px_-16px_rgba(59,130,246,0.15)] ring-4 ring-blue-50/50 scale-[1.02] z-10'
                                            : 'border-slate-100 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.05)] hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] hover:-translate-y-2'
                                            }`}
                                    >
                                        <div className="mb-8">
                                            <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                                            <p className="text-slate-500 font-medium text-sm leading-relaxed">{plan.subtitle}</p>
                                        </div>

                                        <div className="mb-8">
                                            {plan.promo && (
                                                <div className="inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-black bg-blue-50 text-blue-600 border border-blue-100 mb-4 animate-pulse uppercase tracking-wider">
                                                    ★ {plan.promo}
                                                </div>
                                            )}

                                            <div className="h-32 flex flex-col justify-end">
                                                <div className="space-y-2">
                                                    <div className="flex items-baseline flex-wrap">
                                                        <span className="text-5xl font-black text-slate-900 tracking-tight">
                                                            {plan.price === 'COTIZACIÓN' ? 'Cotizar' : `$${plan.price}`}
                                                        </span>
                                                        {plan.price !== 'COTIZACIÓN' && (
                                                            <span className="ml-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest">MXN / {plan.period}</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                        {plan.price === 'COTIZACIÓN' ? 'Precio según necesidades' : 'Suscripción mensual recurrente'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <ul className="space-y-3 mb-10 flex-grow">
                                            {plan.features.map((feature: string, i: number) => {
                                                const isHighlight = feature.includes('Puntos') ||
                                                    feature.includes('APP') ||
                                                    feature.includes('ilimitados') ||
                                                    feature.includes('IA');
                                                return (
                                                    <li key={i} className="flex items-start group/item">
                                                        <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 transition-colors ${isHighlight
                                                            ? 'bg-blue-100 text-blue-600'
                                                            : 'bg-green-100 text-green-600'
                                                            }`}>
                                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                        <span className={`text-sm leading-tight transition-colors ${isHighlight
                                                            ? 'text-blue-700 font-bold'
                                                            : 'text-slate-600 group-hover/item:text-slate-900'
                                                            }`}>
                                                            {feature}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>

                                        <div className="mt-auto space-y-4">
                                            <div className="block w-full">
                                                <Button
                                                    disabled={isDisabled}
                                                    onClick={() => {
                                                        if (plan.price === 'COTIZACIÓN') {
                                                            setIsContactModalOpen(true);
                                                        } else {
                                                            handleSubscribe(plan.id);
                                                        }
                                                    }}
                                                    className={`w-full py-7 text-base font-black rounded-2xl transition-all duration-300 ${isDisabled
                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-none'
                                                        : plan.popular
                                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 shadow-[0_20px_40px_-12px_rgba(59,130,246,0.35)] hover:shadow-[0_20px_40px_-12px_rgba(59,130,246,0.45)] hover:-translate-y-1'
                                                            : 'bg-[#0f172a] text-white hover:bg-slate-800 shadow-xl hover:-translate-y-1'
                                                        }`}
                                                >
                                                    {loadingPlan === plan.id ? (
                                                        <Loader2 className="w-6 h-6 animate-spin" />
                                                    ) : getButtonText()}
                                                </Button>
                                            </div>

                                            <div className="flex flex-col items-center gap-2">
                                                {plan.badge && (
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-wider border border-slate-100">
                                                        <span>{plan.badge}</span>
                                                    </div>
                                                )}
                                                <div className="text-center space-y-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                                                        {plan.price === 'COTIZACIÓN' ? 'Contacta para preventa' : 'Cancela en cualquier momento'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Extras Section */}
                        <div className="mt-20 max-w-4xl mx-auto">
                            <div className="group relative bg-slate-50/50 backdrop-blur-sm border border-slate-100 rounded-[2.5rem] p-8 md:p-10">
                                <h3 className="text-2xl font-black text-[#0f172a] mb-8 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">
                                        +
                                    </div>
                                    Recursos Ilimitados
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="relative group/extra p-6 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-base font-black text-slate-900">Mensajería</p>
                                                <p className="text-xs font-medium text-slate-500">WhatsApp & Notificaciones</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-emerald-600">UNLIMITED</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desbloqueado</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative group/extra p-6 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-base font-black text-slate-900">Email Marketing</p>
                                                <p className="text-xs font-medium text-slate-500">Campañas y avisos</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-emerald-600">UNLIMITED</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desbloqueado</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


            </div>

            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                whatsappUrl={WHATSAPP_URL}
                salesEmail={SALES_EMAIL}
                calendlyUrl={CALENDLY_URL}
            />
        </>
    );
}
