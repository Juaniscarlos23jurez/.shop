import React from 'react';

export default function TerminosYPrivacidadPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Términos y Condiciones & Política de Privacidad</h1>
        <div className="rounded-lg overflow-hidden shadow border border-gray-200 bg-white">
          <iframe
            title="Términos y Privacidad"
            src="/terminos_y_privacidad_app_clientes_html.html"
            className="w-full h-[calc(100vh-200px)]"
          />
        </div>
      </div>
    </main>
  );
}
