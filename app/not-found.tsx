'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home, Search } from 'lucide-react'

export default function NotFound() {
    const router = useRouter()
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-chart-2/10 rounded-full blur-3xl -z-10 animate-pulse delay-700" />

            <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8 z-10">
                <div className="relative">
                    <h1 className="text-[150px] md:text-[200px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/20 select-none">
                        404
                    </h1>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm px-6 py-2 rounded-full border border-border shadow-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Search className="w-4 h-4" />
                            <span className="text-sm font-medium">Página no encontrada</span>
                        </div>
                    </div>
                </div>

                <div className="max-w-md space-y-4">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        ¿Te has perdido?
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Lo sentimos, no pudimos encontrar la página que estás buscando. Puede que haya sido movida o eliminada.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild size="lg" className="gap-2">
                        <Link href="/">
                            <Home className="w-4 h-4" />
                            Volver al inicio
                        </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="gap-2" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                        Regresar
                    </Button>
                </div>
            </div>

            {/* Footer text */}
            <div className="absolute bottom-8 text-sm text-muted-foreground/50">
                Error 404 - Page Not Found
            </div>
        </div>
    )
}
