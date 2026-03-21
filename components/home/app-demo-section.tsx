"use client"

import Image from "next/image"

export function AppDemoSection() {
  const handleVideoError = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget
    console.error("Video load error in AppDemoSection", {
      src: video.currentSrc || video.src,
    })
  }

  return (
    <section id="video-demo" className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 text-xs font-black px-3 py-1 rounded-full mb-4 uppercase tracking-widest border border-blue-100">
            <span>App & Web</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] mb-6">
            Tu marca en el bolsillo <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              de tus clientes con tu propia App
            </span>
          </h2>
          <p className="text-[#64748b] text-xl max-w-3xl mx-auto leading-relaxed">
            Tus clientes acceden a <span className="text-[#0f172a] font-bold">tu propia App</span> desde su móvil para ver su saldo de puntos,
            descubrir recompensas y comprar tus productos en segundos.
          </p>
        </div>

        {/* Web Section */}
        <div className="mb-24">
          <div className="flex items-center space-x-4 mb-12">
            <div className="h-px flex-1 bg-gray-200"></div>
            <h3 className="text-2xl font-black text-[#0f172a] uppercase tracking-tighter bg-white px-4">Acceso Web & APP</h3>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* iPhone Mockup with wallet.mp4 */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative w-full max-w-sm">
                <div className="relative mx-auto h-[520px] w-[260px] sm:h-[600px] sm:w-[300px] rounded-[3rem] border border-gray-300 bg-black shadow-2xl overflow-hidden">
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full flex items-center justify-center z-10">
                    <div className="w-16 h-3 bg-gray-900 rounded-full" />
                  </div>
                  <div className="absolute -left-0.5 top-24 h-10 w-1 rounded-r-full bg-gray-300" />
                  <div className="absolute -left-0.5 top-40 h-16 w-1 rounded-r-full bg-gray-300" />
                  <div className="absolute inset-4 rounded-[2.4rem] bg-black overflow-hidden">
                    <video
                      src="/wallet_safari.mp4"
                      className="h-full w-full object-cover"
                      muted
                      loop
                      playsInline
                      autoPlay
                      onError={handleVideoError}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Features bullets */}
            <div className="space-y-8">
              <div className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-[#0f172a] mb-2">Catálogo digital interactivo</h4>
                  <p className="text-[#64748b] leading-relaxed">Muestra todos tus productos con imágenes de alta calidad, descripciones detalladas, precios actualizados y categorías organizadas. Tus clientes pueden explorar, buscar y filtrar fácilmente desde cualquier dispositivo.</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">Búsqueda inteligente</span>
                    <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">Filtros avanzados</span>
                    <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">Actualización en tiempo real</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-[#0f172a] mb-2">Sistema de puntos de lealtad</h4>
                  <p className="text-[#64748b] leading-relaxed">Permite que tus clientes acumulen puntos automáticamente con cada compra y los canjeen por recompensas exclusivas, descuentos especiales o productos gratis. Visualizan su progreso y beneficios en tiempo real.</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">Acumulación automática</span>
                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">Recompensas personalizadas</span>
                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">Historial completo</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-[#0f172a] mb-2">Cupones y promociones inteligentes</h4>
                  <p className="text-[#64748b] leading-relaxed">Envía ofertas exclusivas personalizadas según las preferencias de tus clientes, descuentos especiales en sus productos favoritos y promociones por tiempo limitado. Ellos activan sus cupones con un solo clic.</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full">Ofertas personalizadas</span>
                    <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full">Activación instantánea</span>
                    <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full">Alertas de vencimiento</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-[#0f172a] mb-2">Wallet / PKPass integrado</h4>
                  <p className="text-[#64748b] leading-relaxed">Tus clientes guardan su tarjeta de lealtad digital en Apple Wallet o Google Pay para acceso instantáneo. Reciben notificaciones automáticas de sus puntos, ofertas y actualizaciones sin abrir la app.</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full">Apple Wallet</span>
                    <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full">Google Pay</span>
                    <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full">Acceso offline</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Section */}
        <div className="mb-16">
          <div className="flex items-center space-x-4 mb-12">
            <div className="h-px flex-1 bg-gray-200"></div>
            <h3 className="text-2xl font-black text-[#0f172a] uppercase tracking-tighter bg-gray-50 px-4">App Móvil Nativa</h3>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Features bullets */}
            <div className="space-y-8">
              <div className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#ef4444] to-[#dc2626] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-[#0f172a] mb-2">Notificaciones push inteligentes</h4>
                  <p className="text-[#64748b] leading-relaxed">Envía alertas instantáneas a tus clientes sobre nuevas ofertas, promociones exclusivas, puntos acumulados y recordatorios personalizados. Mantenlos siempre informados sin que pierdan ninguna oportunidad.</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded-full">Alertas en tiempo real</span>
                    <span className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded-full">Personalización avanzada</span>
                    <span className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded-full">Control total</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#0891b2] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-[#0f172a] mb-2">Seguimiento de pedidos en tiempo real</h4>
                  <p className="text-[#64748b] leading-relaxed">Permite que tus clientes monitoreen el estado completo de sus pedidos desde la confirmación hasta la entrega. Visualizan cada etapa del proceso, reciben actualizaciones automáticas y conocen el tiempo estimado de llegada.</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-cyan-50 text-cyan-700 rounded-full">Rastreo GPS</span>
                    <span className="text-xs px-2 py-1 bg-cyan-50 text-cyan-700 rounded-full">Actualizaciones automáticas</span>
                    <span className="text-xs px-2 py-1 bg-cyan-50 text-cyan-700 rounded-full">Historial completo</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#ec4899] to-[#db2777] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-[#0f172a] mb-2">Experiencia nativa optimizada</h4>
                  <p className="text-[#64748b] leading-relaxed">Ofrece una interfaz fluida y rápida diseñada específicamente para iOS y Android. Tus clientes disfrutan de animaciones suaves, navegación intuitiva, modo oscuro automático y rendimiento superior en cualquier dispositivo.</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-pink-50 text-pink-700 rounded-full">Diseño adaptativo</span>
                    <span className="text-xs px-2 py-1 bg-pink-50 text-pink-700 rounded-full">Modo oscuro</span>
                    <span className="text-xs px-2 py-1 bg-pink-50 text-pink-700 rounded-full">Ultra rápida</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-[#0f172a] mb-2">Seguridad y privacidad garantizada</h4>
                  <p className="text-[#64748b] leading-relaxed">Los datos de tus clientes están protegidos con encriptación de nivel bancario. Autenticación biométrica (Face ID/Touch ID), pagos seguros y cumplimiento total con normativas de privacidad internacionales.</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">Encriptación SSL</span>
                    <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">Biometría</span>
                    <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">GDPR compliant</span>
                  </div>
                </div>
              </div>
            </div>

            {/* iPhone Mockup with movil.mp4 */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm">
                <div className="relative mx-auto h-[520px] w-[260px] sm:h-[600px] sm:w-[300px] rounded-[3rem] border border-gray-300 bg-black shadow-2xl overflow-hidden">
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full flex items-center justify-center z-10">
                    <div className="w-16 h-3 bg-gray-900 rounded-full" />
                  </div>
                  <div className="absolute -left-0.5 top-24 h-10 w-1 rounded-r-full bg-gray-300" />
                  <div className="absolute -left-0.5 top-40 h-16 w-1 rounded-r-full bg-gray-300" />
                  <div className="absolute inset-4 rounded-[2.4rem] bg-black overflow-hidden">
                    <video
                      src="/movil_safari.mp4"
                      className="h-full w-full object-cover"
                      muted
                      loop
                      playsInline
                      autoPlay
                      onError={handleVideoError}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <h3 className="text-xl font-semibold text-[#0f172a] mb-6">
            Disponible para tus clientes
          </h3>
          <div className="flex justify-center items-center gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-[#64748b]">Web</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1367 1.0989L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l-1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3435-4.1021-2.6892-7.5743-6.1185-9.4396" />
                </svg>
              </div>
              <span className="text-sm font-medium text-[#64748b]">Android</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-[#64748b]">iOS</span>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { number: '120+', label: 'Negocios' },
            { number: '1000+', label: 'Clientes' },
            { number: '4.9/5', label: 'Calificación' },
            { number: '24/7', label: 'Soporte' }
          ].map((stat, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-xl">
              <div className="text-3xl font-bold text-[#0f172a]">{stat.number}</div>
              <div className="text-base text-[#64748b]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
