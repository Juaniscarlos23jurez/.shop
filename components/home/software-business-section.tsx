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

          {/* Analíticas Card */}
          <UICard className="p-8 border border-gray-100 rounded-2xl bg-white shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-[#0f172a]">Analíticas</h3>
            </div>
            <p className="text-[#64748b] text-lg mb-6">
              Gráficas de ventas, visitantes y perspectivas comerciales en tiempo real.
            </p>
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
              <div className="h-24 w-full flex items-end gap-2">
                {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                  <div key={i} className="flex-1 bg-amber-400 rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>
          </UICard>

          {/* Membresías & Gift Cards Card */}
          <UICard className="p-8 border border-gray-100 rounded-2xl bg-white shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-[#0f172a]">Fidelización</h3>
            </div>
            <p className="text-[#64748b] text-lg mb-6">
              Vende membresías y gift cards para aumentar la recurrencia de tus clientes.
            </p>
            <div className="space-y-4">
              <div className="bg-pink-50 rounded-xl p-4 border border-pink-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">💳</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Membresía VIP</p>
                    <p className="text-[10px] text-pink-600 font-bold uppercase">Suscripción activa</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">$299/mes</p>
                </div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">🎁</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Gift Card Digital</p>
                    <p className="text-[10px] text-purple-600 font-bold uppercase">Lista para enviar</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">$500.00</p>
                </div>
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
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between hover:bg-indigo-50 transition-colors border border-gray-100">
                <div className="flex items-center gap-3">
                  <Image src="/stripe.svg" alt="Stripe" width={40} height={40} className="h-5 w-auto" />
                  <span className="text-sm font-bold text-gray-700">Tarjetas y Wallets</span>
                </div>
                <span className="text-[9px] font-black text-indigo-600 bg-white px-2 py-1 rounded-full border border-indigo-200 uppercase">Stripe</span>
              </div>

            </div>
          </UICard>


        </div>
      </div>
    </section>
  )
}
