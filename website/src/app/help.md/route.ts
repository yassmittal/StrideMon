import { buildHelpMarkdown } from '@/lib/llms/build-page-markdown'
import { buildTextResponse } from '@/lib/llms/markdown'

// The help page as Markdown (D-061), written once at `next build`.
export const dynamic = 'force-static'

export function GET(): Response {
  return buildTextResponse(buildHelpMarkdown(), 'text/markdown')
}
