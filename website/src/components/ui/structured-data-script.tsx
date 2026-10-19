import { serializeStructuredData } from '@/lib/build-structured-data'

/** A page's JSON-LD (D-051, D-061). Server-rendered, so crawlers that run no JavaScript read it. */
export function StructuredDataScript({ structuredData }: { structuredData: unknown }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD from our own content, with `<` escaped.
      dangerouslySetInnerHTML={{ __html: serializeStructuredData(structuredData) }}
    />
  )
}
