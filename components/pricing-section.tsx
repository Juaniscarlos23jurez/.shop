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

export function PricingSection({ activePlanId }: { activePlanId?: number | string | null }) {
    const [isYearly, setIsYearly] = useState(false);
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
                interval: isYearly ? 'year' : 'month',
                // Premium plan (ID 2) gets 30 days free trial only if not used before
                trial_days: (planId === 2 && !isTrialUsed) ? 30 : 0,
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
            id: 1, // Basic is ID 1
            name: 'Básico',
            subtitle: 'Para aficionados',
            price: '0',
            period: 'mes',
            yearlyPrice: '0',
            description: 'Perfecto para comenzar',
            features: [
                'Pedidos ilimitados por WhatsApp',
                'Sin comisiones',
                'Sube hasta 15 productos',
                'Hasta 2 sucursales',
                'Tu compañia disponible en la web',
                'Punto de venta',
                'Puntos para tus clientes',
                'Cupones para tus clientes'
            ],
            cta: 'Plan Básico',
            popular: false,
            badge: null
        },
        {
            id: 2, // Premium is ID 2
            name: 'Premium',
            subtitle: 'Para emprendedores independientes',
            price: '300',
            period: 'mes',
            yearlyPrice: '2700',
            yearlyMonthly: '225',
            description: 'Todo en Basic, además:',
            features: [
                'Productos ilimitados',
                'Dominio y correo electrónico propios',
                'Hasta 5 sucursales',
                'WhatsApp y chatbot con IA: comunicación instantánea y automatizada con tus clientes.',
                'Tu compañia disponible en la web y App (android y ios)',
                'Pagos con tarjeta (Stripe)',
                'Analíticas, SEO y Meta Pixel',
                'Punto de venta',
                'Exportación/Importación de CSV',
                'Soporte de chat en vivo',
                'Puntos para tus clientes',
                'Cupones para tus clientes',
                'Notificaciones push ilimitadas',
                'Campañas de correos',
                'Promociones exclusivas',
                //  'Configuración de facturas y PDF',
                // 'Exportación/Importación de CSV',
                //  'Calculadora de distancia para envíos',
            ],
            cta: 'Obtener Premium',
            popular: true,
            badge: '🎁 Dominio gratis - Oferta limitada',
            promo: '¡Primer mes Gratis!'
        },
        {
            id: 3, // Business is ID 3
            name: 'Business',
            subtitle: 'Para equipos',
            price: '750',
            period: 'mes',
            yearlyPrice: '6750',
            yearlyMonthly: '562.5',
            description: 'Todo en Premium, además:',
            features: [
                'Productos ilimitados',
                'Dominio y correo electrónico propios',
                'Hasta 5 sucursales',
                'WhatsApp y chatbot con IA: comunicación instantánea y automatizada con tus clientes.',
                'Tu compañia disponible en la web y App (android y ios)',
                'Pagos con tarjeta (Stripe)',
                'Analíticas, SEO y Meta Pixel',
                'Punto de venta',
                'Exportación/Importación de CSV',
                'Soporte de chat en vivo',
                'Sucursales ilimitadas',
                'Webhooks y API',
                'Integración de aplicaciones externas',
                'Soporte prioritario',
                'Componentes y actualizaciones prioritarias',
                'Flujo de trabajo y catálogo de WhatsApp',
                '10 cuentas de personal',
                'Venta de membresías y tipos de membresías',
                'Membresía de mayoreo para tus clientes',
                'Puntos para tus clientes',
                'Cupones para tus clientes',
                'Notificaciones push ilimitadas',
                'Campañas de correos',
                'Promociones exclusivas',
            ],
            cta: 'Obtener Business',
            popular: false,
            badge: '🎁 Dominio gratis - Oferta limitada',
            promo: '¡Primer mes Gratis!'
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
                            <span>Planes Flexibles</span>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black text-[#0f172a] mb-6 tracking-tight">
                            Elige el plan ideal para <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">escalar tu negocio</span>
                        </h2>

                        {/* Custom Toggle */}
                        <div className="flex items-center justify-center mt-10">
                            <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center relative border border-slate-200 shadow-inner">
                                <button
                                    onClick={() => setIsYearly(false)}
                                    className={`relative z-10 px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${!isYearly ? 'text-[#0f172a]' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Mensual
                                </button>
                                <button
                                    onClick={() => setIsYearly(true)}
                                    className={`relative z-10 px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${isYearly ? 'text-[#22c55e]' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Anual
                                </button>
                                <div
                                    className={`absolute top-1.5 bottom-1.5 bg-white rounded-xl shadow-md transition-all duration-300 ease-out z-0 ${isYearly ? 'left-[calc(50%+6px)] right-1.5' : 'left-1.5 right-[calc(50%+6px)]'}`}
                                />
                                {isYearly && (
                                    <div className="absolute -top-3 -right-12 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-full animate-bounce shadow-lg">
                                        -25% AHORRO
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                        {(fetchedPlans || plans).map((plan, index) => {
                            // Check if this specific variation (ID + Interval) is the one active
                            const companyInterval = (company?.company_plan_billing_cycle || 'monthly').toLowerCase();

                            // Normalize intervals to check if they match (handle 'month' vs 'monthly' and 'year' vs 'yearly/annual')
                            const isMonthlyMatch = !isYearly && companyInterval.includes('month');
                            const isYearlyMatch = isYearly && (companyInterval.includes('year') || companyInterval.includes('annua'));

                            const isActive = activePlanId !== null &&
                                activePlanId !== undefined &&
                                String(plan.id) === String(activePlanId) &&
                                (isMonthlyMatch || isYearlyMatch);

                            const isDowngradeToBasic = activePlanId && Number(activePlanId) > Number(plan.id) && plan.id === 1;

                            const getButtonText = () => {
                                if (isActive) return 'PLAN ACTIVO';
                                if (isDowngradeToBasic) return 'PLAN BÁSICO';

                                // Logic for other downgrades
                                if (activePlanId && Number(activePlanId) > Number(plan.id)) {
                                    return `BAJAR A ${plan.name.toUpperCase()}`;
                                }

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
                                        {plan.promo && !(plan.id === 2 && company?.company_plan_trial_used) && (
                                            <div className="inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 mb-4 animate-pulse uppercase tracking-wider">
                                                ★ {plan.promo}
                                            </div>
                                        )}

                                        <div className="h-24 flex flex-col justify-end">
                                            {plan.price === '0' ? (
                                                <div className="flex items-baseline">
                                                    <span className="text-6xl font-black text-slate-900 tracking-tight">$0</span>
                                                    <span className="ml-2 text-slate-400 font-bold uppercase text-xs tracking-widest">MXN</span>
                                                </div>
                                            ) : (
                                                <>
                                                    {isYearly ? (
                                                        <div className="space-y-1">
                                                            <div className="flex items-baseline flex-wrap">
                                                                {(plan.promo === '¡Primer mes Gratis!' && !company?.company_plan_trial_used) ? (
                                                                    <>
                                                                        <span className="text-3xl font-black text-slate-300 line-through mr-3 tracking-tight">
                                                                            ${new Intl.NumberFormat().format(Number(plan.yearlyPrice))}
                                                                        </span>
                                                                        <span className="text-5xl font-black text-green-600 tracking-tight">
                                                                            Gratis
                                                                        </span>
                                                                        <span className="w-full text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                                                                            1er mes, luego ${new Intl.NumberFormat().format(Number(plan.yearlyPrice))}/año
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <span className="text-5xl font-black text-slate-900 tracking-tight">
                                                                            ${new Intl.NumberFormat().format(Number(plan.yearlyPrice))}
                                                                        </span>
                                                                        <span className="ml-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest">MXN/año</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <div className="text-xs font-bold text-green-600 flex items-center gap-1.5">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                                {`Equivale a $${plan.yearlyMonthly}/mes`}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            <div className="flex items-baseline flex-wrap">
                                                                {(plan.promo === '¡Primer mes Gratis!' && !company?.company_plan_trial_used) ? (
                                                                    <>
                                                                        <span className="text-3xl font-black text-slate-300 line-through mr-3 tracking-tight">
                                                                            ${plan.price}
                                                                        </span>
                                                                        <span className="text-5xl font-black text-green-600 tracking-tight">
                                                                            Gratis
                                                                        </span>
                                                                        <span className="w-full text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                                                                            1er mes, luego ${plan.price}/mes
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <span className="text-6xl font-black text-slate-900 tracking-tight">
                                                                            ${plan.price}
                                                                        </span>
                                                                        <span className="ml-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest">MXN/mes</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            {plan.promo !== '¡Primer mes Gratis!' && (
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                    {`$${Number(plan.price) * 12} / año pagando mes a mes`}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <ul className="space-y-3 mb-10 flex-grow">
                                        {plan.features.map((feature: string, i: number) => {
                                            const isHighlight = feature.includes('Puntos') ||
                                                feature.includes('Cupones') ||
                                                feature.includes('Notificaciones push') ||
                                                feature.includes('correos') ||
                                                feature.includes('Promociones') ||
                                                feature.includes('Membresía');
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
                                                disabled={isActive || isDowngradeToBasic || loadingPlan !== null}
                                                onClick={() => handleSubscribe(plan.id)}
                                                className={`w-full py-7 text-base font-black rounded-2xl transition-all duration-300 ${isActive
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
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {plan.price !== '0' && '✓ Incluye 25% OFF el 1er año'}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                                                    Sin compromisos • Cancela cuando quieras
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
                                Extras & Consumos
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative group/extra p-6 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-base font-black text-slate-900">WhatsApp adicional</p>
                                            <p className="text-xs font-medium text-slate-500">Automatizaciones y notificaciones</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-emerald-600">$0.05</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">por mensaje</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative group/extra p-6 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-base font-black text-slate-900">Email adicional</p>
                                            <p className="text-xs font-medium text-slate-500">Campañas y avisos</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-emerald-600">$0.01</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">por email</p>
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
                            <span className="block">Plan Empresarial</span>
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Personalizado</span>
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Todo el poder de Fynlink+ pero con tu propia marca, tu propia app y sistema independiente.
                            Perfecto para franquicias y empresas que quieren completa autonomía.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                        {/* Left Side - App Mockups */}
                        <div className="relative">
                            <div className="relative flex justify-center items-center">
                                {/* Main Phone */}
                                <div className="relative z-20 w-72 h-[580px] bg-black rounded-[3rem] p-3 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full flex items-center justify-center z-10">
                                        <div className="w-16 h-3 bg-gray-900 rounded-full" />
                                    </div>
                                    <div className="absolute inset-4 rounded-[2.4rem] bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center overflow-hidden">
                                        <div className="text-center p-6">
                                            <div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
                                                <span className="text-3xl">🏪</span>
                                            </div>
                                            <h3 className="text-white font-bold text-lg mb-2">Tu App</h3>
                                            <p className="text-white/80 text-sm">100% Personalizada</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Background Phone */}
                                <div className="absolute -right-8 top-8 w-64 h-[520px] bg-black rounded-[3rem] p-3 shadow-xl opacity-60 transform -rotate-6">
                                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full flex items-center justify-center z-10">
                                        <div className="w-16 h-3 bg-gray-900 rounded-full" />
                                    </div>
                                    <div className="absolute inset-4 rounded-[2.4rem] bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center">
                                        <div className="text-center p-6">
                                            <div className="w-16 h-16 bg-white/20 rounded-xl mx-auto mb-3 flex items-center justify-center">
                                                <span className="text-2xl">📊</span>
                                            </div>
                                            <h3 className="text-white font-bold text-sm">Dashboard</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

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
                                        <h3 className="text-xl font-bold mb-2">App Dedicada</h3>
                                        <p className="text-gray-300">Tu propia aplicación en App Store y Google Play con tu marca, colores y funcionalidades personalizadas.</p>
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
                                        <p className="text-gray-300">Servidores dedicados, base de datos propia y completa autonomía sin compartir recursos con otros negocios.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Multi-Sucursal Avanzado</h3>
                                        <p className="text-gray-300">Gestión ilimitada de sucursales, roles personalizados, reportes consolidados y control centralizado.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Seguridad Empresarial</h3>
                                        <p className="text-gray-300">Encriptación de nivel bancario, certificados SSL, backups automáticos y cumplimiento de normativas.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* What's Included */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 mb-12">
                        <h3 className="text-2xl font-bold mb-6 text-center">Todo lo de Fynlink+ PLUS:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                '🎨 Diseño UI/UX personalizado',
                                '📱 Apps nativas (iOS & Android)',
                                '🌐 Dominio y hosting propios',
                                '🔧 Integraciones a medida',
                                '📊 Analíticas avanzadas',
                                '🏪 Gestión multi-sucursal ilimitada',
                                '👥 Roles y permisos personalizados',
                                '🔌 API completa y documentada',
                                '🎯 Soporte prioritario 24/7',
                                '📈 Consultoría estratégica',
                                '🏷️ Sistema de lealtad avanzado',
                                '💳 Pasarelas de pago personalizadas'
                            ].map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-gray-200">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl p-8 backdrop-blur-sm border border-purple-400/20">
                            <h3 className="text-3xl font-bold mb-4">¿Listo para tener tu propio ecosistema?</h3>
                            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                                Habla con nuestro equipo de soluciones empresariales y diseña la plataforma perfecta para tu franquicia o cadena de tiendas.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link href="#contact">
                                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
                                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        Contactar Ventas Empresariales
                                    </Button>
                                </Link>
                                <Link href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                                    <Button size="lg" variant="outline" className="bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800">
                                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Agendar Reunión
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
