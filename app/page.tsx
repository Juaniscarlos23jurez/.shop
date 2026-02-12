"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { PricingSection } from "@/components/pricing-section"
import { Inter } from 'next/font/google'
import { useEffect, useState } from "react"
import type React from "react"
import type { CSSProperties } from 'react'

const inter = Inter({ subsets: ['latin'] })
// Contact lead-gen links (override via NEXT_PUBLIC_* envs)
const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/522381638747'
const SALES_EMAIL = process.env.NEXT_PUBLIC_SALES_EMAIL || 'info@fynlink.shop'
const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/juancarlosjuarez26/30min'

export default function HomePage() {
  // const [isYearly, setIsYearly] = useState(false)

  const features = [
    {
      icon: (
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: "Programa de Lealtad",
      description: "Crea un sistema de puntos personalizado para fidelizar a tus clientes.",
      visual: (
        <div className="relative w-full h-32 bg-blue-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-blue-50 transition-colors">
          <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm w-48 transform rotate-3 group-hover:rotate-0 transition-transform duration-300">
            <div className="flex justify-between items-center mb-3">
              <div className="text-xs font-bold text-gray-800">Fynlink+</div>
              <div className="h-4 w-4 bg-yellow-400 rounded-full"></div>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">1,250</div>
            <div className="text-xs text-gray-500">Puntos acumulados</div>
          </div>
        </div>
      )
    },
    {
      icon: (
        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2m5-10a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2h3.17l1.41-1.41A2 2 0 019.83 3h4.34a2 2 0 011.42.59L17.17 5H20z" />
        </svg>
      ),
      title: "Cupones Digitales & PKPass",
      description: "Genera cupones para Apple Wallet (iOS) y Google Wallet (Android).",
      visual: (
        <div className="relative w-full h-32 bg-green-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-green-50 transition-colors">
          <div className="bg-gray-900 text-white rounded-xl p-3 w-40 shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -mr-6 -mt-6"></div>
            <div className="flex justify-between items-start mb-3">
              <div className="text-[10px] font-medium opacity-80">Store Card</div>
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[8px]">✓</div>
            </div>
            <div className="mt-2 flex justify-between items-end">
              <div>
                <div className="text-[10px] text-gray-400">Balance</div>
                <div className="text-sm font-bold">$50.00</div>
              </div>
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <div className="w-4 h-4 bg-black"></div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: (
        <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      title: "Tu Propio Sitio Web",
      description: "Crea tu tienda en línea con catálogo, carrito y pagos en minutos.",
      visual: (
        <div className="relative w-full h-32 bg-purple-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-purple-50 transition-colors">
          <div className="bg-white border border-purple-100 rounded-lg shadow-sm w-44 overflow-hidden transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <div className="bg-gray-50 px-2 py-1.5 flex gap-1 border-b">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
            </div>
            <div className="p-2 space-y-2">
              <div className="h-2 bg-purple-100 rounded w-3/4"></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-8 bg-gray-50 rounded border border-gray-100"></div>
                <div className="h-8 bg-gray-50 rounded border border-gray-100"></div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: (
        <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: "Tu Propia App Nativa",
      description: "Tus clientes descargan TU aplicación desde la App Store y Play Store.",
      visual: (
        <div className="relative w-full h-32 bg-orange-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-orange-50 transition-colors">
          <div className="bg-white border border-orange-100 rounded-xl shadow-sm w-20 h-28 transform rotate-12 group-hover:rotate-0 transition-transform duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-4 bg-gray-50 border-b border-gray-100 flex justify-center items-center">
              <div className="w-8 h-1 bg-gray-200 rounded-full"></div>
            </div>
            <div className="p-2 mt-2 space-y-1">
              <div className="w-full h-8 bg-orange-100 rounded-lg"></div>
              <div className="w-full h-8 bg-gray-50 rounded-lg border border-gray-100"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: (
        <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Analíticas & SEO",
      description: "Optimización para motores de búsqueda y estadísticas en tiempo real.",
      visual: (
        <div className="relative w-full h-32 bg-amber-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-amber-50 transition-colors">
          <div className="bg-white border border-amber-100 rounded-lg p-3 shadow-sm w-44">
            <div className="flex items-end gap-1.5 h-16 justify-between px-1">
              <div className="w-4 bg-amber-100 rounded-t h-[40%] group-hover:h-[50%] transition-all duration-500"></div>
              <div className="w-4 bg-amber-200 rounded-t h-[60%] group-hover:h-[70%] transition-all duration-500 delay-75"></div>
              <div className="w-4 bg-amber-300 rounded-t h-[30%] group-hover:h-[40%] transition-all duration-500 delay-100"></div>
              <div className="w-4 bg-amber-400 rounded-t h-[80%] group-hover:h-[90%] transition-all duration-500 delay-150"></div>
              <div className="w-4 bg-amber-500 rounded-t h-[50%] group-hover:h-[60%] transition-all duration-500 delay-200"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: (
        <svg className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Catálogo Digital",
      description: "Hermosos catálogos con imágenes, precios y gestión completa.",
      visual: (
        <div className="relative w-full h-32 bg-pink-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-pink-50 transition-colors">
          <div className="grid grid-cols-2 gap-2 w-40">
            <div className="bg-white border border-pink-100 rounded p-1.5 shadow-sm transform group-hover:-translate-y-1 transition-transform duration-300">
              <div className="w-full h-8 bg-pink-100 rounded mb-1"></div>
              <div className="h-1 w-8 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white border border-pink-100 rounded p-1.5 shadow-sm transform group-hover:-translate-y-1 transition-transform duration-300 delay-75">
              <div className="w-full h-8 bg-purple-100 rounded mb-1"></div>
              <div className="h-1 w-8 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white border border-pink-100 rounded p-1.5 shadow-sm transform group-hover:-translate-y-1 transition-transform duration-300 delay-100">
              <div className="w-full h-8 bg-blue-100 rounded mb-1"></div>
              <div className="h-1 w-8 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white border border-pink-100 rounded p-1.5 shadow-sm transform group-hover:-translate-y-1 transition-transform duration-300 delay-150">
              <div className="w-full h-8 bg-green-100 rounded mb-1"></div>
              <div className="h-1 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: (
        <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "CRM & Clientes",
      description: "Mejora la gestión de relaciones con clientes y precios al por mayor.",
      visual: (
        <div className="relative w-full h-32 bg-indigo-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-indigo-50 transition-colors">
          <div className="bg-white border border-indigo-100 rounded-lg shadow-sm w-44 overflow-hidden">
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-100"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-1.5 bg-gray-200 rounded w-12"></div>
                  <div className="h-1 bg-gray-100 rounded w-16"></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-1.5 bg-gray-200 rounded w-10"></div>
                  <div className="h-1 bg-gray-100 rounded w-14"></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-100"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-1.5 bg-gray-200 rounded w-14"></div>
                  <div className="h-1 bg-gray-100 rounded w-12"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: (
        <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      title: "Inventario",
      description: "Gestiona tu inventario en línea y evita la sobreventa.",
      visual: (
        <div className="relative w-full h-32 bg-teal-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-teal-50 transition-colors">
          <div className="bg-white border border-teal-100 rounded-lg p-3 shadow-sm w-44">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <div className="h-1.5 w-12 bg-gray-100 rounded"></div>
                </div>
                <div className="text-[8px] font-mono text-gray-400">84</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                  <div className="h-1.5 w-10 bg-gray-100 rounded"></div>
                </div>
                <div className="text-[8px] font-mono text-gray-400">12</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  <div className="h-1.5 w-14 bg-gray-100 rounded"></div>
                </div>
                <div className="text-[8px] font-mono text-gray-400">0</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: (
        <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      title: "Notificaciones & Email",
      description: "Envía notificaciones push y correos automáticos para recuperar ventas.",
      visual: (
        <div className="relative w-full h-32 bg-rose-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-rose-50 transition-colors">
          <div className="bg-white border border-rose-100 rounded-lg shadow-sm w-44 p-3 relative">
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce">1</div>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0"></div>
              <div className="space-y-1.5 w-full">
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-100 rounded w-full"></div>
                <div className="h-2 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
            <div className="w-full h-8 bg-rose-500 rounded text-white text-[10px] flex items-center justify-center font-medium">
              Ver Oferta
            </div>
          </div>
        </div>
      )
    },
    {
      icon: (
        <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: "WhatsApp Automático",
      description: "Automatiza pedidos y atención al cliente directamente en WhatsApp.",
      visual: (
        <div className="relative w-full h-32 bg-emerald-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-emerald-50 transition-colors">
          <div className="bg-white border border-emerald-100 rounded-xl shadow-sm w-44 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
              </div>
              <div className="h-1.5 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-2 flex gap-2 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="h-1 w-12 bg-emerald-200 rounded"></div>
            </div>
            <div className="flex justify-end">
              <div className="bg-gray-50 rounded-lg p-2 w-24">
                <div className="h-1 w-16 bg-gray-200 rounded mb-1"></div>
                <div className="h-1 w-8 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: (
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Pasarelas de Pago",
      description: "Acepta tarjetas de crédito, débito y transferencias de forma segura con Stripe.",
      visual: (
        <div className="relative w-full h-32 bg-blue-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-blue-50 transition-colors">
          <div className="bg-white border border-blue-100 rounded-xl shadow-sm w-44 p-3 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-1.5 w-12 bg-gray-200 rounded"></div>
              <div className="flex gap-1">
                <div className="w-4 h-2.5 bg-blue-600 rounded-sm"></div>
                <div className="w-4 h-2.5 bg-orange-400 rounded-sm"></div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-2 w-full bg-gray-100 rounded"></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-2 w-full bg-gray-100 rounded"></div>
                <div className="h-2 w-full bg-gray-100 rounded"></div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[8px] text-blue-600 font-bold justify-center border border-blue-100 rounded-lg py-1">
              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
              PAGO SEGURO
            </div>
          </div>
        </div>
      )
    }
  ]

  // Screenshots/Galería de la app (ubicadas en `public/`)
  const appScreens = [
    "/position1.png",
    "/position2.png",
    "/position3.png",
    "/position4.png",
    "/position5.png"
  ]

  // Carousel (slide) state: seamless infinite loop
  const displaySlides = [appScreens[appScreens.length - 1], ...appScreens, appScreens[0]]
  const [index, setIndex] = useState(1) // starts at first real slide
  const [isAnimating, setIsAnimating] = useState(true)
  const [slideWidth, setSlideWidth] = useState(240)
  const [activeDemo, setActiveDemo] = useState<'mobile' | 'web'>('mobile')

  // Typewriter effect state
  const words = ["y vende más", "y gana más", "y crece más"]
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const word = words[wordIndex]
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < word.length) {
          setCharIndex(prev => prev + 1)
        } else {
          // Pause at full word
          setTimeout(() => setIsDeleting(true), 1000)
        }
      } else {
        if (charIndex > 0) {
          setCharIndex(prev => prev - 1)
        } else {
          setIsDeleting(false)
          setWordIndex((prev) => (prev + 1) % words.length)
        }
      }
    }, isDeleting ? 20 : 40)

    return () => clearTimeout(timer)
  }, [charIndex, isDeleting, wordIndex])

  // Testimonials data for carousel
  const testimonials = [
    {
      quote:
        "Fuimos el primer negocio en confiar en Fynlink+ y no nos arrepentimos. Desde el día uno vimos resultados increíbles en la retención de clientes.",
      author: "Miel de sol",
      role: "Nuestro primer cliente",
      avatar: "/company1.png"
    },
    {
      quote:
        "Incrementamos nuestras ventas recurrentes en un 30% desde que implementamos Fynlink+. ¡Nuestros clientes aman el programa de puntos!",
      author: "María González",
      role: "Dueña de Café Aromas",
      avatar: "/placeholder-user.jpg"
    },
    {
      quote:
        "Lanzamos nuestro programa de fidelización en horas y ahora más del 60% de las ventas vienen de clientes frecuentes.",
      author: "Panadería La Espiga",
      role: "Negocio local",
      avatar: "/placeholder-logo.png"
    },
    {
      quote:
        "La facilidad para crear cupones y campañas nos ha ayudado a llenar el local en días lentos. Es una herramienta indispensable.",
      author: "Carlos Mendoza",
      role: "Gerente de Tienda de Ropa",
      avatar: "/placeholder-user.jpg"
    },
    {
      quote:
        "Las analíticas integradas nos han dado información valiosa sobre el comportamiento de nuestros clientes. Tomamos mejores decisiones.",
      author: "Ana Lucía Ramírez",
      role: "Directora de Marketing",
      avatar: "/placeholder-user.jpg"
    },
    {
      quote:
        "Nuestros clientes valoran poder guardar su tarjeta en Apple Wallet y Google Wallet. Se siente muy profesional y moderno.",
      author: "Spa Esencia",
      role: "Centro de bienestar",
      avatar: "/placeholder-logo.png"
    },
    {
      quote:
        "El equipo de soporte nos acompañó en todo el proceso. Hoy tenemos más de 5,000 clientes registrados en el programa.",
      author: "Jorge López",
      role: "Director Comercial",
      avatar: "/placeholder-user.jpg"
    },
    {
      quote:
        "Implementamos Fynlink+ en nuestras 3 sucursales y los resultados son consistentes. Nuestros clientes regresan más seguido.",
      author: "Restaurante Familiar",
      role: "Cadena de restaurantes",
      avatar: "/placeholder-logo.png"
    },
    {
      quote:
        "La integración con nuestro sistema de punto de venta fue perfecta. No tuvimos que cambiar nada de nuestro flujo de trabajo.",
      author: "Patricia Herrera",
      role: "Administradora de Farmacia",
      avatar: "/placeholder-user.jpg"
    },
    {
      quote:
        "Los cupones digitales han revolucionado nuestras promociones. Ahora podemos medir exactamente qué funciona y qué no.",
      author: "Tienda de Electrónicos TechMax",
      role: "Retail especializado",
      avatar: "/placeholder-logo.png"
    }
  ]

  const [testimonialIndex, setTestimonialIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => i + 1)
    }, 2500)
    return () => clearInterval(id)
  }, [])

  // Smooth continuous testimonial carousel
  const [testimonialOffset, setTestimonialOffset] = useState(0)
  const [isTestimonialAnimating, setIsTestimonialAnimating] = useState(true)
  const [isTestimonialPaused, setIsTestimonialPaused] = useState(false)

  const handleVideoError = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget
    console.error("Video load error", {
      src: video.currentSrc || video.src,
      networkState: video.networkState,
      readyState: video.readyState,
    })
  }

  useEffect(() => {
    if (testimonials.length === 0 || isTestimonialPaused) return
    const id = setInterval(() => {
      setTestimonialOffset((prev) => prev + 1)
    }, 3000) // Move every 3 seconds
    return () => clearInterval(id)
  }, [testimonials.length, isTestimonialPaused])

  // Manual navigation functions
  const goToNextTestimonial = () => {
    setTestimonialOffset((prev) => prev + 1)
  }

  const goToPrevTestimonial = () => {
    setTestimonialOffset((prev) => {
      if (prev <= 0) {
        setIsTestimonialAnimating(false)
        setTimeout(() => {
          setTestimonialOffset(testimonials.length - 1)
          setIsTestimonialAnimating(true)
        }, 50)
        return testimonials.length - 1
      }
      return prev - 1
    })
  }

  const toggleTestimonialAutoplay = () => {
    setIsTestimonialPaused(!isTestimonialPaused)
  }

  // Handle smooth transition end for testimonials
  const handleTestimonialTransitionEnd = () => {
    if (testimonialOffset >= testimonials.length) {
      setIsTestimonialAnimating(false)
      setTestimonialOffset(0)
      setTimeout(() => setIsTestimonialAnimating(true), 50)
    }
  }

  // Responsive slide width (matches Tailwind md breakpoint widths)
  useEffect(() => {
    const update = () => {
      const w = typeof window !== 'undefined' ? window.innerWidth : 0
      setSlideWidth(w >= 768 ? 300 : 240)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const handleTransitionEnd = () => {
    // If we reached the clone of the first slide at the end, jump back to the first real slide
    if (index === displaySlides.length - 1) {
      setIsAnimating(false)
      setIndex(1)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true))
      })
    }
  }

  // Safety: if transitionend is missed (e.g., tab hidden), force-reset when hitting the cloned slide
  useEffect(() => {
    if (index >= displaySlides.length - 1) {
      setIsAnimating(false)
      setIndex(1)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true))
      })
    }
  }, [index, displaySlides.length])

  // 3D/center-emphasis styles for each slide
  const getSlideStyle = (idx: number): CSSProperties => {
    const offset = idx - index // -1 => left, 0 => center, 1 => right
    const abs = Math.abs(offset)
    const isCenter = offset === 0
    const rotateY = Math.max(-1, Math.min(1, offset)) * -12 // tilt sides slightly toward center
    const scale = isCenter ? 1.08 : 0.92
    const opacity = isCenter ? 1 : 0.85
    const zIndex = isCenter ? 30 : 10 - abs
    const blur = isCenter ? 0 : 1.2
    return {
      transform: `translateZ(${isCenter ? 60 : 0}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      filter: `blur(${blur}px)`,
      transition: 'transform 700ms ease, filter 700ms ease, opacity 700ms ease',
      zIndex,
      willChange: 'transform',
    }
  }

  return (
    <div className={`min-h-screen bg-[#f8fafc] ${inter.className} antialiased`}>
      {/* Header */}
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
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900 font-medium">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#22c55e] hover:bg-green-600 text-white shadow-md hover:shadow-lg transition-all">Hablar con ventas</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-16 pb-12 md:pt-24 md:pb-20 overflow-hidden bg-white">
          {/* Enhanced Background Atmosphere */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-50 rounded-full blur-[120px] opacity-60"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 text-sm font-bold px-4 py-2 rounded-full mb-8 border border-green-100 shadow-sm animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span>Plataforma #1 de Lealtad en LATAM</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-[#0f172a] tracking-tight mb-8 leading-[1.2] min-h-[140px] md:min-h-[180px]">
                Fideliza a tus clientes <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 inline-block pb-4">
                  {words[wordIndex].substring(0, charIndex)}
                  <span className="text-blue-600 animate-pulse ml-1">|</span>
                </span>
              </h1>

              <p className="mt-8 max-w-2xl mx-auto text-xl text-[#64748b] leading-relaxed">
                Impulsa tus ventas recurrentes con nuestro ecosistema integral de lealtad y gestión. Elige el plan que mejor se adapte a tu etapa y <span className="text-blue-600 font-bold">comienza a crecer</span> hoy mismo.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-14 px-8 bg-[#22c55e] hover:bg-green-600 text-white text-lg font-bold rounded-2xl shadow-[0_20px_40px_-12px_rgba(34,197,94,0.35)] hover:shadow-[0_20px_40px_-12px_rgba(34,197,94,0.45)] hover:-translate-y-1 transition-all duration-300">
                    Obtener mi App ahora
                  </Button>
                </Link>
                <Link href={CALENDLY_URL} className="w-full sm:w-auto" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="w-full h-14 px-8 border-2 border-gray-200 text-[#0f172a] text-lg font-bold rounded-2xl hover:bg-gray-50 transition-all duration-300">
                    Ver cómo funciona
                  </Button>
                </Link>
              </div>

              <div className="mt-12 flex flex-col items-center justify-center space-y-4">
                <div className="flex -space-x-3">
                  {[
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80",
                    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64&q=80",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64&q=80",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64&q=80"
                  ].map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      className="h-10 w-10 rounded-full border-4 border-white object-cover shadow-sm"
                      alt="Negocio cliente"
                    />
                  ))}
                  <div className="h-10 w-10 rounded-full border-4 border-white bg-green-100 flex items-center justify-center text-[10px] font-black text-green-700 shadow-sm uppercase">
                    +120
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  Marcas que están creciendo con nosotros
                </p>
              </div>
            </div>

            {/* Main Visual: Fynlink+ Dashboard Mockup */}
            <div className="mt-20 relative max-w-7xl mx-auto">
              {/* Floating Badge above laptop */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-gray-100 px-4 py-2 rounded-xl shadow-lg z-10 flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Tu Panel Central: Fynlink+</span>
              </div>

              <div className="relative">
                {/* Floating Cards (better top/bottom order) */}

                {/* Top Left: Discount/Offers */}
                <div className="absolute -left-20 top-6 hidden lg:block bg-white p-5 rounded-3xl shadow-2xl border border-gray-100 max-w-[210px] animate-bounce z-20 transition-all hover:scale-110" style={{ animationDuration: '3.5s' }}>
                  <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center mb-3 text-orange-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div className="text-sm font-black text-[#0f172a]">Ofertas Flash</div>
                  <p className="text-[10px] text-gray-500 mt-1">Promociona tus productos o servicios de rebaja fácilmente.</p>
                </div>

                {/* Top Center: Stripe Payments */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-8 hidden lg:block transform bg-white p-5 rounded-3xl shadow-2xl border border-gray-100 max-w-[210px] animate-bounce z-20 transition-all hover:scale-110" style={{ animationDuration: '4.2s' }}>
                  <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center mb-3 text-indigo-600">
                    <Image
                      src="/stripe.svg"
                      alt="Stripe logo"
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  </div>
                  <div className="text-sm font-black text-[#0f172a]">Cobro por Stripe</div>
                  <p className="text-[10px] text-gray-500 mt-1">Procesa pagos seguros con tarjetas y wallets digitales.</p>
                </div>

                {/* Top Center-Right: Mercado Pago */}
                <div className="absolute left-[65%] -top-12 hidden lg:block transform bg-white p-5 rounded-3xl shadow-2xl border border-gray-100 max-w-[210px] animate-bounce z-20 transition-all hover:scale-110" style={{ animationDuration: '3.8s' }}>
                  <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
                    <Image
                      src="/mercado.png"
                      alt="Mercado Pago logo"
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="text-sm font-black text-[#0f172a]">Mercado Pago</div>
                  <p className="text-[10px] text-gray-500 mt-1">Acepta tarjetas de crédito, débito y efectivo en OXXO.</p>
                </div>

                {/* Top Right: Monthly Growth */}
                <div className="absolute -right-20 top-6 hidden lg:block bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 max-w-[210px] animate-bounce z-20 transition-all hover:scale-110" style={{ animationDuration: '4s' }}>
                  <div className="text-green-600 font-black text-2xl mb-1">↑ 24%</div>
                  <div className="text-sm font-bold text-[#0f172a]">Crecimiento Mensual</div>
                  <p className="text-[10px] text-gray-500 mt-2">Envía notificaciones, crea cupones y analiza resultados.</p>
                </div>

                {/* Bottom Left: Push Notifications */}
                <div className="absolute -left-20 bottom-6 hidden lg:block bg-white p-5 rounded-3xl shadow-2xl border border-gray-100 max-w-[210px] animate-bounce z-20 transition-all hover:scale-110" style={{ animationDuration: '5s' }}>
                  <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center mb-3 text-red-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div className="text-sm font-black text-[#0f172a]">Notificaciones</div>
                  <p className="text-[10px] text-gray-500 mt-1">Llega directo al celular de tus clientes con alertas.</p>
                </div>

                {/* Bottom Center: WhatsApp Integration */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 hidden lg:block transform bg-white p-5 rounded-3xl shadow-2xl border border-gray-100 max-w-[210px] animate-bounce z-20 transition-all hover:scale-110" style={{ animationDuration: '5.3s' }}>
                  <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center mb-3 text-[#25D366]">
                    <svg
                      className="w-6 h-6"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div className="text-sm font-black text-[#0f172a]">Integración WhatsApp</div>
                  <p className="text-[10px] text-gray-500 mt-1">Automatiza conversaciones y respuestas desde tu panel.</p>
                </div>

                {/* Bottom Right: Coupons */}
                <div className="absolute -right-20 bottom-4 hidden lg:block bg-white p-5 rounded-3xl shadow-2xl border border-gray-100 max-w-[210px] animate-bounce z-20 transition-all hover:scale-110" style={{ animationDuration: '4.5s' }}>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </div>
                    <div className="text-xs font-black text-[#0f172a]">Cupones</div>
                  </div>
                  <p className="text-[10px] text-gray-500">Manda cupones personalizados a tus clientes en segundos.</p>
                </div>

                {/* MacBook Mockup with Base */}
                <div className="relative mx-auto w-full max-w-6xl xl:max-w-7xl">
                  <div className="absolute inset-0 bg-green-500/10 blur-3xl rounded-full scale-110 -z-10 group-hover:scale-125 transition-transform duration-700"></div>

                  {/* Screen part */}
                  <div className="relative rounded-[1.5rem] bg-gradient-to-b from-gray-800 to-gray-900 p-3 shadow-2xl border-t border-white/20">
                    <div className="relative h-6 flex items-center justify-center rounded-t-xl bg-black">
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-gray-700" />
                    </div>
                    <div className="relative bg-black rounded-b-xl overflow-hidden aspect-[21/10] sm:aspect-[16/9]">
                      <video
                        src="/dashboard.mp4"
                        className="absolute inset-0 w-full h-full object-cover object-top"
                        autoPlay
                        muted
                        loop
                        playsInline
                        onError={handleVideoError}
                      />
                    </div>
                  </div>

                  {/* Base/Keyboard part */}
                  <div className="relative mx-auto mt-1 w-full max-w-[95%]">
                    <div className="h-4 sm:h-8 rounded-b-[2rem] bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500 shadow-xl">
                      <div className="flex items-center justify-center h-full">
                        {/* Trackpad */}
                        <div className="w-24 sm:w-32 h-2 sm:h-4 rounded-b-lg bg-gray-500/30 border-x border-b border-gray-400/50 shadow-inner" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MacBook Shadow */}
              <div className="mt-8 h-4 w-3/4 mx-auto bg-black/10 blur-2xl rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Features Section - Moved Up */}
        <section id="features" className="py-16 bg-white" >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-[#0f172a] mb-4">
                Todo lo que necesitas para fidelizar clientes
              </h2>
              <p className="text-[#64748b] text-xl max-w-3xl mx-auto">
                Herramientas poderosas diseñadas para negocios que quieren crecer
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border border-gray-100 rounded-2xl overflow-hidden bg-white">
                  <div className="p-1">
                    {feature.visual}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-green-50 transition-colors">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-bold text-[#0f172a] leading-tight">{feature.title}</h3>
                    </div>
                    <p className="text-[#64748b] text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Video Demo Section */}
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
                      {/* Notch */}
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full flex items-center justify-center z-10">
                        <div className="w-16 h-3 bg-gray-900 rounded-full" />
                      </div>

                      {/* Side buttons (decorative) */}
                      <div className="absolute -left-0.5 top-24 h-10 w-1 rounded-r-full bg-gray-300" />
                      <div className="absolute -left-0.5 top-40 h-16 w-1 rounded-r-full bg-gray-300" />

                      {/* Screen */}
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
                      {/* Notch */}
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full flex items-center justify-center z-10">
                        <div className="w-16 h-3 bg-gray-900 rounded-full" />
                      </div>

                      {/* Side buttons (decorative) */}
                      <div className="absolute -left-0.5 top-24 h-10 w-1 rounded-r-full bg-gray-300" />
                      <div className="absolute -left-0.5 top-40 h-16 w-1 rounded-r-full bg-gray-300" />

                      {/* Screen */}
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
                {/* Web */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                    <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-[#64748b]">Web</span>
                </div>

                {/* Android */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                    <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1367 1.0989L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l-1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3435-4.1021-2.6892-7.5743-6.1185-9.4396" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-[#64748b]">Android</span>
                </div>

                {/* iOS */}
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

        {/* Software Empresarial Todo-en-Uno */}
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
              <Card className="p-8 border border-gray-100 rounded-2xl bg-white shadow-lg">
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
              </Card>

              {/* Inventario Card */}
              <Card className="p-8 border border-gray-100 rounded-2xl bg-white shadow-lg">
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
              </Card>

              {/* Venta al por mayor Card */}
              <Card className="p-8 border border-gray-100 rounded-2xl bg-white shadow-lg">
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
              </Card>

              {/* Analíticas & Membresía Card */}
              <Card className="p-8 border border-gray-100 rounded-2xl bg-white shadow-lg">
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
              </Card>

              {/* Pasarelas de Pago Card */}
              <Card className="p-8 border border-gray-100 rounded-2xl bg-white shadow-lg">
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
              </Card>

              {/* CRM & WhatsApp Card */}
              <Card className="p-8 border border-gray-100 rounded-2xl bg-white shadow-lg">
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
              </Card>
            </div>
          </div>
        </section>

        {/* WhatsApp Experience Section */}
        <section id="whatsapp-orders" className="py-24 bg-white overflow-hidden" >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 text-sm font-bold px-4 py-2 rounded-full mb-6">
                <span>💬</span>
                <span>VENTAS POR WHATSAPP</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] mb-6">
                Tus clientes compran, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">
                  tú recibes el pedido por WhatsApp
                </span>
              </h2>
              <p className="text-[#64748b] text-xl max-w-2xl mx-auto">
                Olvídate de tomar pedidos manualmente. Ofrece una experiencia de compra profesional que termina directamente en tu chat.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Image 1: Cart/Checkout */}
              <div className="relative group">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-green-100 rounded-full blur-3xl opacity-50 transition-all duration-500 group-hover:scale-150"></div>
                <div className="relative mx-auto h-[580px] w-[280px] sm:h-[640px] sm:w-[320px] rounded-[3.5rem] border-[12px] border-gray-900 bg-black shadow-2xl overflow-hidden transform -rotate-1 hover:rotate-0 transition-all duration-500 hover:scale-[1.02]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-3xl z-20 flex items-center justify-center">
                    <div className="w-16 h-1 bg-gray-800 rounded-full"></div>
                  </div>
                  <div className="absolute inset-0 bg-white">
                    <img
                      src="/IMG_0375.PNG"
                      alt="Carrito de compras y métodos de pago"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="mt-8 text-center px-4">
                  <h3 className="text-2xl font-bold text-[#0f172a] mb-3">1. El cliente personaliza su pedido</h3>
                  <p className="text-[#64748b] leading-relaxed">
                    Desde tu catálogo digital, el cliente agrega productos al carrito, elige si prefiere entrega a domicilio o recoger en tienda, y selecciona su método de pago.
                  </p>
                </div>
              </div>

              {/* Image 2: WhatsApp Chat */}
              <div className="relative group">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50 transition-all duration-500 group-hover:scale-150"></div>
                <div className="relative mx-auto h-[580px] w-[280px] sm:h-[640px] sm:w-[320px] rounded-[3.5rem] border-[12px] border-gray-900 bg-black shadow-2xl overflow-hidden transform rotate-1 hover:rotate-0 transition-all duration-500 hover:scale-[1.02]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-3xl z-20 flex items-center justify-center">
                    <div className="w-16 h-1 bg-gray-800 rounded-full"></div>
                  </div>
                  <div className="absolute inset-0 bg-white">
                    <img
                      src="/img_0136-2.png"
                      alt="Conversación de WhatsApp con el pedido"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="mt-8 text-center px-4">
                  <h3 className="text-2xl font-bold text-[#0f172a] mb-3">2. Tú recibes el pedido listo</h3>
                  <p className="text-[#64748b] leading-relaxed">
                    Recibes automáticamente un mensaje de WhatsApp con el resumen detallado, ubicación de Google Maps (si es envío) y el comprobante de pago adjunto.
                  </p>
                </div>
              </div>
            </div>

            {/* Video Demo Stripe - Side by Side Content */}
            <div className="mt-24 max-w-5xl mx-auto px-4 relative">
              {/* Background Decorative Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-green-50/50 via-white to-blue-50/50 rounded-full blur-[120px] -z-20"></div>

              {/* Floating Money/Cards Icons */}
              <div className="absolute -top-10 -left-10 w-24 h-24 text-green-200/40 transform -rotate-12 animate-pulse hidden lg:block -z-10">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 6h18v12H3V6zm1 1v10h16V7H4zm2 2h2v1H6V9zm0 2h2v1H6v-1zm10-2h2v1h-2V9zm0 2h2v1h-2v-1zM7 13.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5zm7 0c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5z" />
                </svg>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 text-blue-200/40 transform rotate-12 animate-bounce hidden lg:block -z-10" style={{ animationDuration: '4s' }}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                </svg>
              </div>
              <div className="absolute top-1/4 right-0 w-16 h-16 text-yellow-200/40 animate-pulse hidden lg:block -z-10">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v5H7v2h4v5h2v-5h4v-2h-4V7z" />
                </svg>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Left side: Video */}
                <div className="relative order-2 md:order-1 group">
                  <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700 -z-10"></div>
                  <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border-[8px] border-gray-900 bg-black mx-auto max-w-[280px] transform transition-all duration-500 group-hover:scale-[1.03] group-hover:-rotate-1">
                    <video
                      className="w-full h-auto"
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source src="/stripe.mp4" type="video/mp4" />
                      Tu navegador no soporta el elemento de video.
                    </video>

                    {/* Floating Badge */}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-gray-100 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider">Checkout Vivo</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Text */}
                <div className="text-center md:text-left order-1 md:order-2">
                  <div className="inline-flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full mb-6 border border-green-100">
                    <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                    <span className="text-green-700 font-bold tracking-wider text-[11px] uppercase">Experiencia de Pago</span>
                  </div>
                  <h3 className="text-4xl font-black text-[#0f172a] mb-6 leading-tight">
                    Pagos rápidos <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                      con Stripe 💳
                    </span>
                  </h3>
                  <p className="text-[#64748b] text-lg leading-relaxed max-w-md mx-auto md:mx-0">
                    Tus clientes pueden pagar con tarjeta de crédito, débito, Apple Pay o Google Pay en segundos.
                    <span className="block mt-4 text-[#0f172a] font-medium">Una experiencia de pago fluida que elimina la fricción y aumenta la conversión de tu negocio en tiempo real.</span>
                  </p>

                  <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-4">
                    <div className="flex flex-col items-center md:items-start">
                      <div className="text-2xl font-bold text-[#0f172a]">2s</div>
                      <div className="text-xs text-[#64748b] uppercase font-bold tracking-tighter">Promedio de pago</div>
                    </div>
                    <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                    <div className="flex flex-col items-center md:items-start">
                      <div className="text-2xl font-bold text-[#0f172a]">+35%</div>
                      <div className="text-xs text-[#64748b] uppercase font-bold tracking-tighter">Conversión</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mercado Pago Section */}
              <div className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Left side: Text */}
                <div className="text-center md:text-left">
                  <div className="inline-flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full mb-6 border border-blue-100">
                    <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
                    <span className="text-blue-700 font-bold tracking-wider text-[11px] uppercase">Más Opciones de Pago</span>
                  </div>
                  <h3 className="text-4xl font-black text-[#0f172a] mb-6 leading-tight">
                    Todo México paga <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-sky-600">
                      con Mercado Pago 💸
                    </span>
                  </h3>
                  <p className="text-[#64748b] text-lg leading-relaxed max-w-md mx-auto md:mx-0">
                    Ofrece a tus clientes la facilidad de pagar como ellos prefieran: con su saldo de Mercado Pago, tarjetas de crédito, débito o <span className="text-orange-600 font-bold">efectivo en cualquier OXXO</span>.
                  </p>

                  <div className="mt-10 flex flex-wrap justify-center md:justify-start gap-6">
                    <div className="flex flex-col items-center md:items-start group">
                      <div className="w-16 h-10 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
                        <Image src="/mercado.png" alt="Mercado Pago" width={60} height={30} className="object-contain" />
                      </div>
                      <span className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest">Mercado Pago</span>
                    </div>
                    <div className="flex flex-col items-center md:items-start group">
                      <div className="w-16 h-10 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
                        <Image src="/oxxo.png" alt="OXXO" width={60} height={30} className="object-contain" />
                      </div>
                      <span className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest">Efectivo</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Visual Display */}
                <div className="relative group p-4">
                  <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700 -z-10"></div>
                  <Card className="bg-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden transform group-hover:rotate-1 transition-transform duration-500">
                    <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
                      <div>
                        <p className="text-xs opacity-80 font-bold uppercase tracking-widest">Total a pagar</p>
                        <p className="text-3xl font-black">$450.00 MXN</p>
                      </div>
                      <Image src="/mercado.png" alt="MP" width={40} height={40} className="brightness-0 invert object-contain h-8 w-auto" />
                    </div>
                    <div className="p-8 space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group-hover:border-blue-200 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <span className="text-xl">💳</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">Tarjeta Guardada</p>
                            <p className="text-[10px] text-gray-500 leading-none mt-1">Visa •••• 4582</p>
                          </div>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-blue-600 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                            <Image src="/oxxo.png" alt="OXXO" width={30} height={30} className="object-contain h-5 w-auto" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">Efectivo en OXXO</p>
                            <p className="text-[10px] text-gray-500 leading-none mt-1">Pago referenciado</p>
                          </div>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-gray-200"></div>
                      </div>
                      <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl mt-4 shadow-lg shadow-blue-200">
                        Pagar ahora
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="mt-10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl px-8 py-10 shadow-2xl border border-white/10">
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-300 font-black mb-3">
                  Pasarelas activadas en México
                </p>
                <h4 className="text-3xl md:text-4xl font-black leading-tight mb-4">
                  Stripe + Mercado Pago funcionando hoy mismo
                </h4>
                <p className="text-slate-200 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
                  Cobra con tarjetas de crédito, débito, wallets y pagos en efectivo. Mercado Pago habilita referenciados en <span className="font-semibold text-white">OXXO</span> y saldo MP,
                  mientras que Stripe procesa Apple Pay, Google Pay y pagos en sucursal. Ambas pasarelas conviven en tu tienda para que ningún cliente se quede sin pagar.
                </p>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-xs font-black tracking-widest text-emerald-200 uppercase mb-2">Tarjetas</p>
                    <p className="text-base text-slate-100">Visa, Mastercard y AMEX con Stripe y Mercado Pago.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-xs font-black tracking-widest text-emerald-200 uppercase mb-2">Efectivo / OXXO</p>
                    <p className="text-base text-slate-100">Genera referencias para OXXO y pagos offline sin fricción.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-xs font-black tracking-widest text-emerald-200 uppercase mb-2">Wallets</p>
                    <p className="text-base text-slate-100">Apple Pay, Google Pay y saldo Mercado Pago listos para usar.</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
                  <div className="bg-white rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
                    <Image src="/stripe.svg" alt="Stripe" width={60} height={24} className="h-4 w-auto" />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Stripe México</span>
                  </div>
                  <div className="bg-white rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
                    <Image src="/mercado.png" alt="Mercado Pago" width={60} height={24} className="h-4 w-auto object-contain" />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Mercado Pago MX</span>
                  </div>
                  <div className="bg-white rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
                    <Image src="/oxxo.png" alt="OXXO" width={60} height={24} className="h-4 w-auto object-contain" />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Pagos en OXXO</span>
                  </div>
                </div>
              </div>
            </div>


            <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-[#0f172a] mb-3">Ahorra tiempo valioso</h4>
                <p className="text-[#64748b]">Elimina el "pimponeo" de mensajes. Recibe toda la información necesaria en un solo envío y procesa más pedidos en menos tiempo.</p>
              </div>

              <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-[#0f172a] mb-3">Precisión total</h4>
                <p className="text-[#64748b]">Los pedidos llegan sin errores. Sin confusiones de productos, precios o direcciones. Lo que el cliente ve es lo que tú recibes.</p>
              </div>

              <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-[#0f172a] mb-3">Imagen Profesional</h4>
                <p className="text-[#64748b]">Tus clientes perciben un negocio moderno y organizado, lo que genera confianza y fomenta la recompra inmediata.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section - Moved Down */}
        <section id="testimonials" className="py-16 bg-gray-50" >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-[#0f172a] mb-4">
                Lo que dicen nuestros clientes
              </h2>
              <p className="text-[#64748b] text-xl max-w-2xl mx-auto">
                Empresas de todos los tamaños confían en Fynlink+ para fidelizar a sus clientes
              </p>
            </div>

            {/* Testimonial carousel (smooth continuous sliding) */}
            <div className="max-w-6xl mx-auto overflow-hidden">
              <div className="relative">
                {/* Viewport showing 3 testimonials */}
                <div className="overflow-hidden">
                  <div
                    className="flex gap-6 transition-transform duration-1000 ease-in-out"
                    style={{
                      transform: `translateX(-${testimonialOffset * 33.333}%)`,
                      transition: isTestimonialAnimating ? 'transform 1000ms ease-in-out' : 'none'
                    }}
                    onTransitionEnd={handleTestimonialTransitionEnd}
                  >
                    {/* Duplicate testimonials for seamless loop */}
                    {[...testimonials, ...testimonials.slice(0, 3)].map((testimonial, index) => (
                      <div
                        key={`testimonial-${index}`}
                        className="flex-shrink-0 w-full md:w-1/3 px-3"
                      >
                        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-left h-full">
                          <div className="mb-4 text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-5 h-5 inline-block" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-gray-600 text-lg mb-6 min-h-[88px]">
                            "{testimonial.quote}"
                          </p>
                          <div className="flex items-center">
                            <img
                              src={testimonial.avatar}
                              alt={testimonial.author}
                              className="w-12 h-12 rounded-full object-cover mr-4"
                            />
                            <div>
                              <div className="font-medium text-gray-900 text-lg">{testimonial.author}</div>
                              <div className="text-base text-gray-500">{testimonial.role}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Controls and dots */}
                <div className="mt-6 flex items-center justify-center gap-6">
                  {/* Previous button */}
                  <button
                    type="button"
                    onClick={goToPrevTestimonial}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-label="Testimonio anterior"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Play/Pause button */}
                  <button
                    type="button"
                    onClick={toggleTestimonialAutoplay}
                    className="p-2 rounded-full bg-[#16a34a] hover:bg-[#15803d] transition-colors"
                    aria-label={isTestimonialPaused ? 'Reproducir automático' : 'Pausar automático'}
                  >
                    {isTestimonialPaused ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    )}
                  </button>

                  {/* Next button */}
                  <button
                    type="button"
                    onClick={goToNextTestimonial}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-label="Siguiente testimonio"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Dots indicator */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setTestimonialOffset(i)}
                      className={`h-2 w-2 rounded-full transition-colors ${i === (testimonialOffset % testimonials.length)
                        ? 'bg-[#16a34a]'
                        : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      aria-label={`Ir al testimonio ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Plans Section */}

        <PricingSection />

        {/* FAQ Section */}
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
      </main>

      {/* CTA Section */}
      <section className="bg-[#22c55e] py-12" >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Hablamos de tu estrategia de lealtad?
          </h2>
          <p className="text-green-100 text-xl mb-8 max-w-2xl mx-auto">
            Empieza hoy mismo y transforma la lealtad de tus clientes en ventas recurrentes.
          </p>
          <div className="flex justify-center">
            <Link href="http://localhost:3000/auth/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-white text-[#22c55e] hover:bg-gray-100 font-black px-10 rounded-2xl shadow-xl transform transition-all hover:scale-105">
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white" >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-[#0f172a] mb-4">Conecta con nuestro equipo</h2>
            <p className="text-[#64748b] text-xl">Elige el canal que prefieras. Respondemos rápido.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border border-gray-100 rounded-2xl text-center">
              <div className="flex items-center justify-center mb-2">
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
              <Link href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-[#22c55e] hover:bg-green-600 text-white">Abrir WhatsApp</Button>
              </Link>
            </Card>
            <Card className="p-6 border border-gray-100 rounded-2xl text-center">
              <div className="flex items-center justify-center mb-2">
                <svg
                  className="w-10 h-10 text-[#0f172a]"
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
              <h3 className="text-xl font-bold mb-2">Email</h3>
              <p className="text-base text-gray-600 mb-4">Cuéntanos sobre tu negocio y te contactamos.</p>
              <Link href={`mailto:${SALES_EMAIL}`}>
                <Button variant="outline" className="w-full">Enviar correo</Button>
              </Link>
            </Card>
            <Card className="p-6 border border-gray-100 rounded-2xl text-center">
              <div className="flex items-center justify-center mb-2">
                <svg
                  className="w-10 h-10 text-[#0f172a]"
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
              <h3 className="text-xl font-bold mb-2">Agendar demo</h3>
              <p className="text-base text-gray-600 mb-4">Reserva una demo de 30 minutos.</p>
              <Link href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full">Ver disponibilidad</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
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
      {/* Floating Custom Plan Button - Mobile Only */}
      <a
        href="#custom-plan"
        aria-label="Ver Plan Empresarial"
        className="md:hidden fixed bottom-24 right-6 z-50 group flex items-center gap-3"
      >
        <span className="hidden sm:inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium px-3 py-2 rounded-full shadow-lg transition-transform duration-200 group-hover:scale-105">
          Plan Empresarial
        </span>
        <div className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl animate-bounce">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </a>

      {/* Floating WhatsApp Button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chatear por WhatsApp"
        className="fixed bottom-6 right-6 z-50 group flex items-center gap-3"
      >
        <span className="hidden sm:inline-block bg-[#25D366] text-white font-medium px-3 py-2 rounded-full shadow-lg transition-transform duration-200 group-hover:scale-105">
          Contactar
        </span>
        <div className="h-16 w-16 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
          <svg className="w-10 h-10 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>

      </a>
    </div>
  )
}