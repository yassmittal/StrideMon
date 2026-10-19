import type { Metadata } from 'next'
import { siteName, siteTitle, xCardMetadata } from '@/content/site'

type PageMetadataOptions = {
  title: string
  description: string
  path: string
  /** True when the route has its own `opengraph-image`, which Next adds by itself. */
  hasOwnShareImage?: boolean
  /** The page's Markdown copy (D-061), linked as `rel="alternate" type="text/markdown"`. */
  markdownPath?: string
}

// The root layout's share image (`app/opengraph-image.tsx`). Served as PNG by `vercel.json`.
const siteShareImage = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: siteTitle,
  type: 'image/png',
}

/**
 * A page's title, description, canonical and share cards. Next merges metadata shallowly, so a
 * page that sets `openGraph` or `twitter` loses every field of the layout's: this sets them all.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  hasOwnShareImage = false,
  markdownPath,
}: PageMetadataOptions): Metadata {
  // Even `images: undefined` would hide a route's own `opengraph-image`, so the key is left out.
  const shareImages = hasOwnShareImage ? {} : { images: [siteShareImage] }
  return {
    title,
    description,
    alternates: {
      canonical: path,
      ...(markdownPath === undefined ? {} : { types: { 'text/markdown': markdownPath } }),
    },
    openGraph: {
      type: 'website',
      url: path,
      siteName,
      locale: 'en_US',
      title,
      description,
      ...shareImages,
    },
    twitter: { ...xCardMetadata, title, description, ...shareImages },
  }
}
