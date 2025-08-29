"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function HomePage() {
  const features = [
    {
      icon: (
        <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: "Programa de Lealtad",
      description: "Crea un sistema de puntos personalizado para fidelizar a tus clientes."
    },
    {
      icon: (
        <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2m5-10a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2h3.17l1.41-1.41A2 2 0 019.83 3h4.34a2 2 0 011.42.59L17.17 5H20z" />
        </svg>
      ),
      title: "Cupones Digitales",
      description: "Genera y envía cupones personalizados para impulsar las ventas recurrentes."
    },
    {
      icon: (
        <svg className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      title: "Notificaciones",
      description: "Mantén a tus clientes informados con notificaciones personalizadas."
    },
    {
      icon: (
        <svg className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Analíticas",
      description: "Mide el rendimiento de tu programa de fidelización con estadísticas en tiempo real."
    }
  ]

  return (
    <div className={`min-h-screen bg-[#f8fafc] ${inter.className} antialiased`}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#22c55e] flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">Fideliza+</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-1">
                <a href="#features" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">Características</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">¿Cómo funciona?</a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">Precios</a>
                <a href="#testimonials" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">Testimonios</a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-600 hover:bg-gray-100">Iniciar sesión</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-[#22c55e] hover:bg-green-600 text-white shadow-md hover:shadow-lg transition-all">Comenzar gratis</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-green-50 via-white to-green-50 overflow-hidden">
          <div className="absolute inset-0 bg-grid-gray-100 [mask-image:linear-gradient(0deg,white,transparent)]"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full mb-4">
                <span>✨</span>
                <span>Plataforma de fidelización #1 en Latinoamérica</span>
              </div>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Fideliza a tus clientes</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">y haz crecer tu negocio</span>
              </h1>
              <p className="mt-5 max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed">
                La plataforma todo en uno para crear programas de fidelización que tus clientes amarán. Aumenta las ventas recurrentes, mejora la retención y construye relaciones duraderas con tus clientes.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-[#22c55e] hover:bg-green-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 transform">
                    Comenzar gratis - Sin tarjeta
                  </Button>
                </Link>
                <Link href="#video-demo" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center space-x-2">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    <span>Ver video demo</span>
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                        <div className="w-full h-full bg-gray-300"></div>
                      </div>
                    ))}
                  </div>
                  <span className="ml-3">+2,500 negocios confían en nosotros</span>
                </div>
              </div>
            </div>
          </div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                <div className="w-full h-96 bg-gradient-to-br from-green-100 to-blue-50 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard de Fidelización</h3>
                    <p className="text-gray-500 text-sm">Panel de control intuitivo para gestionar tu programa de lealtad</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Video Demo Section */}
        <section id="video-demo" className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-12">
              <h2 className="text-3xl font-black text-[#0f172a] mb-4">
                Descubre cómo funciona Fideliza+
              </h2>
              <p className="text-[#64748b] text-lg max-w-2xl mx-auto">
                Mira nuestro video de 2 minutos y descubre cómo puedes aumentar las ventas recurrentes de tu negocio
              </p>
            </div>
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-2xl overflow-hidden shadow-xl">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
                <button className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
                  <svg className="w-10 h-10 text-[#22c55e]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { number: '2,500+', label: 'Negocios' },
                { number: '1M+', label: 'Clientes' },
                { number: '4.9/5', label: 'Calificación' },
                { number: '24/7', label: 'Soporte' }
              ].map((stat, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-[#0f172a]">{stat.number}</div>
                  <div className="text-sm text-[#64748b]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-[#0f172a] mb-4">
                Lo que dicen nuestros clientes
              </h2>
              <p className="text-[#64748b] text-lg max-w-2xl mx-auto">
                Empresas de todos los tamaños confían en Fideliza+ para fidelizar a sus clientes
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "Incrementamos nuestras ventas recurrentes en un 30% desde que implementamos Fideliza+. ¡Nuestros clientes aman el programa de puntos!",
                  author: "María González",
                  role: "Dueña de Café Aromas",
                  avatar: "/placeholder-user.jpg"
                },
                {
                  quote: "La facilidad de uso de la plataforma nos permitió lanzar nuestro programa de fidelización en cuestión de horas. ¡Excelente soporte!" ,
                  author: "Carlos Mendoza",
                  role: "Gerente de Tienda de Ropa",
                  avatar: "/placeholder-user.jpg"
                },
                {
                  quote: "Las analíticas integradas nos han dado información valiosa sobre el comportamiento de nuestros clientes. Una herramienta imprescindible.",
                  author: "Ana Lucía Ramírez",
                  role: "Directora de Marketing",
                  avatar: "/placeholder-user.jpg"
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-4 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 inline-block" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.author}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{testimonial.author}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-[#0f172a] mb-4">
                Todo lo que necesitas para fidelizar clientes
              </h2>
              <p className="text-[#64748b] text-lg max-w-3xl mx-auto">
                Herramientas poderosas diseñadas para negocios que quieren crecer
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 hover:shadow-md transition-shadow duration-300 border border-gray-100 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#0f172a] mb-2">{feature.title}</h3>
                  <p className="text-[#64748b] text-sm leading-relaxed">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-[#0f172a] mb-4">
                ¿Cómo funciona?
              </h2>
              <p className="text-[#64748b] text-lg">
                Comienza a fidelizar clientes en solo 3 pasos
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 text-lg font-bold flex items-center justify-center mb-4 mx-auto">1</div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2 text-center">Crea tu cuenta</h3>
                <p className="text-[#64748b] text-sm text-center">Regístrate en minutos y configura tu negocio en nuestra plataforma.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 text-lg font-bold flex items-center justify-center mb-4 mx-auto">2</div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2 text-center">Personaliza tu programa</h3>
                <p className="text-[#64748b] text-sm text-center">Configura tu sistema de puntos, beneficios y recompensas.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 text-lg font-bold flex items-center justify-center mb-4 mx-auto">3</div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2 text-center">Involucra a tus clientes</h3>
                <p className="text-[#64748b] text-sm text-center">Comienza a enviar ofertas y ver crecer la lealtad de tus clientes.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[#22c55e] py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white mb-6">
              ¿Listo para transformar la lealtad de tus clientes?
            </h2>
            <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
              Únete a cientos de negocios que ya están fidelizando clientes con nuestra plataforma.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-white text-[#0f172a] hover:bg-gray-100 font-medium">
                  Comenzar gratis
                </Button>
              </Link>
              <Link href="#contact" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full text-white border-white hover:bg-green-600 hover:border-green-600">
                  Hablar con ventas
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-[#0f172a] mb-4">
                Precios simples y predecibles
              </h2>
              <p className="text-[#64748b] text-lg max-w-2xl mx-auto">
                Elige el plan que mejor se adapte a las necesidades de tu negocio
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  name: 'Básico',
                  price: '29',
                  period: 'mes',
                  description: 'Perfecto para pequeños negocios que están comenzando',
                  features: [
                    'Hasta 500 clientes',
                    'Programa de puntos básico',
                    'Plantillas de correo electrónico',
                    'Soporte por correo electrónico',
                    'Análisis básicos'
                  ],
                  cta: 'Comenzar prueba gratuita',
                  popular: false
                },
                {
                  name: 'Profesional',
                  price: '79',
                  period: 'mes',
                  description: 'Ideal para negocios en crecimiento',
                  features: [
                    'Hasta 2,000 clientes',
                    'Programa de puntos avanzado',
                    'Cupones y descuentos',
                    'Soporte prioritario',
                    'Análisis avanzados',
                    'Integración con redes sociales'
                  ],
                  cta: 'Comenzar prueba gratuita',
                  popular: true
                },
                {
                  name: 'Empresarial',
                  price: 'Personalizado',
                  period: '',
                  description: 'Solución personalizada para grandes empresas',
                  features: [
                    'Clientes ilimitados',
                    'Programas personalizados',
                    'API completa',
                    'Soporte 24/7',
                    'Análisis personalizados',
                    'Entrenamiento dedicado',
                    'Contrato anual'
                  ],
                  cta: 'Contactar ventas',
                  popular: false
                }
              ].map((plan, index) => (
                <div 
                  key={index} 
                  className={`relative bg-white rounded-2xl shadow-sm overflow-hidden border ${
                    plan.popular ? 'border-2 border-[#22c55e] transform scale-105 z-10' : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-[#22c55e] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      MÁS POPULAR
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                    <div className="flex items-baseline mb-4">
                      {plan.price === 'Personalizado' ? (
                        <span className="text-4xl font-bold text-gray-900">Personalizado</span>
                      ) : (
                        <>
                          <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                          <span className="ml-1 text-gray-500">/{plan.period}</span>
                        </>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button 
                      className={`w-full py-3 px-4 rounded-lg font-medium ${
                        plan.popular 
                          ? 'bg-[#22c55e] text-white hover:bg-green-600' 
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-6">¿Necesitas una solución personalizada para tu negocio?</p>
              <a 
                href="#contact" 
                className="inline-flex items-center text-[#22c55e] font-medium hover:text-green-600"
              >
                Contáctanos para una demostración personalizada
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* CTA Section */}
      <section className="bg-[#22c55e] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            ¿Listo para transformar la lealtad de tus clientes?
          </h2>
          <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
            Únete a miles de negocios que ya están aumentando sus ventas con Fideliza+
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-white text-[#0f172a] hover:bg-gray-100 font-medium">
                Comenzar gratis por 14 días
              </Button>
            </Link>
            <Link href="#contact" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full text-white border-white hover:bg-green-600 hover:border-green-600">
                Hablar con ventas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-4">Producto</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-[#e2e8f0] hover:text-white text-sm">Características</a></li>
                <li><a href="#pricing" className="text-[#e2e8f0] hover:text-white text-sm">Precios</a></li>
                <li><a href="#" className="text-[#e2e8f0] hover:text-white text-sm">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-4">Empresa</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-[#e2e8f0] hover:text-white text-sm">Acerca de</a></li>
                <li><a href="#" className="text-[#e2e8f0] hover:text-white text-sm">Blog</a></li>
                <li><a href="#" className="text-[#e2e8f0] hover:text-white text-sm">Trabajos</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-4">Recursos</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-[#e2e8f0] hover:text-white text-sm">Documentación</a></li>
                <li><a href="#" className="text-[#e2e8f0] hover:text-white text-sm">Guías</a></li>
                <li><a href="#" className="text-[#e2e8f0] hover:text-white text-sm">Soporte</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-[#e2e8f0] hover:text-white text-sm">Privacidad</a></li>
                <li><a href="#" className="text-[#e2e8f0] hover:text-white text-sm">Términos</a></li>
                <li><a href="#" className="text-[#e2e8f0] hover:text-white text-sm">Seguridad</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-[#1e293b]">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <span className="text-white font-bold">Fideliza+</span>
              </div>
              <p className="text-[#94a3b8] text-sm">
                &copy; {new Date().getFullYear()} Fideliza+. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}