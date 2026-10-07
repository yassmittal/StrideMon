import { demoVideo } from '@/content/demo-video'
import { frequentlyAskedQuestions } from '@/content/faq'
import {
  githubRepositoryUrl,
  siteDescription,
  siteName,
  siteUrl,
  xAccountUrl,
} from '@/content/site'

type StructuredDataOptions = {
  hasDemoVideo: boolean
}

// ISO 8601, as schema.org's `duration` wants it: 78 seconds is `PT1M18S`.
export function formatIsoDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `PT${minutes}M${seconds}S`
}

function buildDemoVideoObject() {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: demoVideo.structuredDataName,
    description: demoVideo.description,
    thumbnailUrl: `${siteUrl}${demoVideo.posterPath}`,
    contentUrl: `${siteUrl}${demoVideo.filePath}`,
    uploadDate: demoVideo.uploadDate,
    duration: formatIsoDuration(demoVideo.durationSeconds),
  }
}

// JSON-LD for the page: the site's name (Google shows it above the result instead of the domain),
// StrideMon as an organization with its logo, the game itself, the FAQ built from the same data as
// the section, and the demo video when it's on the page.
export function buildStructuredData({ hasDemoVideo }: StructuredDataOptions) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: `${siteUrl}/`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      url: `${siteUrl}/`,
      logo: `${siteUrl}/apple-icon`,
      sameAs: [xAccountUrl, githubRepositoryUrl],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: siteName,
      description: siteDescription,
      url: siteUrl,
      image: `${siteUrl}/opengraph-image`,
      gamePlatform: 'Android',
      applicationCategory: 'GameApplication',
      operatingSystem: 'Android',
      genre: 'Move to earn',
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
      sameAs: [xAccountUrl, githubRepositoryUrl],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: frequentlyAskedQuestions.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
    ...(hasDemoVideo ? [buildDemoVideoObject()] : []),
  ]
}

// `<` is escaped so the JSON can never close the <script> tag it sits in.
export function serializeStructuredData(structuredData: unknown): string {
  return JSON.stringify(structuredData).replace(/</g, '\\u003c')
}
