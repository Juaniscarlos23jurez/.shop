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
    'Fynlink+ te ayuda a fidelizar clientes, lanzar programas de recompensas y hacer crecer tu negocio desde un solo dashboard.',
  keywords: ['fynlink', 'fidelización', 'programa de puntos', 'crm', 'negocios locales', 'lealtad'],
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
      'Centraliza tus cupones, recompensas y campañas de lealtad para convertir clientes en fans de tu marca.',
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
      'Centraliza tus cupones, recompensas y campañas de lealtad para convertir clientes en fans de tu marca.',
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