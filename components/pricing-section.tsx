"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/contexts/AuthContext";
import { CompanyContext } from "@/contexts/CompanyContext";
import { api } from "@/lib/api/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/juancarlosjuarez26/30min';
const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/521234567890';

export function PricingSection({ activePlanId }: { activePlanId?: number | string | null }) {
    const [loadingPlan, setLoadingPlan] = useState<number | string | null>(null);
    const [fetchedPlans, setFetchedPlans] = useState<any[] | null>(null);
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
            price: '4,999',
            period: 'de por vida',
            description: 'Acceso vitalicio a las herramientas core:',
            features: [
                'Todo desbloqueado desde el día 1',
                'Tu propio Dominio (.com / .com.mx)',
                'Pedidos ilimitados por WhatsApp',
                'Catálogo digital interactivo',
                'Punto de venta (POS) incluido',
                'Programa de lealtad vitalicio',
                'Cupones digitales ilimitados',
                'Hasta 3 sucursales',
                'Soporte técnico por 1 año'
            ],
            cta: 'Comprar Licencia Vitalicia',
            popular: false,
            badge: 'PAGO ÚNICO'
        },
        {
            id: 2,
            name: 'Ecosistema Premium',
            subtitle: 'Tu propia APP en Stores y control absoluto',
            price: '14,999',
            period: 'de por vida',
            description: 'Todo en Starter, más tu propia tecnología nativa:',
            features: [
                'TU PROPIA APP (Android & iOS)',
                'Publicación en App Store y Play Store',
                'WhatsApp y chatbot con IA vitalicio',
                'Dominio y correo profesional propio',
                'Todo lo demás desbloqueado para siempre',
                'Hasta 10 sucursales',
                'Notificaciones push ilimitadas',
                'Pagos con Stripe & Mercado Pago',
                'Analíticas y SEO avanzado',
                'Soporte prioritario de por vida',
                'Actualizaciones gratuitas garantizadas'
            ],
            cta: 'Obtener mi Ecosistema',
            popular: true,
            badge: 'EL MÁS ELEGIDO - PAGO ÚNICO',
            promo: '¡Propiedad total!'
        },
        {
            id: 3,
            name: 'White Label / Enterprise',
            subtitle: 'Para cadenas y franquicias multinacionales',
            price: '29,999',
            period: 'de por vida',
            description: 'Propiedad total del sistema:',
            features: [
                'Todo lo de Premium sin límites',
                'Sucursales y Staff ilimitados',
                'API & Webhooks avanzados',
                'Instalación en tu propio servidor si lo prefieres',
                'Propiedad de la base de datos de clientes',
                'Integración con sistemas externos (ERP/SAP)',
                'Capacitación presencial/virtual para tu equipo',
                'Update prioritario de funciones personalizadas',
                'Soporte dedicado 24/7',
                'Repositorio de código fuente opcional'
            ],
            cta: 'Consultar Propiedad Total',
            popular: false,
            badge: 'PROPIEDAD TOTAL',
            promo: 'Control Absoluto'
        }
    ];

    return (
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

                                        <div className="h-24 flex flex-col justify-end">
                                            <div className="space-y-1">
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

            {/* Custom Plan Section */}
            <section id="custom-plan" className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,transparent)]"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center space-x-2 bg-purple-500/20 text-purple-200 text-base font-medium px-4 py-2 rounded-full mb-6 backdrop-blur-sm border border-purple-400/20">
                            <span className="text-xl">🏢</span>
                            <span>Solución Empresarial</span>
                        </div>
                        <h2 className="text-5xl font-black mb-6">
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Propiedad Total del Código</span>
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Para empresas que necesitan control absoluto. Te entregamos el sistema completo para que lo operes en tu propia infraestructura de por vida.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                        {/* Right Side - Features */}
                        <div className="space-y-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">App Dedicada & Código Fuente</h3>
                                        <p className="text-gray-300">Tu propia aplicación nativa y acceso al código para personalizaciones infinitas.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Sistema Independiente</h3>
                                        <p className="text-gray-300">Servidores dedicados y base de datos propia. Sin dependencias externas.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Mockup placeholder (reusing the logic from before but cleaner) */}
                        <div className="relative group/mockup flex justify-center">
                            <div className="w-64 h-[500px] bg-black rounded-[3rem] p-3 shadow-2xl relative z-10 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-4xl mb-4">👑</div>
                                        <p className="text-white font-black">TU MARCA</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl p-8 backdrop-blur-sm border border-purple-400/20">
                            <h3 className="text-3xl font-bold mb-4">¿Listo para ser dueño de tu tecnología?</h3>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link href="#contact">
                                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                                        Contactar Ventas
                                    </Button>
                                </Link>
                                <Link href={WHATSAPP_URL} target="_blank">
                                    <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-slate-900">
                                        Hablar por WhatsApp
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
