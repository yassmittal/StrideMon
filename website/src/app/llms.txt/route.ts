import { buildLlmsText } from '@/lib/llms/build-llms-text'
import { buildTextResponse } from '@/lib/llms/markdown'

// The llmstxt.org index of the site (D-061), written once at `next build`.
export const dynamic = 'force-static'

export function GET(): Response {
  return buildTextResponse(buildLlmsText(), 'text/plain')
}
