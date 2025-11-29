# Solución para mostrar imagen del producto en WhatsApp

## Problema actual

Cuando compartes un link como `https://fynlink.shop/rewin/miel-de-sol/1?product=5`, WhatsApp muestra la imagen de la compañía en lugar de la imagen del producto específico.

## Por qué sucede

1. WhatsApp/Facebook crawler hace una petición HTTP a la URL
2. Lee las meta tags `<meta property="og:image">` del HTML
3. La página actual es "use client" (Client Component) y no genera meta tags dinámicas en el servidor
4. Por lo tanto, siempre muestra las meta tags por defecto (logo de la compañía)

## Solución

Necesitas generar meta tags Open Graph dinámicas en el **servidor** basándote en el query param `?product=ID`.

### Opción 1: Convertir a Server Component con generateMetadata (RECOMENDADO)

Crea un archivo `app/rewin/[companySlug]/[locationId]/page.tsx` con esta estructura:

```tsx
import { Metadata } from 'next';
import { publicWebApiClient } from '@/lib/api/public-web';

type Props = {
  params: { companySlug: string; locationId: string };
  searchParams: { product?: string };
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { companySlug, locationId } = params;
  const productId = searchParams.product;

  try {
    // Cargar datos de la ubicación
    const locationRes = await publicWebApiClient.getLocationDetails(companySlug, Number(locationId));
    
    if (!locationRes.success || !locationRes.data) {
      return {
        title: 'Tienda',
        description: 'Explora nuestros productos',
      };
    }

    const location = locationRes.data.location;
    const company = locationRes.data.company;

    // Si hay productId, cargar el producto específico
    if (productId) {
      const itemsRes = await publicWebApiClient.getLocationItems(Number(locationId));
      
      if (itemsRes.success && itemsRes.data) {
        const product = itemsRes.data.find((item: any) => String(item.id) === productId);
        
        if (product) {
          return {
            title: `${product.name} - ${location.name}`,
            description: product.description || `Descubre ${product.name} en ${location.name}`,
            openGraph: {
              title: `${product.name} - ${location.name}`,
              description: product.description || `Descubre ${product.name} en ${location.name}`,
              images: product.image_url ? [
                {
                  url: product.image_url,
                  width: 1200,
                  height: 630,
                  alt: product.name,
                }
              ] : [],
              type: 'website',
            },
            twitter: {
              card: 'summary_large_image',
              title: `${product.name} - ${location.name}`,
              description: product.description || `Descubre ${product.name} en ${location.name}`,
              images: product.image_url ? [product.image_url] : [],
            },
          };
        }
      }
    }

    // Meta tags por defecto (sin producto específico)
    return {
      title: `${location.name} - ${company?.name || 'Tienda'}`,
      description: company?.description || `Visita ${location.name}`,
      openGraph: {
        title: `${location.name} - ${company?.name || 'Tienda'}`,
        description: company?.description || `Visita ${location.name}`,
        images: company?.logo_url ? [
          {
            url: company.logo_url,
            width: 1200,
            height: 630,
            alt: company.name,
          }
        ] : [],
        type: 'website',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Tienda',
      description: 'Explora nuestros productos',
    };
  }
}

// Luego tu componente actual (puede seguir siendo "use client" si lo envuelves en otro componente)
export default function PublicLocationProductsPage() {
  // ... tu código actual
}
```

### Opción 2: Middleware para detectar crawlers

Crea `middleware.ts` en la raíz del proyecto:

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Detectar crawlers de WhatsApp, Facebook, Twitter, etc.
  const isCrawler = /WhatsApp|facebookexternalhit|Twitterbot|LinkedInBot/i.test(userAgent);
  
  if (isCrawler && request.nextUrl.searchParams.has('product')) {
    // Redirigir a una ruta especial que sirva HTML con meta tags
    const url = request.nextUrl.clone();
    url.pathname = `/api/og${url.pathname}`;
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/rewin/:path*',
};
```

Y crea `app/api/og/rewin/[companySlug]/[locationId]/route.ts` que genere HTML con las meta tags correctas.

### Opción 3: Usar un servicio externo (más rápido)

Usa un servicio como:
- **Vercel OG Image Generation**: https://vercel.com/docs/functions/edge-functions/og-image-generation
- **Cloudinary**: Para generar imágenes OG dinámicas

## Verificación

Después de implementar, verifica con:

1. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
2. **WhatsApp Link Preview**: Envía el link a ti mismo en WhatsApp

## Cambios ya aplicados en el código

✅ El link ya no se duplica en el texto compartido
✅ La URL base se limpia de query params previos antes de agregar `?product=ID`
✅ El modal se abre automáticamente cuando entras a una URL con `?product=ID`

## Lo que falta

❌ Meta tags Open Graph dinámicas (requiere Server Component o API route)
