"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Inter } from 'next/font/google'
import { useState } from "react"
import type React from "react"

const inter = Inter({ subsets: ['latin'] })

export default function PromotoresPage() {
    const [faqs, setFaqs] = useState([
        {
            question: "¿Cuánto puedo ganar como promotor?",
            answer: "No hay límite. Ganarás una comisión por cada cliente que se registre y active un plan a través de tu enlace o código de referido. Las comisiones son recurrentes mientras el cliente mantenga su suscripción activa.",
            open: false
        },
        {
            question: "¿Cuándo recibo mis pagos?",
            answer: "Los pagos se procesan mensualmente. Una vez que alcances el monto mínimo de retiro ($50 USD o equivalente local), podrás solicitar tu pago a través de transferencia bancaria o PayPal.",
            open: false
        },
        {
            question: "¿Necesito ser cliente de Fynlink+ para ser promotor?",
            answer: "No es obligatorio, pero conocer la plataforma ayuda mucho a venderla mejor. Cualquier persona con ganas de generar ingresos puede unirse a nuestro programa.",
            open: false
        },
        {
            question: "¿Cómo rastreo mis ventas?",
            answer: "Tendrás acceso a un panel de control exclusivo para promotores donde verás en tiempo real tus referidos, clics, ventas y comisiones acumuladas.",
            open: false
        }
    ])

    const toggleFaq = (index: number) => {
        setFaqs(faqs.map((faq, i) => i === index ? { ...faq, open: !faq.open } : faq))
    }

    return (
        <div className={`min-h-screen bg-[#f8fafc] ${inter.className} antialiased`}>
            {/* Header (Simplified) */}
            <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
                <div className="w-full px-4 sm:px-6">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="flex items-center space-x-3">
                                <div className="w-10 h-10 relative">
                                    <Image
                                        src="/logorewa.png"
                                        alt="Fynlink+ logo"
                                        fill
                                        sizes="40px"
                                        className="object-contain"
                                    />
                                </div>
                                <span className="text-2xl font-bold text-gray-900">Fynlink+</span>
                            </Link>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-center space-x-4">
                                <Link href="/#features" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors">Características</Link>
                                <Link href="/#how-it-works" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors">¿Cómo funciona?</Link>
                                <Link href="/promotores" className="text-blue-600 hover:text-blue-700 px-4 py-2 text-base font-bold rounded-lg hover:bg-blue-50 transition-colors">Promotores</Link>
                                <Link href="/#contact" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors">Contacto</Link>
                                <Link href="/#testimonials" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors">Testimonios</Link>
                                <Link href="/#pricing" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors">Precios</Link>
                                <Link href="/#faq" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors">Preguntas Frecuentes</Link>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link href="/auth/login">
                                <Button variant="ghost" className="text-gray-600 hover:text-gray-900 font-medium">
                                    Iniciar sesión
                                </Button>
                            </Link>
                            <Link href="/promotores/register">
                                <Button className="bg-[#22c55e] hover:bg-green-600 text-white shadow-md hover:shadow-lg transition-all">Unirse ahora</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative pt-16 pb-12 md:pt-24 md:pb-20 overflow-hidden bg-white">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-50 rounded-full blur-[120px] opacity-60"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm font-bold px-4 py-2 rounded-full mb-8 border border-blue-100 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            <span>¡Programa de Afiliados Abierto!</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black text-[#0f172a] tracking-tight mb-8 leading-[1.1]">
                            Gana dinero <br />
                            ayudando a <span className="text-green-600">crecer</span> negocios
                        </h1>

                        <p className="mt-8 max-w-2xl mx-auto text-xl text-[#64748b] leading-relaxed">
                            Únete a la red de promotores de <span className="text-blue-600 font-bold">Fynlink+</span> y gana comisiones recurrentes por cada negocio que digitalices. ¡Tu éxito es nuestro éxito!
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/promotores/register" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full h-14 px-8 bg-[#22c55e] hover:bg-green-600 text-white text-lg font-bold rounded-2xl shadow-[0_20px_40px_-12px_rgba(34,197,94,0.35)] hover:shadow-[0_20px_40px_-12px_rgba(34,197,94,0.45)] hover:-translate-y-1 transition-all duration-300">
                                    Registrarme como Promotor
                                </Button>
                            </Link>
                        </div>

                        <div className="mt-16 bg-white border border-gray-100 rounded-3xl p-8 shadow-xl max-w-4xl mx-auto relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
                            <div className="grid md:grid-cols-3 gap-8">
                                <div>
                                    <div className="text-4xl font-black text-green-600 mb-2">20%</div>
                                    <div className="text-sm font-bold text-gray-900 uppercase tracking-wider">Comisión Recurrente</div>
                                    <p className="text-xs text-gray-500 mt-2">Gana todos los meses mientras tu cliente esté activo.</p>
                                </div>
                                <div className="border-l border-gray-100 pl-8 md:pl-0 md:border-l-0 md:border-x">
                                    <div className="text-4xl font-black text-blue-600 mb-2">$0</div>
                                    <div className="text-sm font-bold text-gray-900 uppercase tracking-wider">Costo de Entrada</div>
                                    <p className="text-xs text-gray-500 mt-2">Unirse al programa es totalmente gratuito.</p>
                                </div>
                                <div className="border-l border-gray-100 pl-8 md:pl-0 md:border-l-0">
                                    <div className="text-4xl font-black text-purple-600 mb-2">∞</div>
                                    <div className="text-sm font-bold text-gray-900 uppercase tracking-wider">Sin Límite</div>
                                    <p className="text-xs text-gray-500 mt-2">Entre más clientes refieras, más dinero escalas.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-24 bg-[#f8fafc]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">¿Por qué ser parte?</h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Te damos todas las herramientas para que cierres ventas y generes ingresos desde el primer día.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    title: "Pagos Puntuales",
                                    desc: "Recibe tus comisiones cada mes directo a tu cuenta sin retrasos.",
                                    icon: (
                                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )
                                },
                                {
                                    title: "Material de Marketing",
                                    desc: "Acceso a banners, presentaciones y videos para promocionar efectivamente.",
                                    icon: (
                                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    )
                                },
                                {
                                    title: "Soporte VIP",
                                    desc: "Un equipo dedicado para ayudarte a resolver dudas de tus clientes.",
                                    icon: (
                                        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    )
                                },
                                {
                                    title: "Panel de Control",
                                    desc: "Rastrea cada clic y venta con total transparencia desde tu dashboard.",
                                    icon: (
                                        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    )
                                }
                            ].map((benefit, i) => (
                                <Card key={i} className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow rounded-2xl">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                                    <p className="text-gray-500 text-sm">{benefit.desc}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it Works Section */}
                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">¡TRES PASOS PARA GANAR!</h2>
                            <p className="text-lg text-gray-600">Es más fácil de lo que crees.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-12 relative">
                            {/* Connector lines (Desktop) */}
                            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 -z-10"></div>

                            {[
                                {
                                    step: "01",
                                    title: "Regístrate",
                                    desc: "Crea tu cuenta de promotor en menos de 2 minutos."
                                },
                                {
                                    step: "02",
                                    title: "Comparte",
                                    desc: "Usa tu enlace o código para recomendar Fynlink+ a negocios."
                                },
                                {
                                    step: "03",
                                    title: "Cobra",
                                    desc: "Recibe tu comisión por cada suscripción activa."
                                }
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 text-center relative hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-md">
                                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-lg shadow-blue-200">
                                        {item.step}
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-4">{item.title}</h3>
                                    <p className="text-gray-600">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-24 bg-[#f8fafc]">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">Preguntas Frecuentes</h2>
                            <p className="text-lg text-gray-600">Resolvemos tus dudas al instante.</p>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                    <button
                                        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                                        onClick={() => toggleFaq(i)}
                                    >
                                        <span className="font-bold text-gray-900">{faq.question}</span>
                                        <svg
                                            className={`w-5 h-5 text-gray-500 transition-transform ${faq.open ? 'rotate-180' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {faq.open && (
                                        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 text-gray-600 text-sm leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-white">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-[#0f172a] rounded-[3rem] p-8 md:p-16 text-center relative overflow-hidden">
                            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500 rounded-full blur-[120px] opacity-20"></div>
                            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-green-500 rounded-full blur-[120px] opacity-20"></div>

                            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 relative z-10">
                                ¿Listo para ser el próximo <br />
                                <span className="text-green-500">Promotor Estrella</span>?
                            </h2>
                            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto relative z-10">
                                No esperes más. Únete hoy a Fynlink+ y comienza a construir tu propio negocio de referidos.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                                <Link href="/promotores/register">
                                    <Button size="lg" className="w-full sm:w-auto h-16 px-12 bg-[#22c55e] hover:bg-green-600 text-white text-xl font-bold rounded-2xl shadow-xl transition-all">
                                        ¡COMENZAR AHORA!
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 relative">
                            <Image src="/logorewa.png" alt="logo" fill className="object-contain" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">Fynlink+</span>
                    </div>
                    <div className="flex space-x-8 text-sm text-gray-500 font-medium">
                        <Link href="/" className="hover:text-gray-900">Inicio</Link>
                        <Link href="/privacidad" className="hover:text-gray-900">Privacidad</Link>
                        <Link href="/terminos-y-privacidad" className="hover:text-gray-900">Términos</Link>
                    </div>
                    <p className="text-sm text-gray-400">© 2026 Fynlink+. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    )
}
