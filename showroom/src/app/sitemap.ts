import type { MetadataRoute } from 'next'
import { showroomUrl } from '@/content/showroom'

export const dynamic = 'force-static'

// The showroom is one page. A deep link (`?pass=137`) is the same page, so it isn't listed.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: showroomUrl, changeFrequency: 'monthly', priority: 1 }]
}
