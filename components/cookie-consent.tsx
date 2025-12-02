'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
    }
}

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        setIsMounted(true)
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookie-consent')
        if (consent === null) {
            // Small delay for animation effect
            const timer = setTimeout(() => setIsVisible(true), 1000)
            return () => clearTimeout(timer)
        } else if (consent === 'granted') {
            // If already granted, ensure gtag knows (in case of page reload)
            if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('consent', 'update', {
                    'ad_storage': 'granted',
                    'ad_user_data': 'granted',
                    'ad_personalization': 'granted',
                    'analytics_storage': 'granted'
                })
            }
        }
    }, [])

    const handleAccept = () => {
        setIsVisible(false)
        localStorage.setItem('cookie-consent', 'granted')

        // Update Google Consent Mode
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('consent', 'update', {
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted',
                'analytics_storage': 'granted'
            })
        }
    }

    const handleDecline = () => {
        setIsVisible(false)
        localStorage.setItem('cookie-consent', 'denied')

        // Update Google Consent Mode
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('consent', 'update', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied'
            })
        }
    }

    if (!isMounted) return null

    // Only show on landing page
    if (pathname !== '/') return null

    return (
        <div
            className={cn(
                "fixed bottom-4 left-4 z-[100] w-full max-w-md transition-transform duration-500 ease-in-out",
                isVisible ? "translate-y-0" : "translate-y-[150%]"
            )}
        >
            <Card className="p-6 shadow-2xl border-green-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
                <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-green-100 rounded-full shrink-0">
                            <span className="text-2xl">🍪</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-gray-900">Valoramos tu privacidad</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Utilizamos cookies para mejorar tu experiencia, analizar el tráfico y mostrarte publicidad personalizada.
                                Al hacer clic en "Aceptar todo", aceptas nuestro uso de cookies.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full">
                        <Button
                            variant="outline"
                            onClick={handleDecline}
                            className="flex-1 border-gray-200 hover:bg-gray-50 text-gray-700"
                        >
                            Rechazar
                        </Button>
                        <Button
                            onClick={handleAccept}
                            className="flex-1 bg-[#22c55e] hover:bg-green-600 text-white shadow-sm"
                        >
                            Aceptar todo
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
