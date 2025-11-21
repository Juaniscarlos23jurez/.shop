export const metadata = {
  title: "Descargar App | Fideliza+",
  description:
    "Escanea y descarga la app para acumular puntos, canjear cupones y seguir a tu comercio favorito.",
}

const IOS_URL =
  "https://apps.apple.com/us/app/rewin-reward/id6748548104"

const ANDROID_URL =
  process.env.NEXT_PUBLIC_ANDROID_URL ||
  "https://play.google.com/store/apps/details?id=com.fynlink.BoostYou"

export default function DescargarAppPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-100 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Copy */}
            <div>
              <div className="inline-flex items-center space-x-2 rounded-full bg-white shadow-sm ring-1 ring-black/5 px-3 py-1 mb-4">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-gray-700">Estás en la página oficial de descarga</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
                Descarga la app y gana puntos en cada compra
              </h1>
              <p className="mt-4 text-base sm:text-lg text-gray-600">
                Escaneaste un QR en el local. Ahora instala la app para acumular puntos, canjear
                cupones exclusivos y seguir promociones en tiempo real.
              </p>

              {/* Store Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <a
                  href={IOS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-3 rounded-xl bg-black text-white px-5 py-3 text-sm sm:text-base font-semibold shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  aria-label="Descargar en App Store (iOS)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M19.665 17.142c-.328.755-.72 1.43-1.176 2.022-.617.815-1.12 1.375-1.508 1.68-.603.553-1.25.838-1.94.857-.494 0-1.09-.141-1.789-.422-.701-.282-1.345-.423-1.934-.423-.617 0-1.277.141-1.98.423-.703.281-1.272.43-1.707.446-.67.029-1.328-.27-1.973-.897-.421-.36-.946-.948-1.576-1.762-.675-.876-1.229-1.893-1.662-3.051-.466-1.27-.7-2.5-.7-3.69 0-1.363.295-2.54.884-3.532.462-.78 1.078-1.398 1.846-1.854.768-.456 1.598-.69 2.49-.702.488 0 1.13.162 1.927.486.796.324 1.306.487 1.53.487.17 0 .747-.203 1.728-.61.926-.38 1.709-.538 2.35-.473 1.738.14 3.042.827 3.912 2.06-1.555.943-2.33 2.265-2.323 3.967.007 1.323.494 2.42 1.46 3.29.435.405.924.717 1.466.936-.117.34-.241.664-.371.971zM15.79 2.62c0 1.02-.374 1.968-1.122 2.844-.903 1.059-1.995 1.672-3.18 1.578a3.098 3.098 0 0 1-.022-.384c0-.978.424-2.023 1.176-2.89.375-.427.853-.781 1.43-1.063.579-.283 1.129-.44 1.644-.474.05.13.074.26.074.39z" />
                  </svg>
                  <span>Descargar en App Store</span>
                </a>

                <a
                  href={ANDROID_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-3 rounded-xl bg-[#3ddc84] text-gray-900 px-5 py-3 text-sm sm:text-base font-semibold shadow-sm hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  aria-label="Descargar en Google Play (Android)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M3.6 1.8c-.36.22-.6.62-.6 1.13v18.14c0 .51.24.91.6 1.13l9.66-10.2L3.6 1.8zM14.29 11.03l-1.66 1.75 5.47 5.78 2.28-1.34c.38-.22.62-.62.62-1.13V7.91c0-.51-.24-.91-.62-1.13l-2.28-1.34-4.81 5.59zM13.03 12.4l-1.26 1.34-6.41 6.77 10.07-5.89-2.4-2.22zM5.36 3.49l6.41 6.79 1.26 1.34 2.42-2.81L5.36 3.49z" />
                  </svg>
                  <span>Descargar en Google Play</span>
                </a>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Consejo: Si estás en iPhone, usa el botón de App Store. Si estás en Android, usa el de Google Play.
              </p>
            </div>

            {/* Card */}
            <div className="lg:justify-self-end">
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2 2 7l10 5 10-5-10-5Zm0 7L2 4l10 5Zm0 3-10 5 10 5 10-5-10-5Zm0 7-10-5 10 5Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Fideliza+</p>
                    <p className="text-xs text-gray-500">Puntos • Cupones • Promociones</p>
                  </div>
                </div>

                <ul className="mt-6 space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      ✓
                    </span>
                    Acumula puntos por cada compra y canjéalos por recompensas.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      ✓
                    </span>
                    Recibe cupones y promociones personalizadas.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      ✓
                    </span>
                    Sigue a tu comercio favorito y no te pierdas novedades.
                  </li>
                </ul>

                <div className="mt-6 rounded-xl bg-gray-50 p-4 text-xs text-gray-600">
                  <p className="font-medium text-gray-800">¿Escaneaste un QR en el local?</p>
                  <p>Excelente. Descarga la app e inicia sesión para que tus puntos se acrediten correctamente.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ-ish mini section */}
      <section className="py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <span className="text-lg">★</span>
              </div>
              <p className="font-semibold text-gray-900">Recompensas reales</p>
              <p className="text-sm text-gray-600 mt-1">Canjea por descuentos, artículos y beneficios exclusivos.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
              <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                <span className="text-lg">🔔</span>
              </div>
              <p className="font-semibold text-gray-900">Notificaciones útiles</p>
              <p className="text-sm text-gray-600 mt-1">Enterate de cupones y promociones cerca de ti.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
              <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                <span className="text-lg">🛡️</span>
              </div>
              <p className="font-semibold text-gray-900">Privacidad y seguridad</p>
              <p className="text-sm text-gray-600 mt-1">Tus datos están protegidos y puedes darte de baja cuando quieras.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Fideliza+. Todos los derechos reservados.
        </div>
      </footer>
    </main>
  )
}
