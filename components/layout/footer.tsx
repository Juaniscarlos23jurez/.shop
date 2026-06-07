"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand & Social */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 relative">
                <Image
                  src="/logorewa.png"
                  alt="Fynlink+ logo"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <span className="text-white font-bold text-2xl">Fynlink+</span>
            </div>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
              Transformando la manera en que los negocios gestionan sus ventas, reservas y clientes. 
              Todo en un solo lugar.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-[#94a3b8] hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-[#94a3b8] hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-[#94a3b8] hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-[#94a3b8] hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Enlaces Rápidos</h3>
            <ul className="space-y-4">
              <li><Link href="/" className="text-[#94a3b8] hover:text-white transition-colors text-sm">Inicio</Link></li>
              <li><Link href="#features" className="text-[#94a3b8] hover:text-white transition-colors text-sm">Características</Link></li>
              <li><Link href="#pricing" className="text-[#94a3b8] hover:text-white transition-colors text-sm">Precios</Link></li>
              <li><Link href="#about" className="text-[#94a3b8] hover:text-white transition-colors text-sm">Acerca de Nosotros</Link></li>
              <li><Link href="#blog" className="text-[#94a3b8] hover:text-white transition-colors text-sm">Blog & Noticias</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Legal</h3>
            <ul className="space-y-4">
              <li><Link href="/privacy" className="text-[#94a3b8] hover:text-white transition-colors text-sm">Política de Privacidad</Link></li>
              <li><Link href="/terms" className="text-[#94a3b8] hover:text-white transition-colors text-sm">Términos y Condiciones</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-[#94a3b8] shrink-0" />
                <a href="mailto:info@fynlink.shop" className="text-[#94a3b8] hover:text-white transition-colors text-sm">
                  info@fynlink.shop
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-[#94a3b8] shrink-0" />
                <a href="tel:+522381638747" className="text-[#94a3b8] hover:text-white transition-colors text-sm">
                  +52 238 163 8747
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-[#94a3b8] shrink-0" />
                <span className="text-[#94a3b8] text-sm">
                  Tehuacán, Puebla, México
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-[#1e293b]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#94a3b8] text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} Fynlink+. Todos los derechos reservados.
            </p>
            <p className="text-[#94a3b8] text-sm text-center md:text-right flex items-center">
              Diseñado con <span className="text-red-500 mx-1">♥</span> para hacer crecer tu negocio.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
