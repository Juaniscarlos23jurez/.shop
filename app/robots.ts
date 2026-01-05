import type { MetadataRoute } from 'next'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fynlink.shop').replace(/\/$/, '')

const disallowedPaths = ['/api', '/dashboard', '/auth/empleados', '/app', '/rewin', '/user-catalog']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowedPaths,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
