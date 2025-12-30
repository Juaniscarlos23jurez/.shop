"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/juancarlosjuarez26/30min';

export function PricingSection({ activePlanId }: { activePlanId?: number | string | null }) {
    const [isYearly, setIsYearly] = useState(false);

    const plans = [
        {
            id: null,
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
            cta: 'Comienza ahora',
            popular: false,
            badge: null
        },
        {
            id: 1, // Assume 1 for Premium
            name: 'Premium',
            subtitle: 'Para emprendedores independientes',
            price: '247',
            period: 'mes',
            yearlyPrice: '2223',
            yearlyMonthly: '185',
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
            badge: '🎁 Dominio gratis - Oferta limitada'
        },
        {
            id: 2, // Assume 2 for Business
            name: 'Business',
            subtitle: 'Para equipos',
            price: '650',
            period: 'mes',
            yearlyPrice: '5850',
            yearlyMonthly: '488',
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
            badge: '🎁 Dominio gratis - Oferta limitada'
        }
    ];

    return (
        <>
            <section id="pricing" className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black text-[#0f172a] mb-4">
                            Precios
                        </h2>
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <span className={`text-lg ${isYearly ? 'text-[#94a3b8]' : 'text-[#0f172a] font-semibold'}`}>
                                Paga mensualmente
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isYearly}
                                    onChange={(e) => setIsYearly(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22c55e]"></div>
                            </label>
                            <span className={`text-lg ${isYearly ? 'text-[#0f172a] font-semibold' : 'text-[#64748b]'}`}>
                                Paga anualmente (Ahorra 25%)
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {plans.map((plan, index) => {
                            const isActive = (plan.id === null && (activePlanId === null || activePlanId === undefined)) || (activePlanId !== null && activePlanId !== undefined && String(plan.id) === String(activePlanId));

                            return (
                                <div
                                    key={index}
                                    className={`relative bg-white rounded-2xl shadow-sm overflow-hidden border ${plan.popular ? 'border-2 border-[#22c55e] transform scale-105 z-10' : 'border-gray-200'
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute top-0 right-0 bg-[#22c55e] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                            MÁS POPULAR
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                                        <p className="text-base text-gray-600 mb-4">{plan.subtitle}</p>
                                        <div className="mb-4">
                                            {plan.price === '0' ? (
                                                <div className="flex items-baseline">
                                                    <span className="text-5xl font-bold text-gray-900">$0</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex flex-col items-start gap-1 transition-all duration-200">
                                                        {isYearly ? (
                                                            <>
                                                                {/* Modo anual: mostrar el total del año en grande (con descuento) */}
                                                                <div className="flex items-baseline">
                                                                    <span className="text-5xl font-bold text-gray-900">
                                                                        ${plan.yearlyPrice}
                                                                    </span>
                                                                    <span className="ml-2 text-gray-500">MXN/año</span>
                                                                </div>
                                                                <div className="text-base text-gray-600">
                                                                    {`Equivale a $${(Number(plan.yearlyPrice) / 12).toFixed(2)}/mes`}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {/* Modo mensual: mostrar precio por mes y debajo el total anual pagando mes a mes */}
                                                                <div className="flex items-baseline">
                                                                    <span className="text-5xl font-bold text-gray-900">
                                                                        ${plan.price}
                                                                    </span>
                                                                    <span className="ml-2 text-gray-500">MXN/{plan.period}</span>
                                                                </div>
                                                                <div className="text-base text-gray-600">
                                                                    {`${Number(plan.price) * 12} / año pagando mes a mes`}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <p className="text-gray-700 text-base font-medium mb-4">{plan.description}</p>
                                        <ul className="space-y-3 mb-8">
                                            {plan.features.map((feature, i) => {
                                                const isHighlight = feature.includes('Puntos') ||
                                                    feature.includes('Cupones') ||
                                                    feature.includes('Notificaciones push') ||
                                                    feature.includes('correos') ||
                                                    feature.includes('Promociones') ||
                                                    feature.includes('Membresía');
                                                return (
                                                    <li key={i} className="flex items-center">
                                                        <svg className={`h-5 w-5 ${isHighlight ? 'text-purple-500' : 'text-green-500'} mr-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span className={`${isHighlight ? 'text-purple-700 font-bold' : 'text-gray-700'} text-base`}>{feature}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                        <Link href="#contact">
                                            <Button
                                                disabled={isActive}
                                                className={`w-full mb-4 text-base font-semibold rounded-xl shadow-sm transition-all duration-200 ${isActive
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : plan.popular
                                                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg hover:-translate-y-0.5'
                                                        : 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400'
                                                    }`}
                                            >
                                                {isActive ? 'Activo' : plan.cta}
                                            </Button>
                                        </Link>
                                        {plan.badge && (
                                            <div className="text-sm text-center text-green-600 font-medium mb-2">
                                                {plan.badge}
                                            </div>
                                        )}
                                        <p className="text-sm text-center text-gray-500">
                                            {plan.price !== '0' && 'Obtén un 25% de dscto. el 1er año'}<br />
                                            Cancela en cualquier momento
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </section>

            {/* Custom Plan Section */}
            <section id="custom-plan" className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
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
        </>
    );
}
