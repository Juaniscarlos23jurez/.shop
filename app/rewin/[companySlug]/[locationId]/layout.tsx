import type { Metadata } from 'next'
import type { ReactNode } from 'react'

interface RewinLocationLayoutProps {
  children: ReactNode
}

interface RewinLocationLayoutParams {
  params: {
    companySlug: string
    locationId: string
  }
}

export function generateMetadata({ params }: RewinLocationLayoutParams): Metadata {
  const { companySlug } = params

  // Convierte el slug en un nombre más legible para el título
  const readableName = companySlug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

  return {
    title: `${readableName} | Fideliza`,
    description: `Descubre promociones, productos y recompensas de ${readableName} en Rewin.`,
    openGraph: {
      title: `${readableName} | Fideliza`,
      description: `Descubre promociones, productos y recompensas de ${readableName} en Rewin.`,
      type: 'website',
      url: undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${readableName} | Fideliza`,
      description: `Descubre promociones, productos y recompensas de ${readableName} en Rewin.`,
    },
  }
}

export default function RewinLocationLayout({ children }: RewinLocationLayoutProps) {
  return <>{children}</>
}
