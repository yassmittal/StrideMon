import type { MetadataRoute } from 'next'
import {
  contentUpdatedOn,
  helpPath,
  legalPagePaths,
  passGalleryPath,
  passIndexPath,
  siteUrl,
  waitlistPagePath,
} from '@/content/site'
import { buildPassPagePath, passDesigns } from '@/lib/founding-pass/pass-design'

export const dynamic = 'force-static'

// `lastModified` only where `contentUpdatedOn` is true (D-061): the main pages, not the 1,000
// pass pages, whose designs are frozen.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, lastModified: contentUpdatedOn, changeFrequency: 'monthly', priority: 1 },
    {
      url: `${siteUrl}${passGalleryPath}`,
      lastModified: contentUpdatedOn,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    { url: `${siteUrl}${passIndexPath}`, changeFrequency: 'monthly', priority: 0.6 },
    {
      url: `${siteUrl}${helpPath}`,
      lastModified: contentUpdatedOn,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    { url: `${siteUrl}${waitlistPagePath}`, changeFrequency: 'monthly', priority: 0.6 },
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
