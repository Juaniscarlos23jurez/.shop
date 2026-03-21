"use client"

import { Card } from "@/components/ui/button" // Wait, Card is from @/components/ui/card
import { Card as UICard } from "@/components/ui/card"

export const features = [
  {
    icon: (
      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "Programa de Lealtad",
    description: "Crea un sistema de puntos personalizado para fidelizar a tus clientes.",
    visual: (
      <div className="relative w-full h-32 bg-blue-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-blue-50 transition-colors">
        <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm w-48 transform rotate-3 group-hover:rotate-0 transition-transform duration-300">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs font-bold text-gray-800">Fynlink+</div>
            <div className="h-4 w-4 bg-yellow-400 rounded-full"></div>
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-1">1,250</div>
          <div className="text-xs text-gray-500">Puntos acumulados</div>
        </div>
      </div>
    )
  },
  {
    icon: (
      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2m5-10a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2h3.17l1.41-1.41A2 2 0 019.83 3h4.34a2 2 0 011.42.59L17.17 5H20z" />
      </svg>
    ),
    title: "Cupones Digitales & PKPass",
    description: "Genera cupones para Apple Wallet (iOS) y Google Wallet (Android).",
    visual: (
      <div className="relative w-full h-32 bg-green-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-green-50 transition-colors">
        <div className="bg-gray-900 text-white rounded-xl p-3 w-40 shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -mr-6 -mt-6"></div>
          <div className="flex justify-between items-start mb-3">
            <div className="text-[10px] font-medium opacity-80">Store Card</div>
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[8px]">✓</div>
          </div>
          <div className="mt-2 flex justify-between items-end">
            <div>
              <div className="text-[10px] text-gray-400">Balance</div>
              <div className="text-sm font-bold">$50.00</div>
            </div>
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
              <div className="w-4 h-4 bg-black"></div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: (
      <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    title: "Tu Propio Sitio Web",
    description: "Crea tu tienda en línea con catálogo, carrito y pagos en minutos.",
    visual: (
      <div className="relative w-full h-32 bg-purple-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-purple-50 transition-colors">
        <div className="bg-white border border-purple-100 shadow-sm w-44 overflow-hidden transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <div className="bg-gray-50 px-2 py-1.5 flex gap-1 border-b">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
          </div>
          <div className="p-2 space-y-2">
            <div className="h-2 bg-purple-100 rounded w-3/4"></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-8 bg-gray-50 rounded border border-gray-100"></div>
              <div className="h-8 bg-gray-50 rounded border border-gray-100"></div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: (
      <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: "Tu Propia App Nativa",
    description: "Tus clientes descargan TU aplicación desde la App Store y Play Store.",
    visual: (
      <div className="relative w-full h-32 bg-orange-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-orange-50 transition-colors">
        <div className="bg-white border border-orange-100 rounded-xl shadow-sm w-20 h-28 transform rotate-12 group-hover:rotate-0 transition-transform duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-4 bg-gray-50 border-b border-gray-100 flex justify-center items-center">
            <div className="w-8 h-1 bg-gray-200 rounded-full"></div>
          </div>
          <div className="p-2 mt-2 space-y-1">
            <div className="w-full h-8 bg-orange-100 rounded-lg"></div>
            <div className="w-full h-8 bg-gray-50 rounded-lg border border-gray-100"></div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: (
      <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Analíticas & SEO",
    description: "Optimización para motores de búsqueda y estadísticas en tiempo real.",
    visual: (
      <div className="relative w-full h-32 bg-amber-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-amber-50 transition-colors">
        <div className="bg-white border border-amber-100 rounded-lg p-3 shadow-sm w-44">
          <div className="flex items-end gap-1.5 h-16 justify-between px-1">
            <div className="w-4 bg-amber-100 rounded-t h-[40%] group-hover:h-[50%] transition-all duration-500"></div>
            <div className="w-4 bg-amber-200 rounded-t h-[60%] group-hover:h-[70%] transition-all duration-500 delay-75"></div>
            <div className="w-4 bg-amber-300 rounded-t h-[30%] group-hover:h-[40%] transition-all duration-500 delay-100"></div>
            <div className="w-4 bg-amber-400 rounded-t h-[80%] group-hover:h-[90%] transition-all duration-500 delay-150"></div>
            <div className="w-4 bg-amber-500 rounded-t h-[50%] group-hover:h-[60%] transition-all duration-500 delay-200"></div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: (
      <svg className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Catálogo Digital",
    description: "Hermosos catálogos con imágenes, precios y gestión completa.",
    visual: (
      <div className="relative w-full h-32 bg-pink-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-pink-50 transition-colors">
        <div className="grid grid-cols-2 gap-2 w-40">
          <div className="bg-white border border-pink-100 rounded p-1.5 shadow-sm transform group-hover:-translate-y-1 transition-transform duration-300">
            <div className="w-full h-8 bg-pink-100 rounded mb-1"></div>
            <div className="h-1 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-white border border-pink-100 rounded p-1.5 shadow-sm transform group-hover:-translate-y-1 transition-transform duration-300 delay-75">
            <div className="w-full h-8 bg-purple-100 rounded mb-1"></div>
            <div className="h-1 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-white border border-pink-100 rounded p-1.5 shadow-sm transform group-hover:-translate-y-1 transition-transform duration-300 delay-100">
            <div className="w-full h-8 bg-blue-100 rounded mb-1"></div>
            <div className="h-1 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-white border border-pink-100 rounded p-1.5 shadow-sm transform group-hover:-translate-y-1 transition-transform duration-300 delay-150">
            <div className="w-full h-8 bg-green-100 rounded mb-1"></div>
            <div className="h-1 w-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: (
      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "CRM & Clientes",
    description: "Mejora la gestión de relaciones con clientes y precios al por mayor.",
    visual: (
      <div className="relative w-full h-32 bg-indigo-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-indigo-50 transition-colors">
        <div className="bg-white border border-indigo-100 rounded-lg shadow-sm w-44 overflow-hidden">
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-indigo-100"></div>
              <div className="flex-1 space-y-1">
                <div className="h-1.5 bg-gray-200 rounded w-12"></div>
                <div className="h-1 bg-gray-100 rounded w-16"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-100"></div>
              <div className="flex-1 space-y-1">
                <div className="h-1.5 bg-gray-200 rounded w-10"></div>
                <div className="h-1 bg-gray-100 rounded w-14"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-100"></div>
              <div className="flex-1 space-y-1">
                <div className="h-1.5 bg-gray-200 rounded w-14"></div>
                <div className="h-1 bg-gray-100 rounded w-12"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: (
      <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: "Inventario",
    description: "Gestiona tu inventario en línea y evita la sobreventa.",
    visual: (
      <div className="relative w-full h-32 bg-teal-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-teal-50 transition-colors">
        <div className="bg-white border border-teal-100 rounded-lg p-3 shadow-sm w-44">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <div className="h-1.5 w-12 bg-gray-100 rounded"></div>
              </div>
              <div className="text-[8px] font-mono text-gray-400">84</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                <div className="h-1.5 w-10 bg-gray-100 rounded"></div>
              </div>
              <div className="text-[8px] font-mono text-gray-400">12</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                <div className="h-1.5 w-14 bg-gray-100 rounded"></div>
              </div>
              <div className="text-[8px] font-mono text-gray-400">0</div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: (
      <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    title: "Notificaciones & Email",
    description: "Envía notificaciones push y correos automáticos para recuperar ventas.",
    visual: (
      <div className="relative w-full h-32 bg-rose-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-rose-50 transition-colors">
        <div className="bg-white border border-rose-100 rounded-lg shadow-sm w-44 p-3 relative">
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce">1</div>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0"></div>
            <div className="space-y-1.5 w-full">
              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-100 rounded w-full"></div>
              <div className="h-2 bg-gray-100 rounded w-1/2"></div>
            </div>
          </div>
          <div className="w-full h-8 bg-rose-500 rounded text-white text-[10px] flex items-center justify-center font-medium">
            Ver Oferta
          </div>
        </div>
      </div>
    )
  },
  {
    icon: (
      <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "WhatsApp Automático",
    description: "Automatiza pedidos y atención al cliente directamente en WhatsApp.",
    visual: (
      <div className="relative w-full h-32 bg-emerald-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-emerald-50 transition-colors">
        <div className="bg-white border border-emerald-100 rounded-xl shadow-sm w-44 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
            </div>
            <div className="h-1.5 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-2 flex gap-2 items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <div className="h-1 w-12 bg-emerald-200 rounded"></div>
          </div>
          <div className="flex justify-end">
            <div className="bg-gray-50 rounded-lg p-2 w-24">
              <div className="h-1 w-16 bg-gray-200 rounded mb-1"></div>
              <div className="h-1 w-8 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: (
      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Pasarelas de Pago",
    description: "Acepta tarjetas de crédito, débito y transferencias de forma segura con Stripe.",
    visual: (
      <div className="relative w-full h-32 bg-blue-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-blue-50 transition-colors">
        <div className="bg-white border border-blue-100 rounded-xl shadow-sm w-44 p-3 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-1.5 w-12 bg-gray-200 rounded"></div>
            <div className="flex gap-1">
              <div className="w-4 h-2.5 bg-blue-600 rounded-sm"></div>
              <div className="w-4 h-2.5 bg-orange-400 rounded-sm"></div>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-2 w-full bg-gray-100 rounded"></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-2 w-full bg-gray-100 rounded"></div>
              <div className="h-2 w-full bg-gray-100 rounded"></div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[8px] text-blue-600 font-bold justify-center border border-blue-100 rounded-lg py-1">
            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
            PAGO SEGURO
          </div>
        </div>
      </div>
    )
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 bg-white" >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-[#0f172a] mb-4">
            Todo lo que necesitas para fidelizar clientes
          </h2>
          <p className="text-[#64748b] text-xl max-w-3xl mx-auto">
            Herramientas poderosas diseñadas para negocios que quieren crecer
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature, index) => (
            <UICard key={index} className="group hover:shadow-xl transition-all duration-300 border border-gray-100 rounded-2xl overflow-hidden bg-white">
              <div className="p-1">
                {feature.visual}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-green-50 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#0f172a] leading-tight">{feature.title}</h3>
                </div>
                <p className="text-[#64748b] text-sm leading-relaxed">{feature.description}</p>
              </div>
            </UICard>
          ))}
        </div>
      </div>
    </section>
  )
}
