import type { MetadataRoute } from 'next'
import { legalPagePaths, siteUrl } from '@/content/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: 'monthly', priority: 1 },
    {
      url: `${siteUrl}${legalPagePaths.privacyPolicy}`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}${legalPagePaths.deleteAccount}`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
