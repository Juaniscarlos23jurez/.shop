"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useRegion } from "@/hooks/use-region"

interface HeroSectionProps {
  CALENDLY_URL: string
}

const words = ["y vende más", "y gana más", "y crece más"]

export function HeroSection({ CALENDLY_URL }: HeroSectionProps) {
  const { isEurope } = useRegion()
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

  const handleVideoError = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error("Video load error in HeroSection", event.currentTarget.src)
  }

  return (
    <section className="relative pt-16 pb-12 md:pt-24 md:pb-20 overflow-hidden bg-white">
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
            {!isEurope && (
              <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 bg-[#22c55e] hover:bg-green-600 text-white text-lg font-bold rounded-2xl shadow-[0_20px_40px_-12px_rgba(34,197,94,0.35)] hover:shadow-[0_20px_40px_-12px_rgba(34,197,94,0.45)] hover:-translate-y-1 transition-all duration-300">
                <Link href="/auth/register">
                  Obtener mi App ahora
                </Link>
              </Button>
            )}
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 border-2 border-gray-200 text-[#0f172a] text-lg font-bold rounded-2xl hover:bg-gray-50 transition-all duration-300">
              <Link href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                Ver cómo funciona
              </Link>
            </Button>
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
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-gray-100 px-4 py-2 rounded-xl shadow-lg z-10 flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Tu Panel Central: Fynlink+</span>
          </div>

          <div className="relative">
            <div className="absolute -left-20 top-6 hidden lg:block bg-white p-5 rounded-3xl shadow-2xl border border-gray-100 max-w-[210px] animate-bounce z-20 transition-all hover:scale-110" style={{ animationDuration: '3.5s' }}>
              <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center mb-3 text-orange-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="text-sm font-black text-[#0f172a]">Ofertas Flash</div>
              <p className="text-[10px] text-gray-500 mt-1">Promociona tus productos o servicios de rebaja fácilmente.</p>
            </div>

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
              <p className="text-[10px] text-gray-500 mt-1">Acepta tarjetas de crédito y débito</p>
            </div>

            <div className="absolute -right-20 top-6 hidden lg:block bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 max-w-[210px] animate-bounce z-20 transition-all hover:scale-110" style={{ animationDuration: '4s' }}>
              <div className="text-green-600 font-black text-2xl mb-1">↑ 24%</div>
              <div className="text-sm font-bold text-[#0f172a]">Crecimiento Mensual</div>
              <p className="text-[10px] text-gray-500 mt-2">Envía notificaciones, crea cupones y analiza resultados.</p>
            </div>

            <div className="absolute -left-20 bottom-6 hidden lg:block bg-white p-5 rounded-3xl shadow-2xl border border-gray-100 max-w-[210px] animate-bounce z-20 transition-all hover:scale-110" style={{ animationDuration: '5s' }}>
              <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center mb-3 text-red-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="text-sm font-black text-[#0f172a]">Notificaciones</div>
              <p className="text-[10px] text-gray-500 mt-1">Llega directo al celular de tus clientes con alertas.</p>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 hidden lg:block transform bg-white p-5 rounded-3xl shadow-2xl border border-gray-100 max-w-[210px] animate-bounce z-20 transition-all hover:scale-110" style={{ animationDuration: '5.3s' }}>
              <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center mb-3 text-[#25D366]">
                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div className="text-sm font-black text-[#0f172a]">Integración WhatsApp</div>
              <p className="text-[10px] text-gray-500 mt-1">Automatiza conversaciones y respuestas desde tu panel.</p>
            </div>

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

            <div className="relative mx-auto w-full max-w-6xl xl:max-w-7xl">
              <div className="absolute inset-0 bg-green-500/10 blur-3xl rounded-full scale-110 -z-10 group-hover:scale-125 transition-transform duration-700"></div>
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

              <div className="relative mx-auto mt-1 w-full max-w-[95%]">
                <div className="h-4 sm:h-8 rounded-b-[2rem] bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500 shadow-xl">
                  <div className="flex items-center justify-center h-full">
                    <div className="w-24 sm:w-32 h-2 sm:h-4 rounded-b-lg bg-gray-500/30 border-x border-b border-gray-400/50 shadow-inner" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 h-4 w-3/4 mx-auto bg-black/10 blur-2xl rounded-full"></div>
        </div>
      </div>
    </section>
  )
}
