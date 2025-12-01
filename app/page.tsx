"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Inter } from 'next/font/google'
import { useEffect, useState } from "react"
import type { CSSProperties } from 'react'

const inter = Inter({ subsets: ['latin'] })
// Contact lead-gen links (override via NEXT_PUBLIC_* envs)
const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/521234567890'
const SALES_EMAIL = process.env.NEXT_PUBLIC_SALES_EMAIL || 'ventas@tudominio.com'
const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/juancarlosjuarez26/30min'

export default function HomePage() {
  const [isYearly, setIsYearly] = useState(false)

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
              <div className="text-xs font-bold text-gray-800">Fideliza+</div>
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
      title: "Crea tu Sitio Web",
      description: "Diseña tu sitio web con catálogo de productos, mapas y más. Sin código.",
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

  // Testimonials data for carousel
  const testimonials = [
    {
      quote:
        "Fuimos el primer negocio en confiar en Fideliza+ y no nos arrepentimos. Desde el día uno vimos resultados increíbles en la retención de clientes.",
      author: "Miel de sol",
      role: "Nuestro primer cliente",
      avatar: "/company1.png"
    },
    {
      quote:
        "Incrementamos nuestras ventas recurrentes en un 30% desde que implementamos Fideliza+. ¡Nuestros clientes aman el programa de puntos!",
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
        "Implementamos Fideliza+ en nuestras 3 sucursales y los resultados son consistentes. Nuestros clientes regresan más seguido.",
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#22c55e] flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-gray-900">Fideliza+</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors">Características</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors">¿Cómo funciona?</a>
                <a href="#contact" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors">Contacto</a>
                <a href="#testimonials" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors">Testimonios</a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors">Precios</a>
                <a href="#faq" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors">Preguntas Frecuentes</a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-600 hover:bg-gray-100">Iniciar sesión</Button>
              </Link>
              <Link href="#contact">
                <Button className="bg-[#22c55e] hover:bg-green-600 text-white shadow-md hover:shadow-lg transition-all">Hablar con ventas</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-green-50 via-white to-green-50 overflow-hidden">
          <div className="absolute inset-0 bg-grid-gray-100 [mask-image:linear-gradient(0deg,white,transparent)]"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 text-base font-medium px-4 py-2 rounded-full mb-6">
                <span className="text-xl">✨</span>
                <span>Plataforma de fidelización #1 en Latinoamérica</span>
              </div>
              <h1 className="text-5xl tracking-tight font-extrabold text-gray-900 sm:text-6xl md:text-7xl leading-tight md:leading-[1.15] pt-2 md:pt-4 pb-4 md:pb-6">
                <span className="block">Fideliza a tus clientes</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">y haz crecer tu negocio</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
                La plataforma todo en uno para crear programas de fidelización que tus clientes amarán. Aumenta las ventas recurrentes, mejora la retención y construye relaciones duraderas con tus clientes.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Link href="#contact" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-[#22c55e] hover:bg-green-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 transform">
                    Hablar con ventas
                  </Button>
                </Link>
                <Link href={CALENDLY_URL} className="w-full sm:w-auto" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50">
                    Agendar demo
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                        <div className="w-full h-full bg-gray-300"></div>
                      </div>
                    ))}
                  </div>
                  <span className="ml-3 text-base">+2,500 negocios confían en nosotros</span>
                </div>
              </div>
            </div>
          </div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <div className="flex justify-center">
              <div className="w-full max-w-5xl">
                {/* MacBook mockup */}
                <div className="relative">
                  {/* Screen */}
                  <div className="relative mx-auto w-full max-w-4xl">
                    <div className="relative rounded-[1.5rem] bg-gradient-to-b from-gray-800 to-gray-900 p-3 shadow-2xl">
                      {/* Top bezel with camera */}
                      <div className="relative h-6 flex items-center justify-center rounded-t-xl bg-black">
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-gray-700" />
                      </div>

                      {/* Screen content */}
                      <div className="relative bg-black rounded-b-xl overflow-hidden">
                        <div className="relative w-full" style={{ paddingTop: '62.5%' }}>
                          <video
                            src="/dashboard.mp4"
                            className="absolute inset-0 w-full h-full object-contain rounded-b-xl"
                            autoPlay
                            muted
                            loop
                            playsInline
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Base/Keyboard */}
                  <div className="relative mx-auto mt-1 w-full max-w-5xl">
                    <div className="h-8 rounded-b-[2rem] bg-gradient-to-b from-gray-300 to-gray-400 shadow-lg">
                      <div className="flex items-center justify-center h-full">
                        {/* Trackpad */}
                        <div className="w-20 h-3 rounded-md bg-gray-500/30 border border-gray-400/50" />
                      </div>
                    </div>
                  </div>

                  {/* Shadow under laptop */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-black/10 rounded-full blur-xl" />
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* Video Demo Section */}
        <section id="video-demo" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-black text-[#0f172a] mb-4">
                Descubre cómo funciona Fideliza+
              </h2>
              <p className="text-[#64748b] text-xl max-w-2xl mx-auto">
                Mira cómo se ve tu catálogo digital en móvil (app) y en la web
              </p>
            </div>

            {/* Web Section */}
            <div className="mb-24">
              <h3 className="text-3xl font-bold text-[#0f172a] mb-8">Web</h3>
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
                          src="/wallet.mp4"
                          className="h-full w-full object-cover"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features bullets */}
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#22c55e] mt-2" />
                    <div>
                      <h4 className="text-xl font-semibold text-[#0f172a] mb-1">Catálogo digital</h4>
                      <p className="text-[#64748b]">Muestra todos tus productos con imágenes y descripciones</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#22c55e] mt-2" />
                    <div>
                      <h4 className="text-xl font-semibold text-[#0f172a] mb-1">Puntos de lealtad</h4>
                      <p className="text-[#64748b]">Acumula puntos con cada compra y canjéalos por recompensas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#22c55e] mt-2" />
                    <div>
                      <h4 className="text-xl font-semibold text-[#0f172a] mb-1">Cupones y promociones</h4>
                      <p className="text-[#64748b]">Recibe ofertas exclusivas y descuentos especiales</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#22c55e] mt-2" />
                    <div>
                      <h4 className="text-xl font-semibold text-[#0f172a] mb-1">Wallet / PKPass</h4>
                      <p className="text-[#64748b]">Guarda tu tarjeta de lealtad en Apple Wallet o Google Pay</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Section */}
            <div className="mb-16">
              <h3 className="text-3xl font-bold text-[#0f172a] mb-8">App Movil IOS/Android</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Features bullets */}
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#22c55e] mt-2" />
                    <div>
                      <h4 className="text-xl font-semibold text-[#0f172a] mb-1">Notificaciones push</h4>
                      <p className="text-[#64748b]">Recibe alertas de nuevas ofertas y promociones al instante</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#22c55e] mt-2" />
                    <div>
                      <h4 className="text-xl font-semibold text-[#0f172a] mb-1">Seguimiento de pedidos</h4>
                      <p className="text-[#64748b]">Ve el proceso de tu pedido en tiempo real desde tu móvil</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#22c55e] mt-2" />
                    <div>
                      <h4 className="text-xl font-semibold text-[#0f172a] mb-1">Experiencia nativa</h4>
                      <p className="text-[#64748b]">Interfaz optimizada para iOS y Android</p>
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
                          src="/movil.mp4"
                          className="h-full w-full object-cover"
                          autoPlay
                          muted
                          loop
                          playsInline
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
                { number: '2,500+', label: 'Negocios' },
                { number: '1M+', label: 'Clientes' },
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

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-[#0f172a] mb-4">
                Lo que dicen nuestros clientes
              </h2>
              <p className="text-[#64748b] text-xl max-w-2xl mx-auto">
                Empresas de todos los tamaños confían en Fideliza+ para fidelizar a sus clientes
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

        {/* Features Section */}
        <section id="features" className="py-16 bg-white">
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

        {/* Software Empresarial Todo-en-Uno */}
        <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
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

              {/* Analíticas & Cobro Card */}
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
                      Visitantes y perspectivas comerciales
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-[#0f172a]">Cobro con Link</h3>
                    </div>
                    <p className="text-[#64748b] text-base">
                      Recibe tus pagos pendientes más rápido
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                        <svg className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-[#0f172a]">Membresía</h3>
                    </div>
                    <p className="text-[#64748b] text-base">
                      Incentiva las compras repetidas con crédito de recompensa
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Plans Section */}
        <section id="pricing" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-[#0f172a] mb-4">
                Precios
              </h2>
              <div className="flex items-center justify-center gap-4 mb-6">
                <span className={`text-lg ${isYearly ? 'text-[#94a3b8]' : 'text-[#0f172a] font-semibold'}`}>
                  Paga mensualmente
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isYearly}
                    onChange={(e) => setIsYearly(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22c55e]"></div>
                </label>
                <span className={`text-lg ${isYearly ? 'text-[#0f172a] font-semibold' : 'text-[#64748b]'}`}>
                  Paga anualmente (Ahorra 25%)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  name: 'Básico',
                  subtitle: 'Para aficionados',
                  price: '0',
                  period: 'mes',
                  yearlyPrice: '0',
                  description: 'Perfecto para comenzar',
                  features: [
                    'Pedidos ilimitados por WhatsApp',
                    'Sin comisiones',
                    'Pagos manuales',
                    'Sube hasta 20 imágenes'
                  ],
                  cta: 'Comienza ahora',
                  popular: false,
                  badge: null
                },
                {
                  name: 'Premium',
                  subtitle: 'Para emprendedores independientes',
                  price: '190',
                  period: 'mes',
                  yearlyPrice: '1710',
                  yearlyMonthly: '143',
                  description: 'Todo en Basic, además:',
                  features: [
                    'Imágenes ilimitadas',
                    'Dominio y correo electrónico propios',
                    'Pagos con tarjeta (Stripe y más)',
                    'Analíticas, SEO y Meta Pixel',
                    'Configuración de facturas y PDF',
                    'Exportación/Importación de CSV',
                    'Calculadora de distancia para envíos',
                    'Soporte de chat en vivo'
                  ],
                  cta: 'Obtener Premium',
                  popular: true,
                  badge: '🎁 Dominio gratis - Oferta limitada'
                },
                {
                  name: 'Business',
                  subtitle: 'Para equipos',
                  price: '500',
                  period: 'mes',
                  yearlyPrice: '4500',
                  yearlyMonthly: '375',
                  description: 'Todo en Premium, además:',
                  features: [
                    'Eliminación del logo de Take App',
                    'Flujo de trabajo y catálogo de WhatsApp',
                    '5 tiendas y 5 cuentas de personal',
                    'Recompensas de membresía',
                    'Precios al por mayor',
                    'Webhooks y API',
                    'Integración de aplicaciones externas',
                    'Soporte prioritario de cuenta'
                  ],
                  cta: 'Obtener Business',
                  popular: false,
                  badge: '🎁 Dominio gratis - Oferta limitada'
                }
              ].map((plan, index) => (
                <div
                  key={index}
                  className={`relative bg-white rounded-2xl shadow-sm overflow-hidden border ${plan.popular ? 'border-2 border-[#22c55e] transform scale-105 z-10' : 'border-gray-200'
                    }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-[#22c55e] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      MÁS POPULAR
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                    <p className="text-base text-gray-600 mb-4">{plan.subtitle}</p>
                    <div className="mb-4">
                      {plan.price === '0' ? (
                        <div className="flex items-baseline">
                          <span className="text-5xl font-bold text-gray-900">$0</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col items-start gap-1 transition-all duration-200">
                            {isYearly ? (
                              <>
                                {/* Modo anual: mostrar el total del año en grande (con descuento) */}
                                <div className="flex items-baseline">
                                  <span className="text-5xl font-bold text-gray-900">
                                    ${plan.yearlyPrice}
                                  </span>
                                  <span className="ml-2 text-gray-500">MXN/año</span>
                                </div>
                                <div className="text-base text-gray-600">
                                  {`Equivale a $${(Number(plan.yearlyPrice) / 12).toFixed(2)}/mes`}
                                </div>
                              </>
                            ) : (
                              <>
                                {/* Modo mensual: mostrar precio por mes y debajo el total anual pagando mes a mes */}
                                <div className="flex items-baseline">
                                  <span className="text-5xl font-bold text-gray-900">
                                    ${plan.price}
                                  </span>
                                  <span className="ml-2 text-gray-500">MXN/{plan.period}</span>
                                </div>
                                <div className="text-base text-gray-600">
                                  {`${Number(plan.price) * 12} / año pagando mes a mes`}
                                </div>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <p className="text-gray-700 text-base font-medium mb-4">{plan.description}</p>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700 text-base">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="#contact">
                      <Button
                        className={`w-full mb-4 text-base font-semibold rounded-xl shadow-sm transition-all duration-200 ${plan.popular
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg hover:-translate-y-0.5'
                          : 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400'
                          }`}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                    {plan.badge && (
                      <div className="text-sm text-center text-green-600 font-medium mb-2">
                        {plan.badge}
                      </div>
                    )}
                    <p className="text-sm text-center text-gray-500">
                      {plan.price !== '0' && 'Obtén un 25% de dscto. el 1er año'}<br />
                      Cancela en cualquier momento
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 text-lg mb-6">¿Necesitas una solución personalizada para tu negocio?</p>
              <a
                href="#contact"
                className="inline-flex items-center text-[#22c55e] font-medium hover:text-green-600"
              >
                Contáctanos para una demostración personalizada
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-[#0f172a] mb-4">
                Preguntas frecuentes sobre Fideliza+
              </h2>
              <p className="text-[#64748b] text-xl max-w-2xl mx-auto">
                Resolvemos las dudas más comunes sobre programas de lealtad, CRM y la plataforma Fideliza+
              </p>
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
                <h3 className="text-lg md:text-xl font-semibold text-[#0f172a] mb-2">
                  ¿Qué es Fideliza+ y para qué tipo de negocios está pensado?
                </h3>
                <p className="text-[#64748b] text-base leading-relaxed">
                  Fideliza+ es una plataforma de fidelización y CRM diseñada para pequeños y medianos negocios que quieren aumentar sus ventas recurrentes. Es ideal para cafeterías, restaurantes, tiendas de ropa, spas, farmacias y cualquier comercio que quiera premiar a sus clientes frecuentes con puntos, cupones y beneficios exclusivos.
                </p>
              </div>

              <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
                <h3 className="text-lg md:text-xl font-semibold text-[#0f172a] mb-2">
                  ¿Necesito una app o página web propia para usar el programa de lealtad?
                </h3>
                <p className="text-[#64748b] text-base leading-relaxed">
                  No. Al contratar Fideliza+ obtienes tu propio sitio web de lealtad con catálogo de productos y un perfil para tus clientes. Además, ellos pueden guardar su tarjeta digital en Apple Wallet y Google Wallet, sin necesidad de que tú desarrolles una app desde cero.
                </p>
              </div>

              <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
                <h3 className="text-lg md:text-xl font-semibold text-[#0f172a] mb-2">
                  ¿Cómo se integra Fideliza+ con mi punto de venta o sistema actual?
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
                  ¿Cómo me ayuda Fideliza+ a vender más usando WhatsApp?
                </h3>
                <p className="text-[#64748b] text-base leading-relaxed">
                  Puedes segmentar a tus mejores clientes y enviarles campañas por WhatsApp con cupones personalizados, recordatorios de puntos por vencer y promociones especiales para días de baja afluencia. Todo queda registrado para que veas qué campañas generan más ventas.
                </p>
              </div>

              <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
                <h3 className="text-lg md:text-xl font-semibold text-[#0f172a] mb-2">
                  ¿Cuánto cuesta Fideliza+ y qué incluye cada plan?
                </h3>
                <p className="text-[#64748b] text-base leading-relaxed">
                  Contamos con planes mensuales y anuales que se adaptan al tamaño de tu negocio. En todos los planes tienes acceso al programa de puntos, cupones digitales, dashboard de analíticas y soporte. En los planes superiores se incluye multi-sucursal, POS avanzado y acceso a la API. Puedes revisar los detalles en la sección de precios.
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
              <Link href="#contact">
                <Button className="bg-[#22c55e] hover:bg-green-600 text-white rounded-xl px-6 text-base font-semibold">
                  Hablar con nuestro equipo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* CTA Section */}
      <section className="bg-[#22c55e] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Hablamos de tu estrategia de lealtad?
          </h2>
          <p className="text-green-100 text-xl mb-8 max-w-2xl mx-auto">
            Agenda una llamada o escríbenos por WhatsApp para conocer tus objetivos y proponerte la mejor solución.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Link href="#contact" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-white text-[#0f172a] hover:bg-gray-100 font-medium">
                Hablar con ventas
              </Button>
            </Link>
            <Link href={CALENDLY_URL} className="w-full sm:w-auto" target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="w-full bg-white/10 text-white border-white hover:bg-white hover:text-[#16a34a] hover:border-white transition-colors"
              >
                Agendar demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white">
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
                <span className="text-white font-bold">Fideliza+</span>
              </div>
              <p className="text-[#94a3b8] text-sm">
                &copy; {new Date().getFullYear()} Fideliza+. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/522381638747"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chatear por WhatsApp"
        className="fixed bottom-6 right-6 z-50 group flex items-center gap-3"
      >
        <span className="hidden sm:inline-block bg-[#25D366] text-white font-medium px-3 py-2 rounded-full shadow-lg transition-transform duration-200 group-hover:scale-105">
          Contactar
        </span>
        <div className="h-16 w-16 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>

      </a>
    </div>
  )
}