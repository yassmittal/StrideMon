import type { MetadataRoute } from 'next'
import { helpPath, legalPagePaths, passGalleryPath, siteUrl } from '@/content/site'
import { buildPassPagePath, passDesigns } from '@/lib/founding-pass/pass-design'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}${passGalleryPath}`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}${helpPath}`, changeFrequency: 'weekly', priority: 0.6 },
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
    ...passDesigns.map((design) => ({
      url: `${siteUrl}${buildPassPagePath(design.designNumber)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
  ]
}
