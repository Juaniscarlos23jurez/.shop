import type { Metadata } from 'next'
import Script from 'next/script'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { AuthProvider } from '@/contexts/AuthContext'
import { GA4PageViewTracker } from '@/components/analytics/GA4PageViewTracker'
import { CookieConsent } from '@/components/cookie-consent'
import './globals.css'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.fynlink.shop').replace(/\/$/, '')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Fynlink+ | Plataforma de fidelización todo en uno',
    template: '%s | Fynlink+',
  },
  description:
    'Fynlink+ ofrece pedidos ilimitados por WhatsApp, punto de venta, chatbot con IA, sucursales, puntos, cupones y campañas para fidelizar clientes desde un solo dashboard.',
  keywords: [
    'fynlink',
    'fynlink+',
    'fidelización de clientes',
    'programa de puntos digital',
    'crm para negocios locales',
    'marketing de lealtad',
    'software de recompensas',
    'club de clientes',
    'retención de clientes',
    'puntajes y cupones',
  ],
  applicationName: 'Fynlink+',
  creator: 'Fynlink',
  publisher: 'Fynlink',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Fynlink+',
    title: 'Fynlink+ | Plataforma de fidelización todo en uno',
    description:
      'Centraliza pedidos por WhatsApp, POS, chatbot con IA, puntos, cupones, campañas de email y analíticas para convertir clientes en fans de tu marca.',
    images: [
      {
        url: `${siteUrl}/logorewa.png`,
        width: 1200,
        height: 630,
        alt: 'Fynlink+ Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@fynlink',
    creator: '@fynlink',
    title: 'Fynlink+ | Plataforma de fidelización todo en uno',
    description:
      'Centraliza pedidos por WhatsApp, POS, chatbot con IA, puntos, cupones, campañas de email y analíticas para convertir clientes en fans de tu marca.',
    images: [`${siteUrl}/logorewa.png`],
  },
  icons: {
    icon: '/logorewa.png',
    shortcut: '/logorewa.png',
    apple: '/logorewa.png',
  },

}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name='impact-site-verification' content='4b5de0c7-8ebb-4f48-b5da-e458bc9cefd1' />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <link rel="icon" href="/logorewa.png" type="image/png" />
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0BFVK699R7"
          strategy="afterInteractive"
        />
        <Script id="ga-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            // Define default consent mode
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'denied'
            });

            gtag('js', new Date());

            gtag('config', 'G-0BFVK699R7');
          `}
        </Script>
      </head>
      <body>
        <AuthProvider>
          <GA4PageViewTracker />
          {children}
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  )
}