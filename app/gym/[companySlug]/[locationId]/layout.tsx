import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { publicWebApiClient } from '@/lib/api/public-web'

interface GymLocationLayoutProps {
  children: ReactNode
}

interface GymLocationLayoutParams {
  params: {
    companySlug: string
    locationId: string
  }
  searchParams: {
    product?: string
  }
}

export async function generateMetadata({ params, searchParams }: GymLocationLayoutParams): Promise<Metadata> {
  const { companySlug, locationId } = params
  const productId = searchParams?.product

  // Convierte el slug en un nombre más legible para el título
  const readableName = companySlug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char: string) => char.toUpperCase())

  let logoUrl: string | undefined
  let company: any = null
  let location: any = null

  try {
    if (locationId) {
      const locationDetailsRes = await publicWebApiClient.getLocationDetailsById(locationId)
      if (locationDetailsRes.success && locationDetailsRes.data) {
        const responseData: any = locationDetailsRes.data

        if (responseData.data) {
          company = responseData.data.company
          location = responseData.data.location
        } else if (responseData.company) {
          company = responseData.company
          location = responseData.location
        } else if (responseData.location && responseData.location.company) {
          company = responseData.location.company
          location = responseData.location
        }

        if (company && typeof company.logo_url === 'string') {
          logoUrl = company.logo_url
        }
      }

      // Si hay productId, intentar cargar el producto específico
      if (productId) {
        try {
          const itemsRes = await publicWebApiClient.getPublicItemsByLocationId(locationId)
          if (itemsRes.success && itemsRes.data) {
            const product = itemsRes.data.find((item: any) => String(item.id) === productId)

            if (product) {
              const locationName = location?.name || readableName
              const productTitle = `${product.name} - ${locationName}`
              const productDescription = product.description || `Descubre ${product.name} en ${locationName}`

              return {
                title: productTitle,
                description: productDescription,
                openGraph: {
                  title: productTitle,
                  description: productDescription,
                  type: 'website',
                  images: product.image_url
                    ? [
                      {
                        url: product.image_url,
                        width: 1200,
                        height: 630,
                        alt: product.name,
                      },
                    ]
                    : logoUrl
                      ? [
                        {
                          url: logoUrl,
                          width: 1200,
                          height: 630,
                        },
                      ]
                      : undefined,
                },
                twitter: {
                  card: 'summary_large_image',
                  title: productTitle,
                  description: productDescription,
                  images: product.image_url ? [product.image_url] : logoUrl ? [logoUrl] : undefined,
                },
              }
            }
          }
        } catch (productError) {
          console.error('Error loading product for metadata:', productError)
          // Si falla, continuar con metadatos por defecto
        }
      }
    }
  } catch {
    // Si falla el fetch, seguimos con metadatos básicos sin imagen
  }

  // Metadatos por defecto (sin producto específico)
  return {
    title: `${readableName} | Gym & Fitness`,
    description: `Entrena con los mejores en ${readableName}. Descubre planes, clases y recompensas.`,
    openGraph: {
      title: `${readableName} | Gym & Fitness`,
      description: `Entrena con los mejores en ${readableName}. Descubre planes, clases y recompensas.`,
      type: 'website',
      url: undefined,
      images: logoUrl
        ? [
          {
            url: logoUrl,
            width: 1200,
            height: 630,
          },
        ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${readableName} | Gym & Fitness`,
      description: `Entrena con los mejores en ${readableName}. Descubre planes, clases y recompensas.`,
    },
  }
}

export default function GymLocationLayout({ children }: GymLocationLayoutProps) {
  return <>{children}</>
}
