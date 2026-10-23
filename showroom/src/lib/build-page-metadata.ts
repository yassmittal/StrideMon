import type { Metadata } from 'next'
import { showroomSiteName, storeStills, xCardMetadata } from '@/content/showroom'

// The page's title, description, canonical and share cards. Copied by hand from the website's
// `src/lib/build-page-metadata.ts` (there's no shared package, brief §7.3), with the showroom's
// own share image: a still of the lit store, rendered by `bun run render-stills`.

type PageMetadataOptions = {
  title: string
  description: string
  path: string
}

const shareImage = {
  url: storeStills.shareCard,
  width: 1200,
  height: 630,
  alt: 'The StrideMon store at night, its lights on, seen from the street',
  type: 'image/jpeg',
}

/**
 * Next merges metadata shallowly, so a page that sets `openGraph` or `twitter` loses every field
 * of the layout's: this sets them all.
 */
export function buildPageMetadata({ title, description, path }: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: path,
      siteName: showroomSiteName,
      locale: 'en_US',
      title,
      description,
      images: [shareImage],
    },
    twitter: { ...xCardMetadata, title, description, images: [shareImage] },
  }
}
