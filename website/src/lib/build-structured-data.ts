import { frequentlyAskedQuestions } from '@/content/faq'
import { siteDescription, siteName, siteUrl } from '@/content/site'

// JSON-LD for the page: the game itself, and the FAQ built from the same data as the section.
export function buildStructuredData() {
  return [
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
  ]
}

// `<` is escaped so the JSON can never close the <script> tag it sits in.
export function serializeStructuredData(structuredData: unknown): string {
  return JSON.stringify(structuredData).replace(/</g, '\\u003c')
}
