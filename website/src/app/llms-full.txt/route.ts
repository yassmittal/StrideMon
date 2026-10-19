import { buildLlmsFullText } from '@/lib/llms/build-llms-text'
import { buildTextResponse } from '@/lib/llms/markdown'

// The home page, the Founding Pass page and the whole help in one file (D-061), written once at `next build`.
export const dynamic = 'force-static'

export function GET(): Response {
  return buildTextResponse(buildLlmsFullText(), 'text/plain')
}
