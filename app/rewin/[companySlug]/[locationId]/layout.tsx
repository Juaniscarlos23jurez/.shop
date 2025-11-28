import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { publicWebApiClient } from '@/lib/api/public-web'

interface RewinLocationLayoutProps {
  children: ReactNode
}

interface RewinLocationLayoutParams {
  params: {
    companySlug: string
    locationId: string
  }
}

export async function generateMetadata({ params }: RewinLocationLayoutParams): Promise<Metadata> {
  const { companySlug, locationId } = params

  // Convierte el slug en un nombre más legible para el título
  const readableName = companySlug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

  let logoUrl: string | undefined

  try {
    if (locationId) {
      const locationDetailsRes = await publicWebApiClient.getLocationDetailsById(locationId)
      if (locationDetailsRes.success && locationDetailsRes.data) {
        const responseData: any = locationDetailsRes.data

        let company: any = null

        if (responseData.data) {
          company = responseData.data.company
        } else if (responseData.company) {
          company = responseData.company
        } else if (responseData.location && responseData.location.company) {
          company = responseData.location.company
        }

        if (company && typeof company.logo_url === 'string') {
          logoUrl = company.logo_url
        }
      }
    }
  } catch {
    // Si falla el fetch, seguimos con metadatos básicos sin imagen
  }

  return {
    title: `${readableName} | Fideliza`,
    description: `Descubre promociones, productos y recompensas de ${readableName} en Rewin.`,
    openGraph: {
      title: `${readableName} | Fideliza`,
      description: `Descubre promociones, productos y recompensas de ${readableName} en Rewin.`,
      type: 'website',
      url: undefined,
      images: logoUrl
        ? [
            {
              url: logoUrl,
            },
          ]
        : undefined,
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
