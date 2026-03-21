"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

interface NavbarProps {
  WHATSAPP_URL: string
}

export function Navbar({ WHATSAPP_URL }: NavbarProps) {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="w-full px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 relative">
                <Image
                  src="/logorewa.png"
                  alt="Tu Marca logo"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-gray-900">Fynlink+</span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <a href="#features" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors">Características</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors">¿Cómo funciona?</a>
              <Link href="/promotores" className="text-blue-600 hover:text-blue-700 px-4 py-2 text-base font-bold rounded-lg hover:bg-blue-50 transition-colors">Promotores</Link>
              <Link href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors">Contacto</Link>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors">Testimonios</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors">Precios</a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors">Preguntas Frecuentes</a>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button asChild variant="ghost" className="text-gray-600 hover:text-gray-900 font-medium">
              <Link href="/auth/login">
                Iniciar sesión
              </Link>
            </Button>
            <Button asChild className="bg-[#22c55e] hover:bg-green-600 text-white shadow-md hover:shadow-lg transition-all">
              <Link href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                Hablar con ventas
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
