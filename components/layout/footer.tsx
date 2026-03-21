"use client"

export function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-4">Producto</h3>
            <ul className="space-y-3">
              <li><a href="#features" className="text-[#e2e8f0] hover:text-white text-sm">Características</a></li>
              <li><a href="#pricing" className="text-[#e2e8f0] hover:text-white text-sm">Precios</a></li>
              <li><a href="#custom-plan" className="text-[#e2e8f0] hover:text-white text-sm">Plan Empresarial</a></li>
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
              <span className="text-white font-bold">Fynlink+</span>
            </div>
            <p className="text-[#94a3b8] text-sm">
              &copy; {new Date().getFullYear()} Fynlink+. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
