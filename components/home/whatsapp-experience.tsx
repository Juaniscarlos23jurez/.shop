"use client"

import { Card as UICard } from "@/components/ui/card"
import Image from "next/image"

export function WhatsAppExperience() {
  const handleVideoError = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error("Video load error in WhatsAppExperience", event.currentTarget.src)
  }

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 text-xs font-black px-3 py-1 rounded-full mb-6 uppercase tracking-widest border border-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>Pasarela de Pagos</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] mb-8 leading-tight">
              Acepta pagos de <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                todo el mundo
              </span>
            </h2>
            <p className="text-[#64748b] text-xl mb-10 leading-relaxed">
              Cobra de forma segura y automatizada. Stripe te permite aceptar pagos globales con una integración robusta, confiable y diseñada para escalar tu negocio.
            </p>

            <div className="space-y-6">
              {[
                { title: 'Seguridad certificada', desc: 'Protección contra fraudes con tecnología de nivel bancario.' },
                { title: 'Integración global', desc: 'Acepta tarjetas de crédito, débito, Apple Pay y Google Pay.' },
                { title: 'Pagos en un clic', desc: 'Experiencia de checkout optimizada para máxima conversión.' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <svg className="w-4 h-4 text-blue-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#0f172a]">{item.title}</h4>
                    <p className="text-[#64748b]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full scale-110 -z-10"></div>
            <div className="space-y-6 relative z-10 max-w-sm mx-auto">
              <UICard className="p-0 border border-gray-100 rounded-[2rem] bg-white shadow-2xl overflow-hidden hover:-translate-y-2 transition-transform duration-500">
                <div className="p-6 pb-2">
                  <div className="bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                    <Image src="/stripe.svg" alt="Stripe" width={24} height={24} className="h-4 w-auto" />
                  </div>
                  <h4 className="text-xl font-bold text-[#0f172a] mb-2">Pago con Stripe</h4>
                  <p className="text-sm text-[#64748b]">Cobra con todas las tarjetas de crédito, débito y Apple Pay.</p>
                </div>
                <div className="relative aspect-[9/16] mt-2 group">
                  <video
                    src="/stripe.mp4"
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    onError={handleVideoError}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                </div>
              </UICard>

              <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-2xl flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-[20px] font-black leading-tight mb-2">Ventas sin fricción</h4>
                <p className="text-indigo-100 text-sm">Convierte cada visita en una venta exitosa.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl px-8 py-10 shadow-2xl border border-white/10">

          <h4 className="text-3xl md:text-4xl font-black leading-tight mb-4 text-center">
            Stripe funcionando hoy mismo
          </h4>
          <p className="text-slate-200 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed text-center mb-8">
            Cobra con tarjetas de crédito, débito y wallets locales. Stripe procesa Apple Pay, Google Pay y pagos en sucursal con la mayor tasa de conversión del mercado.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs font-black tracking-widest text-blue-200 uppercase mb-2">Tarjetas</p>
              <p className="text-base text-slate-100">Visa, Mastercard y AMEX procesadas con total seguridad.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs font-black tracking-widest text-blue-200 uppercase mb-2">Conversión</p>
              <p className="text-base text-slate-100">Checkout optimizado que reduce el abandono de carrito.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs font-black tracking-widest text-blue-200 uppercase mb-2">Wallets</p>
              <p className="text-base text-slate-100">Apple Pay y Google Pay listos para usar en un solo clic.</p>
            </div>
          </div>

        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-[#0f172a] mb-3">Escalabilidad total</h4>
            <p className="text-[#64748b]">Acepta pagos de cualquier parte del mundo sin complicaciones técnicas. Crece sin límites con la infraestructura de Stripe.</p>
          </div>

          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-[#0f172a] mb-3">Control financiero</h4>
            <p className="text-[#64748b]">Gestiona tus ingresos con claridad. Stripe te ofrece un dashboard detallado para monitorear cada transacción en tiempo real.</p>
          </div>

          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-[#0f172a] mb-3">Confianza del Cliente</h4>
            <p className="text-[#64748b]">Tus clientes se sienten seguros pagando con la plataforma más reconocida a nivel global, lo que aumenta la lealtad.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
