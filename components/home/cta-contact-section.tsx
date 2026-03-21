"use client"

import { Button } from "@/components/ui/button"
import { Card as UICard } from "@/components/ui/card"
import Link from "next/link"

interface ContactSectionProps {
  WHATSAPP_URL: string
  SALES_EMAIL: string
  CALENDLY_URL: string
}

export function CTASection() {
  return (
    <section className="bg-[#22c55e] py-12" >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          ¿Hablamos de tu estrategia de lealtad?
        </h2>
        <p className="text-green-100 text-xl mb-8 max-w-2xl mx-auto">
          Empieza hoy mismo y transforma la lealtad de tus clientes en ventas recurrentes.
        </p>
        <Button asChild size="lg" className="w-full sm:w-auto bg-white text-[#22c55e] hover:bg-gray-100 font-black px-10 rounded-2xl shadow-xl transform transition-all hover:scale-105">
          <Link href="/auth/register">
            Registrarse
          </Link>
        </Button>
      </div>
    </section>
  )
}

export function ContactSection({ WHATSAPP_URL, SALES_EMAIL, CALENDLY_URL }: ContactSectionProps) {
  return (
    <section id="contact" className="py-16 bg-white" >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-[#0f172a] mb-4">Conecta con nuestro equipo</h2>
          <p className="text-[#64748b] text-xl">Elige el canal que prefieras. Respondemos rápido.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UICard className="p-6 border border-gray-100 rounded-2xl text-center shadow-sm">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-[#25D366] shadow-md flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">WhatsApp</h3>
            <p className="text-base text-gray-600 mb-4">Escríbenos y te atendemos al instante.</p>
            <Button asChild className="w-full bg-[#22c55e] hover:bg-green-600 text-white">
              <Link href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                Abrir WhatsApp
              </Link>
            </Button>
          </UICard>

          <UICard className="p-6 border border-gray-100 rounded-2xl text-center shadow-sm">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[#0f172a]"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 6H20C21.1046 6 22 6.89543 22 8V16C22 17.1046 21.1046 18 20 18H4C2.89543 18 2 17.1046 2 16V8C2 6.89543 2.89543 6 4 6Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 8L11.1056 12.737C11.6686 13.1121 12.3314 13.1121 12.8944 12.737L20 8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Email</h3>
            <p className="text-base text-gray-600 mb-4">Cuéntanos sobre tu negocio y te contactamos.</p>
            <Button asChild variant="outline" className="w-full">
              <Link href={`mailto:${SALES_EMAIL}`}>
                Enviar correo
              </Link>
            </Button>
          </UICard>

          <UICard className="p-6 border border-gray-100 rounded-2xl text-center shadow-sm">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[#0f172a]"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="4"
                    y="5"
                    width="16"
                    height="15"
                    rx="2"
                    ry="2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M8 3V7M16 3V7M4 9H20"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect x="8" y="12" width="3" height="3" rx="0.5" fill="currentColor" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Agendar demo</h3>
            <p className="text-base text-gray-600 mb-4">Reserva una demo de 30 minutos.</p>
            <Button asChild variant="outline" className="w-full">
              <Link href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                Ver disponibilidad
              </Link>
            </Button>
          </UICard>
        </div>
      </div>
    </section>
  )
}
