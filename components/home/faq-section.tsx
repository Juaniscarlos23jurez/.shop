"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

interface FaqSectionProps {
  WHATSAPP_URL: string
}

export function FaqSection({ WHATSAPP_URL }: FaqSectionProps) {
  return (
    <section id="faq" className="py-16 bg-white" >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-[#0f172a] mb-4">
            Preguntas frecuentes sobre Fynlink+
          </h2>
          <p className="text-[#64748b] text-xl max-w-2xl mx-auto">
            Resolvemos las dudas más comunes sobre programas de lealtad, CRM y la plataforma Fynlink+
          </p>
        </div>

        <div className="space-y-4">
          <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
            <h3 className="text-lg md:text-xl font-semibold text-[#0f172a] mb-2">
              ¿Qué es Fynlink+ y para qué tipo de negocios está pensado?
            </h3>
            <p className="text-[#64748b] text-base leading-relaxed">
              Fynlink+ es una plataforma de fidelización y CRM diseñada para pequeños y medianos negocios que quieren aumentar sus ventas recurrentes. Es ideal para cafeterías, restaurantes, tiendas de ropa, spas, farmacias y cualquier comercio que quiera premiar a sus clientes frecuentes con puntos, cupones y beneficios exclusivos.
            </p>
          </div>

          <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
            <h3 className="text-lg md:text-xl font-semibold text-[#0f172a] mb-2">
              ¿Necesito una app o página web propia para usar el programa de lealtad?
            </h3>
            <p className="text-[#64748b] text-base leading-relaxed">
              No. Al contratar Fynlink+ obtienes tu propio sitio web de lealtad con catálogo de productos y un perfil para tus clientes. Además, ellos pueden guardar su tarjeta digital en Apple Wallet y Google Wallet, sin necesidad de que tú desarrolles una app desde cero.
            </p>
          </div>

          <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
            <h3 className="text-lg md:text-xl font-semibold text-[#0f172a] mb-2">
              ¿Cómo se integra Fynlink+ con mi punto de venta o sistema actual?
            </h3>
            <p className="text-[#64748b] text-base leading-relaxed">
              Puedes registrar compras y puntos directamente desde el panel web o nuestro POS en la nube. Si ya cuentas con un sistema de punto de venta, nuestro equipo puede apoyarte con la integración vía API para que los puntos se asignen automáticamente en cada ticket.
            </p>
          </div>

          <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
            <h3 className="text-lg md:text-xl font-semibold text-[#0f172a] mb-2">
              ¿En cuánto tiempo puedo lanzar mi programa de lealtad?
            </h3>
            <p className="text-[#64748b] text-base leading-relaxed">
              La mayoría de los negocios lanzan su programa en menos de una semana. En un par de días definimos reglas de puntos, recompensas y diseño de la tarjeta; después solo tienes que comunicarlo a tus clientes en caja, redes sociales y WhatsApp.
            </p>
          </div>

          <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
            <h3 className="text-lg md:text-xl font-semibold text-[#0f172a] mb-2">
              ¿Cómo me ayuda Fynlink+ a vender más usando WhatsApp?
            </h3>
            <p className="text-[#64748b] text-base leading-relaxed">
              Puedes segmentar a tus mejores clientes y enviarles campañas por WhatsApp con cupones personalizados, recordatorios de puntos por vencer y promociones especiales para días de baja afluencia. Todo queda registrado para que veas qué campañas generan más ventas.
            </p>
          </div>

          <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
            <h3 className="text-lg md:text-xl font-semibold text-[#0f172a] mb-2">
              ¿Cuánto cuesta Fynlink+ y qué incluye cada plan?
            </h3>
            <p className="text-[#64748b] text-base leading-relaxed">
              Ofrecemos opciones flexibles según tu etapa: desde un <span className="font-bold text-[#0f172a]">pago único de $200 MXN</span> para el Plan Básico, hasta cotizaciones personalizadas para los planes Pro y Empresa que requieren implementación a medida. Todos los planes incluyen acceso al programa de lealtad, dashboard y soporte.
            </p>
          </div>

          <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
            <h3 className="text-lg md:text-xl font-semibold text-[#0f172a] mb-2">
              ¿Qué tan segura es la información de mis clientes?
            </h3>
            <p className="text-[#64748b] text-base leading-relaxed">
              Tomamos muy en serio la seguridad y privacidad de tus datos. Toda la información se almacena en infraestructuras en la nube con estándares de seguridad de nivel empresarial, y solo tu equipo autorizado tiene acceso al panel. Además, puedes exportar o solicitar tus datos cuando lo necesites.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[#64748b] text-base mb-4">
            ¿Tienes alguna otra pregunta sobre cómo implementar un programa de lealtad en tu negocio?
          </p>
          <Link href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            <Button className="bg-[#22c55e] hover:bg-green-600 text-white rounded-xl px-6 text-base font-semibold">
              Hablar con nuestro equipo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
