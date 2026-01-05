import type { MetadataRoute } from 'next'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fynlink.shop').replace(/\/$/, '')

const staticRoutes: { path: string; priority: number }[] = [
  { path: '/', priority: 1 },
  { path: '/catalogo', priority: 0.8 },
  { path: '/compania', priority: 0.7 },
  { path: '/descargar-app', priority: 0.8 },
  { path: '/privacidad', priority: 0.6 },
  { path: '/terminos-y-privacidad', priority: 0.6 },
  { path: '/terminos_y_privacidad_app_clientes_html.html', priority: 0.4 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return staticRoutes.map(({ path, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: 'weekly',
    priority,
  }))
}
