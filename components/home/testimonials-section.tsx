"use client"

import { useState, useEffect } from "react"

const testimonials = [
  {
    quote: "Fynlink+ transformó nuestra cafetería. Los clientes aman juntar puntos y nosotros amamos ver cómo regresan cada semana.",
    author: "Ana García",
    role: "Dueña de 'El Grano de Oro'",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80"
  },
  {
    quote: "La integración con WhatsApp es una maravilla. Recibimos los pedidos organizados y nuestros clientes ya no tienen que esperar.",
    author: "Carlos Ruiz",
    role: "Gerente de 'Sushi House'",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80"
  },
  {
    quote: "Tener nuestra propia App en la Store nos dio un nivel de profesionalismo increíble. Nuestras ventas subieron un 30% en dos meses.",
    author: "Elena M.",
    role: "Fundadora de 'Beauté Spa'",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80"
  }
]

export function TestimonialsSection() {
  const [testimonialOffset, setTestimonialOffset] = useState(0)
  const [isTestimonialAnimating, setIsTestimonialAnimating] = useState(false)
  const [isTestimonialPaused, setIsTestimonialPaused] = useState(false)

  useEffect(() => {
    if (isTestimonialPaused) return

    const interval = setInterval(() => {
      goToNextTestimonial()
    }, 5000)

    return () => clearInterval(interval)
  }, [testimonialOffset, isTestimonialPaused])

  const goToNextTestimonial = () => {
    if (isTestimonialAnimating) return
    setIsTestimonialAnimating(true)
    setTestimonialOffset(prev => prev + 1)
  }

  const goToPrevTestimonial = () => {
    if (isTestimonialAnimating) return
    setIsTestimonialAnimating(true)
    setTestimonialOffset(prev => prev - 1)
  }

  const handleTestimonialTransitionEnd = () => {
    setIsTestimonialAnimating(false)
    if (testimonialOffset >= testimonials.length) {
      setTestimonialOffset(0)
    } else if (testimonialOffset < 0) {
      setTestimonialOffset(testimonials.length - 1)
    }
  }

  const toggleTestimonialAutoplay = () => {
    setIsTestimonialPaused(!isTestimonialPaused)
  }

  return (
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

        <div className="max-w-6xl mx-auto overflow-hidden">
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex gap-6 transition-transform duration-1000 ease-in-out"
                style={{
                  transform: `translateX(-${testimonialOffset * 33.333}%)`,
                  transition: isTestimonialAnimating ? 'transform 1000ms ease-in-out' : 'none'
                }}
                onTransitionEnd={handleTestimonialTransitionEnd}
              >
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

            <div className="mt-6 flex items-center justify-center gap-6">
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
  )
}
