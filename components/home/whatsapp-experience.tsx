"use client"

import { Card as UICard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function WhatsAppExperience() {
  const handleVideoError = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error("Video load error in WhatsAppExperience", event.currentTarget.src)
  }

  return (
    <section className="py-24 bg-white overflow-hidden" >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 text-xs font-black px-3 py-1 rounded-full mb-6 uppercase tracking-widest border border-emerald-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Experiencia WhatsApp</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] mb-8 leading-tight">
              Toda tu tienda en <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                un solo chat
              </span>
            </h2>
            <p className="text-[#64748b] text-xl mb-10 leading-relaxed">
              No más mensajes perdidos o pedidos incompletos. Tus clientes eligen, compran y pagan sin salir de WhatsApp. Tú recibes el pedido <span className="text-emerald-600 font-bold">listo para procesar</span>.
            </p>

            <div className="space-y-6">
              {[
                { title: 'Recepción automática', desc: 'Recibe datos de envío y pago en un solo bloque.' },
                { title: 'Catálogo en el chat', desc: 'Tus clientes navegan tus productos sin apps externas.' },
                { title: 'Pagos integrados', desc: 'Cobra por Stripe o Mercado Pago directamente.' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                    <svg className="w-4 h-4 text-emerald-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full scale-110 -z-10"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-6 pt-12">
                {/* Stripe Card with video */}
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
              </div>

              <div className="space-y-6">
                {/* Mercado Pago Card with video */}
                <UICard className="p-0 border border-gray-100 rounded-[2rem] bg-white shadow-2xl overflow-hidden hover:-translate-y-2 transition-transform duration-500">
                  <div className="p-6 pb-2">
                    <div className="bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                      <Image src="/mercado.png" alt="Mercado Pago" width={32} height={32} className="h-8 w-auto object-contain" />
                    </div>
                    <h4 className="text-xl font-bold text-[#0f172a] mb-2">Mercado Pago</h4>
                    <p className="text-sm text-[#64748b]">Acepta pagos locales en OXXO, transferencias y saldo MP.</p>
                  </div>
                  <div className="relative aspect-[9/16] mt-2 group">
                    <video
                      src="/mercado_pago.mp4"
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
                  <p className="text-indigo-100 text-sm">Convierte cada chat en una venta exitosa.</p>
                </div>
              </div>
            </div>

            <div className="mt-10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl px-8 py-10 shadow-2xl border border-white/10">
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-300 font-black mb-3">
                Pasarelas activadas en México
              </p>
              <h4 className="text-3xl md:text-4xl font-black leading-tight mb-4">
                Stripe + Mercado Pago funcionando hoy mismo
              </h4>
              <p className="text-slate-200 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
                Cobra con tarjetas de crédito, débito, wallets y pagos en efectivo. Mercado Pago habilita referenciados en <span className="font-semibold text-white">OXXO</span> y saldo MP,
                mientras que Stripe procesa Apple Pay, Google Pay y pagos en sucursal. Ambas pasarelas conviven en tu tienda para que ningún cliente se quede sin pagar.
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-xs font-black tracking-widest text-emerald-200 uppercase mb-2">Tarjetas</p>
                  <p className="text-base text-slate-100">Visa, Mastercard y AMEX con Stripe y Mercado Pago.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-xs font-black tracking-widest text-emerald-200 uppercase mb-2">Efectivo / OXXO</p>
                  <p className="text-base text-slate-100">Genera referencias para OXXO y pagos offline sin fricción.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-xs font-black tracking-widest text-emerald-200 uppercase mb-2">Wallets</p>
                  <p className="text-base text-slate-100">Apple Pay, Google Pay y saldo Mercado Pago listos para usar.</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
                <div className="bg-white rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
                  <Image src="/stripe.svg" alt="Stripe" width={60} height={24} className="h-4 w-auto" />
                  <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Stripe México</span>
                </div>
                <div className="bg-white rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
                  <Image src="/mercado.png" alt="Mercado Pago" width={60} height={24} className="h-4 w-auto object-contain" />
                  <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Mercado Pago MX</span>
                </div>
                <div className="bg-white rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
                  <Image src="/oxxo.png" alt="OXXO" width={60} height={24} className="h-4 w-auto object-contain" />
                  <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Pagos en OXXO</span>
                </div>
              </div>
            </div>
          </div>


          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-[#0f172a] mb-3">Ahorra tiempo valioso</h4>
              <p className="text-[#64748b]">Elimina el "pimponeo" de mensajes. Recibe toda la información necesaria en un solo envío y procesa más pedidos en menos tiempo.</p>
            </div>

            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-[#0f172a] mb-3">Precisión total</h4>
              <p className="text-[#64748b]">Los pedidos llegan sin errores. Sin confusiones de productos, precios o direcciones. Lo que el cliente ve es lo que tú recibes.</p>
            </div>

            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-[#0f172a] mb-3">Imagen Profesional</h4>
              <p className="text-[#64748b]">Tus clientes perciben un negocio moderno y organizado, lo que genera confianza y fomenta la recompra inmediata.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
