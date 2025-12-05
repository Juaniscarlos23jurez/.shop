import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'
import Script from 'next/script'
import { GA4PageViewTracker } from '@/components/analytics/GA4PageViewTracker'
import { CookieConsent } from '@/components/cookie-consent'

export const metadata: Metadata = {
  title: 'Fideliza',
  description: 'haz crecer tu negocio',
  generator: 'Fideliza',
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