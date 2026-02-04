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
const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/521234567890';
const SALES_EMAIL = process.env.NEXT_PUBLIC_SALES_EMAIL || 'info@fynlink.shop';

export function PricingSection({ activePlanId }: { activePlanId?: number | string | null }) {
    const [loadingPlan, setLoadingPlan] = useState<number | string | null>(null);
    const [fetchedPlans, setFetchedPlans] = useState<any[] | null>(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const authContext = useContext(AuthContext);
    const companyContext = useContext(CompanyContext);

    const token = authContext?.token;
    const company = companyContext?.company;

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

        // Enterprise plan - open contact modal instead
        if (planId === 3) {
            console.log('Opening contact modal for Enterprise plan');
            setIsContactModalOpen(true);
            return;
        }

        if (!token || !company) {
            toast.error("Debes iniciar sesión para suscribirte");
            return;
        }

        if (planId === 1 || planId === null) {
            // Plan básico is typically free/default.
            // If the user is on a paid plan and downgrades, you might need a specific API call or just redirect.
            // For now, we'll assume subscribing to Basic (free) is either a no-op or handled differently.
            toast.info("El plan básico es gratuito.");
            return;
        }

        const isTrialUsed = company?.company_plan_trial_used || false;

        setLoadingPlan(planId);
        try {
            const response = await api.subscriptions.subscribe({
                company_id: company.id,
                plan_id: planId,
                interval: 'lifetime' as any, // Changed to lifetime ownership model
                trial_days: 0, // No trials for lifetime ownership
                success_url: window.location.origin + '/dashboard/subscription/success?session_id={CHECKOUT_SESSION_ID}',
                cancel_url: window.location.origin + '/dashboard/suscripcion/planes'
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
            id: 1,
            name: 'Licencia Starter',
            subtitle: 'Ideal para elevar tu marca propia',
            price: '14,999',
            monthlyFrom: '1,250',
            installments: '12',
            period: 'de por vida',
            description: 'Acceso vitalicio a las herramientas core:',
            features: [
                'Todo desbloqueado desde el día 1',
                'Tu propio Dominio (.com / .com.mx)',
                'Sitio web profesional con carrito',
                'Pedidos ilimitados por WhatsApp',
                'Catálogo digital interactivo',
                'Punto de venta (POS) completo',
                'Programa de lealtad vitalicio',
                'Cupones digitales ilimitados',
                'Hasta 5 sucursales',
                'Soporte técnico por 2 años',
                'Actualizaciones de seguridad incluidas'
            ],
            cta: 'Comprar Licencia Vitalicia',
            popular: false,
            badge: 'PAGO ÚNICO'
        },
        {
            id: 2,
            name: 'Ecosistema Premium',
            subtitle: 'Tu propia APP en Stores y control absoluto',
            price: '49,999',
            monthlyFrom: '4,167',
            installments: '12',
            period: 'de por vida',
            description: 'Todo en Starter, más tu propia tecnología nativa:',
            features: [
                'TU PROPIA APP NATIVA (Android & iOS)',
                'Publicación en App Store y Play Store',
                'Diseño personalizado de tu marca',
                'WhatsApp Business API con IA vitalicio',
                'Chatbot inteligente 24/7',
                'Dominio y correo profesional propio',
                'Todo lo demás desbloqueado para siempre',
                'Hasta 20 sucursales',
                'Notificaciones push ilimitadas',
                'Pagos con Stripe & Mercado Pago (0% comisión nuestra)',
                'Analíticas avanzadas y SEO premium',
                'Soporte prioritario de por vida',
                'Actualizaciones y nuevas features incluidas'
            ],
            cta: 'Obtener mi Ecosistema',
            popular: true,
            badge: 'EL MÁS ELEGIDO - PAGO ÚNICO',
            promo: '¡Ahorra $180,000/año en suscripciones!'
        },
        {
            id: 3,
            name: 'White Label / Enterprise',
            subtitle: 'Para cadenas y franquicias multinacionales',
            price: '149,999',
            monthlyFrom: '12,500',
            installments: '12',
            period: 'de por vida',
            description: 'Propiedad total del sistema:',
            features: [
                'Todo lo de Premium sin límites',
                'Sucursales y Staff ilimitados',
                'Multi-marca (varias marcas en un solo sistema)',
                'API & Webhooks avanzados',
                'Instalación en tu propio servidor (on-premise)',
                'Propiedad completa de la base de datos',
                'Integración con sistemas externos (ERP/SAP/CRM)',
                'Capacitación presencial para tu equipo',
                'Desarrollo de features personalizadas',
                'Soporte dedicado 24/7 con SLA garantizado',
                'Acceso al código fuente (opcional)',
                'Consultoría estratégica incluida',
                'Migración de datos sin costo'
            ],
            cta: 'Consultar Propiedad Total',
            popular: false,
            badge: 'PROPIEDAD TOTAL',
            promo: 'Ahorra +$500,000/año vs competencia'
        }
    ];

    return (
        <>
            <div className="space-y-0">
                <section id="pricing" className="py-24 relative overflow-hidden bg-white">
                    {/* Background Atmosphere */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
                        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full blur-[120px] opacity-60"></div>
                        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-50 rounded-full blur-[120px] opacity-60"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <div className="inline-flex items-center space-x-2 bg-slate-100 text-slate-800 text-xs font-black px-3 py-1 rounded-full mb-6 uppercase tracking-[0.2em] border border-slate-200">
                                <span>Sin Suscripciones</span>
                            </div>
                            <h2 className="text-5xl md:text-6xl font-black text-[#0f172a] mb-6 tracking-tight">
                                Un solo pago, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">dueño para siempre</span>
                            </h2>

                            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
                                Olvídate de las rentas mensuales. Adquiere el ecosistema completo y llévate todo desbloqueado desde el primer día.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                            {plans.map((plan, index) => {
                                const isActive = activePlanId !== null &&
                                    activePlanId !== undefined &&
                                    String(plan.id) === String(activePlanId);

                                const isDisabled = loadingPlan !== null;

                                const getButtonText = () => {
                                    if (isActive) return 'MI PROPIEDAD';
                                    return plan.cta.toUpperCase();
                                };

                                return (
                                    <div
                                        key={index}
                                        className={`group relative bg-white rounded-[2.5rem] p-8 transition-all duration-500 flex flex-col h-full border ${plan.popular
                                            ? 'border-green-200 shadow-[0_32px_64px_-16px_rgba(34,197,94,0.15)] ring-4 ring-green-50/50 scale-[1.02] z-10'
                                            : 'border-slate-100 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.05)] hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] hover:-translate-y-2'
                                            }`}
                                    >
                                        <div className="mb-8">
                                            <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                                            <p className="text-slate-500 font-medium text-sm leading-relaxed">{plan.subtitle}</p>
                                        </div>

                                        <div className="mb-8">
                                            {plan.promo && (
                                                <div className="inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 mb-4 animate-pulse uppercase tracking-wider">
                                                    ★ {plan.promo}
                                                </div>
                                            )}

                                            <div className="h-32 flex flex-col justify-end">
                                                <div className="space-y-2">
                                                    <div className="flex items-baseline flex-wrap">
                                                        <span className="text-5xl font-black text-slate-900 tracking-tight">
                                                            ${plan.price}
                                                        </span>
                                                        <span className="ml-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest">MXN / Vitalicio</span>
                                                    </div>
                                                    <div className="text-xs font-bold text-green-600 flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                        Pago único — Sin rentas
                                                    </div>
                                                    {plan.monthlyFrom && (
                                                        <div className="pt-2 border-t border-slate-100">
                                                            <p className="text-sm text-slate-600">
                                                                o desde <span className="font-black text-blue-600">${plan.monthlyFrom}/mes</span>
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                                Hasta {plan.installments} MSI con tarjetas participantes
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <ul className="space-y-3 mb-10 flex-grow">
                                            {plan.features.map((feature: string, i: number) => {
                                                const isHighlight = feature.includes('Puntos') ||
                                                    feature.includes('APP') ||
                                                    feature.includes('vitalicio') ||
                                                    feature.includes('desbloqueado') ||
                                                    feature.includes('Propiedad');
                                                return (
                                                    <li key={i} className="flex items-start group/item">
                                                        <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 transition-colors ${isHighlight
                                                            ? 'bg-purple-100 text-purple-600'
                                                            : 'bg-green-100 text-green-600'
                                                            }`}>
                                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                        <span className={`text-sm leading-tight transition-colors ${isHighlight
                                                            ? 'text-purple-700 font-bold'
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
                                                    onClick={() => handleSubscribe(plan.id)}
                                                    className={`w-full py-7 text-base font-black rounded-2xl transition-all duration-300 ${isDisabled
                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-none'
                                                        : plan.popular
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-[0_20px_40px_-12px_rgba(34,197,94,0.35)] hover:shadow-[0_20px_40px_-12px_rgba(34,197,94,0.45)] hover:-translate-y-1'
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
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-wider border border-green-100">
                                                        <span>{plan.badge}</span>
                                                    </div>
                                                )}
                                                <div className="text-center space-y-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                                                        Inversión única • Propiedad total de tu tecnología
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
