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
  }
}

export default function RewinLocationLayout({ children }: RewinLocationLayoutProps) {
  return <>{children}</>
}
