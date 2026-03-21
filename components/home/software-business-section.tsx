"use client"

import { Card as UICard } from "@/components/ui/card"
import Image from "next/image"

export function SoftwareBusinessSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50" >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-[#0f172a] mb-4">
            Software Empresarial Todo-en-Uno
          </h2>
          <p className="text-[#64748b] text-xl max-w-3xl mx-auto">
            Mejora tu productividad usando nuestro software ERP enfocado en WhatsApp para pequeñas empresas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* CRM Card */}
          <UICard className="p-8 border border-gray-100 rounded-2xl bg-white shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-[#0f172a]">CRM</h3>
            </div>
            <p className="text-[#64748b] text-lg mb-6">
              Aumenta tus ventas con una mejor Gestión de Relaciones con Clientes
            </p>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-gray-700 text-base">Segmentación de clientes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-gray-700">Historial de compras</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-gray-700">Comunicación personalizada</span>
                </div>
              </div>
            </div>
          </UICard>

          {/* Inventario Card */}
          <UICard className="p-8 border border-gray-100 rounded-2xl bg-white shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-[#0f172a]">Inventario</h3>
            </div>
            <p className="text-[#64748b] text-lg mb-6">
              Gestiona tu inventario en línea y evita la sobreventa o las faltas de stock
            </p>
            <div className="bg-gray-50 rounded-xl overflow-hidden">
              <table className="w-full text-base">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Producto</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Stock</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Precio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-white">
                    <td className="px-4 py-2 text-gray-700">Vela</td>
                    <td className="px-4 py-2 text-gray-700">10</td>
                    <td className="px-4 py-2 text-gray-700">$12.99</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-2 text-gray-700">Perfume</td>
                    <td className="px-4 py-2 text-gray-700">8</td>
                    <td className="px-4 py-2 text-gray-700">$69.99</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-2 text-gray-700">Diario</td>
                    <td className="px-4 py-2 text-gray-700">16</td>
                    <td className="px-4 py-2 text-gray-700">$7.99</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </UICard>

          {/* Venta al por mayor Card */}
          <UICard className="p-8 border border-gray-100 rounded-2xl bg-white shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-[#0f172a]">Venta al por mayor</h3>
            </div>
            <p className="text-[#64748b] text-lg mb-6">
              Aumenta tus ventas con precios personalizados para tus clientes
            </p>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">Crema de manos</span>
                  <span className="text-base text-gray-600">Usuario regular</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">$15.00</div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">Crema de manos</span>
                  <span className="text-base text-purple-600 font-semibold">Usuario VIP</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-purple-600">$10.00</span>
                  <span className="text-base text-gray-500 line-through">$15.00</span>
                </div>
              </div>
            </div>
          </UICard>

          {/* Analíticas & Membresía Card */}
          <UICard className="p-8 border border-gray-100 rounded-2xl bg-white shadow-lg">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-[#0f172a]">Analíticas</h3>
                </div>
                <p className="text-[#64748b] text-base">
                  Gráficas de ventas, visitantes y perspectivas comerciales en tiempo real.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-[#0f172a]">Membresías</h3>
                </div>
                <p className="text-[#64748b] text-base">
                  Crea planes de suscripción y crédito de recompensa para tus clientes más fieles.
                </p>
              </div>
            </div>
          </UICard>

          {/* Pasarelas de Pago Card */}
          <UICard className="p-8 border border-gray-100 rounded-2xl bg-white shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-[#0f172a]">Pagos Modernos</h3>
            </div>
            <p className="text-[#64748b] text-lg mb-6">
              Acepta múltiples formas de pago y liquida tus ventas al instante.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-indigo-50 transition-colors border border-gray-100">
                <Image src="/stripe.svg" alt="Stripe" width={40} height={40} className="h-6 w-auto" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Cards & Wallets</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 transition-colors border border-gray-100">
                <Image src="/mercado.png" alt="Mercado Pago" width={40} height={40} className="h-6 w-auto object-contain" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Saldo MP</span>
              </div>
              <div className="col-span-2 bg-orange-50 rounded-xl p-4 flex items-center justify-between border border-orange-100">
                <div className="flex items-center gap-3">
                  <Image src="/oxxo.png" alt="OXXO" width={40} height={40} className="h-5 w-auto object-contain" />
                  <span className="text-sm font-bold text-orange-700">Efectivo en OXXO</span>
                </div>
                <span className="text-[9px] font-black text-orange-600 bg-white px-2 py-1 rounded-full border border-orange-200 uppercase">Referencia</span>
              </div>
            </div>
          </UICard>

          {/* CRM & WhatsApp Card */}
          <UICard className="p-8 border border-gray-100 rounded-2xl bg-white shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-[#0f172a]">WhatsApp Pro</h3>
            </div>
            <p className="text-[#64748b] text-lg mb-6">
              Vende por WhatsApp de forma profesional y automatizada.
            </p>
            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-xs">🤖</div>
                  <p className="text-gray-700 font-medium">Chatbot con IA para pedidos</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-xs">📲</div>
                  <p className="text-gray-700 font-medium">Notificaciones push ilimitadas</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-xs">📊</div>
                  <p className="text-gray-700 font-medium">Historial de chats en CRM</p>
                </div>
              </div>
            </div>
          </UICard>
        </div>
      </div>
    </section>
  )
}
